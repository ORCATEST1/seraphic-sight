// ===== NAVIGATION =====
export const NAV_LINKS = [
  "Home",
  "Property Marketing",
  "Construction",
  "Portfolio",
  "Service Area",
  "Contact",
];

// ===== TRUST BAR =====
export const STATS = [
  { value: "FAA Part 107", label: "Certified" },
  { value: "Fully Insured", label: "COI Available" },
  { value: "3–4 Day", label: "Turnaround" },
  { value: "So. & Central", label: "California" },
];

// ===== PROPERTY MARKETING =====
export const PROP_SERVICES = [
  {
    icon: "📸",
    title: "Drone Photography",
    desc: "High-resolution aerial images that showcase property scale, lot lines, surroundings, and neighborhood context. Delivered edited and MLS-ready.",
  },
  {
    icon: "🎬",
    title: "Drone Video",
    desc: "Cinematic aerial video with smooth flight paths, professional editing, and licensed music. Delivered in 16:9 for MLS and YouTube, plus vertical 9:16 cuts for Instagram Reels and TikTok.",
  },
  {
    icon: "🏠",
    title: "360° Virtual Tours",
    desc: "Immersive virtual walkthroughs shot with the Ricoh Theta Z1 and Insta360 X. Buyers explore every room remotely — hosted, shareable, and embeddable on any listing platform.",
  },
  {
    icon: "🗺️",
    title: "Aerial Mapping",
    desc: "Orthomosaic site maps for large lots, land parcels, and development sites. Accurate, geo-referenced, and presentation-ready.",
  },
  {
    icon: "📦",
    title: "Full Marketing Packages",
    desc: "Send us the APN and your deliverable list — we handle scheduling, capture, editing, and delivery. One point of contact, one invoice.",
  },
];

export const PROP_PRICING = [
  {
    name: "Essentials",
    price: "$249",
    popular: false,
    features: [
      "15–20 edited aerial photos, MLS-ready",
      "1 property overview video (60–90 sec)",
      "Professional editing with music",
      "Digital delivery in 3–4 business days",
    ],
  },
  {
    name: "Professional",
    price: "$399",
    popular: true,
    features: [
      "25–30 edited photos (aerial + ground), MLS-ready",
      "Cinematic property video (90–120 sec)",
      "Vertical social cuts (9:16 for Reels / TikTok)",
      "360° virtual tour (Ricoh Theta Z1)",
      "Digital delivery in 3–4 business days",
    ],
  },
  {
    name: "Premium",
    price: "$599",
    popular: false,
    features: [
      "30–40 edited photos (aerial + ground), MLS-ready",
      "Cinematic video (2–3 min, fully produced)",
      "Vertical social cuts (9:16 for Reels / TikTok)",
      "360° virtual tour (Ricoh Theta Z1)",
      "Aerial orthomosaic / site map",
      "Branded agent intro option",
    ],
  },
];

export const PROP_ADDONS = [
  { name: "360° Virtual Tour (standalone)", price: "$125" },
  { name: "Social media vertical cuts (9:16 Reels / TikTok)", price: "$50" },
  { name: "Additional aerial video (per min, edited)", price: "$100" },
  { name: "Twilight / golden hour shoot", price: "$150" },
  { name: "Aerial orthomosaic map", price: "$200" },
  { name: "Rush delivery (24–48 hrs)", price: "+$100" },
  { name: "Additional property (same day, same area)", price: "+$150" },
];

export const PROP_PROCESS = [
  {
    num: "01",
    title: "Send Us the Details",
    desc: "APN, property address, and your deliverable checklist. We'll confirm scope and schedule within 24 hours.",
  },
  {
    num: "02",
    title: "We Capture the Property",
    desc: "Our FAA-certified pilot arrives on site and captures aerial photography, video, 360° virtual tours, and any other requested deliverables.",
  },
  {
    num: "03",
    title: "Receive Your Package",
    desc: "Edited, organized, and delivered digitally within 3–4 business days. MLS-ready, shareable, and presentation-quality.",
  },
];

