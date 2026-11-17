import React from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import {
  NAV_LINKS, PROP_SERVICES, PROP_PRICING, PROP_ADDONS,
  PROP_PROCESS, CON_CAPABILITIES, CON_PRICING, CON_STEPS,
  CON_CLIENTS, REGIONS,
  PROP_HERO_VIDEO_URL, CON_HERO_VIDEO_URL, TRAVEL_FEE,
} from "./data/content";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import EditorialHome from "./components/EditorialHome";
import "./components/EditorialInner.css";
import TurnstileField from "./components/TurnstileField";
import WorldCup2030 from "./WorldCup2030";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Code-split portfolio media so it does not ship on contact and service pages.
const PortfolioSection = React.lazy(() => import("./components/PortfolioSection"));

const REDUCED_MOTION = typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ===== PER-ROUTE META (lightweight, no dependency) =====
function usePageMeta(title, description) {
  React.useEffect(() => {
    document.title = title;
    if (description) {
      let m = document.querySelector('meta[name="description"]');
      if (!m) { m = document.createElement("meta"); m.name = "description"; document.head.appendChild(m); }
      m.setAttribute("content", description);
    }
    const canonicalUrl = "https://seraphicsight.com" + (window.location.pathname === "/" ? "/" : window.location.pathname.replace(/\/$/, ""));
    const previousNotFoundRobots = document.querySelector('meta[data-route-not-found="true"]');
    if (previousNotFoundRobots) previousNotFoundRobots.remove();
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = canonicalUrl;
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute("content", canonicalUrl);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", title);
  }, [title, description]);
}

// ===== PAGE REVEAL HOOK =====
function usePageReveal(ref) {
  useGSAP(() => {
    // Section titles slide up
    gsap.utils.toArray(".section-title").forEach(el => {
      gsap.from(el, {
        y: 28, opacity: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    });
    // Cards stagger in by column position
    gsap.utils.toArray(".card-hover").forEach((el, i) => {
      gsap.from(el, {
        y: 40, opacity: 0, duration: 0.65, delay: (i % 3) * 0.07, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    });
    // Generic staggered reveal items (process steps, pricing rows, etc.)
    gsap.utils.toArray(".reveal-item").forEach((el, i) => {
      gsap.from(el, {
        y: 24, opacity: 0, duration: 0.55, delay: (i % 5) * 0.09, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
      });
    });
  }, { scope: ref });
}

// ===== NAV =====
function Nav() {
  const location = useLocation();
  const [open,setOpen] = React.useState(false);
  const links = [
    ["Work","/portfolio"],["Property","/property-marketing"],
    ["Construction","/construction"],["Service Area","/service-area"],
    ["FAQ","/faq"],["Contact","/contact"]
  ];
  React.useEffect(() => {
    setOpen(false);
    if (window.__lenis) window.__lenis.scrollTo(0,{immediate:true});
    else window.scrollTo({top:0});
  },[location.pathname]);
  React.useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key==="Escape") setOpen(false); };
    window.addEventListener("keydown",onKey);
    return () => window.removeEventListener("keydown",onKey);
  },[open]);
  return <header className="inner-nav-shell">
    <nav className="inner-nav" aria-label="Main navigation">
      <Link to="/" className="inner-wordmark">SERAPHIC SIGHT<span>AERIAL IMAGING STUDIO</span></Link>
      <div className="inner-nav-links">
        {links.map(([label,to])=><Link key={to} to={to} aria-current={location.pathname===to?"page":undefined}>{label}</Link>)}
      </div>
      <button type="button" className="inner-nav-toggle" aria-expanded={open} aria-controls="inner-mobile-menu" onClick={()=>setOpen(v=>!v)}>{open?"CLOSE −":"MENU +"}</button>
    </nav>
    {open&&<nav id="inner-mobile-menu" className="inner-mobile-menu" aria-label="Mobile navigation">
      {links.map(([label,to])=><Link key={to} to={to} onClick={()=>setOpen(false)}>{label}</Link>)}
    </nav>}
  </header>;
}

