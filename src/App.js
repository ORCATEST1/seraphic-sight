import React from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import {
  NAV_LINKS, STATS, PROP_SERVICES, PROP_PRICING, PROP_ADDONS,
  PROP_PROCESS, CON_CAPABILITIES, CON_PRICING, CON_STEPS,
  CON_CLIENTS, PORTFOLIO_ITEMS, REGIONS, HERO_VIDEO_URL,
  PROP_HERO_VIDEO_URL, CON_HERO_VIDEO_URL, TRAVEL_FEE, CLIENTS,
} from "./data/content";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import CinematicHero from "./components/CinematicHero";
import PortfolioSection from "./components/PortfolioSection";
import SpatialShowroom from "./components/SpatialShowroom";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// ===== SCROLL SCRAMBLE HOOK =====
function useTextScramble(text, { duration = 900, delay = 0 } = {}) {
  const [display, setDisplay] = React.useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&";
  React.useEffect(() => {
    let frame = 0;
    const totalFrames = Math.floor(duration / 28);
    let raf, delayTimer;
    const tick = () => {
      frame++;
      const resolved = Math.floor((frame / totalFrames) * text.length);
      setDisplay(
        text.split("").map((ch, i) => {
          if (ch === " " || ch === "\n") return ch;
          if (i < resolved) return ch;
          return chars[Math.floor(Math.random() * chars.length)];
        }).join("")
      );
      if (frame < totalFrames) raf = requestAnimationFrame(tick);
      else setDisplay(text);
    };
    delayTimer = setTimeout(() => { raf = requestAnimationFrame(tick); }, delay);
    return () => { cancelAnimationFrame(raf); clearTimeout(delayTimer); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return display;
}

// ===== MAGNETIC BUTTON =====
function MagneticBtn({ children, style, className, onClick }) {
  const btnRef = React.useRef(null);
  const handleMouseMove = React.useCallback((e) => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.22;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.22;
    gsap.to(el, { x, y, duration: 0.35, ease: "power2.out", overwrite: "auto" });
  }, []);
  const handleMouseLeave = React.useCallback(() => {
    gsap.to(btnRef.current, { x: 0, y: 0, duration: 0.65, ease: "elastic.out(1,0.45)", overwrite: "auto" });
  }, []);
  return (
    <button
      ref={btnRef}
      className={className}
      style={{ ...style, willChange: "transform", display: "inline-block" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >{children}</button>
  );
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
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const location = useLocation();
  const R = { Home:"/","Property Marketing":"/property-marketing",Construction:"/construction",Portfolio:"/portfolio","Service Area":"/service-area",FAQ:"/faq",Contact:"/contact","3D Showroom":"/showroom" };

  React.useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  React.useEffect(() => { setMenuOpen(false); window.scrollTo({ top: 0 }); }, [location]);

  return (
    <>
      <nav style={{ position:"fixed",top:0,left:0,right:0,zIndex:100,background:scrolled?"rgba(10,10,18,0.95)":"rgba(10,10,18,0.8)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"0 40px",transition:"all 0.4s" }}>
        <div style={{ maxWidth:1200,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:68 }}>
          <Link to="/" style={{ display:"flex",alignItems:"center",gap:10,textDecoration:"none" }}>
            <div style={{ width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#0077FF,#00BFA6)",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="3" fill="white"/><circle cx="11" cy="11" r="1.2" fill="#0077FF"/><line x1="5" y1="5" x2="8.5" y2="8.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><line x1="17" y1="5" x2="13.5" y2="8.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><line x1="5" y1="17" x2="8.5" y2="13.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><line x1="17" y1="17" x2="13.5" y2="13.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><circle cx="4" cy="4" r="2" fill="rgba(0,191,166,0.3)" stroke="#00BFA6" strokeWidth="1"/><circle cx="18" cy="4" r="2" fill="rgba(0,191,166,0.3)" stroke="#00BFA6" strokeWidth="1"/><circle cx="4" cy="18" r="2" fill="rgba(0,191,166,0.3)" stroke="#00BFA6" strokeWidth="1"/><circle cx="18" cy="18" r="2" fill="rgba(0,191,166,0.3)" stroke="#00BFA6" strokeWidth="1"/></svg>
            </div>
            <span style={{ color:"#fff",fontWeight:700,fontSize:17,letterSpacing:"-0.3px" }}>Seraphic Sight</span>
          </Link>
          <div className="desktop-nav" style={{ display:"flex",alignItems:"center",gap:28 }}>
            {NAV_LINKS.map(p=><Link key={p} to={R[p]} className={`nav-link ${location.pathname===R[p]?"active":""}`} style={{whiteSpace:"nowrap"}}>{p}</Link>)}
            <Link to="/showroom" className={`nav-link ${location.pathname==="/showroom"?"active":""}`} style={{whiteSpace:"nowrap"}}>3D Showroom</Link>
            <Link to="/contact"><button className="btn-primary" style={{ padding:"9px 22px",fontSize:12 }}>Get a Quote</button></Link>
          </div>
          <div className="mobile-toggle" style={{ display:"none",cursor:"pointer",flexDirection:"column",gap:5 }} onClick={()=>setMenuOpen(true)}>
            <div style={{ width:24,height:2,background:"#fff" }}/><div style={{ width:24,height:2,background:"#fff" }}/><div style={{ width:18,height:2,background:"#fff" }}/>
          </div>
        </div>
      </nav>
      {menuOpen&&<div style={{ position:"fixed",inset:0,background:"rgba(10,10,18,0.98)",zIndex:999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:28 }}>
        <div style={{ position:"absolute",top:24,right:32,color:"#fff",fontSize:28,cursor:"pointer" }} onClick={()=>setMenuOpen(false)}>✕</div>
        {NAV_LINKS.map(p=><Link key={p} to={R[p]} style={{ color:"#fff",textDecoration:"none",fontSize:20,fontWeight:500,letterSpacing:1 }} onClick={()=>setMenuOpen(false)}>{p}</Link>)}
        <Link to="/showroom" style={{ color:"#00BFA6",textDecoration:"none",fontSize:20,fontWeight:500,letterSpacing:1 }} onClick={()=>setMenuOpen(false)}>3D Showroom</Link>
      </div>}
    </>
  );
}

// ===== SHARED COMPONENTS =====
function PageHero({ tag, title, subtitle, accent="#0077FF", videoUrl=null }) {
  return (
    <section style={{ position:"relative",paddingTop:videoUrl?0:140,paddingBottom:videoUrl?0:80,textAlign:"center",overflow:"hidden",minHeight:videoUrl?"60vh":undefined,display:videoUrl?"flex":undefined,alignItems:videoUrl?"center":undefined,justifyContent:videoUrl?"center":undefined }}>
      {videoUrl ? (
        <>
          <video autoPlay muted loop playsInline
            style={{ position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",zIndex:0 }}
            src={videoUrl}/>
          <div style={{ position:"absolute",inset:0,background:"rgba(10,10,18,0.62)",zIndex:1,
            backgroundImage:`linear-gradient(${accent}08 1px,transparent 1px),linear-gradient(90deg,${accent}08 1px,transparent 1px)`,
            backgroundSize:"44px 44px" }}/>
        </>
      ) : (
        <div className="glow-orb" style={{ top:-60,right:-60,width:400,height:400,background:accent,opacity:0.07 }}/>
      )}
      <div style={{ position:"relative",zIndex:2,maxWidth:750,margin:"0 auto",padding:videoUrl?"140px 24px 80px":"0 24px" }}>
        {tag&&<div className="tag-pill" style={{ background:`${accent}15`,border:`1px solid ${accent}30`,color:accent,marginBottom:24,display:"inline-flex" }}>{tag}</div>}
        <h1 style={{ fontSize:44,fontWeight:800,color:"#fff",letterSpacing:"-1.2px",lineHeight:1.1,marginBottom:18 }}>{title}</h1>
        {subtitle&&<p style={{ fontSize:17,color:"#8888A0",lineHeight:1.7,maxWidth:580,margin:"0 auto" }}>{subtitle}</p>}
      </div>
      {videoUrl&&(
        <div style={{ position:"absolute",bottom:28,left:"50%",transform:"translateX(-50%)",zIndex:3,display:"flex",flexDirection:"column",alignItems:"center",gap:6,animation:"heroBounce 2.2s ease-in-out infinite" }}>
          <span style={{ fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.35)",letterSpacing:2,textTransform:"uppercase" }}>Scroll</span>
          <svg width="20" height="12" viewBox="0 0 20 12" fill="none"><path d="M1 1L10 10L19 1" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      )}
    </section>
  );
}

function SectionTitle({ title, sub }) {
  return (
    <div style={{ textAlign:"center",marginBottom:56 }}>
      <h2 className="section-title" style={{ fontSize:34,fontWeight:800,color:"#fff",letterSpacing:"-0.8px",marginBottom:sub?14:0 }}>{title}</h2>
      {sub&&<p style={{ color:"#8888A0",fontSize:15,maxWidth:500,margin:"0 auto" }}>{sub}</p>}
    </div>
  );
}

function CTABanner({ title, sub, btn }) {
  return (
    <section style={{ padding:"90px 24px",position:"relative",overflow:"hidden" }}>
      <div className="glow-orb" style={{ width:400,height:400,top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"#0077FF",opacity:0.06 }}/>
      <div style={{ maxWidth:650,margin:"0 auto",textAlign:"center",position:"relative",zIndex:2 }}>
        <h2 className="section-title" style={{ fontSize:34,fontWeight:800,color:"#fff",letterSpacing:"-0.8px",marginBottom:14 }}>{title}</h2>
        <p style={{ color:"#8888A0",fontSize:15,marginBottom:36,lineHeight:1.7 }}>{sub}</p>
        <Link to="/contact"><button className="btn-primary" style={{ padding:"16px 44px",fontSize:14 }}>{btn}</button></Link>
      </div>
    </section>
  );
}

function Footer() {
  const R = { Home:"/","Property Marketing":"/property-marketing",Construction:"/construction",Portfolio:"/portfolio","Service Area":"/service-area",FAQ:"/faq",Contact:"/contact","3D Showroom":"/showroom" };
  return (
    <footer style={{ borderTop:"1px solid rgba(255,255,255,0.06)",padding:"56px 24px 36px",background:"rgba(0,0,0,0.3)" }}>
      <div style={{ maxWidth:1200,margin:"0 auto" }}>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:48,marginBottom:48 }}>
          <div>
            <Link to="/" style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14,textDecoration:"none" }}>
              <div style={{ width:26,height:26,borderRadius:7,background:"linear-gradient(135deg,#0077FF,#00BFA6)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <svg width="16" height="16" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="3" fill="white"/><circle cx="11" cy="11" r="1.2" fill="#0077FF"/><line x1="5" y1="5" x2="8.5" y2="8.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><line x1="17" y1="5" x2="13.5" y2="8.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><line x1="5" y1="17" x2="8.5" y2="13.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><line x1="17" y1="17" x2="13.5" y2="13.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><circle cx="4" cy="4" r="2" fill="rgba(0,191,166,0.3)" stroke="#00BFA6" strokeWidth="1"/><circle cx="18" cy="4" r="2" fill="rgba(0,191,166,0.3)" stroke="#00BFA6" strokeWidth="1"/><circle cx="4" cy="18" r="2" fill="rgba(0,191,166,0.3)" stroke="#00BFA6" strokeWidth="1"/><circle cx="18" cy="18" r="2" fill="rgba(0,191,166,0.3)" stroke="#00BFA6" strokeWidth="1"/></svg>
              </div>
              <span style={{ color:"#fff",fontWeight:700,fontSize:15 }}>Seraphic Sight</span>
            </Link>
            <p style={{ fontSize:13,color:"#6066A0",lineHeight:1.7,marginBottom:18,maxWidth:260 }}>FAA Part 107 certified drone services for real estate and construction across Southern & Central California.</p>
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              <a href="tel:9093159891" style={{ fontSize:13,color:"#8888A0",textDecoration:"none" }}>📞 909.315.9891</a>
              <a href="mailto:joseph@seraphicsight.com" style={{ fontSize:13,color:"#8888A0",textDecoration:"none" }}>✉️ joseph@seraphicsight.com</a>
              <a href="https://www.google.com/maps/search/?api=1&query=Seraphic+Sight+LLC" target="_blank" rel="noopener noreferrer" style={{ fontSize:13,color:"#0077FF",textDecoration:"none" }}>⭐ Google Business Profile</a>
            </div>
          </div>
          <div>
            <p style={{ fontSize:11,fontWeight:700,color:"#444460",textTransform:"uppercase",letterSpacing:1.5,marginBottom:16 }}>Services</p>
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {["Property Marketing","Construction"].map(p=><Link key={p} to={R[p]} style={{ color:"#8888A0",textDecoration:"none",fontSize:13 }}>{p}</Link>)}
            </div>
          </div>
          <div>
            <p style={{ fontSize:11,fontWeight:700,color:"#444460",textTransform:"uppercase",letterSpacing:1.5,marginBottom:16 }}>Company</p>
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {["Portfolio","Service Area","FAQ","Contact","3D Showroom"].map(p=><Link key={p} to={R[p]} style={{ color:"#8888A0",textDecoration:"none",fontSize:13 }}>{p}</Link>)}
            </div>
          </div>
        </div>
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.05)",paddingTop:24 }}>
          <p style={{ fontSize:11,color:"#3A3A55" }}>© 2026 Seraphic Sight LLC · FAA Part 107 Certified · Fully Insured · Southern & Central California</p>
        </div>
      </div>
    </footer>
  );
}

function TravelFeeNote({ accent = "#0077FF" }) {
  return (
    <div style={{ marginTop:32,padding:"18px 24px",background:`${accent}08`,border:`1px solid ${accent}18`,borderRadius:12,display:"flex",flexWrap:"wrap",alignItems:"center",gap:12 }}>
      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
        
        <span style={{ fontSize:13,fontWeight:700,color:"#fff" }}>Travel Fee</span>
        <span style={{ fontSize:13,fontWeight:700,color:accent }}>{TRAVEL_FEE.rate}</span>
      </div>
      <div style={{ color:"rgba(255,255,255,0.15)",fontSize:13 }}>|</div>
      <span style={{ fontSize:13,color:"#8888A0" }}>{TRAVEL_FEE.nearRule}</span>
      <div style={{ color:"rgba(255,255,255,0.15)",fontSize:13 }}>·</div>
      <span style={{ fontSize:13,color:"#8888A0" }}>{TRAVEL_FEE.farRule}</span>
    </div>
  );
}

// ===== HOME =====
function Home() {
  const homeRef = React.useRef(null);
  const verticalsRef = React.useRef(null);
  const verticalsTrackRef = React.useRef(null);
  const testimonialsRef = React.useRef(null);
  const testimonialsTrackRef = React.useRef(null);
  const scrambledHero = useTextScramble("Aerial Imaging &", { duration: 950, delay: 350 });

  useGSAP(() => {
    // ── Reveal animations: section titles
    gsap.utils.toArray(".section-title").forEach(el => {
      gsap.from(el, { y: 32, opacity: 0, duration: 0.85, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });
    // ── Reveal animations: cards (staggered by column)
    gsap.utils.toArray(".card-hover").forEach((el, i) => {
      gsap.from(el, { y: 44, opacity: 0, duration: 0.7, delay: (i % 3) * 0.08, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });
    // ── Counter animations
    gsap.utils.toArray(".count-up").forEach(el => {
      const end = parseFloat(el.dataset.end);
      const suffix = el.dataset.suffix || "";
      const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
      const obj = { val: 0 };
      gsap.to(obj, { val: end, duration: 1.8, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
        onUpdate() { el.textContent = (decimals ? obj.val.toFixed(decimals) : Math.round(obj.val)) + suffix; }
      });
    });
    // ── Horizontal scroll: Two Verticals + Testimonials (desktop only)
    const mm = gsap.matchMedia();
    mm.add("(min-width: 769px)", () => {
      // Two Verticals
      gsap.timeline({
        scrollTrigger: {
          trigger: verticalsRef.current,
          pin: true,
          anticipatePin: 1,
          scrub: 1.2,
          end: "+=200%",
          snap: { snapTo: [0, 1], duration: { min: 0.4, max: 0.8 }, delay: 0.2, ease: "power2.inOut" }
        }
      }).to(verticalsTrackRef.current, { xPercent: -50, ease: "none" });

      // Testimonials horizontal marquee
      const tTrack = testimonialsTrackRef.current;
      gsap.to(tTrack, {
        x: () => -(tTrack.scrollWidth - document.documentElement.clientWidth + 96),
        ease: "none",
        scrollTrigger: {
          trigger: testimonialsRef.current,
          pin: true,
          anticipatePin: 1,
          scrub: 1,
          end: () => "+=" + (tTrack.scrollWidth - document.documentElement.clientWidth + 96),
          invalidateOnRefresh: true,
        },
      });
    });
  }, { scope: homeRef });

  return (
    <div ref={homeRef}>
      {/* ── Cinematic 3D scroll hero ── */}
      <CinematicHero />

      {/* ── Brand intro — hero content below the cinematic fold ── */}
      <section style={{
        position: "relative",
        padding: "120px 24px 100px",
        textAlign: "center",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(0,119,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,119,255,0.05) 1px,transparent 1px)",
          backgroundSize: "44px 44px",
        }} />
        <div className="glow-orb" style={{ top: "20%", right: "-5%", width: 440, height: 440, background: "#0077FF", opacity: 0.07 }} />
        <div className="glow-orb" style={{ bottom: "10%", left: "-5%", width: 360, height: 360, background: "#00BFA6", opacity: 0.06 }} />
        <div className="animate-fadeUp" style={{ position: "relative", zIndex: 2, maxWidth: 860, margin: "0 auto" }}>
          <div className="tag-pill" style={{ background: "rgba(0,119,255,0.1)", border: "1px solid rgba(0,119,255,0.2)", color: "#0077FF", marginBottom: 32, display: "inline-flex" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0077FF", animation: "pulse 2s infinite" }} />
            FAA Part 107 Certified · Fully Insured
          </div>
          <h1 className="hero-title" style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.08, letterSpacing: "-1.5px", color: "#fff", marginBottom: 24, fontVariantNumeric: "tabular-nums" }}>
            {scrambledHero}<br /><span className="gradient-text">Site Documentation</span><br />for Southern California
          </h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
            <span style={{ color: "#FFD700", fontSize: 13, letterSpacing: 1 }}>★★★★★</span>
            <span style={{ fontSize: 13, color: "#8888A0" }}>5.0 · 26 verified reviews on</span>
            <a href="https://www.droners.io" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#6066A0", textDecoration: "none" }}>Droners.io</a>
          </div>
          <p className="hero-subtitle" style={{ fontSize: 18, lineHeight: 1.7, color: "#8888A0", maxWidth: 600, margin: "0 auto 40px" }}>
            FAA-certified drone services for property marketing, construction monitoring, and site visualization — from APN to final deliverables.
          </p>
          <div className="btn-row" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/contact?type=property-marketing"><MagneticBtn className="btn-primary">Property Marketing</MagneticBtn></Link>
            <Link to="/contact?type=construction"><MagneticBtn className="btn-outline">Construction &amp; Development</MagneticBtn></Link>
            <Link to="/showroom"><MagneticBtn className="btn-outline" style={{borderColor:"rgba(0,191,166,0.3)",color:"#00BFA6"}}>&#9654; 3D Showroom</MagneticBtn></Link>
          </div>
          <p style={{ fontSize: 12, color: "#444460", marginTop: 14 }}>
            Packages from <strong style={{ color: "#666680" }}>$249</strong> · Quote within 24 hrs · No obligation
          </p>
        </div>
      </section>

      <section style={{ borderTop:"1px solid rgba(255,255,255,0.06)",borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"40px 24px",background:"rgba(255,255,255,0.02)" }}>
        <div className="stats-bar" style={{ maxWidth:900,margin:"0 auto",display:"flex",justifyContent:"space-around",flexWrap:"wrap",gap:24 }}>
          {STATS.map((s,i)=>(<div key={i} style={{ textAlign:"center" }}><div style={{ fontSize:20,fontWeight:800,color:"#fff" }}>{s.value}</div><div style={{ fontSize:11,color:"#6666A0",fontWeight:500,marginTop:4,textTransform:"uppercase",letterSpacing:1.5 }}>{s.label}</div></div>))}
        </div>
      </section>

      <section style={{ padding:"48px 24px",background:"rgba(255,255,255,0.01)",borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth:960,margin:"0 auto",textAlign:"center" }}>
          <p style={{ fontSize:11,fontWeight:600,color:"#555570",textTransform:"uppercase",letterSpacing:2,marginBottom:28 }}>Trusted by teams at</p>
          <div style={{ display:"flex",flexWrap:"wrap",justifyContent:"center",gap:40,alignItems:"center" }}>
            {CLIENTS.map((cl,i)=>(<span key={i} style={{ fontSize:14,fontWeight:600,color:"#6066A0",letterSpacing:0.3 }}>{cl}</span>))}
          </div>
        </div>
      </section>

      {/* ===== TWO VERTICALS: Horizontal Pinned Scroll (desktop) / Stacked (mobile) ===== */}
      <section ref={verticalsRef} style={{ overflow:"hidden",position:"relative" }}>
        <div ref={verticalsTrackRef} style={{ display:"flex",width:"200vw",flexWrap:"nowrap" }}>

          {/* Panel 1 — Property Marketing */}
          <div style={{ width:"100vw",minHeight:"100vh",position:"relative",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0 }}>
            <div style={{ position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(0,119,255,0.1) 0%,rgba(10,10,18,0.98) 60%)" }}/>
            <div style={{ position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(0,119,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,119,255,0.05) 1px,transparent 1px)",backgroundSize:"48px 48px",opacity:0.6 }}/>
            <div style={{ position:"relative",zIndex:2,maxWidth:680,padding:"100px 40px",textAlign:"center" }}>
              <div className="tag-pill" style={{ background:"rgba(0,119,255,0.1)",border:"1px solid rgba(0,119,255,0.25)",color:"#0077FF",marginBottom:28,display:"inline-flex" }}>01 — Property Marketing</div>
              <h2 style={{ fontSize:58,fontWeight:900,color:"#fff",letterSpacing:"-1.8px",lineHeight:1.02,marginBottom:22 }}>
                Sell listings<br/><span className="gradient-text">faster.</span>
              </h2>
              <p style={{ fontSize:17,color:"#8888A0",lineHeight:1.75,maxWidth:480,margin:"0 auto 40px" }}>
                MLS-ready aerial photography, drone video, 360° virtual tours, and complete marketing packages. Send us the APN — we handle the rest.
              </p>
              <div style={{ display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",marginBottom:52 }}>
                <Link to="/property-marketing"><MagneticBtn className="btn-primary">View Services →</MagneticBtn></Link>
                <Link to="/contact?type=property-marketing"><MagneticBtn className="btn-outline" style={{borderColor:"rgba(0,119,255,0.3)",color:"#0077FF"}}>Get a Quote</MagneticBtn></Link>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16 }}>
                {[{v:"$249",l:"Starting from"},{v:"3–4 Day",l:"Turnaround"},{v:"26",l:"5-Star Reviews"}].map((s,i)=>(
                  <div key={i} style={{ padding:"18px 12px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(0,119,255,0.12)",borderRadius:10 }}>
                    <div style={{ fontSize:22,fontWeight:800,color:"#fff",letterSpacing:"-0.5px" }}>{s.v}</div>
                    <div style={{ fontSize:10,color:"#6066A0",fontWeight:600,textTransform:"uppercase",letterSpacing:1.3,marginTop:4 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel 2 — Construction */}
          <div style={{ width:"100vw",minHeight:"100vh",position:"relative",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0 }}>
            <div style={{ position:"absolute",inset:0,background:"linear-gradient(225deg,rgba(0,191,166,0.1) 0%,rgba(10,10,18,0.98) 60%)" }}/>
            <div style={{ position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(0,191,166,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,191,166,0.05) 1px,transparent 1px)",backgroundSize:"48px 48px",opacity:0.6 }}/>
            <div style={{ position:"relative",zIndex:2,maxWidth:680,padding:"100px 40px",textAlign:"center" }}>
              <div className="tag-pill" style={{ background:"rgba(0,191,166,0.08)",border:"1px solid rgba(0,191,166,0.25)",color:"#00BFA6",marginBottom:28,display:"inline-flex" }}>02 — Construction & Development</div>
              <h2 style={{ fontSize:58,fontWeight:900,color:"#fff",letterSpacing:"-1.8px",lineHeight:1.02,marginBottom:22 }}>
                Document every<br/><span style={{ background:"linear-gradient(90deg,#00BFA6,#0077FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>phase.</span>
              </h2>
              <p style={{ fontSize:17,color:"#8888A0",lineHeight:1.75,maxWidth:480,margin:"0 auto 40px" }}>
                DroneDeploy automated workflows, orthomosaic mapping, and audit-ready progress documentation for multi-million dollar projects.
              </p>
              <div style={{ display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",marginBottom:52 }}>
                <Link to="/construction"><MagneticBtn className="btn-primary" style={{background:"linear-gradient(135deg,#00BFA6,#0077FF)"}}>View Services →</MagneticBtn></Link>
                <Link to="/contact?type=construction"><MagneticBtn className="btn-outline" style={{borderColor:"rgba(0,191,166,0.3)",color:"#00BFA6"}}>Get a Quote</MagneticBtn></Link>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16 }}>
                {[{v:"DroneDeploy",l:"Platform"},{v:"GeoTIFF",l:"Deliverables"},{v:"BIM 360",l:"Compatible"}].map((s,i)=>(
                  <div key={i} style={{ padding:"18px 12px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(0,191,166,0.12)",borderRadius:10 }}>
                    <div style={{ fontSize:15,fontWeight:800,color:"#fff",letterSpacing:"-0.3px" }}>{s.v}</div>
                    <div style={{ fontSize:10,color:"#6066A0",fontWeight:600,textTransform:"uppercase",letterSpacing:1.3,marginTop:4 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
        {/* Panel indicator */}
        <div style={{ position:"absolute",bottom:28,left:"50%",transform:"translateX(-50%)",display:"flex",gap:8,zIndex:10,pointerEvents:"none" }}>
          <div style={{ width:24,height:3,borderRadius:2,background:"rgba(0,119,255,0.7)" }}/>
          <div style={{ width:24,height:3,borderRadius:2,background:"rgba(255,255,255,0.15)" }}/>
        </div>
      </section>

      <section style={{ padding:"80px 24px",background:"rgba(255,255,255,0.015)" }}>
        <div style={{ maxWidth:1200,margin:"0 auto" }}>
          <SectionTitle title="From Scope to Deliverables in Days"/>
          <div className="responsive-grid-3" style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:28 }}>
            {[{n:"01",t:"Define the Scope",d:"Send us the APN, project address, or site details along with your deliverable requirements."},{n:"02",t:"We Fly the Site",d:"Our FAA-certified pilots capture your property or project using industry-standard equipment and automated workflows."},{n:"03",t:"Receive Deliverables",d:"Processed, organized, and delivered within 3–4 business days. Ready for MLS, stakeholders, or project records."}].map((s,i)=>(
              <div key={i} className="card-hover" style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:36,textAlign:"center" }}>
                <div className="gradient-text" style={{ fontSize:44,fontWeight:900,marginBottom:16 }}>{s.n}</div>
                <h3 style={{ fontSize:18,fontWeight:700,color:"#fff",marginBottom:10 }}>{s.t}</h3>
                <p style={{ color:"#8888A0",lineHeight:1.7,fontSize:14 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS: Pinned horizontal strip (desktop) / stack (mobile) ===== */}
      <section ref={testimonialsRef} style={{ background:"rgba(0,0,0,0.22)",overflow:"hidden" }}>
        {/* Header — stays pinned above the scrolling track */}
        <div style={{ maxWidth:1200,margin:"0 auto",padding:"80px 24px 40px",display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:16 }}>
          <div>
            <p style={{ fontSize:11,fontWeight:700,color:"#444460",letterSpacing:2,textTransform:"uppercase",marginBottom:10 }}>Client Reviews</p>
            <h2 className="section-title" style={{ fontSize:36,fontWeight:800,color:"#fff",letterSpacing:"-0.8px",margin:0 }}>What Clients Say</h2>
          </div>
          <a href="https://www.droners.io" target="_blank" rel="noopener noreferrer"
            style={{ display:"flex",alignItems:"center",gap:8,textDecoration:"none",padding:"10px 20px",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,background:"rgba(255,255,255,0.02)" }}>
            <span style={{ color:"#FFD700",letterSpacing:2,fontSize:13 }}>★★★★★</span>
            <span style={{ fontSize:13,color:"#8888A0" }}>5.0 · 26 reviews · Droners.io</span>
          </a>
        </div>
        {/* Horizontal card track */}
        <div ref={testimonialsTrackRef} className="testimonials-track" style={{ display:"flex",gap:20,paddingLeft:48,paddingRight:96,paddingBottom:80,width:"max-content" }}>
          {[
            { quote:"Seraphic Sight LLC did an awesome job on my plot of land. Very professional, on time, high-quality pics and videos, and great editing.", name:"Joyita R.", context:"Land Survey" },
            { quote:"Pilot was very professional and quick to get out to the site to meet our deadline. Provided multiple drafts and the video had great graphics, variety of angles, and was a desirable product.", name:"Lucia L.", context:"Video Production" },
            { quote:"I really needed a good outline of this large vacant desert property and he nailed it. The shot was great and the outline was super easy to see and visualize!", name:"Courtney B.", context:"Vacant Land Mapping" },
            { quote:"Joseph dealt very well with a lot of sensitive requests on behalf of our Customers, and got us some really interesting footage. We'll keep him on file for any other jobs in the area.", name:"Spencer H.", context:"Zeitview" },
            { quote:"Excellent drone pilot. Very experienced with complex jobs and delivers results. Will work with him again in any future project.", name:"W.V.", context:"Construction" },
            { quote:"Fantastic photos and videos that captured the property, quick turnaround, and openness to make any necessary edits. Highly recommend.", name:"Dustin W.", context:"Property Marketing" },
          ].map((t,i)=>(
            <div key={i} className="card-hover testimonial-card" style={{ width:360,flexShrink:0,background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:"36px 32px",display:"flex",flexDirection:"column" }}>
              <div style={{ fontSize:56,lineHeight:0.75,color:"rgba(0,119,255,0.22)",fontFamily:"Georgia,serif",fontWeight:700,marginBottom:18 }}>"</div>
              <p style={{ fontSize:15,color:"#C8C8D8",lineHeight:1.82,flex:1,marginBottom:24 }}>{t.quote}</p>
              <div style={{ display:"flex",alignItems:"center",gap:12,paddingTop:20,borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,rgba(0,119,255,0.25),rgba(0,191,166,0.15))",border:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",flexShrink:0 }}>
                  {t.name.split(" ").map(n=>n[0]).join("")}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13,fontWeight:700,color:"#fff" }}>{t.name}</div>
                  <div style={{ fontSize:11,color:"#555570",marginTop:2 }}>{t.context}</div>
                </div>
                <span style={{ color:"#FFD700",fontSize:11,letterSpacing:1.5 }}>★★★★★</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding:"80px 24px",background:"rgba(255,255,255,0.012)" }}>
        <div style={{ maxWidth:960,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:60,alignItems:"center" }}>
          <div>
            <div className="tag-pill" style={{ background:"rgba(0,119,255,0.1)",border:"1px solid rgba(0,119,255,0.2)",color:"#0077FF",marginBottom:20,display:"inline-flex" }}>About</div>
            <h2 style={{ fontSize:32,fontWeight:800,color:"#fff",letterSpacing:"-0.8px",marginBottom:6,lineHeight:1.15 }}>Joseph Perez</h2>
            <p style={{ fontSize:13,color:"#555570",marginBottom:20,fontWeight:500 }}>FAA Part 107 Certified · Seraphic Sight LLC</p>
            <p style={{ fontSize:15,color:"#8888A0",lineHeight:1.8,marginBottom:32 }}>FAA Part 107 certified drone pilot with over 5 years of experience serving Southern California's real estate and construction industries. Based in the Inland Empire — delivering MLS-ready aerial photography, cinematic marketing videos, 360° virtual tours, and DroneDeploy automated site documentation across 7 coverage regions, from San Diego to Bakersfield.</p>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
              {[
                {v:"300+", l:"Projects Completed", end:300, suffix:"+", decimals:0},
                {v:"5.0 ★", l:"Droners.io Rating", end:5.0, suffix:" ★", decimals:1},
                {v:"5 Yrs", l:"Industry Experience", end:5, suffix:" Yrs", decimals:0},
                {v:"7",    l:"Coverage Regions",    end:7,  suffix:"",    decimals:0},
              ].map((s,i)=>(
                <div key={i} style={{ padding:"16px 20px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12 }}>
                  <div className="count-up" data-end={s.end} data-suffix={s.suffix} data-decimals={s.decimals}
                    style={{ fontSize:22,fontWeight:800,color:"#fff",letterSpacing:"-0.5px" }}>{s.v}</div>
                  <div style={{ fontSize:11,color:"#6066A0",fontWeight:500,textTransform:"uppercase",letterSpacing:1.2,marginTop:4 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"center" }}>
            <div style={{ width:260,height:300,borderRadius:20,background:"linear-gradient(135deg,rgba(0,119,255,0.08),rgba(0,191,166,0.04))",border:"1px solid rgba(0,119,255,0.12)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16 }}>
              <div style={{ width:76,height:76,borderRadius:"50%",background:"linear-gradient(135deg,#0077FF,#00BFA6)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <svg width="36" height="36" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="3" fill="white"/><circle cx="11" cy="11" r="1.2" fill="#0077FF"/><line x1="5" y1="5" x2="8.5" y2="8.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><line x1="17" y1="5" x2="13.5" y2="8.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><line x1="5" y1="17" x2="8.5" y2="13.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><line x1="17" y1="17" x2="13.5" y2="13.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><circle cx="4" cy="4" r="2" fill="rgba(255,255,255,0.4)" stroke="white" strokeWidth="0.8"/><circle cx="18" cy="4" r="2" fill="rgba(255,255,255,0.4)" stroke="white" strokeWidth="0.8"/><circle cx="4" cy="18" r="2" fill="rgba(255,255,255,0.4)" stroke="white" strokeWidth="0.8"/><circle cx="18" cy="18" r="2" fill="rgba(255,255,255,0.4)" stroke="white" strokeWidth="0.8"/></svg>
              </div>
              <div style={{ textAlign:"center",padding:"0 20px" }}>
                <p style={{ fontSize:14,fontWeight:700,color:"#fff",margin:0 }}>Joseph Perez</p>
                <p style={{ fontSize:12,color:"#6066A0",margin:"4px 0 12px" }}>Seraphic Sight LLC</p>
                <p style={{ fontSize:11,color:"#444460",lineHeight:1.6 }}>FAA Part 107 · LAANC Authorized<br/>Fully Insured · COI Available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTABanner title="Ready to Scope Your Next Project?" sub="Tell us what you need — APN, address, deliverables. We'll send you a quote within 24 hours." btn="Get a Quote →"/>
    </div>
  );
}

// ===== PROPERTY MARKETING =====
function PropertyMarketing() {
  const pageRef = React.useRef(null);
  usePageReveal(pageRef);
  return (
    <div ref={pageRef}>
      <PageHero tag="Property Marketing" title={<>Aerial Photography, Video<br/>& 3D Tours</>} subtitle="MLS-ready aerial content delivered in 3–4 business days. LAANC-authorized for controlled airspace. Send us the APN and your deliverable list — we handle the rest." accent="#0077FF" videoUrl={PROP_HERO_VIDEO_URL}/>
      <section style={{ padding:"80px 24px",maxWidth:1200,margin:"0 auto" }}>
        <SectionTitle title="What We Deliver" sub="Every service designed to move listings faster."/>
        <div className="responsive-grid-3" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:20 }}>
          {PROP_SERVICES.map((s,i)=>(<div key={i} className="card-hover" style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:32 }}><h3 style={{ fontSize:18,fontWeight:700,color:"#fff",marginBottom:10 }}>{s.title}</h3><p style={{ fontSize:13,color:"#8888A0",lineHeight:1.7 }}>{s.desc}</p></div>))}
        </div>
      </section>
      <section style={{ padding:"80px 24px",background:"rgba(255,255,255,0.015)" }}>
        <div style={{ maxWidth:1200,margin:"0 auto" }}>
          <SectionTitle title="Pricing" sub="Transparent packages. No hidden fees."/>
          <div className="responsive-grid-3" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:24 }}>
            {PROP_PRICING.map((p,i)=>(<div key={i} className="card-hover" style={{ background:p.popular?"linear-gradient(180deg,rgba(0,119,255,0.08),rgba(0,119,255,0.02))":"rgba(255,255,255,0.03)",border:p.popular?"1px solid rgba(0,119,255,0.25)":"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:40,position:"relative",overflow:"hidden" }}>
              {p.popular&&<div style={{ position:"absolute",top:16,right:16,background:"#0077FF",color:"#fff",fontSize:10,fontWeight:700,padding:"4px 12px",borderRadius:100,letterSpacing:1,textTransform:"uppercase" }}>Most Popular</div>}
              <h3 style={{ fontSize:16,fontWeight:600,color:"#8888A0",letterSpacing:1,textTransform:"uppercase",marginBottom:12 }}>{p.name}</h3>
              <div style={{ fontSize:42,fontWeight:800,color:"#fff",letterSpacing:"-1px",marginBottom:24 }}>{p.price}</div>
              <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                {p.features.map((f,j)=>(<div key={j} style={{ display:"flex",alignItems:"flex-start",gap:10 }}><span style={{ color:"#0077FF",fontSize:14,marginTop:2,flexShrink:0 }}>✓</span><span style={{ fontSize:14,color:"#C0C0D0",lineHeight:1.5 }}>{f}</span></div>))}
              </div>
              <Link to="/contact?type=property-marketing"><button className={p.popular?"btn-primary":"btn-outline"} style={{ width:"100%",marginTop:28 }}>Get Started</button></Link>
            </div>))}
          </div>
          <div style={{ marginTop:56 }}>
            <h3 style={{ fontSize:22,fontWeight:700,color:"#fff",marginBottom:24,textAlign:"center" }}>Add-Ons</h3>
            <div style={{ maxWidth:600,margin:"0 auto",display:"grid",gap:12 }}>
              {PROP_ADDONS.map((a,i)=>(<div key={i} className="reveal-item" style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10 }}><span style={{ fontSize:14,color:"#C0C0D0" }}>{a.name}</span><span style={{ fontSize:14,fontWeight:700,color:"#fff",flexShrink:0,marginLeft:16 }}>{a.price}</span></div>))}
            </div>
            <div style={{ maxWidth:600,margin:"0 auto" }}><TravelFeeNote accent="#0077FF"/></div>
          </div>
        </div>
      </section>
      <section style={{ padding:"80px 24px",maxWidth:1000,margin:"0 auto" }}>
        <SectionTitle title="How It Works"/>
        <div style={{ display:"flex",flexDirection:"column",position:"relative" }}>
          <div style={{ position:"absolute",left:24,top:36,bottom:36,width:2,background:"linear-gradient(180deg,#0077FF,#00BFA6)",opacity:0.2 }}/>
          {PROP_PROCESS.map((s,i)=>(<div key={i} className="reveal-item" style={{ display:"flex",gap:28,padding:"28px 0",alignItems:"flex-start" }}><div style={{ width:50,height:50,borderRadius:"50%",background:"rgba(0,119,255,0.1)",border:"1px solid rgba(0,119,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:"#0077FF",flexShrink:0,position:"relative",zIndex:2 }}>{s.num}</div><div><h4 style={{ fontSize:18,fontWeight:700,color:"#fff",marginBottom:6 }}>{s.title}</h4><p style={{ fontSize:14,color:"#8888A0",lineHeight:1.7 }}>{s.desc}</p></div></div>))}
        </div>
      </section>
      <CTABanner title="Ready to Market Your Listing?" sub="Send us the APN and deliverables — we'll get you a quote within 24 hours." btn="Get a Quote →"/>
    </div>
  );
}

// ===== CONSTRUCTION =====
function Construction() {
  const pageRef = React.useRef(null);
  usePageReveal(pageRef);
  return (
    <div ref={pageRef}>
      <PageHero tag="Construction & Development" title={<>Progress Monitoring,<br/>Mapping & Visualization</>} subtitle="Automated DroneDeploy workflows, orthomosaic mapping, and audit-ready documentation for multi-million dollar projects." accent="#00BFA6" videoUrl={CON_HERO_VIDEO_URL}/>
      <section style={{ padding:"80px 24px",maxWidth:1200,margin:"0 auto" }}>
        <SectionTitle title="Capabilities" sub="Enterprise-grade aerial documentation for every project phase."/>
        <div className="responsive-grid-3" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:20 }}>
          {CON_CAPABILITIES.map((c,i)=>(<div key={i} className="card-hover" style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:32 }}><h3 style={{ fontSize:18,fontWeight:700,color:"#fff",marginBottom:10 }}>{c.title}</h3><p style={{ fontSize:13,color:"#8888A0",lineHeight:1.7 }}>{c.desc}</p></div>))}
        </div>
      </section>
      <section style={{ padding:"80px 24px",background:"rgba(255,255,255,0.015)" }}>
        <div style={{ maxWidth:1200,margin:"0 auto" }}>
          <section style={{ padding:"0 24px 60px",maxWidth:960,margin:"0 auto" }}>
        <div style={{ borderRadius:16,overflow:"hidden",border:"1px solid rgba(0,191,166,0.15)" }}>
          <img src="https://res.cloudinary.com/dpc1noikx/image/upload/v1778210648/map-snapshot_q3dk25.png" alt="DroneDeploy orthomosaic map - active construction site" style={{ width:"100%",display:"block" }}/>
          <div style={{ padding:"16px 24px",background:"rgba(0,191,166,0.04)",borderTop:"1px solid rgba(0,191,166,0.1)" }}>
            <p style={{ fontSize:12,color:"#6066A0",margin:0 }}>Orthomosaic site map � live DroneDeploy flight, construction progress monitoring, Southern California.</p>
          </div>
        </div>
      </section>

      <SectionTitle title="Our Workflow" sub="Repeatable, automated, audit-ready."/>
          <div className="responsive-grid-3" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:28 }}>
            {CON_STEPS.map((s,i)=>(<div key={i} className="card-hover" style={{ background:"rgba(0,191,166,0.03)",border:"1px solid rgba(0,191,166,0.1)",borderRadius:16,padding:40,textAlign:"center" }}><div className="gradient-text" style={{ fontSize:44,fontWeight:900,marginBottom:18 }}>{s.num}</div><h3 style={{ fontSize:18,fontWeight:700,color:"#fff",marginBottom:10 }}>{s.title}</h3><p style={{ fontSize:13,color:"#8888A0",lineHeight:1.7 }}>{s.desc}</p></div>))}
          </div>
        </div>
      </section>
      <section style={{ padding:"80px 24px",maxWidth:800,margin:"0 auto" }}>
        <SectionTitle title="Pricing Framework" sub="Construction documentation is scoped per project. Here are our starting benchmarks."/>
        <div style={{ display:"grid",gap:12 }}>
          {CON_PRICING.map((p,i)=>(<div key={i} className="reveal-item" style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 24px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,flexWrap:"wrap",gap:12 }}><span style={{ fontSize:14,color:"#C0C0D0" }}>{p.service}</span><span style={{ fontSize:15,fontWeight:700,color:"#00BFA6",flexShrink:0 }}>{p.price}</span></div>))}
        </div>
        <div style={{ marginTop:32,padding:24,background:"rgba(0,191,166,0.05)",border:"1px solid rgba(0,191,166,0.12)",borderRadius:12 }}>
          <p style={{ fontSize:13,color:"#8888A0",lineHeight:1.8 }}><strong style={{ color:"#fff" }}>Every engagement includes:</strong> DroneDeploy automated flight plans · GeoTIFF + LAS/LAZ deliverables · Procore / BIM 360 compatible outputs · Organized, timestamped progress imagery · Site superintendent coordination · COI provided upon request</p>
        </div>
        <TravelFeeNote accent="#00BFA6"/>
      </section>
      <section style={{ padding:"80px 24px",background:"rgba(255,255,255,0.015)" }}>
        <div style={{ maxWidth:900,margin:"0 auto" }}>
          <SectionTitle title="Who We Work With"/>
          <div className="responsive-grid-3" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16 }}>
            {CON_CLIENTS.map((w,i)=>(<div key={i} className="reveal-item" style={{ padding:"18px 24px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,textAlign:"center",fontSize:14,fontWeight:500,color:"#C0C0D0" }}>{w}</div>))}
          </div>
        </div>
      </section>
      <CTABanner title="Scope Your Next Project" sub="Send us your site details and deliverable requirements. We'll respond with a detailed proposal within 48 hours." btn="Request a Proposal →"/>
    </div>
  );
}

// ===== PORTFOLIO LIGHTBOX =====
function PortfolioLightbox({ p, images, videoUrl, initialTab, onClose }) {
  const [tab, setTab] = React.useState(initialTab);
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);

  const tabs = [
    images.length && "Photos",
    videoUrl && "Video",
    p.media?.tour360 && "360° Tour",
    p.media?.walkthrough && "Walkthrough",
  ].filter(Boolean);

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",zIndex:1000,display:"flex",flexDirection:"column" }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 28px",borderBottom:"1px solid rgba(255,255,255,0.07)",flexShrink:0 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <span style={{ width:8,height:8,borderRadius:"50%",background:p.color,flexShrink:0 }}/>
          <span style={{ color:"#fff",fontWeight:700,fontSize:17 }}>{p.title}</span>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" }}>
          {tabs.map(t=>(
            <button key={t} onClick={()=>{setTab(t);setIdx(0);}}
              style={{ padding:"5px 14px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",
                border:tab===t?`1px solid ${p.color}`:"1px solid rgba(255,255,255,0.12)",
                background:tab===t?`${p.color}20`:"transparent",
                color:tab===t?p.color:"#8888A0" }}>
              {t}
            </button>
          ))}
          <button onClick={onClose} style={{ color:"#8888A0",fontSize:22,background:"none",border:"none",cursor:"pointer",padding:"0 4px",lineHeight:1,marginLeft:8 }}>✕</button>
        </div>
      </div>
      <div style={{ flex:1,overflow:"hidden",display:"flex",flexDirection:"column",padding:"28px 40px",minHeight:0 }}>
        {tab==="Photos"&&images.length>0&&(
          <>
            <div style={{ flex:1,position:"relative",display:"flex",alignItems:"center",justifyContent:"center",minHeight:0 }}>
              <img src={images[idx]} alt={`Photo ${idx+1}`} style={{ maxWidth:"100%",maxHeight:"100%",borderRadius:10,objectFit:"contain" }}/>
              {images.length>1&&<>
                <button onClick={()=>setIdx(i=>(i-1+images.length)%images.length)}
                  style={{ position:"absolute",left:0,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",color:"#fff",fontSize:22,width:42,height:42,borderRadius:"50%",cursor:"pointer" }}>&#8249;</button>
                <button onClick={()=>setIdx(i=>(i+1)%images.length)}
                  style={{ position:"absolute",right:0,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",color:"#fff",fontSize:22,width:42,height:42,borderRadius:"50%",cursor:"pointer" }}>&#8250;</button>
              </>}
            </div>
            {images.length>1&&(
              <div style={{ display:"flex",gap:6,marginTop:14,overflowX:"auto",padding:"4px 0",flexShrink:0,justifyContent:"center" }}>
                {images.map((src,i)=>(
                  <div key={i} onClick={()=>setIdx(i)}
                    style={{ width:60,height:40,borderRadius:5,overflow:"hidden",cursor:"pointer",flexShrink:0,
                      border:i===idx?`2px solid ${p.color}`:"2px solid transparent",
                      opacity:i===idx?1:0.4,transition:"opacity 0.15s" }}>
                    <img src={src} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                  </div>
                ))}
              </div>
            )}
            <p style={{ textAlign:"center",marginTop:10,fontSize:12,color:"#555570",flexShrink:0 }}>{idx+1} / {images.length}</p>
          </>
        )}
        {tab==="Video"&&videoUrl&&(
          <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100%" }}>
            <video controls autoPlay style={{ maxWidth:"100%",maxHeight:"100%",borderRadius:10 }} src={videoUrl}/>
          </div>
        )}
        {tab==="360° Tour"&&p.media?.tour360&&(
          <div style={{ height:"100%",borderRadius:10,overflow:"hidden" }}>
            <iframe src={p.media.tour360} title="360 Tour" style={{ width:"100%",height:"100%",border:"none" }}
              allow="xr-spatial-tracking; gyroscope; accelerometer" allowFullScreen/>
          </div>
        )}
        {tab==="Walkthrough"&&p.media?.walkthrough&&(
          <div style={{ height:"100%",borderRadius:10,overflow:"hidden" }}>
            <iframe src={p.media.walkthrough} title="Walkthrough" style={{ width:"100%",height:"100%",border:"none" }} allowFullScreen/>
          </div>
        )}
      </div>
    </div>
  );
}



function PortfolioCard({ p }) {
  const [images, setImages] = React.useState([]);
  const [videoUrl, setVideoUrl] = React.useState(null);
  const [fetched, setFetched] = React.useState(false);
  const [lightboxTab, setLightboxTab] = React.useState(null);

  const hasCld = !!p.cloudinaryFolder;

  const fetchCloudinary = React.useCallback(async () => {
    if (!hasCld || fetched) return;
    setFetched(true);
    try {
      const [imgRes, vidRes] = await Promise.all([
        fetch(`/api/cloudinary-images?folder=${p.cloudinaryFolder}&type=image`).then(r=>r.json()),
        fetch(`/api/cloudinary-images?folder=${p.cloudinaryFolder}&type=video`).then(r=>r.json()),
      ]);
      setImages(imgRes.urls||[]);
      setVideoUrl(vidRes.urls?.[0]||null);
    } catch { /* silent */ }
  }, [hasCld, fetched, p.cloudinaryFolder]);

  React.useEffect(() => { if (hasCld) fetchCloudinary(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const tabs = [
    (hasCld || images.length) && "Photos",
    (hasCld || videoUrl) && "Video",
    p.media?.tour360 && "360° Tour",
    p.media?.walkthrough && "Walkthrough",
  ].filter(Boolean);

  const openLightbox = (tab) => { fetchCloudinary(); setLightboxTab(tab); };

  return (
    <>
      <div className="card-hover" style={{ background:`linear-gradient(135deg,${p.color}08,${p.color}03)`,border:`1px solid ${p.color}18`,borderRadius:14,overflow:"hidden",display:"flex",flexDirection:"column" }}>
        <div style={{ position:"relative",width:"100%",height:200,overflow:"hidden",background:"#0a0a12",flexShrink:0,cursor:images.length>0?"pointer":"default" }}
          onClick={()=>images.length>0&&openLightbox("Photos")}>
          {images.length>0
            ? <img src={images[0]} alt={p.title} style={{ width:"100%",height:"100%",objectFit:"cover",opacity:0.9 }}/>
            : <div style={{ width:"100%",height:"100%",background:`linear-gradient(135deg,${p.color}12,${p.color}04)` }}/>
          }
          {images.length>1&&<div style={{ position:"absolute",bottom:10,right:10,background:"rgba(0,0,0,0.6)",color:"#fff",fontSize:11,padding:"3px 10px",borderRadius:20,backdropFilter:"blur(4px)" }}>{images.length} photos</div>}
        </div>
        <div style={{ padding:28,flex:1,display:"flex",flexDirection:"column" }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:6,marginBottom:14 }}>
            <span style={{ width:8,height:8,borderRadius:"50%",background:p.color }}/>
            <span style={{ fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:1.5,color:p.color }}>{p.tag}</span>
          </div>
          <h3 style={{ fontSize:20,fontWeight:700,color:"#fff",marginBottom:8 }}>{p.title}</h3>
          <p style={{ fontSize:13,color:"#8888A0",flex:1,lineHeight:1.6 }}>{p.deliverables}</p>
          {tabs.length>0&&(
            <div style={{ display:"flex",gap:8,marginTop:20,flexWrap:"wrap" }}>
              {tabs.map(tab=>(
                <button key={tab} onClick={()=>openLightbox(tab)}
                  style={{ padding:"5px 14px",borderRadius:20,fontSize:12,fontWeight:500,cursor:"pointer",
                    border:`1px solid ${p.color}50`,background:`${p.color}10`,color:p.color }}>
                  {tab} &#8599;
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {lightboxTab&&<PortfolioLightbox p={p} images={images} videoUrl={videoUrl} initialTab={lightboxTab} onClose={()=>setLightboxTab(null)}/>}
    </>
  );
}

// ===== PORTFOLIO =====
function Portfolio() {
  return <PortfolioSection />;
}

function ServiceArea() {
  return (
    <div>
      <PageHero tag="Service Area" title={<>Southern & Central<br/>California</>} subtitle="From San Diego to Bakersfield, Palm Springs to the coast — if your project is in our range, we'll be on site."/>
      <section style={{ padding:"0 24px 60px",maxWidth:1200,margin:"0 auto" }}>
        <div style={{ maxWidth:900,margin:"0 auto 60px",borderRadius:16,border:"1px solid rgba(255,255,255,0.06)",background:"rgba(255,255,255,0.02)",padding:48 }}>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:32,textAlign:"center" }}>
            {[{n:"7",l:"Coverage Regions"},{n:"200+",l:"Cities & Communities"},{n:"400mi",l:"Coverage Radius"},{n:"Same Week",l:"Typical Availability"}].map((s,i)=>(
              <div key={i}>
                <div style={{ fontSize:32,fontWeight:800,color:"#fff",letterSpacing:"-1px" }}>{s.n}</div>
                <div style={{ fontSize:11,fontWeight:600,color:"#6666A0",textTransform:"uppercase",letterSpacing:1.5,marginTop:6 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <SectionTitle title="Coverage Regions"/>
        <div className="responsive-grid-2" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:20 }}>
          {REGIONS.map((r,i)=>(<div key={i} className="card-hover" style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:32 }}><h3 style={{ fontSize:18,fontWeight:700,color:"#fff",marginBottom:6 }}>{r.name}</h3><p style={{ fontSize:12,color:"#0077FF",fontWeight:500,marginBottom:12 }}>{r.cities}</p><p style={{ fontSize:13,color:"#8888A0",lineHeight:1.7 }}>{r.desc}</p></div>))}
        </div>
      </section>
      <section style={{ padding:"60px 24px 100px",textAlign:"center" }}>
        <p style={{ fontSize:15,color:"#8888A0",marginBottom:8 }}>Not sure if we cover your area?</p>
        <p style={{ fontSize:18,fontWeight:700,color:"#fff" }}>Reach out — if you're in range, we'll be there.</p>
      </section>
    </div>
  );
}
// ===== CONTACT =====
function Contact() {
  const location = useLocation();
  const [form, setForm] = React.useState({
    name: "", email: "", phone: "", type: "Property Marketing",
    address: "", desc: "", timeline: "", honeypot: "",
  });
  const [status, setStatus] = React.useState("idle");
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get("type");
    if (t === "property-marketing") setForm(p => ({ ...p, type: "Property Marketing" }));
    else if (t === "construction") setForm(p => ({ ...p, type: "Construction" }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    if (!form.name || !form.email) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <section style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px" }}>
        <div>
          <div style={{ fontSize: 64, marginBottom: 24 }}>✓</div>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: "#fff", marginBottom: 16 }}>Quote Request Received</h2>
          <p style={{ color: "#8888A0", fontSize: 16, lineHeight: 1.7, maxWidth: 450, margin: "0 auto" }}>
            Thank you. We'll review your project details and respond within 24 hours.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div>
      <PageHero tag="Contact" title="Get a Quote" subtitle="Tell us what you need — APN, address, deliverables. We'll respond within 24 hours." />
      <section style={{ padding: "0 24px 100px", maxWidth: 640, margin: "0 auto" }}>
        <div style={{ display: "grid", gap: 24 }}>
          <div style={{ display: "none" }}>
            <input tabIndex="-1" autoComplete="off" value={form.honeypot} onChange={e => upd("honeypot", e.target.value)} />
          </div>
          <div className="responsive-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => upd("name", e.target.value)} placeholder="Your name" /></div>
            <div><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => upd("phone", e.target.value)} placeholder="(000) 000-0000" /></div>
          </div>
          <div><label className="form-label">Email *</label><input className="form-input" value={form.email} onChange={e => upd("email", e.target.value)} placeholder="you@email.com" /></div>
          <div>
            <label className="form-label">Project Type</label>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {["Property Marketing", "Construction & Development", "Other"].map(t => (
                <button key={t} className="filter-btn" onClick={() => upd("type", t)}
                  style={{ border: form.type === t ? "1px solid #0077FF" : "1px solid rgba(255,255,255,0.1)", background: form.type === t ? "rgba(0,119,255,0.12)" : "transparent", color: form.type === t ? "#0077FF" : "#8888A0" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div><label className="form-label">Project Address or APN</label><input className="form-input" value={form.address} onChange={e => upd("address", e.target.value)} placeholder="123 Main St or APN #" /></div>
          <div><label className="form-label">Project Description</label><textarea className="form-input" style={{ minHeight: 120, resize: "vertical" }} value={form.desc} onChange={e => upd("desc", e.target.value)} placeholder="Deliverables needed, site access notes, specific requirements." /></div>
          <div><label className="form-label">Preferred Timeline</label><input className="form-input" value={form.timeline} onChange={e => upd("timeline", e.target.value)} placeholder="e.g., Within 2 weeks, ASAP, Flexible" /></div>
          {status === "error" && (
            <p style={{ color: "#FF4D4D", fontSize: 13, textAlign: "center" }}>
              Something went wrong. Email us directly at joseph@seraphicsight.com
            </p>
          )}
          <button
            className="btn-primary"
            style={{ width: "100%", padding: 16, fontSize: 15, marginTop: 8, opacity: status === "sending" ? 0.6 : 1 }}
            onClick={handleSubmit}
            disabled={status === "sending"}
          >
            {status === "sending" ? "Sending…" : "Submit Quote Request"}
          </button>
        </div>
        <div style={{ marginTop: 56, padding: 32, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 24, textAlign: "center" }}>
          {[{ label: "Email", value: "joseph@seraphicsight.com", href: "mailto:joseph@seraphicsight.com" }, { label: "Phone", value: "909.315.9891", href: "tel:9093159891" }, { label: "Response Time", value: "Within 24 hours", href: null }].map((c, i) => (
            <div key={i}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#8888A0", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>{c.label}</div>
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
      <PageHero tag="FAQ" title="Frequently Asked Questions" subtitle="Everything you need to know about booking, deliverables, and working with Seraphic Sight." accent="#0077FF"/>
      <section style={{ padding:"0 24px 100px",maxWidth:780,margin:"0 auto" }}>
        {items.map((item,i)=>(
          <div key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={()=>setOpen(open===i?null:i)}
              style={{ width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"22px 0",background:"none",border:"none",cursor:"pointer",gap:16,textAlign:"left" }}>
              <span style={{ fontSize:15,fontWeight:600,color:"#fff",lineHeight:1.4 }}>{item.q}</span>
              <span style={{ color:"#0077FF",fontSize:22,flexShrink:0,transform:open===i?"rotate(45deg)":"none",transition:"transform 0.2s",display:"inline-block" }}>+</span>
            </button>
            {open===i&&(
              <div style={{ paddingBottom:22 }}>
                <p style={{ fontSize:14,color:"#8888A0",lineHeight:1.8,margin:0 }}>{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </section>
      <CTABanner title="Still Have Questions?" sub="Reach out directly — we respond within 24 hours." btn="Contact Us →"/>
    </div>
  );
}

// ===== MAIN APP =====

export default function App() {
  React.useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    return () => { lenis.destroy(); };
  }, []);

  return (
    <div>
      {/* Noise grain overlay */}
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,opacity:0.032,
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat:"repeat",backgroundSize:"128px 128px"
      }}/>
      <Nav/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/property-marketing" element={<PropertyMarketing/>}/>
        <Route path="/construction" element={<Construction/>}/>
        <Route path="/portfolio" element={<Portfolio/>}/>
        <Route path="/service-area" element={<ServiceArea/>}/>
        <Route path="/contact" element={<Contact/>}/>
        <Route path="/faq" element={<FAQ/>}/>
        <Route path="/showroom" element={<SpatialShowroom/>}/>
      </Routes>
      <Footer/>
    </div>
  );
        }