// ===== CONSTRUCTION =====
export const CON_CAPABILITIES = [
  {
    icon: "🛰️",
    title: "DroneDeploy Automated Flights",
    desc: "Pre-programmed flight paths ensure identical coverage every visit. Outputs delivered in GeoTIFF, LAS/LAZ, and DXF — compatible with Procore, Autodesk BIM 360, ArcGIS, and AutoCAD Civil3D.",
  },
  {
    icon: "🗺️",
    title: "Orthomosaic Mapping",
    desc: "High-resolution, geo-referenced composite maps stitched from hundreds of overlapping images. Delivered as GeoTIFF for direct import into ArcGIS, QGIS, or AutoCAD Civil3D. Measure distances, calculate areas, and track site changes over time.",
  },
  {
    icon: "📊",
    title: "Progress Monitoring",
    desc: "Scheduled site captures — weekly, biweekly, or monthly — that document every phase from groundbreak to closeout. Timestamped and organized for stakeholder reporting.",
  },
  {
    icon: "👁️",
    title: "Site Visualization",
    desc: "Aerial perspectives that give owners, architects, and project managers a clear view of site conditions, staging areas, access roads, and overall project context.",
  },
  {
    icon: "📁",
    title: "As-Built Documentation",
    desc: "Final-condition captures that serve as permanent visual records. Useful for warranty documentation, dispute resolution, and facility management handoffs.",
  },
  {
    icon: "🔒",
    title: "Insurance & Compliance",
    desc: "Every flight is FAA Part 107 compliant. Full liability insurance with COI provided upon request. We coordinate access and safety with your site superintendent.",
  },
];

export const CON_PRICING = [
  { service: "Single site capture (ortho + progress photos)", price: "$500" },
  { service: "Monthly progress monitoring (per visit)", price: "$400/visit" },
  { service: "Quarterly monitoring package (3 visits)", price: "$1,000" },
  { service: "Full project documentation (custom scope)", price: "Contact for quote" },
];

export const CON_STEPS = [
  {
    num: "01",
    title: "Pre-Flight Planning",
    desc: "We review your site, establish DroneDeploy flight plans, coordinate access with your superintendent, and define deliverable requirements.",
  },
  {
    num: "02",
    title: "Automated Capture",
    desc: "Our pilot executes the pre-programmed flight plan on site. Identical flight paths every visit guarantee consistent, comparable data across your project timeline.",
  },
  {
    num: "03",
    title: "Processing & Delivery",
    desc: "Imagery is processed into orthomosaics, progress photos, and organized deliverables. Timestamped, labeled, and delivered within 3–4 business days.",
  },
];

export const CON_CLIENTS = [
  "General Contractors",
  "Construction Managers",
  "Developers",
  "Architects",
  "School Districts",
  "Municipal Agencies",
  "Solar Installers",
  "Civil Engineers",
];