// ===== SHARED COMPONENTS =====
function PageHero({ tag, title, subtitle, videoUrl=null }) {
  const [playing,setPlaying] = React.useState(false);
  const [failed,setFailed] = React.useState(false);
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return <section className="inner-page-hero">
    {videoUrl && !reduced && !failed && <div className="inner-page-video">
      <video src={videoUrl} autoPlay muted loop playsInline preload="metadata" aria-hidden="true"
        onPlaying={()=>setPlaying(true)} onError={()=>setFailed(true)}
        style={{opacity:playing?1:0}}/>
    </div>}
    <div className="inner-hero-content">
      {tag&&<p className="inner-overline">{tag}</p>}
      <h1>{title}</h1>
      {subtitle&&<p className="inner-hero-deck">{subtitle}</p>}
    </div>
  </section>;
}
function SectionTitle({ title, sub }) {
  return <div className="inner-section-title">
    <h2>{title}</h2>{sub&&<p>{sub}</p>}
  </div>;
}
function CTABanner({ title, sub, btn }) {
  return <section className="inner-cta">
    <p className="inner-overline">START A CONVERSATION</p>
    <h2>{title}</h2>
    <p>{sub}</p>
    <Link className="inner-arrow-link" to="/contact">{btn.replace(/\s*→\s*$/,"")} <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 13 13 3M4 3h9v9"/></svg></Link>
  </section>;
}
function Footer() {
  return <footer className="inner-footer">
    <div className="inner-footer-head">
      <div><Link to="/" className="inner-wordmark">SERAPHIC SIGHT<span>AERIAL IMAGING STUDIO</span></Link>
        <p>Photography, film and construction documentation across Southern California.</p></div>
      <div className="inner-footer-links">
        <Link to="/portfolio">Work</Link>
        <Link to="/property-marketing">Property</Link>
        <Link to="/construction">Construction</Link>
        <Link to="/service-area">Service Area</Link>
        <Link to="/faq">FAQ</Link>
        <Link to="/contact">Contact</Link>
      </div>
    </div>
    <div className="inner-footer-contact"><a href="mailto:joseph@seraphicsight.com">joseph@seraphicsight.com</a><a href="tel:+15627431698">(562) 743-1698</a></div>
    <div className="inner-footer-bottom"><span>© {new Date().getFullYear()} SERAPHIC SIGHT LLC</span><span>FAA PART 107 / SOUTHERN CALIFORNIA</span></div>
  </footer>;
}

function TravelFeeNote({ accent = "#d5ddd4" }) {
  return (
    <div style={{ marginTop:32,padding:"18px 24px",background:`${accent}08`,border:`1px solid ${accent}18`,borderRadius:12,display:"flex",flexWrap:"wrap",alignItems:"center",gap:12 }}>
      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
        
        <span style={{ fontSize:13,fontWeight:700,color:"#fff" }}>Travel Fee</span>
        <span style={{ fontSize:13,fontWeight:700,color:accent }}>{TRAVEL_FEE.rate}</span>
      </div>
      <div style={{ color:"rgba(255,255,255,0.15)",fontSize:13 }}>|</div>
      <span style={{ fontSize:13,color:"#abb4aa" }}>{TRAVEL_FEE.nearRule}</span>
      <div style={{ color:"rgba(255,255,255,0.15)",fontSize:13 }}>·</div>
      <span style={{ fontSize:13,color:"#abb4aa" }}>{TRAVEL_FEE.farRule}</span>
    </div>
  );
}

