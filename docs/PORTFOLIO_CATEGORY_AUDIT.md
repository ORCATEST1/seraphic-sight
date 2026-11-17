# Portfolio category audit — 2026-11-17

## Root cause
The photo catalogue in `src/components/PortfolioSection.js` used manually entered `tags` as both the on-card description and the filter's source of truth. Several photos marked `Land` visibly show developed property, construction equipment, a downtown nighttime skyline, or photogrammetry. The old caption `FILTER BY DELIVERABLE TYPE` also described subject/industry filters incorrectly.

This is a taxonomy / metadata issue, not a CSS problem.

## Corrected entries, grounded in the supplied Land-filter screenshot

The screenshot shows the Land results in catalogue order. We preserved every Cloudinary ID and the gallery's deep-linking, while changing the incorrect subject assignment:

| Public ID | Previous | New primary category | Screenshot evidence |
| --- | --- | --- | --- |
| `DJI_0454_bkvuwb` | Land | Real Estate | Aerial view of an existing mobile-home community with property overlay |
| `4-DJI_0960_etujxs` | Land | Construction | Active lift/crane and site work, not undeveloped land |
| `3-DJI_0014_xn3a13` | Land | Cityscapes | Nighttime downtown/cityscape imagery is not a commercial-property listing |
| `DJI_0768_nvafya` | Land | Construction | Street works and equipment among coastal palm trees |
| `DJI_0104_uzqlyr` | Land | Real Estate | Existing houses / parcels with white property boundary overlay |
| `map-snapshot_q3dk25` | Construction + Land | Construction | Site-mapping/photogrammetry visualization |
| `dji_fly_20230107_163233_917_1673141677255_photo_m5emzx` | Land | Unclassified (All only) | Not clearly visible in screenshot; classification deferred rather than invented |

## UI changes
- Changed `FILTER BY DELIVERABLE TYPE` to `FILTER BY SUBJECT` in the second-pass portfolio layout.
- Filters and their counts are computed from the current catalogue, and empty subject filters are hidden. The `Land` button is absent until at least one genuinely verified land photo is assigned.
- Media with an unverified subject remain visible in `All` and use the generic card caption `Aerial Study`.
- No imagery has been removed and original photo IDs / links remain unchanged.
- Added automated tests to enforce a maximum of one primary subject per photo and guard against the six known mismatches.

## Broader audit limitation
The supplied screenshot is authoritative for the visible Land subset, not for the subjects of every one of the 42 photos. An attempted automated browser audit only inspected a subset in detail and produced contradictory image-to-ID observations for some photos, so it was not used to override the screenshot-derived assignments or to claim a full-gallery audit.

**Next quality gate:** create a numbered contact sheet with all 42 actual images, have the owner verify categories and select a compelling featured set. Consider distinguishing `Cityscapes / Architecture` from `Commercial property` if that is a major part of the body of work. Do not invent specific client or property metadata.

## Follow-up correction
- Introduced a distinct `Cityscapes` category for nighttime downtown imagery instead of treating city architecture as a commercial-property assignment.
- Replaced the inaccurate `03 / LAND` featured-study label with a genuine cityscape image and title.
- Photo filters are described as subjects; video filters as film types. No claim that all 42 photos have received full visual confirmation.

## 3D mapping clarification
The orthomosaic/photogrammetry asset `map-snapshot_q3dk25` is now under a dedicated `Mapping` filter instead of generic `Construction`. This allows prospective construction clients to discover the mapping deliverable directly. The original media ID and lightbox behavior are retained.

A browser check confirmed `3-DJI_0014_xn3a13` is the identical source file in the Cityscapes filter and featured-study card despite differing responsive crops. Escape and the labeled Close button both dismiss the media dialog.
