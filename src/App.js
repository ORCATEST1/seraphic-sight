import React from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import EditorialHome from "./components/EditorialHome";
import { PropertyEditorial, ConstructionEditorial } from "./components/EditorialServices";
import ServiceAreaMap from "./components/ServiceAreaMap";
import "./components/EditorialInner.css";
import "./components/EditorialPolish.css";
import TurnstileField from "./components/TurnstileField";
import WorldCup2030 from "./WorldCup2030";

gsap.registerPlugin(ScrollTrigger);

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



// ===== EDITORIAL SERVICE PAGES =====
function PropertyMarketing() {
  usePageMeta("Property Marketing | Aerial Photography & Film | Seraphic Sight",
    "Property aerial photography, cinematic video and immersive listing presentation. Explore starting packages and request a tailored quote.");
  return <PropertyEditorial/>;
}
function Construction() {
  usePageMeta("Construction Drone Documentation & Mapping | Seraphic Sight",
    "Construction progress imagery, orthomosaic mapping and coordinated aerial site visits across Southern California.");
  return <ConstructionEditorial/>;
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
  usePageMeta("Southern California Drone Service Area | Seraphic Sight",
    "Explore aerial imaging and construction documentation service areas from Los Angeles and San Diego to the Inland Empire and southern Central Valley.");
  return <ServiceAreaMap/>;
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
    <main className="ss-contact-page">
      <header className="ss-contact-head">
        <p className="ss-contact-eyebrow">CONTACT / START A PROJECT</p>
        <h1>Tell us what<br/>you're building.</h1>
        <p>From a single listing to an active construction site, the right first step is a clear brief. Send us the location, what you need captured, and your timeline.</p>
      </header>
      <section className="ss-contact-layout">
        <aside className="ss-contact-aside">
          <p className="ss-contact-eyebrow">A DIRECT LINE</p>
          <h2>Better work starts with a conversation.</h2>
          <p>We'll review your request, confirm feasibility and follow up with the scope, travel and pricing.</p>
          <div className="ss-contact-direct">
            <span>EMAIL</span>
            <a href="mailto:joseph@seraphicsight.com">joseph@seraphicsight.com</a>
            <span>PHONE</span>
            <a href="tel:+15627431698">(562) 743-1698</a>
          </div>
          <p className="ss-contact-footnote">Flight scheduling is subject to weather, airspace restrictions, site access and availability.</p>
        </aside>
        <div className="ss-contact-form-col">
          <p className="ss-contact-eyebrow">PROJECT ENQUIRY</p>
          <h2>Share the essentials.</h2>
        <form noValidate onSubmit={handleSubmit} className="ss-contact-form" style={{ display: "grid", gap: 24 }}>
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
                className="form-input" value={form.phone} onChange={e => upd("phone", e.target.value)} placeholder="Optional phone number" />
            </div>
          </div>
          <div>
            <label htmlFor="contact-email" className="form-label">Email *</label>
            <input id="contact-email" ref={emailRef} name="email" type="email" autoComplete="email" required maxLength={254}
              className="form-input" value={form.email} onChange={e => upd("email", e.target.value)}
              aria-invalid={!!errors.email} aria-describedby={errors.email ? "contact-email-error" : undefined} placeholder="Your business email" />
            {errors.email && <p id="contact-email-error" role="alert" style={{ color: "#FF7777", fontSize: 12, marginTop: 6 }}>{errors.email}</p>}
          </div>
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="form-label">Project Type</legend>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {["Property Marketing", "Construction & Development", "Other"].map(t => (
                <button key={t} type="button" className="filter-btn" aria-pressed={form.type === t}
                  onClick={() => upd("type", t)}
                  style={{ border: form.type === t ? "1px solid #d5ddd4" : "1px solid rgba(255,255,255,0.1)", background: form.type === t ? "#344638" : "transparent", color: form.type === t ? "#f2f4e9" : "#a9baaa" }}>
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
        <p className="ss-contact-disclaimer">We use these details to review your request and follow up about the project.</p>
        </div>
      </section>
    </main>
  );
}

// ===== FAQ =====
function FAQ() {
  usePageMeta("Drone Services FAQ | Seraphic Sight",
    "Practical answers about aerial imaging, construction documentation, deliverables, scheduling, flight permissions and travel.");
  const [open,setOpen]=React.useState(null);
  const items=[
    {q:"Are you FAA Part 107 certified?",a:"Yes. Commercial aerial work is conducted by an FAA Part 107-certificated remote pilot. We assess airspace, site requirements and weather for each assignment. A certificate of insurance can be provided when requested and applicable."},
    {q:"Where do you travel?",a:"We regularly consider assignments across Southern California, including Los Angeles, Orange County, the Inland Empire, San Diego, the Coachella Valley and the High Desert. Select southern Central Valley projects are available by arrangement. Confirm coverage and pricing with the project address."},
    {q:"How soon will I receive my files?",a:"Many standard property-image packages can be delivered within approximately 3–4 business days after capture. Processing-intensive maps, complex edits, weather and access constraints can change that schedule. We confirm turnaround in your proposal."},
    {q:"What deliverable formats are available?",a:"Typical property deliverables include edited JPEGs, MP4 video and optional vertical cutdowns or tour links. Construction services may include organized timestamped imagery, orthomosaics and project-specific geospatial formats. We define required outputs before flight rather than assuming every package includes every format."},
    {q:"Can you fly in controlled airspace?",a:"We check each location against current FAA airspace requirements. LAANC authorizations are available for some locations and conditions; other sites may require additional approvals or may not be flyable on the requested date. We never promise approval before checking."},
    {q:"How is travel calculated?",a:"The published travel rate is $0.70 per mile. Trips under 50 miles use round-trip mileage; trips of 50 miles or more use one-way mileage. The route, applicable fee and any additional expenses are confirmed in your quote."},
    {q:"Are your property boundary overlays surveys?",a:"No. White-line parcel outlines and other marketing annotations are visual aids based on the boundaries supplied or verified for the project. They are not a substitute for a licensed land survey or legal property description."},
    {q:"How do I request a shoot?",a:"Use the contact form with your property address or APN, type of project, requested media and target date. We'll review scope and availability and explain the next steps, including any required scheduling or payment terms."},
    {q:"Can you support repeated construction visits?",a:"Yes. Projects can be scoped for one-off documentation or scheduled return visits. Flight paths, frequency, deliverables and site coordination are agreed with your team for consistent progress records."},
    {q:"What equipment and processing tools do you use?",a:"We select aerial camera equipment and processing workflows to suit the assignment. For mapping, the required accuracy, control points and deliverable formats must be defined in advance. Ask us about the proposed equipment and workflow for your site."}
  ];
  return <main className="ss-faq-page">
    <header className="ss-faq-head"><p className="ss-faq-eyebrow">FAQ / WORKING TOGETHER</p>
      <h1>Good questions.<br/>Clear answers.</h1>
      <p>From flight approvals and deliverables to travel and scheduling, here's what to know before we begin.</p>
    </header>
    <section className="ss-faq-layout">
      <div className="ss-faq-intro"><p className="ss-faq-eyebrow">THE DETAILS</p>
        <h2>Thoughtful planning makes better imagery.</h2>
        <p>Every site has its own conditions. If your question isn't covered here, share the project details and we'll talk through what's possible.</p>
        <Link to="/contact" className="ss-faq-contact">ASK ABOUT A PROJECT <span aria-hidden="true">↗</span></Link>
      </div>
      <div className="ss-faq-accordions">
        {items.map((item,index)=>{
          const id="ss-faq-answer-"+index;
          return <article key={item.q} className="ss-faq-item">
            <button type="button" aria-expanded={open===index} aria-controls={id} onClick={()=>setOpen(open===index?null:index)}>
              <span className="ss-faq-number">{String(index+1).padStart(2,"0")}</span>
              <span className="ss-faq-question">{item.q}</span>
              <span className="ss-faq-symbol" aria-hidden="true">{open===index?"−":"+"}</span>
            </button>
            <div id={id} hidden={open!==index}><p>{item.a}</p></div>
          </article>;
        })}
      </div>
    </section>
    <CTABanner title="Still curious?" sub="Send the address and a few lines about your project. We'll take it from there." btn="Contact Seraphic Sight"/>
  </main>;
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
