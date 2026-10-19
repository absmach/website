import nodemailer from "nodemailer";
import {
  buildConfirmationEmail,
  buildInquiryEmail,
} from "../../lib/contact-emails.js";

export const prerender = false;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 120;
const MESSAGE_MIN_LENGTH = 10;
const MESSAGE_MAX_LENGTH = 5000;

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TURNSTILE_ACTION = "contact";
const TURNSTILE_TOKEN_MAX_LENGTH = 2048;

const ERROR_MESSAGES = {
  invalidPayload: "Invalid request payload.",
  invalidName: `Please provide your name (${NAME_MIN_LENGTH} to ${NAME_MAX_LENGTH} characters).`,
  invalidEmail: "Please provide a valid email address.",
  invalidMessage: `Please provide a message between ${MESSAGE_MIN_LENGTH} and ${MESSAGE_MAX_LENGTH} characters.`,
  notConfigured:
    "Contact form is not configured yet. Please use direct email for now.",
  sendFailed:
    "Unable to send your message right now. Please try again or use direct email.",
  verificationFailed:
    "We could not verify that you are human. Please complete the check and try again.",
};

const json = (payload, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extraHeaders,
    },
  });

const getString = (value) => (typeof value === "string" ? value.trim() : "");

const parseBoolean = (value) => value.toLowerCase() === "true";

const parseRequestBody = async (request) => {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    return body && typeof body === "object" ? body : {};
  }

  const formData = await request.formData();
  return {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    company: formData.get("company"),
    "cf-turnstile-response": formData.get("cf-turnstile-response"),
  };
};

const normalizeInput = (payload) => ({
  name: getString(payload.name),
  email: getString(payload.email).toLowerCase(),
  message: getString(payload.message),
  company: getString(payload.company),
  turnstileToken: getString(payload["cf-turnstile-response"]),
});

const getTeamContactEmail = (env) =>
  getString(env?.TEAM_CONTACT_EMAIL || env?.CONTACT_TO_EMAIL);

const getMailFromEmail = (env) =>
  getString(env?.MAIL_FROM_EMAIL || env?.NO_REPLY_EMAIL || env?.CONTACT_FROM_EMAIL);

const validateInput = ({ name, email, message }) => {
  if (name.length < NAME_MIN_LENGTH || name.length > NAME_MAX_LENGTH) {
    return ERROR_MESSAGES.invalidName;
  }

  if (!EMAIL_REGEX.test(email) || email.length > 254) {
    return ERROR_MESSAGES.invalidEmail;
  }

  if (
    message.length < MESSAGE_MIN_LENGTH ||
    message.length > MESSAGE_MAX_LENGTH
  ) {
    return ERROR_MESSAGES.invalidMessage;
  }

  return null;
};

const createTransporter = (env) => {
  const host = getString(env?.SMTP_HOST);
  const rawPort = getString(env?.SMTP_PORT);
  const port = Number.parseInt(rawPort, 10);
  const rawSecure = getString(env?.SMTP_SECURE);
  const secure = parseBoolean(rawSecure);

  const user = getString(env?.SMTP_USER);
  const pass = getString(env?.SMTP_PASS);
  const hasUser = user.length > 0;
  const hasPass = pass.length > 0;

  if (
    !host ||
    !Number.isFinite(port) ||
    port <= 0 ||
    rawSecure === "" ||
    hasUser !== hasPass
  ) {
    return { ok: false, transporter: null };
  }

  const transportConfig = { host, port, secure };
  if (hasUser && hasPass) {
    transportConfig.auth = { user, pass };
  }

  return {
    ok: true,
    transporter: nodemailer.createTransport(transportConfig),
  };
};

const sendEmail = async ({
  transporter,
  from,
  to,
  subject,
  html,
  text,
  replyTo,
}) => {
  await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
    replyTo,
  });
};

