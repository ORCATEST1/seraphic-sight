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
  // The regular /resources endpoint ignores asset_folder as a filter.
  // The Search API is required to filter by asset_folder in Cloudinary's dynamic folder model.
  const expression = `asset_folder="${folder}" AND resource_type:${type}`;
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/search?expression=${encodeURIComponent(expression)}&max_results=50`;

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
    // Insert transformations between /upload/ and the version/public_id:
    //   f_auto  → convert any format (DNG, TIFF, etc.) to browser-displayable JPEG/WebP
    //   q_auto  → auto quality/compression
    //   a_exif  → apply EXIF rotation so drone photos appear right-side-up
    // w_2000,c_limit caps width at 2000px — still sharp in lightbox but avoids
    // serving raw 50–80 MB drone files. Videos get adaptive codec + quality.
    const xform = type === "image" ? "f_auto,q_auto,a_exif,w_2000,c_limit" : "vc_auto,q_auto";
    const urls = (data.resources || []).map(r =>
      r.secure_url.replace("/upload/", `/upload/${xform}/`)
    );

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    return res.json({ urls });
  } catch (err) {
    console.error("cloudinary-images handler error:", err);
    return res.status(500).json({ error: err.message });
  }
}
