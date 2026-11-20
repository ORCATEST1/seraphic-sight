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

const preferredOrigin = "https://www.seraphicsight.com";
const sitemap = read("public/sitemap.xml");
const robots = read("public/robots.txt");
assert.ok(robots.includes("Sitemap: " + preferredOrigin + "/sitemap.xml"), "Robots sitemap must target preferred www domain");
const expectedPaths = ["/", ...expectedRoutes.map(slug => "/" + slug)];
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\\/loc>/g)].map(match => match[1]);
assert.deepEqual(sitemapUrls, expectedPaths.map(path => preferredOrigin + path), "Sitemap must contain only real, self-canonical public pages");
assert.ok(!sitemap.includes("https://seraphicsight.com"), "Sitemap must not contain non-www redirecting URLs");

const shells = [{ path: "/", html: htmlRoot }, ...expectedRoutes.map(slug => ({path:"/"+slug,html:read(join("build",slug,"index.html"))}))];
for (const {path,html} of shells) {
  const canonical = [...html.matchAll(/<link\\b[^>]*\\brel="canonical"[^>]*>/g)];
  assert.equal(canonical.length,1,"Exactly one canonical expected for " + path);
  assert.ok(canonical[0][0].includes('href="' + preferredOrigin + path + '"'),"Canonical must self-reference www URL for " + path);
  assert.ok(html.includes('property="og:url" content="' + preferredOrigin + path + '"'),"Social URL must use preferred www URL for " + path);
  assert.ok(!html.includes('name="robots" content="noindex"'),"Public " + path + " must remain indexable");
}
const jsonLdMatches = [...htmlRoot.matchAll(/<script type="application\\/ld\\+json">([\\s\\S]*?)<\\/script>/g)];
assert.equal(jsonLdMatches.length,1,"Exactly one local-business JSON-LD block is expected");
const business = JSON.parse(jsonLdMatches[0][1]);
assert.equal(business.url,preferredOrigin+"/");
assert.equal(business["@id"],preferredOrigin+"/#business");
assert.equal(business.telephone,"+1-562-743-1698");
assert.ok(!("aggregateRating" in business),"Unverified review count must not be claimed in structured data");
assert.ok(!htmlRoot.includes('https://seraphicsight.com'),'Non-www absolute URLs must not remain in HTML head');

console.log(`Verified ${expectedRoutes.length} generated route shells, app assets, sitemap and fallback routing.`);
