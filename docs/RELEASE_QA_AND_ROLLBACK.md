# Seraphic Sight release candidate: QA and rollback

**Scope:** React redesign + API hardening. Development branch: `security/redesign-hardening-2026-11-16`. Do not merge, promote, or mutate production without explicit owner approval. Record the exact tested SHA, rather than treating a moving branch URL as a release candidate.

## Non-negotiable safety boundaries
- Production Vercel project: `seraphic-sight-t9fw`; current original baseline verified at `14101d714f722fba65d4067dbd19cb105f522f2e` on November 17, 2026.
- Domain aliases: `seraphicsight.com`, `www.seraphicsight.com`. **Never move aliases to an unapproved preview.**
- Original showroom source/media remain in Git; public `/showroom` should redirect to `/portfolio`; `/api/claim-reward` returns 410.
- No change to production credentials or active email delivery is authorized in this checklist.
- Keep the private AI lead-intelligence project and its records completely separate from this public repository.

## Automated release gates
1. Pin the candidate commit SHA. Require GitHub Actions **Website safety checks** to pass for that SHA.
2. `npm ci` with the committed lockfile, then `npm run test:api`.
3. `CI=true GENERATE_SOURCEMAP=false npm run build` and `node scripts/verify-route-html.mjs`.
4. Inspect the Vercel preview deployment linked to the **same SHA**; do not accept an older green deployment as evidence for newer commits.
5. Before approval, investigate dependency alerts, exposed secrets, and important browser-console errors. A successful build is not a security audit.

## HTTP smoke tests for the pinned preview
Replace `PREVIEW_URL` with the immutable Vercel deployment URL; inspect response codes and headers (protected previews may require Vercel-authenticated tooling).
- `/`, `/property-marketing`, `/construction`, `/portfolio`, `/contact`, `/service-area`, `/faq`: HTTP 200; appropriate server-delivered title, canonical, OG description/url.
- `/nonexistent-release-test`: HTTP 404 (not an SPA 200).
- `/showroom`: HTTP 308 to `/portfolio` on the original response; clients following redirects should reach the portfolio.
- `/api/claim-reward`: HTTP 410.
- `/sitemap.xml`: no archived showroom URL.
- Old production JS source-map URL: 404; also confirm **new** production build source maps are not exposed.
- Verify security headers: nosniff, frame DENY, referrer policy, HTTPS/HSTS, preview X-Robots-Tag noindex. Evaluate report-only CSP separately before enforcement.
- Confirm the active preview uses the right hero and authentic Cloudinary imagery; don't upscale C3 or archived showroom assets.

## Human/browser QA: still requires signoff per candidate SHA
- Desktop, 390px mobile and 768px tablet; test Safari/iOS if available.
- Video begins only when playable; no separate photo flash. Pause control, autoplay failure, reduced motion, and Save-Data fallback all behave.
- Navigation, mobile menu keyboard behavior, focus-visible, no side-scrolling, accessible contrast.
- Portfolio filtering, photo/video viewer, keyboard Space/Enter, Escape, focus trapping/restoration, deep links.
- Contact form field labels, Enter-to-submit, email whitespace normalization, 400/413/429/503 errors, duplicate prevention and success state.
- No unsolicited real email test. With **dedicated Preview** credentials, preview-only recipient and explicit owner authorization, perform one controlled inquiry and verify inbox/reply-to.

## Known release risks
- Current five Vercel variables for Cloudinary, Resend and Turnstile were observed as **All Environments**. Split Preview and Production scopes and use least-privilege preview credentials before any live submission test; don't expose values in chat or in Git.
- `CONTACT_REQUIRE_TURNSTILE` is feature-gated and not considered active until a matching public site key, server secret, provider hostname settings and actual live challenge flow have been verified.
- Rate limiting is still in-memory per serverless instance. Do not claim robust distributed abuse resistance without durable/platform-level controls.
- The Cloudinary folder-search endpoint denies requests unless `CLOUDINARY_PUBLIC_FOLDERS` is configured. Current portfolio uses static asset metadata; validate any future consumers before configuring.
- Do not rely on client-rendered meta changes for social crawlers; inspect server-generated HTML.
- Check official provider configuration and incident logs for Resend/Cloudinary/Vercel before claiming full service reliability.

## Production approval and rollback plan
1. Present candidate SHA, immutable preview URL, green CI run, browser QA evidence, unresolved risks, and exact release diff to owner.
2. Obtain **explicit approval** for merging and production deployment. Do not presume approval from visual-preview acceptance.
3. On approval, merge reviewed PR only after required CI checks; confirm production deployment SHA and domain aliases.
4. Smoke-test landing page, contact API (without sending an unsolicited inquiry), portfolio, metadata, SEO and 404 behavior on production.
5. If a critical regression occurs, **restore the previous READY production deployment** via Vercel's authorized rollback/promote mechanism and confirm both domains resolve to the restored deployment; preserve logs and investigate before a new release. The old baseline SHA is `14101d7`, but always reverify the actual prior READY deployment ID at release time.
6. Never rotate, delete, or alter production secrets solely as part of a webpage rollback without specific security rationale and owner authorization.
