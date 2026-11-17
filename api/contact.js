import { esc, isEmail, rateLimit } from "./_utils.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  if (typeof req.headers["content-type"] !== "string" || !/^application\/json(?:\s*;|\s*$)/i.test(req.headers["content-type"]))
    return res.status(415).json({ error: "JSON required." });
  // Enforce real UTF-8 body size after Vercel parses JSON; do not trust Content-Length.
  let bodyBytes;
  try { bodyBytes = Buffer.byteLength(JSON.stringify(req.body ?? null), "utf8"); }
  catch { return res.status(400).json({ error: "Invalid request." }); }
  if (bodyBytes > 8192) return res.status(413).json({ error: "Request too large." });
  if (!rateLimit(req, { limit: 5, windowMs: 10 * 60 * 1000 }))
    return res.status(429).json({ error: "Too many requests — please try again later." });

  const { name, email, phone, type, address, desc, timeline, honeypot, turnstileToken } = req.body || {};

  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body))
    return res.status(400).json({ error: "Invalid request." });
  const fields = { name: 120, email: 254, phone: 40, type: 80, address: 250, desc: 2000, timeline: 120, honeypot: 200, turnstileToken: 2048 };
  if (Object.entries(fields).some(([key, max]) => req.body[key] !== undefined &&
      (typeof req.body[key] !== "string" || req.body[key].length > max)))
    return res.status(400).json({ error: "Invalid field type or length." });
  if (!["Property Marketing", "Construction", "Construction & Development", "Other"].includes(type || "Property Marketing"))
    return res.status(400).json({ error: "Invalid project type." });
  if (honeypot) return res.status(200).json({ ok: true });
  const normalizedEmail = typeof email === "string" ? email.trim() : email;
  const normalizedName = typeof name === "string" ? name.trim() : name;
  if (!normalizedName || !isEmail(normalizedEmail))
    return res.status(400).json({ error: "Name and a valid email are required." });

  // Feature-gated until a matching public site key and isolated preview secret
  // are configured. Never require a challenge without rendering it in the UI.
  if (process.env.CONTACT_REQUIRE_TURNSTILE === "true") {
    if (!process.env.TURNSTILE_SECRET_KEY)
      return res.status(503).json({ error: "Verification temporarily unavailable." });
    if (typeof turnstileToken !== "string" || !/^[a-zA-Z0-9._-]{10,2048}$/.test(turnstileToken))
      return res.status(403).json({ error: "Complete the verification challenge." });
    try {
      const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        signal: AbortSignal.timeout(7000),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY, response: turnstileToken }),
      });
      if (!verifyRes.ok) return res.status(503).json({ error: "Verification unavailable." });
      const verification = await verifyRes.json();
      if (verification?.success !== true)
        return res.status(403).json({ error: "Verification failed. Try again." });
    } catch (error) {
      console.error("Turnstile verification request failed:", error instanceof Error ? error.name : "unknown");
      return res.status(503).json({ error: "Verification temporarily unavailable." });
    }
  }

  // Preview deployments share provider credentials unless Vercel scopes them
  // separately. Do not send real customer mail from preview by default.
  const previewRecipient = process.env.PREVIEW_CONTACT_EMAIL_TO;
  if (process.env.VERCEL_ENV === "preview" &&
      (!previewRecipient || !isEmail(previewRecipient)))
    return res.status(503).json({ error: "Quote delivery is disabled in preview." });

  if (!process.env.RESEND_API_KEY)
    return res.status(503).json({ error: "Messaging temporarily unavailable." });
  try {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    signal: AbortSignal.timeout(10000),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "quotes@seraphicsight.com",
      to: process.env.VERCEL_ENV === "preview" ? previewRecipient : "joseph@seraphicsight.com",
      reply_to: normalizedEmail,
      subject: `New Quote Request — ${esc(type)}`,
      html: `
        <h2 style="font-family:sans-serif;color:#111">New Quote Request</h2>
        <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;width:100%">
          <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600;width:160px">Name</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${esc(normalizedName)}</td></tr>
          <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Email</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${esc(normalizedEmail)}</td></tr>
          <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Phone</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${esc(phone) || "—"}</td></tr>
          <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Project Type</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${esc(type)}</td></tr>
          <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Address / APN</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${esc(address) || "—"}</td></tr>
          <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Timeline</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${esc(timeline) || "—"}</td></tr>
          <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600;vertical-align:top">Description</td><td style="padding:8px 12px">${esc(desc) || "—"}</td></tr>
        </table>
      `,
    }),
  });

  if (response.ok) return res.status(200).json({ ok: true });
  console.error("Resend returned non-success status:", response.status);
  return res.status(502).json({ error: "Failed to send" });
  } catch (error) {
    console.error("Contact provider request failed:", error instanceof Error ? error.name : "unknown");
    return res.status(502).json({ error: "Messaging temporarily unavailable." });
  }
}
