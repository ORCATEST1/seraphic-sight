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
    desc: "Cinematic aerial video with smooth flight paths, professional editing, and licensed music. Perfect for listings, social media, and agent branding.",
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
      "15–20 edited aerial photos",
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
      "25–30 edited photos (aerial + ground)",
      "Cinematic property video (90–120 sec)",
      "360° virtual tour (Ricoh Theta Z1)",
      "Digital delivery in 3–4 business days",
    ],
  },
  {
    name: "Premium",
    price: "$599",
    popular: false,
    features: [
      "30–40 edited photos (aerial + ground)",
      "Cinematic video (2–3 min, fully produced)",
      "360° virtual tour (Ricoh Theta Z1)",
      "Aerial orthomosaic / site map",
      "Branded agent intro option",
    ],
  },
];

export const PROP_ADDONS = [
  { name: "360° Virtual Tour (standalone)", price: "$125" },
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
    desc: "Pre-programmed flight paths ensure identical coverage every visit. No guesswork, no variation — just clean, consistent data capture across your entire project timeline.",
  },
  {
    icon: "🗺️",
    title: "Orthomosaic Mapping",
    desc: "High-resolution, geo-referenced composite maps stitched from hundreds of overlapping images. Measure distances, calculate areas, and track site changes over time.",
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
  { title: "Luxury Estate – Temecula", tag: "Property Marketing", deliverables: "Aerial Photo · Drone Video · 360° Tour", color: "#0077FF" },
  { title: "Ground-Up Commercial – Riverside", tag: "Construction", deliverables: "Progress Monitoring · Orthomosaic", color: "#00BFA6" },
  { title: "New Development – Palm Springs", tag: "Property Marketing", deliverables: "Aerial Photo · Aerial Mapping", color: "#0077FF" },
  { title: "Infrastructure Project – Bakersfield", tag: "Construction", deliverables: "DroneDeploy · As-Built Docs", color: "#00BFA6" },
  { title: "Multi-Family Complex – San Diego", tag: "Property Marketing", deliverables: "Drone Video · 360° Tour · Photo", color: "#0077FF" },
  { title: "School Facility – Inland Empire", tag: "Construction", deliverables: "Progress Monitoring · Site Viz", color: "#00BFA6" },
  { title: "Ranch Property – Porterville", tag: "Property Marketing", deliverables: "Aerial Photo · Aerial Mapping", color: "#0077FF" },
  { title: "Solar Installation – Barstow", tag: "Construction", deliverables: "Orthomosaic · Progress Docs", color: "#00BFA6" },
  { title: "Hillside Residence – Temecula", tag: "Property Marketing", deliverables: "Drone Video · Twilight Shoot", color: "#0077FF" },
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