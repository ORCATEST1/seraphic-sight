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

## Full-catalogue audit attempt: November 17, 2026

**42/42 public IDs were individually submitted for direct image review** in four browser batches.
**37 images rendered and were described**, while **5 did not render** despite inspection/retries:

- `Showcase_nmenkd`
- `Showcase_2_pkjbvm`
- `Showcase_3_n4gxow`
- `AB3BA538-17AE-4CB0-9614-64DACF77AD60_qdj1dz`
- `dji_fly_20230107_163233_917_1673141677255_photo_m5emzx`

Those five remain in **All**, have **no asserted subject category**, and their public IDs/media have not been removed. A browser-loading failure during inspection does not establish that an original asset is deleted or broken for customers.

The source inspection produced a substantial set of genuine-looking subject descriptions but had **inconsistent visual attribution** for a few consecutive images. This is why individual browser batch descriptions are not treated as independently verified truth. In particular, direct batch descriptions for `3-DJI_0014_xn3a13`, `DJI_0768_nvafya`, and `DJI_0104_uzqlyr` disagreed with the user's original labeled screenshot or a prior controlled preview. For these three, we retained screenshot-supported assignments, rather than blindly overwriting them. The automated browser provider reached its spending limit before a further independent visual recheck could be completed.

Additional lower-risk subject improvements from the successfully rendered batches were committed:
- Residential housing/multifamily photos `DJI_0802_cdwyvj`, `DJI_0730_enavrk`, `DJI_0327_it5brs`, `Aerial_18_njtmry`, `Aerial_25_y6eahl`, `DJI_0322_khfwqi`, `DJI_0036-HDR_bxyo9o` now appear under **Real Estate** rather than Commercial/Construction.
- Coastal cityscape `Aerial_27_qw5yqr` now appears under **Cityscapes**, not Commercial.

A local CSV report, `Seraphic_Sight_42_Photo_Audit_Status.csv`, records every image's current class, the inspection status, the evidence and the need for re-review. The CSV is not uploaded to the public site.

**Audit outcome: partial.** All 42 were attempted; **the condition of 42 independently visually confirmed images has not been met**, and the branch should not be described as fully content-verified. Production remains untouched until the five inaccessible images and contradictions are resolved or explicitly accepted as unclassified.

## Definitive local-file visual check — 2026-11-17 (supersedes provisional classifications above)

The original **42 catalogue records** were fetched independently by GitHub Actions from Cloudinary's optimized and original image URLs. The successful Action was [run #44197846123](https://github.com/ORCATEST1/seraphic-sight/actions/runs/44197846123). Each accessible file was bundled into a downloadable media artifact, which was then examined from **actual local image bytes**, not a changing browser carousel.

- **37/42** returned HTTP 200 with image content and were displayed in four image-contact-sheet panels.
- **5/42** returned HTTP 404 through both delivery paths: `Showcase_nmenkd`, `Showcase_2_pkjbvm`, `Showcase_3_n4gxow`, `AB3BA538-17AE-4CB0-9614-64DACF77AD60_qdj1dz`, and `dji_fly_20230107_163233_917_1673141677255_photo_m5emzx`.
- Cryptographic hashing of the downloaded asset bytes found two **identical-image** pairs: `DJI_0944_hlpmgh` / `DJI_0944_gho2t4`, and `DJI_0726_ffmdmr` / `DJI_0726_c1ezfe`.
- All **42 original IDs** remain in the source catalogue. The five unavailable images and two duplicates are tagged `archived: true`; they no longer appear as broken or repetitive cards. Two old duplicate deep links map to their existing canonical IDs.
- **35 working distinct images remain visible**, with category distribution: Real Estate 20; Cityscapes 7; Land 2; Construction 2; Coastal 2; Mapping 1; Commercial 1.
- The featured triptych now uses three actually inspected originals: multifamily-property photo `DJI_0036-HDR_bxyo9o`, blue-pool crane placement `3-DJI_0014_xn3a13`, and night skyline `DJI_0104_uzqlyr`.

Important corrections against the earlier provisional browser reports:
- `3-DJI_0014_xn3a13` is **Construction**, not Cityscapes. Its image shows a blue pool structure being lowered by crane.
- `DJI_0768_nvafya` is **Real Estate**, not Construction. It shows a residential-property boundary overlay.
- `DJI_0104_uzqlyr` is **Cityscapes**, not Real Estate. It shows the blue-lit downtown skyline.
- `DJI_0011_zmbnvw` and `DJI_0002_xzpfp5` show genuinely undeveloped parcels, and are **Land**.
- `sola-florance-construction-aerial_oapibr` shows a finished urban multifamily building, so its visible subject is **Real Estate** (its filename is not sufficient proof of an active construction process).

The missing-image finding does **not** demonstrate that assets were intentionally deleted. They may have been renamed/moved, but the public IDs currently in source are not retrievable on the image delivery URLs. Restore from the original Cloudinary asset list before re-enabling any.

**Review completion statement:** 42 IDs independently checked for delivery, 37 originals visually inspected, five confirmed inaccessible at the tested URLs and archived. The 35 unique available originals have been visually inspected and classified. This establishes an accurately sourced public gallery without asserting content knowledge of the unavailable five.

### Final release gate
Do not merge the draft PR on automated tests alone. Verify the Vercel preview at its exact commit, image/card counts, filter counts, third-party map loading, contact form, and mobile behavior. Do not change production without final approval.