// ===== HOME =====
function PropertyMarketing() {
  usePageMeta(
    "Real Estate Drone Photography & Video — from $249 | Seraphic Sight",
    "MLS-ready aerial photos, cinematic listing videos, and 360° virtual tours delivered in 3–4 business days. LAANC-authorized across Southern California."
  );
  const pageRef = React.useRef(null);
  usePageReveal(pageRef);
  return (
    <div ref={pageRef}>
      <PageHero tag="Property Marketing" title={<>Aerial Photography, Video<br/>& 3D Tours</>} subtitle="MLS-ready aerial content delivered in 3–4 business days. LAANC-authorized for controlled airspace. Send us the APN and your deliverable list — we handle the rest." accent="#d5ddd4" videoUrl={PROP_HERO_VIDEO_URL}/>
      <section style={{ padding:"80px 24px",maxWidth:1200,margin:"0 auto" }}>
        <SectionTitle title="What We Deliver" sub="Every service designed to move listings faster."/>
        <div className="responsive-grid-3" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:20 }}>
          {PROP_SERVICES.map((s,i)=>(<div key={i} className="card-hover" style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:32 }}><h3 style={{ fontSize:18,fontWeight:700,color:"#fff",marginBottom:10 }}>{s.title}</h3><p style={{ fontSize:13,color:"#abb4aa",lineHeight:1.7 }}>{s.desc}</p></div>))}
        </div>
      </section>
      <section style={{ padding:"80px 24px",background:"rgba(255,255,255,0.015)" }}>
        <div style={{ maxWidth:1200,margin:"0 auto" }}>
          <SectionTitle title="Pricing" sub="Transparent packages. No hidden fees."/>
          <div className="responsive-grid-3" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:24 }}>
            {PROP_PRICING.map((p,i)=>(<div key={i} className="card-hover" style={{ background:p.popular?"linear-gradient(180deg,rgba(0,119,255,0.08),rgba(0,119,255,0.02))":"rgba(255,255,255,0.03)",border:p.popular?"1px solid rgba(0,119,255,0.25)":"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:40,position:"relative",overflow:"hidden" }}>
              {p.popular&&<div style={{ position:"absolute",top:16,right:16,background:"#d5ddd4",color:"#fff",fontSize:10,fontWeight:700,padding:"4px 12px",borderRadius:100,letterSpacing:1,textTransform:"uppercase" }}>Most Popular</div>}
              <h3 style={{ fontSize:16,fontWeight:600,color:"#abb4aa",letterSpacing:1,textTransform:"uppercase",marginBottom:12 }}>{p.name}</h3>
              <div style={{ fontSize:42,fontWeight:800,color:"#fff",letterSpacing:"-1px",marginBottom:24 }}>{p.price}</div>
              <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                {p.features.map((f,j)=>(<div key={j} style={{ display:"flex",alignItems:"flex-start",gap:10 }}><span style={{ color:"#d5ddd4",fontSize:14,marginTop:2,flexShrink:0 }}>✓</span><span style={{ fontSize:14,color:"#e0e5dd",lineHeight:1.5 }}>{f}</span></div>))}
              </div>
              <Link to="/contact?type=property-marketing"><button className={p.popular?"btn-primary":"btn-outline"} style={{ width:"100%",marginTop:28 }}>Get Started</button></Link>
            </div>))}
          </div>
          <div style={{ marginTop:56 }}>
            <h3 style={{ fontSize:22,fontWeight:700,color:"#fff",marginBottom:24,textAlign:"center" }}>Add-Ons</h3>
            <div style={{ maxWidth:600,margin:"0 auto",display:"grid",gap:12 }}>
              {PROP_ADDONS.map((a,i)=>(<div key={i} className="reveal-item" style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10 }}><span style={{ fontSize:14,color:"#e0e5dd" }}>{a.name}</span><span style={{ fontSize:14,fontWeight:700,color:"#fff",flexShrink:0,marginLeft:16 }}>{a.price}</span></div>))}
            </div>
            <div style={{ maxWidth:600,margin:"0 auto" }}><TravelFeeNote accent="#d5ddd4"/></div>
          </div>
        </div>
      </section>
      <section style={{ padding:"80px 24px",maxWidth:1000,margin:"0 auto" }}>
        <SectionTitle title="How It Works"/>
        <div style={{ display:"flex",flexDirection:"column",position:"relative" }}>
          <div style={{ position:"absolute",left:24,top:36,bottom:36,width:2,background:"linear-gradient(180deg,#d5ddd4,#c4d0c4)",opacity:0.2 }}/>
          {PROP_PROCESS.map((s,i)=>(<div key={i} className="reveal-item" style={{ display:"flex",gap:28,padding:"28px 0",alignItems:"flex-start" }}><div style={{ width:50,height:50,borderRadius:"50%",background:"rgba(0,119,255,0.1)",border:"1px solid rgba(0,119,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:"#d5ddd4",flexShrink:0,position:"relative",zIndex:2 }}>{s.num}</div><div><h4 style={{ fontSize:18,fontWeight:700,color:"#fff",marginBottom:6 }}>{s.title}</h4><p style={{ fontSize:14,color:"#abb4aa",lineHeight:1.7 }}>{s.desc}</p></div></div>))}
        </div>
      </section>
      <CTABanner title="Ready to Market Your Listing?" sub="Send us the APN and deliverables — we'll get you a quote within 24 hours." btn="Get a Quote →"/>
    </div>
  );
}

// ===== CONSTRUCTION =====
function Construction() {
  usePageMeta(
    "Construction Drone Mapping & Progress Documentation | Seraphic Sight",
    "DroneDeploy automated workflows, orthomosaic mapping, GeoTIFF/LAS deliverables, and audit-ready progress documentation for Southern California projects."
  );
  const pageRef = React.useRef(null);
  usePageReveal(pageRef);
  return (
    <div ref={pageRef}>
      <PageHero tag="Construction & Development" title={<>Progress Monitoring,<br/>Mapping & Visualization</>} subtitle="Automated DroneDeploy workflows, orthomosaic mapping, and audit-ready documentation for multi-million dollar projects." accent="#c4d0c4" videoUrl={CON_HERO_VIDEO_URL}/>
      <section style={{ padding:"80px 24px",maxWidth:1200,margin:"0 auto" }}>
        <SectionTitle title="Capabilities" sub="Enterprise-grade aerial documentation for every project phase."/>
        <div className="responsive-grid-3" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:20 }}>
          {CON_CAPABILITIES.map((c,i)=>(<div key={i} className="card-hover" style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:32 }}><h3 style={{ fontSize:18,fontWeight:700,color:"#fff",marginBottom:10 }}>{c.title}</h3><p style={{ fontSize:13,color:"#abb4aa",lineHeight:1.7 }}>{c.desc}</p></div>))}
        </div>
      </section>
      <section style={{ padding:"80px 24px",background:"rgba(255,255,255,0.015)" }}>
        <div style={{ maxWidth:1200,margin:"0 auto" }}>
          <section style={{ padding:"0 24px 60px",maxWidth:960,margin:"0 auto" }}>
        <div style={{ borderRadius:16,overflow:"hidden",border:"1px solid rgba(0,191,166,0.15)" }}>
          <img src="https://res.cloudinary.com/dpc1noikx/image/upload/v1778210648/map-snapshot_q3dk25.png" alt="DroneDeploy orthomosaic map - active construction site" style={{ width:"100%",display:"block" }}/>
          <div style={{ padding:"16px 24px",background:"rgba(0,191,166,0.04)",borderTop:"1px solid rgba(0,191,166,0.1)" }}>
            <p style={{ fontSize:12,color:"#97a399",margin:0 }}>Orthomosaic site map · live DroneDeploy flight, construction progress monitoring, Southern California.</p>
          </div>
        </div>
      </section>

      <SectionTitle title="Our Workflow" sub="Repeatable, automated, audit-ready."/>
          <div className="responsive-grid-3" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:28 }}>
            {CON_STEPS.map((s,i)=>(<div key={i} className="card-hover" style={{ background:"rgba(0,191,166,0.03)",border:"1px solid rgba(0,191,166,0.1)",borderRadius:16,padding:40,textAlign:"center" }}><div className="gradient-text" style={{ fontSize:44,fontWeight:900,marginBottom:18 }}>{s.num}</div><h3 style={{ fontSize:18,fontWeight:700,color:"#fff",marginBottom:10 }}>{s.title}</h3><p style={{ fontSize:13,color:"#abb4aa",lineHeight:1.7 }}>{s.desc}</p></div>))}
          </div>
        </div>
      </section>
      <section style={{ padding:"80px 24px",maxWidth:800,margin:"0 auto" }}>
        <SectionTitle title="Pricing Framework" sub="Construction documentation is scoped per project. Here are our starting benchmarks."/>
        <div style={{ display:"grid",gap:12 }}>
          {CON_PRICING.map((p,i)=>(<div key={i} className="reveal-item" style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 24px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,flexWrap:"wrap",gap:12 }}><span style={{ fontSize:14,color:"#e0e5dd" }}>{p.service}</span><span style={{ fontSize:15,fontWeight:700,color:"#c4d0c4",flexShrink:0 }}>{p.price}</span></div>))}
        </div>
        <div style={{ marginTop:32,padding:24,background:"rgba(0,191,166,0.05)",border:"1px solid rgba(0,191,166,0.12)",borderRadius:12 }}>
          <p style={{ fontSize:13,color:"#abb4aa",lineHeight:1.8 }}><strong style={{ color:"#fff" }}>Every engagement includes:</strong> DroneDeploy automated flight plans · GeoTIFF + LAS/LAZ deliverables · Procore / BIM 360 compatible outputs · Organized, timestamped progress imagery · Site superintendent coordination · COI provided upon request</p>
        </div>
        <TravelFeeNote accent="#c4d0c4"/>
      </section>
      <section style={{ padding:"80px 24px",background:"rgba(255,255,255,0.015)" }}>
        <div style={{ maxWidth:900,margin:"0 auto" }}>
          <SectionTitle title="Who We Work With"/>
          <div className="responsive-grid-3" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16 }}>
            {CON_CLIENTS.map((w,i)=>(<div key={i} className="reveal-item" style={{ padding:"18px 24px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,textAlign:"center",fontSize:14,fontWeight:500,color:"#e0e5dd" }}>{w}</div>))}
          </div>
        </div>
      </section>
      <CTABanner title="Scope Your Next Project" sub="Send us your site details and deliverable requirements. We'll respond with a detailed proposal within 48 hours." btn="Request a Proposal →"/>
    </div>
  );
}

// ===== PORTFOLIO =====
function Portfolio() {
  usePageMeta(
    "Aerial Photography & Drone Video Portfolio | Seraphic Sight",
    "Browse real aerial work: real estate listings, commercial sites, construction progress, and land mapping across Southern California."
  );
  return <PortfolioSection />;
}

function ServiceArea() {
  usePageMeta(
    "Drone Service Area — Southern & Central California | Seraphic Sight",
    "Drone photography and mapping coverage from San Diego to Bakersfield: LA, Orange County, Inland Empire, Coachella Valley, and the coast."
  );
  return (
    <div>
      <PageHero tag="Service Area" title={<>Southern & Central<br/>California</>} subtitle="From San Diego to Bakersfield, Palm Springs to the coast — if your project is in our range, we'll be on site."/>
      <section style={{ padding:"0 24px 60px",maxWidth:1200,margin:"0 auto" }}>
        <div style={{ maxWidth:900,margin:"0 auto 60px",borderRadius:16,border:"1px solid rgba(255,255,255,0.06)",background:"rgba(255,255,255,0.02)",padding:48 }}>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:32,textAlign:"center" }}>
            {[{n:"7",l:"Coverage Regions"},{n:"200+",l:"Cities & Communities"},{n:"400mi",l:"Coverage Radius"},{n:"Same Week",l:"Typical Availability"}].map((s,i)=>(
              <div key={i}>
                <div style={{ fontSize:32,fontWeight:800,color:"#fff",letterSpacing:"-1px" }}>{s.n}</div>
                <div style={{ fontSize:11,fontWeight:600,color:"#abb4aa",textTransform:"uppercase",letterSpacing:1.5,marginTop:6 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <SectionTitle title="Coverage Regions"/>
        <div className="responsive-grid-2" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:20 }}>
          {REGIONS.map((r,i)=>(<div key={i} className="card-hover" style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:32 }}><h3 style={{ fontSize:18,fontWeight:700,color:"#fff",marginBottom:6 }}>{r.name}</h3><p style={{ fontSize:12,color:"#d5ddd4",fontWeight:500,marginBottom:12 }}>{r.cities}</p><p style={{ fontSize:13,color:"#abb4aa",lineHeight:1.7 }}>{r.desc}</p></div>))}
        </div>
      </section>
      <section style={{ padding:"60px 24px 100px",textAlign:"center" }}>
        <p style={{ fontSize:15,color:"#abb4aa",marginBottom:8 }}>Not sure if we cover your area?</p>
        <p style={{ fontSize:18,fontWeight:700,color:"#fff" }}>Reach out — if you're in range, we'll be there.</p>
      </section>
    </div>
  );
}
// ===== CONTACT =====
function Contact() {
  usePageMeta(
    "Get a Drone Services Quote — 24hr Response | Seraphic Sight",
    "Request a quote for aerial photography, drone video, or construction mapping. Send the APN or address — we respond within 24 hours."
  );
  const location = useLocation();
  const [form, setForm] = React.useState({
    name: "", email: "", phone: "", type: "Property Marketing",
    address: "", desc: "", timeline: "", honeypot: "", turnstileToken: "",
  });
  const [status, setStatus] = React.useState("idle");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const nameRef = React.useRef(null);
  const emailRef = React.useRef(null);
  const upd = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: undefined }));
    setStatus("idle");
    setErrorMessage("");
  };
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get("type");
    if (t === "property-marketing") setForm(p => ({ ...p, type: "Property Marketing" }));
    else if (t === "construction") setForm(p => ({ ...p, type: "Construction & Development" }));
  }, [location.search]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status === "sending") return;
    const payload = { ...form, name: form.name.trim(), email: form.email.trim() };
    const errs = {};
    if (!payload.name) errs.name = "Please enter your name.";
    if (!payload.email) errs.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) errs.email = "Enter a valid email address.";
    setErrors(errs);
    if (Object.keys(errs).length) {
      if (errs.name) nameRef.current?.focus();
      else emailRef.current?.focus();
      return;
    }
    if (process.env.REACT_APP_TURNSTILE_SITE_KEY && !form.turnstileToken) {
      setStatus("error");
      setErrorMessage("Please complete the verification challenge before sending.");
      return;
    }
    setStatus("sending");
    setErrorMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus("success");
        return;
      }
      setStatus("error");
      const messages = {
        400: "Please review your form details and try again.",
        403: "Verification failed or expired. Reload the page and try again.",
        413: "Your request is too long. Shorten the description and try again.",
        429: "Too many requests. Please try again in a few minutes.",
        503: "Our inquiry service is temporarily unavailable. Please email us directly.",
      };
      setErrorMessage(messages[res.status] || "We couldn't send your request. Please email us directly.");
    } catch {
      setStatus("error");
      setErrorMessage("Connection error. Please retry or email us directly.");
    }
  };

  if (status === "success") {
    return (
      <section role="status" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px" }}>
        <div>
          <div aria-hidden="true" style={{ fontSize: 64, marginBottom: 24 }}>✓</div>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: "#fff", marginBottom: 16 }}>Quote Request Received</h2>
          <p style={{ color: "#abb4aa", fontSize: 16, lineHeight: 1.7, maxWidth: 450, margin: "0 auto" }}>
            Thank you. We'll review your project details and respond within 24 hours.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div>
      <PageHero tag="Contact" title="Get a Quote" subtitle="Tell us what you need: APN, address, deliverables. We'll respond within 24 hours." />
      <section style={{ padding: "0 24px 100px", maxWidth: 640, margin: "0 auto" }}>
        <form noValidate onSubmit={handleSubmit} style={{ display: "grid", gap: 24 }}>
          <div style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
            <label htmlFor="contact-website">Website (leave blank)</label>
            <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" value={form.honeypot} onChange={e => upd("honeypot", e.target.value)} />
          </div>
          <div className="responsive-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label htmlFor="contact-name" className="form-label">Name *</label>
              <input id="contact-name" ref={nameRef} name="name" autoComplete="name" required maxLength={120}
                className="form-input" value={form.name} onChange={e => upd("name", e.target.value)}
                aria-invalid={!!errors.name} aria-describedby={errors.name ? "contact-name-error" : undefined} placeholder="Your name" />
              {errors.name && <p id="contact-name-error" role="alert" style={{ color: "#FF7777", fontSize: 12, marginTop: 6 }}>{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="contact-phone" className="form-label">Phone</label>
              <input id="contact-phone" name="phone" type="tel" autoComplete="tel" maxLength={40}
                className="form-input" value={form.phone} onChange={e => upd("phone", e.target.value)} placeholder="(000) 000-0000" />
            </div>
          </div>
          <div>
            <label htmlFor="contact-email" className="form-label">Email *</label>
            <input id="contact-email" ref={emailRef} name="email" type="email" autoComplete="email" required maxLength={254}
              className="form-input" value={form.email} onChange={e => upd("email", e.target.value)}
              aria-invalid={!!errors.email} aria-describedby={errors.email ? "contact-email-error" : undefined} placeholder="you@email.com" />
            {errors.email && <p id="contact-email-error" role="alert" style={{ color: "#FF7777", fontSize: 12, marginTop: 6 }}>{errors.email}</p>}
          </div>
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="form-label">Project Type</legend>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {["Property Marketing", "Construction & Development", "Other"].map(t => (
                <button key={t} type="button" className="filter-btn" aria-pressed={form.type === t}
                  onClick={() => upd("type", t)}
                  style={{ border: form.type === t ? "1px solid #d5ddd4" : "1px solid rgba(255,255,255,0.1)", background: form.type === t ? "rgba(0,119,255,0.12)" : "transparent", color: form.type === t ? "#68ADFF" : "#AAAAC0" }}>
                  {t}
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="contact-address" className="form-label">Project Address or APN</label>
            <input id="contact-address" name="address" maxLength={250} className="form-input" value={form.address}
              onChange={e => upd("address", e.target.value)} placeholder="123 Main St or APN #" />
          </div>
          <div>
            <label htmlFor="contact-description" className="form-label">Project Description</label>
            <textarea id="contact-description" name="description" maxLength={2000} className="form-input"
              style={{ minHeight: 120, resize: "vertical" }} value={form.desc}
              onChange={e => upd("desc", e.target.value)} placeholder="Deliverables needed, site access notes, specific requirements." />
          </div>
          <div>
            <label htmlFor="contact-timeline" className="form-label">Preferred Timeline</label>
            <input id="contact-timeline" name="timeline" maxLength={120} className="form-input"
              value={form.timeline} onChange={e => upd("timeline", e.target.value)}
              placeholder="e.g., Within 2 weeks, ASAP, Flexible" />
          </div>
          <TurnstileField onToken={token => setForm(p => ({ ...p, turnstileToken: token }))} />
          {status === "error" && (
            <p role="alert" style={{ color: "#FF7777", fontSize: 13, textAlign: "center" }}>
              {errorMessage} <a style={{ textDecoration: "underline", color: "#fff" }} href="mailto:joseph@seraphicsight.com">joseph@seraphicsight.com</a>
            </p>
          )}
          <button type="submit" className="btn-primary" disabled={status === "sending"}
            style={{ width: "100%", padding: 16, fontSize: 15, marginTop: 8, opacity: status === "sending" ? 0.6 : 1 }}>
            {status === "sending" ? "Sending…" : "Submit Quote Request"}
          </button>
        </form>
        <div style={{ marginTop: 56, padding: 32, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 24, textAlign: "center" }}>
          {[{ label: "Email", value: "joseph@seraphicsight.com", href: "mailto:joseph@seraphicsight.com" }, { label: "Phone", value: "(562) 743-1698", href: "tel:+15627431698" }, { label: "Response Time", value: "Within 24 hours", href: null }].map((c, i) => (
            <div key={i}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#abb4aa", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>{c.label}</div>
              {c.href ? <a href={c.href} style={{ fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none" }}>{c.value}</a> : <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{c.value}</div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ===== FAQ =====
function FAQ() {
  usePageMeta(
    "Drone Services FAQ — Licensing, Pricing, Turnaround | Seraphic Sight",
    "Answers on FAA Part 107 certification, insurance and COIs, LAANC airspace authorization, deliverable formats, turnaround times, and travel fees."
  );
  const [open, setOpen] = React.useState(null);
  const items = [
    { q: "Are you FAA Part 107 certified?", a: "Yes. Joseph Perez holds an FAA Part 107 Remote Pilot Certificate, required for all commercial drone operations in the U.S. We are also fully insured and can provide a Certificate of Insurance (COI) upon request — standard for GCs, brokerages, and property management companies." },
    { q: "What areas do you serve?", a: "Southern and Central California — from San Diego to Bakersfield, and the Inland Empire to the coast. Primary coverage includes Los Angeles, Orange County, Riverside County, San Bernardino County, the Coachella Valley, and surrounding areas. Travel fees apply beyond our primary service zone." },
    { q: "How long does it take to receive my deliverables?", a: "Standard turnaround is 3–4 business days from the date of the flight. Rush delivery (1–2 business days) is available as an add-on. Large DroneDeploy mapping or construction projects may require additional processing time — we'll confirm timelines when scoping your project." },
    { q: "What file formats do you deliver?", a: "Property marketing: edited JPEG/PNG photos (MLS-ready), MP4 video in 16:9 and 9:16 (Reels/TikTok cuts), and hosted 360° tour links. Construction/mapping: GeoTIFF orthomosaics, LAS/LAZ point clouds, and Procore / BIM 360-compatible outputs. All files delivered via a cloud download link." },
    { q: "Do you handle airspace authorization?", a: "Yes — we manage all LAANC authorizations for controlled airspace through the FAA's automated system. For restricted or complex airspace, we obtain manual waivers as needed at no additional cost to you." },
    { q: "What is your travel fee?", a: "We charge $0.70 per mile. Jobs under 50 miles are billed round-trip; jobs 50 miles or more are billed one-way. For most projects in the greater Los Angeles, Inland Empire, or San Diego areas, travel fees are minimal or zero." },
    { q: "How do I book a shoot?", a: "Fill out our quote request form with your project address (or APN for land/construction sites), your deliverable list, and your timeline. We respond within 24 hours with pricing and availability. A 50% deposit is required to hold your shoot date." },
    { q: "Do you work with real estate agents and brokerages?", a: "Absolutely — we work with individual agents, teams, and brokerages on a per-listing or retainer basis. If you have regular listing volume, ask about agent pricing. We're happy to build a workflow that fits your business and turnaround requirements." },
    { q: "Can you accommodate urgent timelines?", a: "We do our best to accommodate tight deadlines. Same-week availability is typical. For same-day or next-day requests, reach out directly and we'll make every effort to be on site when you need us." },
    { q: "What equipment do you use?", a: "We fly DJI drones (Mavic 3 Pro, Phantom 4 RTK) for photography, cinematic video, and precision mapping. 360° virtual tours are captured with the Ricoh Theta Z1 and Insta360 X series. Construction flight plans are powered by DroneDeploy's automated workflow platform." },
  ];
  return (
    <div>
      <PageHero tag="FAQ" title="Frequently Asked Questions" subtitle="Everything you need to know about booking, deliverables, and working with Seraphic Sight." accent="#d5ddd4"/>
      <section style={{ padding:"0 24px 100px",maxWidth:780,margin:"0 auto" }}>
        {items.map((item,i)=>(
          <div key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={()=>setOpen(open===i?null:i)}
              style={{ width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"22px 0",background:"none",border:"none",cursor:"pointer",gap:16,textAlign:"left" }}>
              <span style={{ fontSize:15,fontWeight:600,color:"#fff",lineHeight:1.4 }}>{item.q}</span>
              <span style={{ color:"#d5ddd4",fontSize:22,flexShrink:0,transform:open===i?"rotate(45deg)":"none",transition:"transform 0.2s",display:"inline-block" }}>+</span>
            </button>
            {open===i&&(
              <div style={{ paddingBottom:22 }}>
                <p style={{ fontSize:14,color:"#abb4aa",lineHeight:1.8,margin:0 }}>{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </section>
      <CTABanner title="Still Have Questions?" sub="Reach out directly — we respond within 24 hours." btn="Contact Us →"/>
    </div>
  );
}

// ===== NOT FOUND =====
function NotFound() {
  usePageMeta("Page Not Found | Seraphic Sight", "The requested page could not be found.");
  React.useEffect(() => {
    let tag = document.querySelector('meta[name="robots"]');
    const created = !tag;
    const prior = tag?.getAttribute("content");
    if (!tag) { tag = document.createElement("meta"); tag.name = "robots"; document.head.appendChild(tag); }
    tag.content = "noindex,follow";
    if (created) tag.setAttribute("data-route-not-found", "true");
    return () => {
      if (created) tag.remove();
      else if (prior === null) tag.removeAttribute("content");
      else tag.setAttribute("content", prior);
    };
  }, []);
  return (
    <main style={{minHeight:"75vh",padding:"180px 24px 100px",textAlign:"center"}}>
      <h1 style={{fontSize:48,color:"#fff",marginBottom:20}}>Page not found</h1>
      <p style={{color:"#aaa",marginBottom:32}}>The page you requested is unavailable.</p>
      <Link to="/portfolio" className="btn-primary" style={{display:"inline-block",textDecoration:"none"}}>Explore the portfolio</Link>
    </main>
  );
}

// ===== MAIN APP =====

export default function App() {
  const location = useLocation();
  const isWorldCup = location.pathname === "/worldcup-2030";
  const isEditorialHome = location.pathname === "/";
  const isInnerPage = !isEditorialHome && !isWorldCup;

  React.useEffect(() => {
    if (REDUCED_MOTION) return; // native scrolling for reduced-motion users
    const lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    window.__lenis = lenis; // shared with Nav scroll-to-top
    lenis.on("scroll", ScrollTrigger.update);
    const raf = time => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(raf); lenis.destroy(); window.__lenis = null; };
  }, []);

  return (
    <div className={isInnerPage ? "editorial-inner" : ""}>
      {/* Noise grain overlay */}
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,opacity:0.032,
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat:"repeat",backgroundSize:"128px 128px"
      }}/>
      {!isWorldCup && !isEditorialHome && <Nav/>}
      <React.Suspense fallback={
        <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",color:"rgba(0,170,255,0.6)",fontSize:12,letterSpacing:"0.2em" }}>LOADING…</div>
      }>
      <Routes>
        <Route path="/" element={<EditorialHome/>}/>
        <Route path="/property-marketing" element={<PropertyMarketing/>}/>
        <Route path="/construction" element={<Construction/>}/>
        <Route path="/portfolio" element={<Portfolio/>}/>
        <Route path="/showroom" element={<Navigate to="/portfolio" replace/>}/>
        <Route path="/service-area" element={<ServiceArea/>}/>
        <Route path="/contact" element={<Contact/>}/>
        <Route path="/faq" element={<FAQ/>}/>
        <Route path="/worldcup-2030" element={<WorldCup2030/>}/>
        <Route path="*" element={<NotFound/>}/>
      </Routes>
      </React.Suspense>
      {!isWorldCup && !isEditorialHome && <Footer/>}
    </div>
  );
}
