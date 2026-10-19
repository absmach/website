const SITE_URL = "https://www.absmach.eu";
const LOGO_URL =
  "https://organization-images.fra1.cdn.digitaloceanspaces.com/abstract-machines/abstract-machines_logo_landscape-white.png";

const COLORS = {
  navy: "#073763",
  deep: "#082c4e",
  ink: "#12334f",
  muted: "#587084",
  soft: "#f1f4f6",
  line: "#d8e1e7",
  page: "#e9eef2",
};

const FONT_STACK = "'DM Sans', Helvetica, Arial, sans-serif";
const HEADING_STACK = "Manrope, 'DM Sans', Helvetica, Arial, sans-serif";

const TOPIC_LABELS = {
  product: "A product",
  engineering: "An engineering project",
  research: "A research partnership",
};

const DETAIL_PATTERN = /^(Topic|Organisation|Product): (.+)$/;

const STYLES = {
  eyebrow: `margin:0 0 12px;font-family:${FONT_STACK};font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${COLORS.muted};`,
  heading: `margin:0 0 20px;font-family:${HEADING_STACK};font-size:26px;line-height:1.25;font-weight:700;color:${COLORS.navy};`,
  body: `margin:0 0 16px;font-family:${FONT_STACK};font-size:15px;line-height:1.65;color:${COLORS.ink};`,
  small: `margin:0;font-family:${FONT_STACK};font-size:12px;line-height:1.6;color:#8fa6ba;`,
};

export const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

// The contact page appends "Topic/Organisation/Product" lines to the message.
// Split them back out so the email can show them as a details table.
const splitMessageDetails = (message) => {
  const separator = message.lastIndexOf("\n\n");
  if (separator === -1) return { body: message, details: [] };

  const lines = message.slice(separator + 2).split("\n");
  const matches = lines.map((line) => DETAIL_PATTERN.exec(line.trim()));
  if (matches.some((match) => !match)) return { body: message, details: [] };

  return {
    body: message.slice(0, separator).trim(),
    details: matches.map(([, label, value]) => ({
      label,
      value: label === "Topic" ? TOPIC_LABELS[value] || value : value,
    })),
  };
};

// Rows take pre-escaped HTML so callers can pass links.
const renderDetailsTable = (title, rows) =>
  rows.length
    ? `
            <tr>
              <td style="padding:0 40px 8px;">
                <p style="margin:0 0 4px;font-family:${FONT_STACK};font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${COLORS.muted};">${title}</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows
                  .map(
                    ({ label, html }) => `
                  <tr>
                    <td style="padding:10px 0;border-top:1px solid ${COLORS.line};font-family:${FONT_STACK};font-size:13px;color:${COLORS.muted};width:130px;vertical-align:top;">${escapeHtml(label)}</td>
                    <td style="padding:10px 0;border-top:1px solid ${COLORS.line};font-family:${FONT_STACK};font-size:14px;color:${COLORS.ink};vertical-align:top;word-break:break-word;">${html}</td>
                  </tr>`,
                  )
                  .join("")}
                </table>
              </td>
            </tr>`
    : "";

const renderMessageBlock = (body) => `
            <tr>
              <td style="padding:16px 40px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="background:${COLORS.soft};border-left:3px solid ${COLORS.navy};padding:20px 24px;font-family:${FONT_STACK};font-size:15px;line-height:1.65;color:${COLORS.ink};">${escapeHtml(body).replaceAll("\n", "<br />")}</td>
                  </tr>
                </table>
              </td>
            </tr>`;

const renderLayout = ({ title, preheader, content, footer }) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Manrope:wght@600;700&display=swap" rel="stylesheet" />
  </head>
  <body style="margin:0;padding:0;background:${COLORS.page};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.page};">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;">
            <tr>
              <td style="background:${COLORS.navy};padding:28px 40px;">
                <a href="${SITE_URL}/" style="text-decoration:none;">
                  <img src="${LOGO_URL}" width="240" height="69" alt="Abstract Machines" style="display:block;border:0;width:240px;height:auto;" />
                </a>
              </td>
            </tr>${content}
            <tr>
              <td style="background:${COLORS.deep};padding:${footer.padding};">
${footer.html}              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

// Full footer for emails sent to visitors.
const publicFooter = (notice) => ({
  padding: "28px 40px 18px",
  html: `                <p style="margin:0 0 10px;font-family:${FONT_STACK};font-size:13px;line-height:1.6;color:#c9d6e2;">Abstract Machines<br />141 Quai de Valmy, 75010 Paris, France</p>
                <p style="margin:0 0 14px;font-family:${FONT_STACK};font-size:13px;line-height:1.6;">
                  <a href="${SITE_URL}/" style="color:#ffffff;text-decoration:underline;">absmach.eu</a>
                  <span style="color:#6f8ba3;">&nbsp;&middot;&nbsp;</span>
                  <a href="${SITE_URL}/privacy/" style="color:#ffffff;text-decoration:underline;">Privacy policy</a>
                  <span style="color:#6f8ba3;">&nbsp;&middot;&nbsp;</span>
                  <a href="${SITE_URL}/terms/" style="color:#ffffff;text-decoration:underline;">Terms of Service</a>
                </p>
                <p style="${STYLES.small}">${notice}</p>
                <p style="${STYLES.small}margin-top:24px;">&copy; ${new Date().getFullYear()} Abstract Machines.</p>`,
});