const getRuntimeEnv = (locals) =>
  locals?.runtime?.env ?? globalThis.process?.env ?? {};

const getTurnstileHostnames = (env) =>
  new Set(
    getString(env?.TURNSTILE_HOSTNAMES)
      .split(",")
      .map((hostname) => hostname.trim())
      .filter(Boolean),
  );

const verifyTurnstile = async ({ token, secret, hostnames, ip }) => {
  if (!token || token.length > TURNSTILE_TOKEN_MAX_LENGTH) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (ip !== "unknown") body.set("remoteip", ip);

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`siteverify ${response.status}`);

    const result = await response.json();
    return (
      result.success === true &&
      result.action === TURNSTILE_ACTION &&
      hostnames.has(result.hostname)
    );
  } catch (error) {
    console.error("Turnstile verification failed", error);
    return false;
  }
};

const getClientIp = (request) => {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (!forwardedFor) return "unknown";

  return forwardedFor.split(",")[0]?.trim() || "unknown";
};

const handlePost = async ({ request, locals }) => {
  const env = getRuntimeEnv(locals);

  let payload;
  try {
    payload = await parseRequestBody(request);
  } catch {
    return json({ ok: false, error: ERROR_MESSAGES.invalidPayload }, 400);
  }

  const { name, email, message, company, turnstileToken } =
    normalizeInput(payload);

  if (company) {
    return json({ ok: true, message: "Message sent." });
  }

  const validationError = validateInput({ name, email, message });
  if (validationError) {
    return json({ ok: false, error: validationError }, 400);
  }

  const turnstileSecret = getString(env?.TURNSTILE_SECRET);
  const turnstileHostnames = getTurnstileHostnames(env);

  if (!turnstileSecret || turnstileHostnames.size === 0) {
    return json({ ok: false, error: ERROR_MESSAGES.notConfigured }, 503);
  }

  const clientIp = getClientIp(request);
  const verified = await verifyTurnstile({
    token: turnstileToken,
    secret: turnstileSecret,
    hostnames: turnstileHostnames,
    ip: clientIp,
  });

  if (!verified) {
    return json({ ok: false, error: ERROR_MESSAGES.verificationFailed }, 403);
  }

  const mailFromEmail = getMailFromEmail(env);
  const teamContactEmail = getTeamContactEmail(env);
  const transport = createTransporter(env);

  if (!transport.ok || !mailFromEmail || !teamContactEmail) {
    return json({ ok: false, error: ERROR_MESSAGES.notConfigured }, 503);
  }

  const inquiry = buildInquiryEmail({
    name,
    email,
    message,
  });

  try {
    await sendEmail({
      transporter: transport.transporter,
      from: mailFromEmail,
      to: teamContactEmail,
      subject: inquiry.subject,
      html: inquiry.html,
      text: inquiry.text,
      replyTo: email,
    });
  } catch (error) {
    console.error("Contact form delivery failed", error);
    return json({ ok: false, error: ERROR_MESSAGES.sendFailed }, 502);
  }

  const confirmation = buildConfirmationEmail({
    name,
    message,
    contactEmail: teamContactEmail,
  });

  try {
    await sendEmail({
      transporter: transport.transporter,
      from: mailFromEmail,
      to: email,
      subject: confirmation.subject,
      html: confirmation.html,
      text: confirmation.text,
      replyTo: teamContactEmail,
    });
  } catch (error) {
    console.error("Contact form confirmation delivery failed", error);
    return json({
      ok: true,
      message:
        "Thanks. Your message has been sent, but we could not send the confirmation copy.",
    });
  }

  return json({ ok: true, message: "Thanks. Your message has been sent." });
};

const methodNotAllowed = () =>
  json(
    { ok: false, error: "Method not allowed." },
    405,
    { Allow: "POST, OPTIONS" },
  );

export const OPTIONS = async () =>
  new Response(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
      "cache-control": "no-store",
    },
  });

export const POST = handlePost;
export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
