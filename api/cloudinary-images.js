// Fetches images or videos from a Cloudinary folder.
// Query params:
//   folder (required) – Cloudinary folder name (e.g. "hero-shots")
//   type   (optional) – "image" (default) or "video"
//
// Required Vercel environment variables:
//   CLOUDINARY_CLOUD_NAME
//   CLOUDINARY_API_KEY
//   CLOUDINARY_API_SECRET
export default async function handler(req, res) {
  const { folder, type = "image" } = req.query;

  if (!folder) {
    return res.status(400).json({ error: "folder is required" });
  }

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return res.status(500).json({ error: "Cloudinary environment variables not configured" });
  }

  const auth = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString("base64");
  // Trailing slash ensures we match files inside the folder, not files whose name starts with the folder name
  const prefix = folder.endsWith("/") ? folder : `${folder}/`;
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/${type}/upload?prefix=${encodeURIComponent(prefix)}&type=upload&max_results=50`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Cloudinary API error:", response.status, text);
      return res.status(502).json({ error: `Cloudinary error ${response.status}` });
    }

    const data = await response.json();
    const urls = (data.resources || []).map(r => r.secure_url);

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    return res.json({ urls });
  } catch (err) {
    console.error("cloudinary-images handler error:", err);
    return res.status(500).json({ error: err.message });
  }
}
