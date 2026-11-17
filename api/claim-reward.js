// Archived showroom mission endpoint. Preserve the original implementation in Git history.
// Returning 410 prevents reward emails and fabricated promo claims after archival.
export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(410).json({ error: "This experience is no longer available." });
}
