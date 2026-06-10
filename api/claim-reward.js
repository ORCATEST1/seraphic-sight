import { esc, isEmail, rateLimit } from "./_utils.js";

// Max legitimate score: 7 waypoints × 100 + max time bonus (90s × 3 = 270)
const MAX_SCORE = 7 * 100 + 270;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  // Strict limit — this endpoint sends email to an arbitrary address, so it
  // must not be usable as a spam relay.
  if (!rateLimit(req, { limit: 3, windowMs: 30 * 60 * 1000 }))
    return res.status(429).json({ error: "Too many requests — please try again later." });

  const { name, email, score, time, sessionId, wpOrder, collisions } = req.body || {};

  if (!name || !isEmail(email)) return res.status(400).json({ error: "Missing fields" });
  if (typeof sessionId !== "string" || !/^[a-z0-9]{10,40}$/i.test(sessionId))
    return res.status(400).json({ error: "Invalid session" });
  const numScore = Number(score), numTime = Number(time);
  if (!Number.isFinite(numScore) || numScore < 0 || numScore > MAX_SCORE ||
      !Number.isFinite(numTime) || numTime < 3 || numTime > 3600 ||
      !Array.isArray(wpOrder) || wpOrder.length > 7)
    return res.status(400).json({ error: "Invalid mission data" });

  // Generate a unique promo code tied to this session
  const promoCode = "PARCEL-" + sessionId.slice(0, 6).toUpperCase();
  const safeName = esc(name), safeEmail = esc(email);

  // ── Email 1: Lead notification to Joseph ─────────────────────────────────
  const notifyRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    body: JSON.stringify({
      from: "showroom@seraphicsight.com",
      to:   "joseph@seraphicsight.com",
      reply_to: email,
      subject: `New Drone Mission Lead — ${safeName}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#0099cc;margin-bottom:4px">Drone Mission — New Lead</h2>
          <p style="color:#666;font-size:13px;margin-top:0">Submitted from the 3D Showroom</p>
          <table style="font-size:14px;border-collapse:collapse;width:100%">
            <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600;width:140px">Name</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${safeName}</td></tr>
            <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Email</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${safeEmail}</td></tr>
            <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Score</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${numScore} pts</td></tr>
            <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Time</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${Math.round(numTime)}s</td></tr>
            <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Collisions</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${Number(collisions) || 0}</td></tr>
            <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Promo Code</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-family:monospace;font-weight:700;color:#0099cc">${promoCode}</td></tr>
            <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Session ID</td><td style="padding:8px 12px;font-family:monospace;font-size:12px;color:#999">${esc(sessionId)}</td></tr>
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
      from: "joseph@seraphicsight.com",
      to:   email,
      subject: "Your Free Parcel Overlay — Mission Complete 🎯",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#060C18;color:#fff;padding:40px;border-radius:8px">
          <h1 style="color:#00ccff;font-size:28px;margin-bottom:4px;letter-spacing:2px">MISSION COMPLETE</h1>
          <p style="color:#0099cc;font-size:14px;margin-top:0;letter-spacing:1px">Score: ${numScore} pts &nbsp;·&nbsp; Time: ${Math.round(numTime)}s</p>

          <p style="color:#ccc;font-size:15px;line-height:1.6">
            Hi ${safeName}, congratulations on completing the Seraphic Sight Drone Mission!
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
            Seraphic Sight &nbsp;·&nbsp; FAA Part 107 Certified Aerial Imaging<br>
            <a href="https://seraphicsight.com" style="color:#0099cc">seraphicsight.com</a>
          </p>
        </div>
      `,
    }),
  });

  if (!notifyRes.ok || !rewardRes.ok) {
    const e1 = await notifyRes.text().catch(() => "");
    const e2 = await rewardRes.text().catch(() => "");
    console.error("Resend errors:", e1, e2);
    return res.status(500).json({ error: "Email send failed" });
  }

  return res.status(200).json({ ok: true, promoCode });
}
