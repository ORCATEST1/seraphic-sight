// Creates static, route-specific head tags while keeping CRA/React Router
// client-side rendering and all interactive page components unchanged.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = "build";
const original = readFileSync(join(root, "index.html"), "utf8");
const domain = "https://seraphicsight.com";
const entries = {
  "property-marketing": {
    title: "Property Marketing | Aerial Photography & Film | Seraphic Sight",
    description: "Aerial property photography, cinematic film, and listing imagery for Southern California real estate professionals."
  },
  construction: {
    title: "Construction Drone Documentation & Mapping | Seraphic Sight",
    description: "Progress photography, orthomosaic mapping and visual construction documentation for project teams across Southern California."
  },
  portfolio: {
    title: "Aerial Photography & Construction Portfolio | Seraphic Sight",
    description: "Explore selected drone photography, aerial film, and construction mapping work from Seraphic Sight."
  },
  "service-area": {
    title: "Southern California Drone Service Area | Seraphic Sight",
    description: "Explore Seraphic Sight's drone photography and construction documentation service areas across Southern and Central California."
  },
  faq: {
    title: "Drone Services Frequently Asked Questions | Seraphic Sight",
    description: "Answers about Seraphic Sight aerial photography, drone video, construction mapping, deliverables, and project scheduling."
  },
  contact: {
    title: "Request a Drone Services Quote | Seraphic Sight",
    description: "Request a quote for aerial property photography, cinematic video or construction mapping in Southern California."
  }
};
const escapeAttr = value => value.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
function replaceHead(html, pattern, tag) {
  if (!pattern.test(html)) throw new Error("Missing head tag needed for metadata generation: " + tag);
  return html.replace(pattern, tag);
}
for (const [slug, page] of Object.entries(entries)) {
  const title = escapeAttr(page.title);
  const description = escapeAttr(page.description);
  const url = domain + "/" + slug;
  let html = original;
  html = replaceHead(html, /<title>[^<]*<\/title>/i, "<title>" + title + "</title>");
  html = replaceHead(html, /<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/i, '<meta name="description" content="' + description + '">');
  html = replaceHead(html, /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i, '<link rel="canonical" href="' + url + '">');
  html = replaceHead(html, /<meta\b(?=[^>]*\bproperty=["']og:title["'])[^>]*>/i, '<meta property="og:title" content="' + title + '">');
  html = replaceHead(html, /<meta\b(?=[^>]*\bproperty=["']og:description["'])[^>]*>/i, '<meta property="og:description" content="' + description + '">');
  html = replaceHead(html, /<meta\b(?=[^>]*\bproperty=["']og:url["'])[^>]*>/i, '<meta property="og:url" content="' + url + '">');
  html = replaceHead(html, /<meta\b(?=[^>]*\bname=["']twitter:title["'])[^>]*>/i, '<meta name="twitter:title" content="' + title + '">');
  html = replaceHead(html, /<meta\b(?=[^>]*\bname=["']twitter:description["'])[^>]*>/i, '<meta name="twitter:description" content="' + description + '">');
  mkdirSync(join(root, slug), { recursive: true });
  writeFileSync(join(root, slug, "index.html"), html, "utf8");
}
console.log("Generated " + Object.keys(entries).length + " route-specific HTML shells.");
