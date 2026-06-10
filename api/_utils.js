// Shared helpers for the API routes.

// Escape user input before interpolating into email HTML —
// prevents HTML/markup injection into the emails we send ourselves.
export function esc(v) {
  return String(v ?? "")
    .slice(0, 2000)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function isEmail(v) {
  return typeof v === "string" && v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// Best-effort in-memory rate limiter (per serverless instance).
// Not bulletproof across cold starts, but stops naive bots/loops from
// burning the Resend quota. For stronger guarantees move to Upstash/Vercel KV.
const hits = new Map();
export function rateLimit(req, { limit = 5, windowMs = 10 * 60 * 1000 } = {}) {
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress || "unknown";
  const now = Date.now();
  const rec = hits.get(ip) || { count: 0, start: now };
  if (now - rec.start > windowMs) { rec.count = 0; rec.start = now; }
  rec.count += 1;
  hits.set(ip, rec);
  if (hits.size > 5000) hits.clear(); // crude memory cap
  return rec.count <= limit;
}
