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
  if (req.method !== "GET") return res.status(405).end();
  const { folder, type = "image" } = req.query;

  if (typeof folder !== "string" || !/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(folder) || folder.length > 100 || !["image", "video"].includes(type)) {
    return res.status(400).json({ error: "Invalid folder or type." });
  }
  // Configure CLOUDINARY_PUBLIC_FOLDERS with comma-separated permitted asset folders.
  // Fail closed: never expose an unrestricted search endpoint.
  const permitted = (process.env.CLOUDINARY_PUBLIC_FOLDERS || "").split(",").map(s => s.trim()).filter(Boolean);
  if (!permitted.includes(folder)) return res.status(403).json({ error: "Folder not permitted." });
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return res.status(503).json({ error: "Media temporarily unavailable." });
  }

  const auth = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString("base64");
  // The regular /resources endpoint ignores asset_folder as a filter.
  // The Search API is required to filter by asset_folder in Cloudinary's dynamic folder model.
  const expression = `asset_folder="${folder}" AND resource_type:${type}`;
  const url = `https://api.cloudinary.com/v1_1/${encodeURIComponent(CLOUDINARY_CLOUD_NAME)}/resources/search?expression=${encodeURIComponent(expression)}&max_results=50`;

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!response.ok) {
      console.error("Cloudinary media search failed with status:", response.status);
      return res.status(502).json({ error: "Media temporarily unavailable." });
    }

    const data = await response.json();
    // Insert transformations between /upload/ and the version/public_id:
    //   f_auto  → convert any format (DNG, TIFF, etc.) to browser-displayable JPEG/WebP
    //   q_auto  → auto quality/compression
    //   a_exif  → apply EXIF rotation so drone photos appear right-side-up
    // w_2000,c_limit caps width at 2000px — still sharp in lightbox but avoids
    // serving raw 50–80 MB drone files. Videos get adaptive codec + quality.
    const xform = type === "image" ? "f_auto,q_auto,a_exif,w_2000,c_limit" : "vc_auto,q_auto";
    // Only return assets actually hosted by our Cloudinary account. Provider
    // records should not be allowed to introduce arbitrary external URLs.
    const assetPrefix = `/${encodeURIComponent(CLOUDINARY_CLOUD_NAME)}/${type}/upload/`;
    const urls = (Array.isArray(data.resources) ? data.resources : [])
      .slice(0, 50)
      .flatMap(resource => {
        if (typeof resource?.secure_url !== "string") return [];
        try {
          const asset = new URL(resource.secure_url);
          if (asset.protocol !== "https:" || asset.hostname !== "res.cloudinary.com" ||
              !asset.pathname.startsWith(assetPrefix) || asset.username || asset.password ||
              asset.search || asset.hash) return [];
          asset.pathname = asset.pathname.replace(assetPrefix, assetPrefix + xform + "/");
          return [asset.toString()];
        } catch { return []; }
      });

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    return res.json({ urls });
  } catch (err) {
    console.error("Cloudinary media request failed:", err instanceof Error ? err.name : "unknown");
    return res.status(502).json({ error: "Media temporarily unavailable." });
  }
}
