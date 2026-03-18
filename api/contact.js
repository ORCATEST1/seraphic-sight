export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, email, phone, type, address, desc, timeline } = req.body;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "onboarding@resend.dev",
      to: "Joseph@SeraphicSight.com",
      reply_to: email,
      subject: `New Quote Request — ${type}`,
      html: `
        <h2 style="font-family:sans-serif;color:#111">New Quote Request</h2>
        <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;width:100%">
          <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600;width:160px">Name</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${name}</td></tr>
          <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Email</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${email}</td></tr>
          <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Phone</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${phone || "—"}</td></tr>
          <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Project Type</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${type}</td></tr>
          <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Address / APN</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${address || "—"}</td></tr>
          <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Timeline</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${timeline || "—"}</td></tr>
          <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600;vertical-align:top">Description</td><td style="padding:8px 12px">${desc || "—"}</td></tr>
        </table>
      `,
    }),
  });

  if (response.ok) return res.status(200).json({ ok: true });
  return res.status(500).json({ error: "Failed to send" });
}