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
export const PORTFOLIO_ITEMS = [
  {
    title: "Luxury Estate – Temecula Wine Country",
    tag: "Property Marketing",
    deliverables: "Aerial Photo · Cinematic Video · 360° Tour",
    color: "#0077FF",
    media: {
      images: [
        "https://res.cloudinary.com/dpc1noikx/image/upload/Mobile_Homes/DJI_0322.jpg",
        "https://res.cloudinary.com/dpc1noikx/image/upload/Mobile_Homes/DJI_0454.jpg",
        "https://res.cloudinary.com/dpc1noikx/image/upload/Mobile_Homes/DJI_0780.jpg",
        "https://res.cloudinary.com/dpc1noikx/image/upload/Mobile_Homes/DJI_0888.jpg",
      ],
      video: "https://res.cloudinary.com/dpc1noikx/video/upload/joe_4.mp4",
      tour360: null,
      walkthrough: null,
      model3d: null,
    },
  },
  {
    title: "Multifamily Development – South Los Angeles",
    tag: "Construction",
    deliverables: "DroneDeploy Progress Monitoring · Orthomosaic",
    color: "#00BFA6",
    media: {
      images: [
        "https://res.cloudinary.com/dpc1noikx/image/upload/sola-3501-crenshaw-construction-aerial-01.jpg",
        "https://res.cloudinary.com/dpc1noikx/image/upload/sola-3501-crenshaw-construction-aerial-02.jpg",
        "https://res.cloudinary.com/dpc1noikx/image/upload/sola-3501-crenshaw-construction-aerial-03.jpg",
      ],
      video: null,
      tour360: null,
      walkthrough: null,
      model3d: null,
    },
  },
  {
    title: "Desert Modern Estate – Palm Springs",
    tag: "Property Marketing",
    deliverables: "Aerial Photo · Drone Video · Twilight Shoot",
    color: "#0077FF",
    media: {
      images: [],
      video: "https://res.cloudinary.com/dpc1noikx/video/upload/clip1.mp4",
      tour360: null,
      walkthrough: null,
      model3d: null,
    },
  },
  {
    title: "Multifamily Construction – Los Angeles",
    tag: "Construction",
    deliverables: "GeoTIFF Mapping · As-Built Documentation",
    color: "#00BFA6",
    media: {
      images: [
        "https://res.cloudinary.com/dpc1noikx/image/upload/sola-4101-somerset-construction-panorama.jpg",
        "https://res.cloudinary.com/dpc1noikx/image/upload/sola-4008-mlk-construction-aerial.jpg",
        "https://res.cloudinary.com/dpc1noikx/image/upload/sola-4252-whittier-construction-aerial.jpg",
      ],
      video: null,
      tour360: null,
      walkthrough: null,
      model3d: null,
    },
  },
  {
    title: "Coastal Listing – San Diego",
    tag: "Property Marketing",
    deliverables: "Aerial Photo · Cinematic Video · 360° Tour",
    color: "#0077FF",
    media: {
      images: [
        "https://res.cloudinary.com/dpc1noikx/image/upload/San_Diego_Multifamily/aerial-residential-real-estate-san-diego-01.jpg",
        "https://res.cloudinary.com/dpc1noikx/image/upload/San_Diego_Multifamily/aerial-residential-real-estate-san-diego-02.jpg",
        "https://res.cloudinary.com/dpc1noikx/image/upload/San_Diego_Multifamily/aerial-residential-real-estate-san-diego-03.jpg",
        "https://res.cloudinary.com/dpc1noikx/image/upload/San_Diego_Multifamily/aerial-hdr-residential-coastal-oceanside-california-01.jpg",
        "https://res.cloudinary.com/dpc1noikx/image/upload/San_Diego_Multifamily/aerial-hdr-residential-coastal-oceanside-california-02.jpg",
        "https://res.cloudinary.com/dpc1noikx/image/upload/San_Diego_Multifamily/DJI_0036-HDR.jpeg",
        "https://res.cloudinary.com/dpc1noikx/image/upload/San_Diego_Multifamily/94-DJI_0259.jpg",
        "https://res.cloudinary.com/dpc1noikx/image/upload/San_Diego_Multifamily/112-DJI_0287.jpg",
      ],
      video: "https://res.cloudinary.com/dpc1noikx/video/upload/Showcase_3.mp4",
      tour360: null,
      walkthrough: null,
      model3d: null,
    },
  },
  {
    title: "Construction Mapping – South Los Angeles",
    tag: "Construction",
    deliverables: "Orthomosaic · Progress Docs · DroneDeploy",
    color: "#00BFA6",
    media: {
      images: [
        "https://res.cloudinary.com/dpc1noikx/image/upload/sola-florance-construction-aerial.jpg",
        "https://res.cloudinary.com/dpc1noikx/image/upload/sola-oblique-mapping-pass-construction-01.jpg",
      ],
      video: null,
      tour360: null,
      walkthrough: null,
      model3d: null,
    },
  },
  {
    title: "Large Lot Land – Porterville",
    tag: "Property Marketing",
    deliverables: "Aerial Photo · Orthomosaic Site Map",
    color: "#0077FF",
    media: {
      images: [],
      video: "https://res.cloudinary.com/dpc1noikx/video/upload/Showcase.mp4",
      tour360: null,
      walkthrough: null,
      model3d: null,
    },
  },
  {
    title: "Site Documentation – Los Angeles",
    tag: "Construction",
    deliverables: "Progress Monitoring · Site Visualization",
    color: "#00BFA6",
    media: {
      images: [
        "https://res.cloudinary.com/dpc1noikx/image/upload/AB3BA538-569E-4CFE-A6D7-D15694DCC3B3.jpg",
        "https://res.cloudinary.com/dpc1noikx/image/upload/3-DJI_0014.jpg",
      ],
      video: null,
      tour360: null,
      walkthrough: null,
      model3d: null,
    },
  },
  {
    title: "Mid-Century Estate – Palm Desert",
    tag: "Property Marketing",
    deliverables: "Aerial Photo · Drone Video · Social Cuts",
    color: "#0077FF",
    media: {
      images: [
        "https://res.cloudinary.com/dpc1noikx/image/upload/Hero_shots/DJI_0521-Pano.jpg",
        "https://res.cloudinary.com/dpc1noikx/image/upload/Hero_shots/DJI_0841.jpg",
        "https://res.cloudinary.com/dpc1noikx/image/upload/Hero_shots/DJI_0104.jpg",
        "https://res.cloudinary.com/dpc1noikx/image/upload/Hero_shots/B8BF74C3-98E2-4C69-8958-D92124D1FE27.jpg",
        "https://res.cloudinary.com/dpc1noikx/image/upload/Hero_shots/dji_fly_20230107_145206_631_1673132863018_photo.jpg",
      ],
      video: null,
      tour360: null,
      walkthrough: null,
      model3d: null,
    },
  },
  {
    title: "Aerial Progress – Los Angeles",
    tag: "Construction",
    deliverables: "DroneDeploy · Orthomosaic · Timestamped Docs",
    color: "#00BFA6",
    media: {
      images: [
        "https://res.cloudinary.com/dpc1noikx/image/upload/4-DJI_0960.jpg",
        "https://res.cloudinary.com/dpc1noikx/image/upload/LA_Commercial/V5_%281%29.00_01_30_08.Still005.jpg",
      ],
      video: null,
      tour360: null,
      walkthrough: null,
      model3d: null,
    },
  },
  {
    title: "Hillside Residence – Corona",
    tag: "Property Marketing",
    deliverables: "Cinematic Video · 360° Tour · Twilight Shoot",
    color: "#0077FF",
    media: {
      images: [
        "https://res.cloudinary.com/dpc1noikx/image/upload/Interior/interior-real-estate-photography-san-diego-01.jpg",
        "https://res.cloudinary.com/dpc1noikx/image/upload/Interior/interior-real-estate-photography-san-diego-02.jpg",
        "https://res.cloudinary.com/dpc1noikx/image/upload/Interior/IMG_3012.jpg",
        "https://res.cloudinary.com/dpc1noikx/image/upload/Interior/Staged_%283%29.png",
      ],
      video: "https://res.cloudinary.com/dpc1noikx/video/upload/Showcase_2.mp4",
      tour360: null,
      walkthrough: null,
      model3d: null,
    },
  },
  {
    title: "Agricultural Land – Bakersfield",
    tag: "Property Marketing",
    deliverables: "Aerial Photo · Orthomosaic Mapping",
    color: "#0077FF",
    media: {
      images: [
        "https://res.cloudinary.com/dpc1noikx/image/upload/Bakersfield_Lots/DJI_0002.jpg",
        "https://res.cloudinary.com/dpc1noikx/image/upload/Bakersfield_Lots/DJI_0521.jpg",
      ],
      video: "https://res.cloudinary.com/dpc1noikx/video/upload/part_1.mp4",
      tour360: null,
      walkthrough: null,
      model3d: null,
    },
  },
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