// Team notifications only need to say where they came from.
const teamFooter = {
  padding: "18px 40px",
  html: `                <p style="${STYLES.small}">Sent from the contact form on absmach.eu.</p>`,
};

const textFooter = [
  "--",
  "Abstract Machines, 141 Quai de Valmy, 75010 Paris, France",
  `Website: ${SITE_URL}/`,
  `Privacy policy: ${SITE_URL}/privacy/`,
  `Terms of Service: ${SITE_URL}/terms/`,
];

const formatSubmittedAt = (date) =>
  `${date.toLocaleString("en-GB", {
    timeZone: "Europe/Paris",
    dateStyle: "long",
    timeStyle: "short",
  })} (Paris time)`;

export const buildConfirmationEmail = ({ name, message, contactEmail }) => {
  const { body, details } = splitMessageDetails(message);
  const safeContactEmail = escapeHtml(contactEmail);

  const content = `
            <tr>
              <td style="padding:40px 40px 8px;">
                <p style="${STYLES.eyebrow}">Message received</p>
                <h1 style="${STYLES.heading}">Thanks for reaching out, ${escapeHtml(name)}.</h1>
                <p style="${STYLES.body}">We have your message and someone from our team will get back to you within 1 to 2 business days. Here is a copy of what you sent us.</p>
              </td>
            </tr>${renderMessageBlock(body)}${renderDetailsTable(
              "Details",
              details.map(({ label, value }) => ({
                label,
                html: escapeHtml(value),
              })),
            )}
            <tr>
              <td style="padding:24px 40px 40px;">
                <p style="${STYLES.body}">Want to add something? Email us at <a href="mailto:${safeContactEmail}" style="color:${COLORS.navy};font-weight:500;">${safeContactEmail}</a>.</p>
                <p style="${STYLES.body}margin:0;">Best regards,<br /><strong style="color:${COLORS.navy};">The Abstract Machines team</strong></p>
              </td>
            </tr>`;

  const html = renderLayout({
    title: "We received your message",
    preheader:
      "Thanks for reaching out. Our team typically responds within 1 to 2 business days.",
    content,
    footer: publicFooter(
      "You are receiving this email because you submitted the contact form on absmach.eu. Please do not reply to this email as this is an automated notification email.",
    ),
  });

  const text = [
    `Hi ${name},`,
    "",
    "Thanks for reaching out to Abstract Machines. We have your message and someone from our team will get back to you within 1 to 2 business days.",
    "",
    "Your message:",
    body,
    ...(details.length
      ? ["", ...details.map(({ label, value }) => `${label}: ${value}`)]
      : []),
    "",
    `Want to add something? Email us at ${contactEmail}.`,
    "",
    "Best regards,",
    "The Abstract Machines team",
    "",
    ...textFooter,
    "",
    "Please do not reply to this email as this is an automated notification email.",
  ].join("\n");

  return {
    subject: "We received your message | Abstract Machines",
    html,
    text,
  };
};

export const buildInquiryEmail = ({
  name,
  email,
  message,
  submittedAt = new Date(),
}) => {
  const { body, details } = splitMessageDetails(message);
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const firstName = name.split(/\s+/)[0];
  const replyHref = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent("Re: Your message to Abstract Machines")}`;
  const submitted = formatSubmittedAt(submittedAt);

  const contactRows = [
    { label: "Name", html: safeName },
    {
      label: "Email",
      html: `<a href="mailto:${safeEmail}" style="color:${COLORS.navy};">${safeEmail}</a>`,
    },
    ...details.map(({ label, value }) => ({ label, html: escapeHtml(value) })),
    { label: "Submitted", html: escapeHtml(submitted) },
  ];

  const content = `
            <tr>
              <td style="padding:40px 40px 8px;">
                <p style="${STYLES.eyebrow}">New enquiry</p>
                <h1 style="${STYLES.heading}">${safeName} sent a message through the website.</h1>
              </td>
            </tr>${renderDetailsTable("Contact", contactRows)}
            <tr>
              <td style="padding:20px 40px 0;">
                <p style="margin:0;font-family:${FONT_STACK};font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${COLORS.muted};">Message</p>
              </td>
            </tr>${renderMessageBlock(body)}
            <tr>
              <td style="padding:0 40px 40px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="background:${COLORS.navy};">
                      <a href="${replyHref}" style="display:inline-block;padding:14px 26px;font-family:${FONT_STACK};font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;">Reply to ${escapeHtml(firstName)} &rarr;</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`;

  const html = renderLayout({
    title: `New enquiry from ${safeName}`,
    preheader: escapeHtml(body.slice(0, 140)),
    content,
    footer: teamFooter,
  });

  const text = [
    "New website enquiry",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    ...details.map(({ label, value }) => `${label}: ${value}`),
    `Submitted: ${submitted}`,
    "",
    "Message:",
    body,
    "",
    "--",
    "Sent from the contact form on absmach.eu.",
  ].join("\n");

  return {
    subject: `New contact request from ${name}`,
    html,
    text,
  };
};
