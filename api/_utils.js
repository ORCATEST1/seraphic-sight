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
  // Accept only a string supplied by the hosting proxy; never assume an
  // arbitrary client-sent header provides strong identity or distributed limits.
  const forwarded = req.headers?.["x-forwarded-for"];
  const ip = (typeof forwarded === "string" ? forwarded.split(",")[0].trim() : "") ||
    req.socket?.remoteAddress || "unknown";
  const now = Date.now();
  const rec = hits.get(ip) || { count: 0, start: now };
  if (now - rec.start > windowMs) { rec.count = 0; rec.start = now; }
  rec.count += 1;
  hits.set(ip, rec);
  // Reclaim expired records first. Do not clear everyone's counters just
  // because many distinct requesters have arrived (which bypasses limits).
  if (hits.size > 5000) {
    for (const [key, value] of hits) {
      if (now - value.start > windowMs) hits.delete(key);
    }
    while (hits.size > 5000) hits.delete(hits.keys().next().value);
  }
  return rec.count <= limit;
}
