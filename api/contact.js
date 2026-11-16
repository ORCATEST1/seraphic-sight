import { esc, isEmail, rateLimit } from "./_utils.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  if (!req.headers["content-type"]?.toLowerCase().startsWith("application/json"))
    return res.status(415).json({ error: "JSON required." });
  if (Number(req.headers["content-length"] || 0) > 8192)
    return res.status(413).json({ error: "Request too large." });
  if (!rateLimit(req, { limit: 5, windowMs: 10 * 60 * 1000 }))
    return res.status(429).json({ error: "Too many requests — please try again later." });

  const { name, email, phone, type, address, desc, timeline, honeypot } = req.body || {};

  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body))
    return res.status(400).json({ error: "Invalid request." });
  const fields = { name: 120, email: 254, phone: 40, type: 80, address: 250, desc: 2000, timeline: 120, honeypot: 200 };
  if (Object.entries(fields).some(([key, max]) => req.body[key] !== undefined &&
      (typeof req.body[key] !== "string" || req.body[key].length > max)))
    return res.status(400).json({ error: "Invalid field type or length." });
  if (!["Property Marketing", "Construction", "Construction & Development", "Other"].includes(type || "Property Marketing"))
    return res.status(400).json({ error: "Invalid project type." });
  if (honeypot) return res.status(200).json({ ok: true });
  if (!name || !isEmail(email))
    return res.status(400).json({ error: "Name and a valid email are required." });

  if (!process.env.RESEND_API_KEY)
    return res.status(503).json({ error: "Messaging temporarily unavailable." });
  try {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "quotes@seraphicsight.com",
      to: "Joseph@SeraphicSight.com",
      reply_to: email,
      subject: `New Quote Request — ${esc(type)}`,
      html: `
        <h2 style="font-family:sans-serif;color:#111">New Quote Request</h2>
        <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;width:100%">
          <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600;width:160px">Name</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${esc(name)}</td></tr>
          <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Email</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${esc(email)}</td></tr>
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
  const error = await response.text();
  console.error("Resend error:", error);
  return res.status(502).json({ error: "Failed to send" });
  } catch (error) {
    console.error("Contact provider request failed:", error instanceof Error ? error.name : "unknown");
    return res.status(502).json({ error: "Messaging temporarily unavailable." });
  }
}
