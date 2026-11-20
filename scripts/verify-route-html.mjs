// Deterministic post-build checks, no network calls or credentials.
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const read = path => readFileSync(path, "utf8");
const htmlRoot = read(join("build", "index.html"));
const routeMeta = {
  "property-marketing": "Property Marketing",
  construction: "Construction Drone Documentation",
  portfolio: "Aerial Photography",
  "service-area": "Southern California Drone Service Area",
  faq: "Frequently Asked Questions",
  contact: "Request a Drone Services Quote"
};
const config = JSON.parse(read("vercel.json"));
const expectedRoutes = Object.keys(routeMeta);
assert.match(htmlRoot, /<title>Seraphic Sight/);
assert.match(htmlRoot, /rel="canonical" href="https:\/\/www\.seraphicsight\.com\/"/);
const srcRefs = [...htmlRoot.matchAll(/(?:src|href)="(\/static\/(?:js|css)\/[^"]+)"/g)].map(match => match[1]);
assert.ok(srcRefs.length >= 1, "homepage must reference built assets");

for (const [slug, titlePart] of Object.entries(routeMeta)) {
  const path = join("build", slug, "index.html");
  assert.ok(existsSync(path), `Missing generated shell for /${slug}`);
  const html = read(path);
  assert.ok(html.includes("<title>") && html.includes(titlePart), `Wrong title: /${slug}`);
  assert.ok(html.includes(`rel="canonical" href="https://www.seraphicsight.com/${slug}"`), `Wrong canonical: /${slug}`);
  assert.ok(html.includes(`property="og:url" content="https://www.seraphicsight.com/${slug}"`), `Wrong OG URL: /${slug}`);
  assert.ok(html.includes('name="description"'), `Missing description: /${slug}`);
  for (const ref of srcRefs) assert.ok(html.includes(ref), `Missing app asset in /${slug}: ${ref}`);
  assert.ok(config.routes.some(route => route.src === `^/${slug}/?$` && route.dest === `/${slug}/index.html`),
    `No explicit Vercel routing for /${slug}`);
}

const routes = config.routes;
const filesystemIndex = routes.findIndex(route => route.handle === "filesystem");
const notFoundIndex = routes.findIndex(route => route.status === 404);
assert.ok(filesystemIndex >= 0 && notFoundIndex > filesystemIndex, "Missing filesystem-to-404 fallback");
assert.ok(routes.some(route => route.src === "^/showroom/?$" && route.status === 308 &&
  route.headers?.Location === "/portfolio"), "Archived showroom must redirect");
assert.ok(!read("public/sitemap.xml").includes("/showroom"), "Archived showroom listed in sitemap");
assert.ok(!existsSync(join("build", "showroom", "index.html")), "Showroom generated as standalone page");
console.log(`Verified ${expectedRoutes.length} generated route shells, app assets, sitemap and fallback routing.`);
