export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, email, score, time, sessionId, wpOrder, collisions } = req.body;
  if (!email || !name) return res.status(400).json({ error: "Missing fields" });

  // Generate a unique promo code tied to this session
  const promoCode = "PARCEL-" + sessionId.slice(0,6).toUpperCase();

  // ── Email 1: Lead notification to Joseph ─────────────────────────────────
  const notifyRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    body: JSON.stringify({
      from: "showroom@seraphicsight.com",
      to:   "joseph@seraphicsight.com",
      subject: `New Drone Mission Lead — ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#0099cc;margin-bottom:4px">Drone Mission — New Lead</h2>
          <p style="color:#666;font-size:13px;margin-top:0">Submitted from the 3D Showroom</p>
          <table style="font-size:14px;border-collapse:collapse;width:100%">
            <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600;width:140px">Name</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${name}</td></tr>
            <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Email</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${email}</td></tr>
            <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Score</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${score} pts</td></tr>
            <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Time</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${time}s</td></tr>
            <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Collisions</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${collisions}</td></tr>
            <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Promo Code</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-family:monospace;font-weight:700;color:#0099cc">${promoCode}</td></tr>
            <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Session ID</td><td style="padding:8px 12px;font-family:monospace;font-size:12px;color:#999">${sessionId}</td></tr>
          </table>
        </div>
      `,
    }),
  });

  // ── Email 2: Reward confirmation to the visitor ───────────────────────────
  const rewardRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    body: JSON.stringify({
      from: "Joseph@SeraphicSight.com",
      to:   email,
      subject: "Your Free Parcel Overlay — Mission Complete 🎯",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#060C18;color:#fff;padding:40px;border-radius:8px">
          <h1 style="color:#00ccff;font-size:28px;margin-bottom:4px;letter-spacing:2px">MISSION COMPLETE</h1>
          <p style="color:#0099cc;font-size:14px;margin-top:0;letter-spacing:1px">Score: ${score} pts &nbsp;·&nbsp; Time: ${time}s</p>

          <p style="color:#ccc;font-size:15px;line-height:1.6">
            Hi ${name}, congratulations on completing the Seraphic Sight Drone Mission!
            You've unlocked a <strong style="color:#00ccff">free parcel boundary overlay</strong> add-on with your next quote.
          </p>

          <div style="background:#0d1f35;border:1px solid #0099cc;border-radius:6px;padding:24px;text-align:center;margin:28px 0">
            <p style="color:#aaa;font-size:12px;letter-spacing:2px;margin:0 0 8px">YOUR PROMO CODE</p>
            <p style="color:#00ccff;font-size:32px;font-family:monospace;font-weight:700;letter-spacing:4px;margin:0">${promoCode}</p>
            <p style="color:#666;font-size:11px;margin:10px 0 0">Mention this code when requesting your quote</p>
          </div>

          <p style="color:#ccc;font-size:14px;line-height:1.6">
            Parcel boundary overlays are GPS-accurate boundaries drawn directly onto your aerial imagery —
            perfect for buyers, agents, and developers who need to understand site limits, access, and frontage at a glance.
          </p>

          <a href="https://seraphicsight.com/contact?promo=${promoCode}&service=parcel-overlay"
             style="display:inline-block;background:#00ccff;color:#000;font-weight:700;text-decoration:none;
                    padding:14px 32px;border-radius:4px;font-size:14px;letter-spacing:1px;margin-top:8px">
            CLAIM MY FREE OVERLAY
          </a>

          <p style="color:#444;font-size:12px;margin-top:32px;border-top:1px solid #1a2a3a;padding-top:16px">
            Seraphic Sight &nbsp;·&nbsp; FAA Licensed Aerial Imaging<br>
            <a href="https://seraphicsight.com" style="color:#0099cc">seraphicsight.com</a>
          </p>
        </div>
      `,
    }),
  });

  if (!notifyRes.ok || !rewardRes.ok) {
    const e1 = await notifyRes.text().catch(()=>"");
    const e2 = await rewardRes.text().catch(()=>"");
    console.error("Resend errors:", e1, e2);
    return res.status(500).json({ error: "Email send failed" });
  }

  return res.status(200).json({ ok: true, promoCode });
}
