import React from "react";
import { Link } from "react-router-dom";
import {
  PROP_HERO_VIDEO_URL, CON_HERO_VIDEO_URL, PROP_PRICING, PROP_ADDONS,
  CON_PRICING, CON_CLIENTS, TRAVEL_FEE
} from "../data/content";
import "./EditorialServices.css";

const CLD="https://res.cloudinary.com/dpc1noikx/image/upload/";
const photo=(id)=>CLD+"w_900,h_600,c_fill,f_auto,q_auto/"+id;
const PROPERTY_IMAGE=photo("DJI_0944_gho2t4");
const SITE_IMAGE=photo("sola-florance-construction-aerial_oapibr");
const MAP_IMAGE=photo("map-snapshot_q3dk25");

const propertyOfferings=[
  {title:"Aerial photography",desc:"Show the property, its approach, surroundings and scale from angles that ground photography cannot reach."},
  {title:"Property film",desc:"Considered camera movement, editing and sound, with formats selected for the listing and its audience."},
  {title:"Immersive presentation",desc:"360° tours, social cutdowns and mapping imagery available when the assignment calls for them."}
];
const constructionOfferings=[
  {title:"Progress documentation",desc:"Repeatable site visits and organized, dated imagery for teams tracking changing conditions."},
  {title:"Orthomosaic mapping",desc:"Overlapping aerial capture processed into an overhead site view, with georeferenced exports when specified."},
  {title:"Context & coordination",desc:"Visual records of site access, staging, surroundings and milestone conditions for stakeholder communication."}
];
const steps=[
  {title:"Define the scope",desc:"We confirm site location, airspace, access, reporting cadence and the specific outputs your team needs."},
  {title:"Capture consistently",desc:"Flights are planned around site conditions to support comparable views across return visits."},
  {title:"Deliver clearly",desc:"Receive named, organized imagery and applicable mapping files suitable for your established workflows."}
];
function Arrow(){return <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 13 13 3M4 3h9v9"/></svg>}
function TextLink({to,children}){return <Link className="ess-text-link" to={to}>{children}<Arrow/></Link>}
function VideoSection({source,label}){
  const [playing,setPlaying]=React.useState(false);
  const [failed,setFailed]=React.useState(false);
  const mediaRef=React.useRef(null);
  const reduced=typeof window!=="undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return <div className="ess-video-wrap">
    {(!source||reduced||failed)&&<img src={label==="Construction"?SITE_IMAGE:PROPERTY_IMAGE} alt={label==="Construction"?"Aerial view of a construction project":"Aerial photograph of Southern California property"} />}
    {source&&!reduced&&!failed&&<video ref={mediaRef} autoPlay muted loop playsInline preload="metadata" aria-label={label+" aerial footage"} onPlaying={()=>setPlaying(true)} onError={()=>setFailed(true)} style={{opacity:playing?1:0}}><source src={source} type="video/mp4"/></video>}
    <div className="ess-video-bottom"><span>FIELD NOTES / {label.toUpperCase()}</span><span>AERIAL IMAGING STUDIO</span></div>
  </div>;
}
function EditorialIntro({kind}){
  const construction=kind==="construction";
  return <><VideoSection source={construction?CON_HERO_VIDEO_URL:PROP_HERO_VIDEO_URL} label={construction?"Construction":"Property"}/>
    <header className="ess-intro">
      <p className="ess-eyebrow">{construction?"CONSTRUCTION / SITE INTELLIGENCE":"PROPERTY / VISUAL MARKETING"}</p>
      <h1>{construction?<>Make progress<br/>visible.</>:<>Show the place.<br/>Tell its story.</>}</h1>
      <div className="ess-intro-lower"><p>{construction?
        "Clear, consistent aerial records for construction teams. From early site conditions to milestone reporting, we make the built environment easier to understand.":
        "Aerial photography and film that communicate a property's scale, setting, and character. Designed for real listings, real spaces, and the people marketing them."}</p>
        <TextLink to={construction?"/contact?type=construction":"/contact?type=property-marketing"}>{construction?"SCOPE A SITE VISIT":"REQUEST A PROPERTY QUOTE"}</TextLink></div>
    </header>
  </>;
}
function Offerings({kind}){
  const construction=kind==="construction",items=construction?constructionOfferings:propertyOfferings;
  return <section className="ess-offerings ess-section"><div className="ess-section-aside"><p className="ess-eyebrow">01 / CAPABILITIES</p><h2>Built for the<br/>assignment.</h2></div>
    <div>{items.map((item,i)=><article className="ess-offering-row" key={item.title}><span>{String(i+1).padStart(2,"0")}</span><div><h3>{item.title}</h3><p>{item.desc}</p></div></article>)}</div>
  </section>;
}
function GalleryPair({kind}){
  const construction=kind==="construction";
  return <section className="ess-media-pair" aria-label="Examples of aerial work">
    <figure className="ess-media-primary"><img src={construction?SITE_IMAGE:PROPERTY_IMAGE} loading="lazy" decoding="async" alt={construction?"Actual aerial construction-site photography":"Actual aerial real estate photography"}/><figcaption>{construction?"CONSTRUCTION / AERIAL DOCUMENTATION":"PROPERTY / AERIAL PERSPECTIVE"}</figcaption></figure>
    <figure className="ess-media-secondary"><img src={construction?MAP_IMAGE:photo("DJI_0915_w53hst",1000)} loading="lazy" decoding="async" alt={construction?"Orthomosaic construction mapping example":"Aerial property photography example"}/><figcaption>{construction?"MAPPING / SITE CONTEXT":"MARKETING / LOCATION CONTEXT"}</figcaption></figure>
  </section>;
}
function PackagePricing(){
  return <section className="ess-section ess-pricing" aria-label="Property marketing packages">
    <div className="ess-section-heading"><p className="ess-eyebrow">02 / PROPERTY PACKAGES</p><h2>Clear starting points.</h2><p>Choose the level of coverage that fits your listing. We'll confirm the final scope, availability, travel and any add-ons before scheduling.</p></div>
    <div className="ess-package-table">{PROP_PRICING.map((p,i)=><article className="ess-package" key={p.name}>
      <span className="ess-package-index">{String(i+1).padStart(2,"0")}</span>
      <div><h3>{p.name}</h3>{p.popular&&<p className="ess-package-note">MOST REQUESTED</p>}</div>
      <div className="ess-package-list"><ul>{p.features.map(f=><li key={f}>{f}</li>)}</ul></div>
      <div className="ess-package-price"><span>FROM</span><strong>{p.price}</strong><TextLink to="/contact?type=property-marketing">ENQUIRE</TextLink></div>
    </article>)}</div>
    <details className="ess-addons"><summary>Available add-ons <span>VIEW OPTIONS</span></summary>
      <div>{PROP_ADDONS.map(x=><div className="ess-addon-line" key={x.name}><span>{x.name}</span><strong>{x.price}</strong></div>)}</div>
    </details>
    <p className="ess-pricing-note">Published package specifications are a starting point. Airspace, site access, travel, property size and final deliverables are confirmed in the quote.</p>
  </section>;
}
function ConstructionPricing(){
  return <section className="ess-section ess-pricing">
    <div className="ess-section-heading"><p className="ess-eyebrow">03 / ENGAGEMENTS</p><h2>Scoped to the site.</h2><p>One-off captures and recurring monitoring are quoted against site size, access, capture frequency and required outputs.</p></div>
    <div className="ess-con-price">{CON_PRICING.map(x=><div key={x.service}><span>{x.service}</span><strong>{x.price}</strong></div>)}</div>
    <p className="ess-pricing-note">Mapping, survey-control requirements, CAD exports, point clouds and processing time are determined by scope. Aerial mapping is not a replacement for a licensed boundary or engineering survey.</p>
  </section>;
}
function Process(){
  return <section className="ess-section ess-process"><div><p className="ess-eyebrow">02 / OUR PROCESS</p><h2>Every visit with<br/>a purpose.</h2><p>We coordinate with your site team, work within applicable FAA requirements and deliver media organized around your reporting needs.</p></div>
    <div>{steps.map((s,i)=><article key={s.title}><span>{String(i+1).padStart(2,"0")}</span><div><h3>{s.title}</h3><p>{s.desc}</p></div></article>)}</div>
  </section>;
}
function Clients(){return <section className="ess-clients ess-section"><p className="ess-eyebrow">WHO WE SUPPORT</p><div>{CON_CLIENTS.map(x=><span key={x}>{x}</span>)}</div></section>}
function EndCTA({construction}){return <section className="ess-end-cta">
  <p className="ess-eyebrow">START WITH THE ADDRESS</p>
  <h2>{construction?<>Your next milestone,<br/>documented.</>:<>A stronger first<br/>impression starts here.</>}</h2>
  <p>Share the address or APN, your deliverables and preferred timing. We'll follow up with scope and availability.</p>
  <TextLink to={construction?"/contact?type=construction":"/contact?type=property-marketing"}>TELL US ABOUT THE PROJECT</TextLink>
  <p className="ess-fee">TRAVEL / {TRAVEL_FEE.rate} · {TRAVEL_FEE.nearRule} · {TRAVEL_FEE.farRule}</p>
</section>}
export function PropertyEditorial(){return <main className="ess-page"><EditorialIntro kind="property"/><Offerings kind="property"/><GalleryPair kind="property"/><PackagePricing/><EndCTA construction={false}/></main>}
export function ConstructionEditorial(){return <main className="ess-page"><EditorialIntro kind="construction"/><Offerings kind="construction"/><GalleryPair kind="construction"/><Process/><ConstructionPricing/><Clients/><EndCTA construction/></main>}
