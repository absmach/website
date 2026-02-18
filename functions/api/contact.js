import nodemailer from "nodemailer";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 120;
const MESSAGE_MIN_LENGTH = 10;
const MESSAGE_MAX_LENGTH = 5000;

const ERROR_MESSAGES = {
  invalidPayload: "Invalid request payload.",
  invalidName: `Please provide your name (${NAME_MIN_LENGTH} to ${NAME_MAX_LENGTH} characters).`,
  invalidEmail: "Please provide a valid email address.",
  invalidMessage: `Please provide a message between ${MESSAGE_MIN_LENGTH} and ${MESSAGE_MAX_LENGTH} characters.`,
  notConfigured:
    "Contact form is not configured yet. Please use direct email for now.",
  sendFailed:
    "Unable to send your message right now. Please try again or use direct email.",
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

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

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
  };
};

const normalizeInput = (payload) => ({
  name: getString(payload.name),
  email: getString(payload.email).toLowerCase(),
  message: getString(payload.message),
  company: getString(payload.company),
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

const buildInquiryEmail = ({ name, email, message, ip, userAgent }) => {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");
  const safeIp = escapeHtml(ip || "unknown");
  const safeUserAgent = escapeHtml(userAgent || "unknown");

  return {
    subject: `New contact request from ${name}`,
    html: `
      <h2>New website inquiry</h2>
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Message:</strong><br />${safeMessage}</p>
      <hr />
      <p><strong>IP:</strong> ${safeIp}</p>
      <p><strong>User-Agent:</strong> ${safeUserAgent}</p>
    `,
    text: [
      "New website inquiry",
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      "Message:",
      message,
      "",
      `IP: ${ip || "unknown"}`,
      `User-Agent: ${userAgent || "unknown"}`,
    ].join("\n"),
  };
};

const buildConfirmationEmail = ({ name, message }) => {
  const safeName = escapeHtml(name);
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");

  return {
    subject: "We received your message - Abstract Machines",
    html: `
      <p>Hi ${safeName},</p>
      <p>Thanks for contacting Abstract Machines. This is a confirmation copy of your submission.</p>
      <p><strong>Your message:</strong><br />${safeMessage}</p>
      <p>Our team typically responds within 1-2 business days.</p>
      <p>Best regards,<br />Abstract Machines</p>
    `,
    text: [
      `Hi ${name},`,
      "",
      "Thanks for contacting Abstract Machines. This is a confirmation copy of your submission.",
      "",
      "Your message:",
      message,
      "",
      "Our team typically responds within 1-2 business days.",
      "",
      "Best regards,",
      "Abstract Machines",
    ].join("\n"),
  };
};

const handlePost = async (context) => {
  const { request, env } = context;

  let payload;
  try {
    payload = await parseRequestBody(request);
  } catch {
    return json({ ok: false, error: ERROR_MESSAGES.invalidPayload }, 400);
  }

  const { name, email, message, company } = normalizeInput(payload);

  // Honeypot field for basic bot filtering.
  if (company) {
    return json({ ok: true, message: "Message sent." });
  }

  const validationError = validateInput({ name, email, message });
  if (validationError) {
    return json({ ok: false, error: validationError }, 400);
  }

  // API contract:
  // 1) Request body contains name, email, message.
  // 2) Send inquiry to TEAM_CONTACT_EMAIL.
  // 3) Send confirmation copy to request email, from MAIL_FROM_EMAIL.
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
    ip: request.headers.get("cf-connecting-ip") || "unknown",
    userAgent: request.headers.get("user-agent") || "unknown",
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

  const confirmation = buildConfirmationEmail({ name, message });

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

export const onRequest = async (context) => {
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        Allow: "POST, OPTIONS",
      },
    });
  }

  if (context.request.method !== "POST") {
    return json(
      { ok: false, error: "Method not allowed." },
      405,
      { Allow: "POST, OPTIONS" },
    );
  }

  return handlePost(context);
};
