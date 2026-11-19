# Editorial refinement and copy quality audit

## Scope
Second-pass design following the production launch at `e97898259418c4ca7a1da9f1ba88d6f7d9009b50`.
The landing page is intentionally unchanged. This branch redesigns Property Marketing, Construction, Portfolio, Contact, FAQ and Service Area. The contact form's transport and server API are unchanged.

## Copy decisions
| Previous phrasing / presentation | Revision / rationale |
| --- | --- |
| "Enterprise-grade" and "audit-ready" in nearly every construction section | Replace with concrete use cases: dated site imagery, repeat visits, orthomosaic mapping when scoped, stakeholder context |
| "Every engagement includes" GeoTIFF + LAS/LAZ + many outputs | Remove blanket promise. Explicitly specify actual mapping formats and accuracy requirements during scoping |
| Airspace waivers automatically obtained at no extra cost | Explain that LAANC or further authorization depends on location and cannot be guaranteed |
| 400-mile fixed coverage radius / 200+ cities / "same-week" availability | Replace with a map of representative hubs, selectable region details, and project-specific coverage confirmation |
| Exact drone/camera models presented as permanent | Describe equipment selected to each assignment until the verified gear list is maintained |
| Completed photos, videos and mapping guaranteed in 3–4 days | State a typical standard-property turnaround and confirm heavier workflows by quote |
| Parcel-line overlays treated without caveat | Clarify marketing overlays are not legal boundaries or licensed land surveys |
| Huge card collections and repeated generic CTAs | Prioritize visual hierarchy: real photography, purpose-driven copy and a single primary enquiry action |
| Dozens of same-sized portfolio media cards up front | Create three featured media studies, then retain all original categories, filters, media, and deep links |

## Facts for the owner to confirm before final publication
- Public property package pricing: Essentials $249, Professional $399, Premium $599. These are retained from existing site data, not independently verified rates.
- Published travel policy: $0.70/mile, under 50 miles round-trip and 50+ miles one-way. Retained, not changed.
- Typical standard-turnaround target around 3–4 business days.
- Current insurance / COI language and desired service availability.
- Specific approved social sharing / licensing usage rights for each existing gallery item.

## Map design note
The Leaflet map uses selectable dots and translucent highlighting centered on eight representative regional hubs: Los Angeles, Orange County, Inland Empire, Temecula/Southwest Riverside, Coachella Valley, High Desert, San Diego, and Southern Central Valley.
These are **NOT legally surveyed boundaries, guaranteed coverage zones, or flight authorization areas**. The page explicitly asks the visitor to confirm each assignment's address, availability and airspace. Map tile imagery and the Leaflet runtime are loaded from third-party CDN providers; a text-based area selector remains visible if mapping fails.
Background tiles use OpenStreetMap-derived CARTO imagery with provider attribution.

## Portfolio decision
Do not invent client names, job site addresses or commissioned project descriptions from file IDs alone.
The feature headings are editorial subject groups, not fabricated project case studies. Real case-study titles can be added later after client/usage approval; gallery contents and deep-link IDs remain available.

## Preview release gates
1. GitHub CI: npm ci, API tests, new service/map interaction tests, strict CRA build, generated-route metadata checks.
2. Immutable Vercel preview built from exact PR commit; verify map markers/tiles, region selector, all eight text fallback entries, and narrow mobile behavior.
3. Validate curated feature photos and lightbox controls; ensure full media inventory still appears under gallery filters.
4. Inspect Contact on mobile and complete a **read-only** submission-flow walkthrough (real delivery was already confirmed by owner).
5. Obtain owner visual approval before merge to main.
6. Retain the existing production deployment as rollback target.

## Deployment blocker
Vercel deployment API rejected a forced Preview deployment on November 17, 2026 with HTTP 402, code `api-deployments-free-per-day`, stating more than 100 deployments today and a 24-hour limit. Do not attempt to bypass quotas; leave the PR as draft until an authorized preview build can be run.