// ===== PORTFOLIO =====
// cloudinaryFolder: exact folder name in your Cloudinary Media Library.
//   Images/videos inside that folder auto-load in the card.
// tour360:  Momento360 embed URL — from your tour page → Share → Embed, copy the src URL
// model3d:  Cloudinary raw-file URL for a .glb — upload via Cloudinary Media Library (any file type supported)
export const PORTFOLIO_ITEMS = [
  {
    title: "Featured Aerials – SoCal Portfolio",
    tag: "Property Marketing",
    deliverables: "Signature Aerial Photography · Hero Shots · MLS-Ready",
    color: "#0077FF",
    cloudinaryFolder: "Hero-shots",
    media: { tour360: null, walkthrough: null, model3d: null },
  },
  {
    title: "Lots & Land – Kern, Riverside & San Bernardino",
    tag: "Property Marketing",
    deliverables: "Aerial Photo · Land Documentation · Site Overview",
    color: "#0077FF",
    cloudinaryFolder: "Lots",
    media: { tour360: null, walkthrough: null, model3d: null },
  },
  {
    title: "Property Interiors – Southern California",
    tag: "Property Marketing",
    deliverables: "Interior Photography · Ground-Level Stills · MLS-Ready",
    color: "#0077FF",
    cloudinaryFolder: "Interiors",
    media: { tour360: null, walkthrough: null, model3d: null },
  },
  {
    title: "Commercial Properties – Los Angeles",
    tag: "Property Marketing",
    deliverables: "Aerial Photo · Cinematic Video · Commercial Coverage",
    color: "#0077FF",
    cloudinaryFolder: "la-commercial",
    media: { tour360: null, walkthrough: null, model3d: null },
  },
  {
    title: "Mobile Home Communities – Southern California",
    tag: "Property Marketing",
    deliverables: "Aerial Photo · Community Overview · 360° Panoramic",
    color: "#0077FF",
    cloudinaryFolder: "mobile-homes",
    media: {
      tour360: "https://momento360.com/e/u/4c8c12a479114e87ab32b9ac829473e0?utm_campaign=embed&utm_source=other&heading=0&pitch=0&field-of-view=75&size=large&display-plan=true",
      walkthrough: null,
      model3d: null,
    },
  },
  {
    title: "Multifamily Portfolio – San Diego County",
    tag: "Property Marketing",
    deliverables: "Aerial Photo · Cinematic Video · Complex Overview",
    color: "#0077FF",
    cloudinaryFolder: "san-diego-multifamily",
    media: { tour360: null, walkthrough: null, model3d: null },
  },
  {
    title: "Progress Monitoring – Active Build Sites",
    tag: "Construction",
    deliverables: "Timestamped Progress Docs · Aerial Photo · Site Documentation",
    color: "#00BFA6",
    cloudinaryFolder: "Progress monitoring",
    media: { tour360: null, walkthrough: null, model3d: null },
  },
  // Add more Momento360 panoramic URLs here as you collect them
  // Get URL from Momento360: open tour → share icon → copy the link shown
];

// ===== SERVICE AREA =====
export const CITIES = [
  "San Diego", "Inland Empire", "Riverside", "Temecula",
  "Palm Springs", "Barstow", "Bakersfield", "Porterville",
  "Los Angeles County",
];

export const REGIONS = [
  {
    name: "San Diego Metro",
    cities: "San Diego, Chula Vista, Escondido, Oceanside, Carlsbad",
    desc: "Full coverage across San Diego County. From coastal listings to inland development sites, we're on-call for the region's diverse real estate and construction markets.",
  },
  {
    name: "Inland Empire",
    cities: "Riverside, San Bernardino, Ontario, Rancho Cucamonga, Corona, Fontana",
    desc: "One of California's fastest-growing regions for residential and commercial development. We support agents, builders, and general contractors across the IE.",
  },
  {
    name: "Temecula & Southwest Riverside",
    cities: "Temecula, Murrieta, Menifee, Lake Elsinore, Wildomar",
    desc: "Wine country estates, master-planned communities, and new construction. Consistent demand for aerial marketing and site documentation.",
  },
  {
    name: "Palm Springs & Coachella Valley",
    cities: "Palm Springs, Palm Desert, La Quinta, Indio, Cathedral City",
    desc: "Resort properties, mid-century estates, and desert development projects. Aerial imaging captures the scale and setting that ground photography can't.",
  },
  {
    name: "High Desert",
    cities: "Barstow, Victorville, Hesperia, Apple Valley",
    desc: "Large-parcel land, solar installations, and infrastructure projects. Orthomosaic mapping is especially valuable for remote and expansive sites.",
  },
  {
    name: "Central Valley – South",
    cities: "Bakersfield, Porterville, Visalia, Delano, Tulare",
    desc: "Agricultural land, new residential development, and commercial construction. We cover the southern Central Valley for both verticals.",
  },
  {
    name: "Los Angeles County",
    cities: "Los Angeles, Long Beach, Pasadena, Pomona, Santa Clarita",
    desc: "Select coverage across LA County. Contact us to confirm availability for your specific project location.",
  },
];