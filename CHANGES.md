# Seraphic Sight — Implemented Changes
All QC fixes + level-up ideas. Build verified: `Compiled successfully`, zero warnings.
Bundle is now code-split: main 254KB gz, showroom/portfolio load as separate chunks.

## How to apply
Copy these files over your repo (or `git apply seraphic-sight-changes.patch` from the repo root):

- `src/App.js`
- `src/components/CinematicHero.js`
- `src/components/SpatialShowroom.js`
- `src/components/PortfolioSection.js`
- `public/index.html`
- `public/sitemap.xml` (new)
- `public/robots.txt`
- `api/contact.js`
- `api/claim-reward.js`
- `api/_utils.js` (new)

## CinematicHero.js (v4)
- **Headline visible on load** — brand text fades in on mount; scroll only fades it out. No more anonymous dark screen on first paint.
- **Scan-build intro** — the point cloud assembles bottom-to-top over ~2.6s with the scan beam tracking the build height (drawRange reveal, the original v3 intent, now wired up).
- **End-of-scroll blob bug fixed** — Scene 3 camera clamped to y=16.5/z=24, above the terrain peaks; it no longer dives inside the cloud.
- Progress bar moved below the nav (was hidden behind it).
- HUD: truthful specs (photogrammetry/RTK — removed the fake LiDAR line) cycling every 4s.
- Geometry/material disposal on unmount (GPU leak fix); pixel ratio updated on resize; WebGL failure fallback; `prefers-reduced-motion` gets a static cloud + visible text + 100vh (no scroll-jack); hero shortened 350vh → 300vh.

## SpatialShowroom.js (v14)
- React state sync throttled to every 10 frames (was re-rendering the UI tree at 60fps).
- Proximity-based video play/pause on **all** devices (desktop previously decoded 6 streams forever).
- Removed 18 per-panel spotlights (panels are unlit materials — pure shader cost).
- Full scene disposal on exit (geometries, materials, canvas/video textures).
- Page scroll + Lenis locked while in showroom (wheel no longer scrolls the footer into view).
- "← EXIT SHOWROOM" pill (nav/footer are now hidden on /showroom).
- Modal CTAs use SPA navigation (no full reloads); WebGL-unavailable fallback screen with portfolio/contact links; sets its own page title.

## App.js
- **SEO:** lightweight `usePageMeta` hook — unique title + meta description per route (no new dependency).
- **Lazy loading:** showroom + portfolio code-split via `React.lazy`/`Suspense`.
- **3D Showroom teaser section** on Home (aerial backdrop, mission pitch, Enter Showroom CTA).
- **Contact form:** inline validation with visible errors (was failing silently), email format check, red borders, aria-invalid.
- Lenis instance shared (`window.__lenis`): route changes scroll-to-top through Lenis; showroom pauses it; ticker callback removed on cleanup (leak fix); Lenis skipped entirely for reduced-motion users.
- `ScrollTrigger.refresh()` after Home mounts (pin mis-measurement fix).
- Droners.io links now deep-link to https://droners.io/accounts/seraphicsight/ (2 places).
- Text scramble respects `prefers-reduced-motion`.
- Removed dead `PortfolioLightbox`/`PortfolioCard` (~90 lines) + unused imports; fixed mojibake in the ortho map caption; fixed mis-indented closing brace; nav/footer hidden on /showroom.

## PortfolioSection.js
- **Deep links:** `/portfolio?item=<cloudinary-id>` opens that exact photo/video; the lightbox keeps the URL in sync, so any open item is shareable.
- Silenced JSX comment-textnode warnings (decorative `//` strings wrapped in braces).

## public/index.html
- Removed `@google/model-viewer` (loaded twice, used nowhere — ~1MB saved).
- Open Graph + Twitter card tags with a real og:image (golden-hour aerial) — shared links now show a preview.
- Canonical URL, useful noscript fallback (phone/email), theme-color matches the site.
- JSON-LD `LocalBusiness` schema: services, area served, 5.0/26 aggregate rating, droners.io profile in `sameAs`.

## public/sitemap.xml (new) + robots.txt
- All 8 routes; robots.txt points to the sitemap.

## api/ (security hardening)
- `_utils.js` (new): HTML-escaping, email validation, best-effort in-memory rate limiter.
- `contact.js`: rate-limited (5/10min/IP), validates email, escapes all user input before email interpolation.
- `claim-reward.js`: rate-limited (3/30min/IP — it emails arbitrary addresses, so this stops spam-relay abuse), validates sessionId format, clamps score (max legit = 970) and time, escapes input.
- **Recommended next step:** swap the in-memory limiter for Upstash/Vercel KV for cross-instance guarantees.

## Verify after deploy
1. Hard-refresh home: cloud builds bottom-up, headline appears without scrolling.
2. Scroll to the very end of the hero: no giant point blobs.
3. Share `https://seraphicsight.com` in iMessage/Slack: preview card with image appears.
4. `/portfolio?item=DJI_0915_w53hst` opens that photo directly.
5. Showroom: wheel no longer scrolls page; videos pause when far away; EXIT pill works.
6. Contact form: submit empty → visible errors.
