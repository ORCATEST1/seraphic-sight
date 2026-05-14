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

gsap.registerPlugin(ScrollTrigger, useGSAP);

// ===== SCSOLL SARAMBLE HOOK =====
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
  const R = { Home:"/","Property Marketing":"/property-marketing",Construction:"/construction",Portfolio:"/portfolio","Service Area":"/service-area",FAQ:"/faq",Contact:"/contact" };

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
            <Link to="/contact"><button className="btn-primary" style={{ padding:"9px 22px",fontSize:12 }}>Get a Quote</button></Link>
          </div>
          <div className="mobile-toggle" style={{ display:"none",cursor:"pointer",flexDirection:"column",gap:5 }} onClick={()=>setMenuOpen(true)}>
            <div style={{ width:24,height:2,background:"#fff" }}/><div style={{ width:24,height:2,background:"#fff" }}/><div style={{ width:18,height:2,background:"#fff" }}/>
          </div>
        </div>
      </nav>
      {menuOpen&&<div style={{ position:"fixed",inset:0,background:"rgba(10,10,18,0.98)",zIndex:999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:28 }}>
        <div style={{ position:"absolute",top:24,right:32,color:"#fff",fontSize:28,cursor:"pointer" }} onClick={()=>setMenuOpen(false)}>â</div>
        {NAV_LINKS.map(p=><Link key={p} to={R[p]} style={{ color:"#fff",textDecoration:"none",fontSize:20,fontWeight:500,letterSpacing:1 }} onClick={()=>setMenuOpen(false)}>{p}</Link>)}
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
  const R = { Home:"/","Property Marketing":"/property-marketing",Construction:"/construction",Portfolio:"/portfolio","Service Area":"/service-area",FAQ:"/faq",Contact:"/contact" };
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
              <a href="tel:9093159891" style={{ fontSize:13,color:"#8888A0",textDecoration:"none" }}>ð 909.315.9891</a>
              <a href="mailto:joseph@seraphicsight.com" style={{ fontSize:13,color:"#8888A0",textDecoration:"none" }}>âï¸ joseph@seraphicsight.com</a>
              <a href="https://www.google.com/maps/search/?api=1&query=Seraphic+Sight+LLC" target="_blank" rel="noopener noreferrer" style={{ fontSize:13,color:"#0077FF",textDecoration:"none" }}>â­ Google Business Profile</a>
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
              {["Portfolio","Service Area","FAQ","Contact"].map(p=><Link key={p} to={R[p]} style={{ color:"#8888A0",textDecoration:"none",fontSize:13 }}>{p}</Link>)}
            </div>
          </div>
        </div>
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.05)",paddingTop:24 }}>
          <p style={{ fontSize:11,color:"#3A3A55" }}>Â© 2026 Seraphic Sight LLC Â· FAA Part 107 Certified Â· Fully Insured Â· Southern & Central California</p>
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
      <div style={{ color:"rgba(255,255,255,0.15)",fontSize:13 }}>Â·</div>
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
    // ââ Reveal animations: section titles
    gsap.utils.toArray(".section-title").forEach(el => {
      gsap.from(el, { y: 32, opacity: 0, duration: 0.85, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });
    // ââ Reveal animations: cards (staggered by column)
    gsap.utils.toArray(".card-hover").forEach((el, i) => {
      gsap.from(el, { y: 44, opacity: 0, duration: 0.7, delay: (i % 3) * 0.08, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });
    // ââ Counter animations
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
    // ââ Horizontal scroll: Two Verticals + Testimonials (desktop only)
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
          end: () => +=" + (tTrack.scrollWidth - document.documentElement.clientWidth + 96),
          invalidateOnRefresh: true,
        },
      });
    });
  }, { scope: homeRef });

  return (
    <div ref={homeRef}>
      {/* ââ Cinematic 3D scroll hero ââ */}
      <CinematicHero />

      {/* ââ Brand intro â hero content below the cinematic fold ââ */}
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
            FAA Part 107 Certified Â· Fully Insured
          </div>
          <h1 className="hero-title" style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.08, letterSpacing: "-1.5px", color: "#fff", marginBottom: 24, fontVariantNumeric: "tabular-nums" }}>
            {scrambledHero}<br /><span className="gradient-text">Site Documentation</span><br />for Southern California
          </h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
            <span style={{ color: "#FFD700", fontSize: 13, letterSpacing: 1 }}>âââââ</span>
            <span style={{ fontSize: 13, color: "#8888A0" }}>5.0 Â· 26 verified reviews on</span>
            <a href="https://www.droners.io" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#6066A0", textDecoration: "none" }}>Droners.io</a>
          </div>
          <p className="hero-subtitle" style={{ fontSize: 18, lineHeight: 1.7, color: "#8888A0", maxWidth: 600, margin: "0 auto 40px" }}>
            FAA-certified drone services for property marketing, construction monitoring, and site visualization â from APN to final deliverables.
          </p>
          <div className="btn-row" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/contact?type=property-marketing"><MagneticBtn className="btn-primary">Property Marketing</MagneticBtn></Link>
            <Link to="/contact?type=construction"><MagneticBtn className="btn-outline">Construction & Development</MagneticBtn></Link>
          </div>
          <p style={{ fontSize: 12, color: "#444460", marginTop: 14 }}>
            Packages from <strong style={{ color: "#666680" }}>$249</strong> Â· Quote within 24 hrs Â· No obligation
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

          {/* Panel 1 â Property Marketing */}
          <div style={{ width:"100vw",minHeight:"100vh",position:"relative",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0 }}>
            <div style={{ position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(0,119,255,0.1) 0%,rgba(10,10,18,0.98) 60%)" }}/>
            <div style={{ position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(0,119,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,119,255,0.05) 1px,transparent 1px)",backgroundSize:"48px 48px",opacity:0.6 }}/>
            <div style={{ position:"relative",zIndex:2,maxWidth:680,padding:"100px 40px",textAlign:"center" }}>
              <div className="tag-pill" style={{ background:"rgba(0,119,255,0.1)",border:"1px solid rgba(0,119,255,0.25)",color:"#0077FF",marginBottom:28,display:"inline-flex" }}>01 â Property Marketing</div>
              <h2 style={{ fontSize:58,fontWeight:900,color:"#fff",letterSpacing:"-1.8px",lineHeight:1.02,marginBottom:22 }}>
                Sell listings<br/><span className="gradient-text">faster.</span>
              </h2>
              <p style={{ fontSize:17,color:"#8888A0",lineHeight:1.75,maxWidth:480,margin:"0 auto 40px" }}>
                MLS-ready aerial photography, drone video, 360Â° virtual tours, and complete marketing packages. Send us the APN â we handle the rest.
              </p>
              <div style={{ display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",marginBottom:52 }}>
                <Link to="/property-marketing"><MagneticBtn className="btn-primary">View Services â</MagneticBtn></Link>
                <Link to="/contact?type=property-marketing"><MagneticBtn className="btn-outline" style={{borderColor:"rgba(0,119,255,0.3)",color:"#0077FF"}}>Get a Quote</MagneticBtn></Link>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16 }}>
                {[zÝØèÈÐä±°èMÑÉÑ¥¹É½´ô±íØèÏLÐä±°èQÕÉ¹É½Õ¹ô±íØèÈØ±°èÔµMÑÈIÙ¥ÝÌõt¹µÀ ¡Ì±¤¤ôø (ñ¥Ø­äõí¥ôÍÑå±õíìÁ¥¹èÄáÁàÄÉÁà±­É½Õ¹èÉ ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀÌ¤±½ÉÈèÅÁàÍ½±¥É À°ÄÄä°ÈÔÔ°À¸ÄÈ¤±½ÉÉI¥ÕÌèÄÀõôø(ñ¥ØÍÑå±õíì½¹ÑM¥éèÈÈ±½¹Ñ]¥¡ÐèàÀÀ±½±½Èè±±ÑÑÉMÁ¥¹è´À¸ÕÁàõôùíÌ¹Ùôð½¥Øø(ñ¥ØÍÑå±õíì½¹ÑM¥éèÄÀ±½±½ÈèØÀØÙÀ±½¹Ñ]¥¡ÐèØÀÀ±ÑáÑQÉ¹Í½É´èÕÁÁÉÍ±±ÑÑÉMÁ¥¹èÄ¸Ì±µÉ¥¹Q½ÀèÐõôùíÌ¹±ôð½¥Øø(ð½¥Øø(¤¥ô(ð½¥Øø(ð½¥Øø(ð½¥Øø((ì¼¨A¹°ÈP
½¹ÍÑÉÕÑ¥½¸¨½ô(ñ¥ØÍÑå±õíìÝ¥Ñ èÄÀÁÙÜ±µ¥¹!¥¡ÐèÄÀÁÙ ±Á½Í¥Ñ¥½¸èÉ±Ñ¥Ù±¥ÍÁ±äè±à±±¥¹%ÑµÌè¹ÑÈ±©ÕÍÑ¥å
½¹Ñ¹Ðè¹ÑÈ±½ÙÉ±½Üè¡¥¸±±áM¡É¥¹¬èÀõôø(ñ¥ØÍÑå±õíìÁ½Í¥Ñ¥½¸èÍ½±ÕÑ±¥¹ÍÐèÀ±­É½Õ¹è±¥¹ÈµÉ¥¹Ð ÈÈÕ±É À°ÄäÄ°ÄØØ°À¸Ä¤À±É ÄÀ°ÄÀ°Äà°À¸äà¤ØÀ¤õô¼ø(ñ¥ØÍÑå±õíìÁ½Í¥Ñ¥½¸èÍ½±ÕÑ±¥¹ÍÐèÀ±­É½Õ¹%µè±¥¹ÈµÉ¥¹Ð¡É À°ÄäÄ°ÄØØ°À¸ÀÔ¤ÅÁà±ÑÉ¹ÍÁÉ¹ÐÅÁà¤±±¥¹ÈµÉ¥¹Ð äÁ±É À°ÄäÄ°ÄØØ°À¸ÀÔ¤ÅÁà±ÑÉ¹ÍÁÉ¹ÐÅÁà¤±­É½Õ¹M¥éèÐáÁàÐáÁà±½Á¥ÑäèÀ¸Øõô¼ø(ñ¥ØÍÑå±õíìÁ½Í¥Ñ¥½¸èÉ±Ñ¥Ù±é%¹àèÈ±µá]¥Ñ èØàÀ±Á¥¹èÄÀÁÁàÐÁÁà±ÑáÑ±¥¸è¹ÑÈõôø(ñ¥Ø±ÍÍ9µôÑµÁ¥±°ÍÑå±õíì­É½Õ¹èÉ À°ÄäÄ°ÄØØ°À¸Àà¤±½ÉÈèÅÁàÍ½±¥É À°ÄäÄ°ÄØØ°À¸ÈÔ¤±½±½ÈèÀÁ	Ø±µÉ¥¹	½ÑÑ½´èÈà±¥ÍÁ±äè¥¹±¥¹µ±àõôøÀÈP
½¹ÍÑÉÕÑ¥½¸Ù±½Áµ¹Ðð½¥Øø(ñ ÈÍÑå±õíì½¹ÑM¥éèÔà±½¹Ñ]¥¡ÐèäÀÀ±½±½Èè±±ÑÑÉMÁ¥¹è´Ä¸áÁà±±¥¹!¥¡ÐèÄ¸ÀÈ±µÉ¥¹	½ÑÑ½´èÈÈõôø(½Õµ¹ÐÙÉäñÈ¼øñÍÁ¸ÍÑå±õíì­É½Õ¹è±¥¹ÈµÉ¥¹Ð äÁ°ÀÁ	Ø°ÀÀÜÝ¤±]­¥Ñ	­É½Õ¹
±¥ÀèÑáÐ±]­¥ÑQáÑ¥±±
½±½ÈèÑÉ¹ÍÁÉ¹ÐõôùÁ¡Í¸ð½ÍÁ¸ø(ð½ Èø(ñÀÍÑå±õíì½¹ÑM¥éèÄÜ±½±½ÈèàààáÀ±±¥¹!¥¡ÐèÄ¸ÜÔ±µá]¥Ñ èÐàÀ±µÉ¥¸èÀÕÑ¼ÐÁÁàõôø(É½¹Á±½äÕÑ½µÑÝ½É­±½ÝÌ°½ÉÑ¡½µ½Í¥µÁÁ¥¹°¹Õ¥ÐµÉäÁÉ½ÉÍÌ½Õµ¹ÑÑ¥½¸½ÈµÕ±Ñ¤µµ¥±±¥½¸½±±ÈÁÉ½©ÑÌ¸(ð½Àø(ñ¥ØÍÑå±õíì¥ÍÁ±äè±à±ÀèÄÐ±©ÕÍÑ¥å
½¹Ñ¹Ðè¹ÑÈ±±á]ÉÀèÝÉÀ±µÉ¥¹	½ÑÑ½´èÔÈõôø(ñ1¥¹¬Ñ¼ô½½¹ÍÑÉÕÑ¥½¸øñ5¹Ñ¥	Ñ¸±ÍÍ9µôÑ¸µÁÉ¥µÉäÍÑå±õíí­É½Õ¹è±¥¹ÈµÉ¥¹Ð ÄÌÕ°ÀÁ	Ø°ÀÀÜÝ¤õôùY¥ÜMÉÙ¥ÌHð½5¹Ñ¥	Ñ¸øð½1¥¹¬ø(ñ1¥¹¬Ñ¼ô½½¹ÑÐýÑåÁõ½¹ÍÑÉÕÑ¥½¸øñ5¹Ñ¥	Ñ¸±ÍÍ9µôÑ¸µ½ÕÑ±¥¹ÍÑå±õíí½ÉÉ
½±½ÈèÉ À°ÄäÄ°ÄØØ°À¸Ì¤±½±½ÈèÀÁ	ØõôùÐEÕ½Ñð½5¹Ñ¥	Ñ¸øð½1¥¹¬ø(ð½¥Øø(ñ¥ØÍÑå±õíì¥ÍÁ±äèÉ¥±É¥QµÁ±Ñ
½±Õµ¹ÌèÉÁÐ Ì°ÅÈ¤±ÀèÄØõôø(ímíØèÉ½¹Á±½ä±°èA±Ñ½É´ô±íØè½Q%±°è±¥ÙÉ±Ìô±íØè	%4ÌØÀ±°è
½µÁÑ¥±õt¹µÀ ¡Ì±¤¤ôø (ñ¥Ø­äõí¥ôÍÑå±õíìÁ¥¹èÄáÁàÄÉÁà±­É½Õ¹èÉ ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀÌ¤±½ÉÈèÅÁàÍ½±¥É À°ÄäÄ°ÄØØ°À¸ÄÈ¤±½ÉÉI¥ÕÌèÄÀõôø(ñ¥ØÍÑå±õíì½¹ÑM¥éèÄÔ±½¹Ñ]¥¡ÐèàÀÀ±½±½Èè±±ÑÑÉMÁ¥¹è´À¸ÍÁàõôùíÌ¹Ùôð½¥Øø(ñ¥ØÍÑå±õíì½¹ÑM¥éèÄÀ±½±½ÈèØÀØÙÀ±½¹Ñ]¥¡ÐèØÀÀ±ÑáÑQÉ¹Í½É´èÕÁÁÉÍ±±ÑÑÉMÁ¥¹èÄ¸Ì±µÉ¥¹Q½ÀèÐõôùíÌ¹±ôð½¥Øø(ð½¥Øø(¤¥ô(ð½¥Øø(ð½¥Øø(ð½¥Øø((ð½¥Øø(ì¼¨A¹°¥¹¥Ñ½È¨½ô(ñ¥ØÍÑå±õíìÁ½Í¥Ñ¥½¸èÍ½±ÕÑ±½ÑÑ½´èÈà±±ÐèÔÀ±ÑÉ¹Í½É´èÑÉ¹Í±Ñ` ´ÔÀ¤±¥ÍÁ±äè±à±Àèà±é%¹àèÄÀ±Á½¥¹ÑÉÙ¹ÑÌè¹½¹õôø(ñ¥ØÍÑå±õíìÝ¥Ñ èÈÐ±¡¥¡ÐèÌ±½ÉÉI¥ÕÌèÈ±­É½Õ¹èÉ À°ÄÄä°ÈÔÔ°À¸Ü¤õô¼ø(ñ¥ØÍÑå±õíìÝ¥Ñ èÈÐ±¡¥¡ÐèÌ±½ÉÉI¥ÕÌèÈ±­É½Õ¹èÉ ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÄÔ¤õô¼ø(ð½¥Øø(ð½ÍÑ¥½¸ø((ñÍÑ¥½¸ÍÑå±õíìÁ¥¹èàÁÁàÈÑÁà±­É½Õ¹èÉ ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀÄÔ¤õôø(ñ¥ØÍÑå±õíìµá]¥Ñ èÄÈÀÀ±µÉ¥¸èÀÕÑ¼õôø(ñMÑ¥½¹Q¥Ñ±Ñ¥Ñ±ôÉ½´M½ÁÑ¼±¥ÙÉ±Ì¥¸åÌ¼ø(ñ¥Ø±ÍÍ9µôÉÍÁ½¹Í¥ÙµÉ¥´ÌÍÑå±õíì¥ÍÁ±äèÉ¥±É¥QµÁ±Ñ
½±Õµ¹ÌèÅÈÅÈÅÈ±ÀèÈàõôø(ímí¸èÀÄ±Ðè¥¹Ñ¡M½Á±èM¹ÕÌÑ¡A8°ÁÉ½©ÐÉÍÌ°½ÈÍ¥ÑÑ¥±Ì±½¹Ý¥Ñ å½ÕÈ±¥ÙÉ±ÉÅÕ¥Éµ¹ÑÌ¸ô±í¸èÀÈ±Ðè]±äÑ¡M¥Ñ±è=ÕÈµÉÑ¥¥Á¥±½ÑÌÁÑÕÉå½ÕÈÁÉ½ÁÉÑä½ÈÁÉ½©ÐÕÍ¥¹¥¹ÕÍÑÉäµÍÑ¹ÉÅÕ¥Áµ¹Ð¹ÕÑ½µÑÝ½É­±½ÝÌ¸ô±í¸èÀÌ±ÐèI¥Ù±¥ÙÉ±Ì±èAÉ½ÍÍ°½É¹¥é°¹±¥ÙÉÝ¥Ñ¡¥¸ÏLÐÕÍ¥¹ÍÌåÌ¸Iä½È51L°ÍÑ­¡½±ÉÌ°½ÈÁÉ½©ÐÉ½ÉÌ¸õt¹µÀ ¡Ì±¤¤ôø (ñ¥Ø­äõí¥ô±ÍÍ9µôÉµ¡½ÙÈÍÑå±õíì­É½Õ¹èÉ ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀÌ¤±½ÉÈèÅÁàÍ½±¥É ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀØ¤±½ÉÉI¥ÕÌèÄØ±Á¥¹èÌØ±ÑáÑ±¥¸è¹ÑÈõôø(ñ¥Ø±ÍÍ9µôÉ¥¹ÐµÑáÐÍÑå±õíì½¹ÑM¥éèÐÐ±½¹Ñ]¥¡ÐèäÀÀ±µÉ¥¹	½ÑÑ½´èÄØõôùíÌ¹¹ôð½¥Øø(ñ ÌÍÑå±õíì½¹ÑM¥éèÄà±½¹Ñ]¥¡ÐèÜÀÀ±½±½Èè±µÉ¥¹	½ÑÑ½´èÄÀõôùíÌ¹Ñôð½ Ìø(ñÀÍÑå±õíì½±½ÈèàààáÀ±±¥¹!¥¡ÐèÄ¸Ü±½¹ÑM¥éèÄÐõôùíÌ¹ôð½Àø(ð½¥Øø(¤¥ô(ð½¥Øø(ð½¥Øø(ð½ÍÑ¥½¸ø((ì¼¨ôôôôôQMQ%5=9%1LèA¥¹¹¡½É¥é½¹Ñ°ÍÑÉ¥À¡Í­Ñ½À¤¼ÍÑ¬¡µ½¥±¤ôôôôô¨½ô(ñÍÑ¥½¸ÉõíÑÍÑ¥µ½¹¥±ÍIôÍÑå±õíì­É½Õ¹èÉ À°À°À°À¸ÈÈ¤±½ÙÉ±½Üè¡¥¸õôø(ì¼¨!ÈPÍÑåÌÁ¥¹¹½ÙÑ¡ÍÉ½±±¥¹ÑÉ¬¨½ô(ñ¥ØÍÑå±õíìµá]¥Ñ èÄÈÀÀ±µÉ¥¸èÀÕÑ¼±Á¥¹èàÁÁàÈÑÁàÐÁÁà±¥ÍÁ±äè±à±±¥¹%ÑµÌè±àµ¹±©ÕÍÑ¥å
½¹Ñ¹ÐèÍÁµÑÝ¸±±á]ÉÀèÝÉÀ±ÀèÄØõôø(ñ¥Øø(ñÀÍÑå±õíì½¹ÑM¥éèÄÄ±½¹Ñ]¥¡ÐèÜÀÀ±½±½ÈèÐÐÐÐØÀ±±ÑÑÉMÁ¥¹èÈ±ÑáÑQÉ¹Í½É´èÕÁÁÉÍ±µÉ¥¹	½ÑÑ½´èÄÀõôù
±¥¹ÐIÙ¥ÝÌð½Àø(ñ È±ÍÍ9µôÍÑ¥½¸µÑ¥Ñ±ÍÑå±õíì½¹ÑM¥éèÌØ±½¹Ñ]¥¡ÐèàÀÀ±½±½Èè±±ÑÑÉMÁ¥¹è´À¸áÁà±µÉ¥¸èÀõôù]¡Ð
±¥¹ÑÌMäð½ Èø(ð½¥Øø(ñ¡Éô¡ÑÑÁÌè¼½ÝÝÜ¹É½¹ÉÌ¹¥¼ÑÉÐô}±¹¬É°ô¹½½Á¹È¹½ÉÉÉÈ(ÍÑå±õíì¥ÍÁ±äè±à±±¥¹%ÑµÌè¹ÑÈ±Àèà±ÑáÑ½ÉÑ¥½¸è¹½¹±Á¥¹èÄÁÁàÈÁÁà±½ÉÈèÅÁàÍ½±¥É ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸Àà¤±½ÉÉI¥ÕÌèÄÀ±­É½Õ¹èÉ ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀÈ¤õôø(ñÍÁ¸ÍÑå±õíì½±½ÈèÜÀÀ±±ÑÑÉMÁ¥¹èÈ±½¹ÑM¥éèÄÌõôûbbbbbð½ÍÁ¸ø(ñÍÁ¸ÍÑå±õíì½¹ÑM¥éèÄÌ±½±½ÈèàààáÀõôøÔ¸À
ÜÈØÉÙ¥ÝÌ
ÜÉ½¹ÉÌ¹¥¼ð½ÍÁ¸ø(ð½ø(ð½¥Øø(ì¼¨!½É¥é½¹Ñ°ÉÑÉ¬¨½ô(ñ¥ØÉõíÑÍÑ¥µ½¹¥±ÍQÉ­Iô±ÍÍ9µôÑÍÑ¥µ½¹¥±ÌµÑÉ¬ÍÑå±õíì¥ÍÁ±äè±à±ÀèÈÀ±Á¥¹1ÐèÐà±Á¥¹I¥¡ÐèäØ±Á¥¹	½ÑÑ½´èàÀ±Ý¥Ñ èµàµ½¹Ñ¹Ðõôø(íl(ìÅÕ½ÑèMÉÁ¡¥M¥¡Ð11¥¸ÝÍ½µ©½½¸µäÁ±½Ð½±¹¸YÉäÁÉ½ÍÍ¥½¹°°½¸Ñ¥µ°¡¥ µÅÕ±¥ÑäÁ¥Ì¹Ù¥½Ì°¹ÉÐ¥Ñ¥¹¸°¹µè)½å¥ÑH¸°½¹ÑáÐè1¹MÕÉÙäô°(ìÅÕ½ÑèA¥±½ÐÝÌÙÉäÁÉ½ÍÍ¥½¹°¹ÅÕ¥¬Ñ¼Ð½ÕÐÑ¼Ñ¡Í¥ÑÑ¼µÐ½ÕÈ±¥¹¸AÉ½Ù¥µÕ±Ñ¥Á±ÉÑÌ¹Ñ¡Ù¥¼¡ÉÐÉÁ¡¥Ì°ÙÉ¥Ñä½¹±Ì°¹ÝÌÍ¥É±ÁÉ½ÕÐ¸°¹µè1Õ¥0¸°½¹ÑáÐèY¥¼AÉ½ÕÑ¥½¸ô°(ìÅÕ½Ñè$É±±ä¹½½½ÕÑ±¥¹½Ñ¡¥Ì±ÉÙ¹ÐÍÉÐÁÉ½ÁÉÑä¹¡¹¥±¥Ð¸Q¡Í¡½ÐÝÌÉÐ¹Ñ¡½ÕÑ±¥¹ÝÌÍÕÁÈÍäÑ¼Í¹Ù¥ÍÕ±¥é°¹µè
½ÕÉÑ¹ä¸°½¹ÑáÐèY¹Ð1¹5ÁÁ¥¹ô°(ìÅÕ½Ñè)½ÍÁ ±ÐÙÉäÝ±°Ý¥Ñ ±½Ð½Í¹Í¥Ñ¥ÙÉÅÕÍÑÌ½¸¡±½½ÕÈ
ÕÍÑ½µÉÌ°¹½ÐÕÌÍ½µÉ±±ä¥¹ÑÉÍÑ¥¹½½Ñ¸]±°­À¡¥´½¸¥±½È¹ä½Ñ¡È©½Ì¥¸Ñ¡É¸°¹µèMÁ¹È ¸°½¹ÑáÐèi¥ÑÙ¥Üô°(ìÅÕ½Ñèá±±¹ÐÉ½¹Á¥±½Ð¸YÉäáÁÉ¥¹Ý¥Ñ ½µÁ±à©½Ì¹±¥ÙÉÌÉÍÕ±ÑÌ¸]¥±°Ý½É¬Ý¥Ñ ¡¥´¥¸¥¸¹äÕÑÕÉÁÉ½©Ð¸°¹µè\¹X¸°½¹ÑáÐè
½¹ÍÑÉÕÑ¥½¸ô°(ìÅÕ½Ñè¹ÑÍÑ¥Á¡½Ñ½Ì¹Ù¥½ÌÑ¡ÐÁÑÕÉÑ¡ÁÉ½ÁÉÑä°ÅÕ¥¬ÑÕÉ¹É½Õ¹°¹½Á¹¹ÍÌÑ¼µ­¹ä¹ÍÍÉä¥ÑÌ¸!¥¡±äÉ½µµ¹¸°¹µèÕÍÑ¥¸\¸°½¹ÑáÐèAÉ½ÁÉÑä5É­Ñ¥¹ô°(t¹µÀ ¡Ð±¤¤ôø (ñ¥Ø­äõí¥ô±ÍÍ9µôÉµ¡½ÙÈÑÍÑ¥µ½¹¥°µÉÍÑå±õíìÝ¥Ñ èÌØÀ±±áM¡É¥¹¬èÀ±­É½Õ¹èÉ ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀÈÔ¤±½ÉÈèÅÁàÍ½±¥É ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀØ¤±½ÉÉI¥ÕÌèÄØ±Á¥¹èÌÙÁàÌÉÁà±¥ÍÁ±äè±à±±á¥ÉÑ¥½¸è½±Õµ¸õôø(ñ¥ØÍÑå±õíì½¹ÑM¥éèÔØ±±¥¹!¥¡ÐèÀ¸ÜÔ±½±½ÈèÉ À°ÄÄä°ÈÔÔ°À¸ÈÈ¤±½¹Ñµ¥±äè½É¥±ÍÉ¥±½¹Ñ]¥¡ÐèÜÀÀ±µÉ¥¹	½ÑÑ½´èÄàõôøð½¥Øø(ñÀÍÑå±õíì½¹ÑM¥éèÄÔ±½±½Èèááà±±¥¹!¥¡ÐèÄ¸àÈ±±àèÄ±µÉ¥¹	½ÑÑ½´èÈÐõôùíÐ¹ÅÕ½Ñôð½Àø(ñ¥ØÍÑå±õíì¥ÍÁ±äè±à±±¥¹%ÑµÌè¹ÑÈ±ÀèÄÈ±Á¥¹Q½ÀèÈÀ±½ÉÉQ½ÀèÅÁàÍ½±¥É ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀÔ¤õôø(ñ¥ØÍÑå±õíìÝ¥Ñ èÌà±¡¥¡ÐèÌà±½ÉÉI¥ÕÌèÔÀ±­É½Õ¹è±¥¹ÈµÉ¥¹Ð ÄÌÕ±É À°ÄÄä°ÈÔÔ°À¸ÈÔ¤±É À°ÄäÄ°ÄØØ°À¸ÄÔ¤¤±½ÉÈèÅÁàÍ½±¥É ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸Àà¤±¥ÍÁ±äè±à±±¥¹%ÑµÌè¹ÑÈ±©ÕÍÑ¥å
½¹Ñ¹Ðè¹ÑÈ±½¹ÑM¥éèÄÌ±½¹Ñ]¥¡ÐèÜÀÀ±½±½Èè±±áM¡É¥¹¬èÀõôø(íÐ¹¹µ¹ÍÁ±¥Ð ¤¹µÀ¡¸ôù¹lÁt¤¹©½¥¸ ¥ô(ð½¥Øø(ñ¥ØÍÑå±õíì±àèÄõôø(ñ¥ØÍÑå±õíì½¹ÑM¥éèÄÌ±½¹Ñ]¥¡ÐèÜÀÀ±½±½ÈèõôùíÐ¹¹µôð½¥Øø(ñ¥ØÍÑå±õíì½¹ÑM¥éèÄÄ±½±½ÈèÔÔÔÔÜÀ±µÉ¥¹Q½ÀèÈõôùíÐ¹½¹ÑáÑôð½¥Øø(ð½¥Øø(ñÍÁ¸ÍÑå±õíì½±½ÈèÜÀÀ±½¹ÑM¥éèÄÄ±±ÑÑÉMÁ¥¹èÄ¸Ôõôûbbbbbð½ÍÁ¸ø(ð½¥Øø(ð½¥Øø(¤¥ô(ð½¥Øø(ð½ÍÑ¥½¸ø((ñÍÑ¥½¸ÍÑå±õíìÁ¥¹èàÁÁàÈÑÁà±­É½Õ¹èÉ ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀÄÈ¤õôø(ñ¥ØÍÑå±õíìµá]¥Ñ èäØÀ±µÉ¥¸èÀÕÑ¼±¥ÍÁ±äèÉ¥±É¥QµÁ±Ñ
½±Õµ¹ÌèÉÁÐ¡ÕÑ¼µ¥Ð±µ¥¹µà ÌÀÁÁà°ÅÈ¤¤±ÀèØÀ±±¥¹%ÑµÌè¹ÑÈõôø(ñ¥Øø(ñ¥Ø±ÍÍ9µôÑµÁ¥±°ÍÑå±õíì­É½Õ¹èÉ À°ÄÄä°ÈÔÔ°À¸Ä¤±½ÉÈèÅÁàÍ½±¥É À°ÄÄä°ÈÔÔ°À¸È¤±½±½ÈèÀÀÜÝ±µÉ¥¹	½ÑÑ½´èÈÀ±¥ÍÁ±äè¥¹±¥¹µ±àõôù½ÕÐð½¥Øø(ñ ÈÍÑå±õíì½¹ÑM¥éèÌÈ±½¹Ñ]¥¡ÐèàÀÀ±½±½Èè±±ÑÑÉMÁ¥¹è´À¸áÁà±µÉ¥¹	½ÑÑ½´èØ±±¥¹!¥¡ÐèÄ¸ÄÔõôù)½ÍÁ AÉèð½ Èø(ñÀÍÑå±õíì½¹ÑM¥éèÄÌ±½±½ÈèÔÔÔÔÜÀ±µÉ¥¹	½ÑÑ½´èÈÀ±½¹Ñ]¥¡ÐèÔÀÀõôùAÉÐÄÀÜ
ÉÑ¥¥
ÜMÉÁ¡¥M¥¡Ð11ð½Àø(ñÀÍÑå±õíì½¹ÑM¥éèÄÔ±½±½ÈèàààáÀ±±¥¹!¥¡ÐèÄ¸à±µÉ¥¹	½ÑÑ½´èÌÈõôùAÉÐÄÀÜÉÑ¥¥É½¹Á¥±½ÐÝ¥Ñ ½ÙÈÔåÉÌ½áÁÉ¥¹ÍÉÙ¥¹M½ÕÑ¡É¸
±¥½É¹¥ÌÉ°ÍÑÑ¹½¹ÍÑÉÕÑ¥½¸¥¹ÕÍÑÉ¥Ì¸	Í¥¸Ñ¡%¹±¹µÁ¥ÉP±¥ÙÉ¥¹51LµÉäÉ¥°Á¡½Ñ½ÉÁ¡ä°¥¹µÑ¥µÉ­Ñ¥¹Ù¥½Ì°ÌØÃ
ÀÙ¥ÉÑÕ°Ñ½ÕÉÌ°¹É½¹Á±½äÕÑ½µÑÍ¥Ñ½Õµ¹ÑÑ¥½¸É½ÍÌÜ½ÙÉÉ¥½¹Ì°É½´M¸¥¼Ñ¼	­ÉÍ¥±¸ð½Àø(ñ¥ØÍÑå±õíì¥ÍÁ±äèÉ¥±É¥QµÁ±Ñ
½±Õµ¹ÌèÅÈÅÈ±ÀèÄØõôø(íl(íØèÌÀÀ¬°°èAÉ½©ÑÌ
½µÁ±Ñ°¹èÌÀÀ°ÍÕ¥àè¬°¥µ±ÌèÁô°(íØèÔ¸Àb°°èÉ½¹ÉÌ¹¥¼IÑ¥¹°¹èÔ¸À°ÍÕ¥àèb°¥µ±ÌèÅô°(íØèÔeÉÌ°°è%¹ÕÍÑÉäáÁÉ¥¹°¹èÔ°ÍÕ¥àèeÉÌ°¥µ±ÌèÁô°(íØèÜ°°è
½ÙÉI¥½¹Ì°¹èÜ°ÍÕ¥àè°¥µ±ÌèÁô°(t¹µÀ ¡Ì±¤¤ôø (ñ¥Ø­äõí¥ôÍÑå±õíìÁ¥¹èÄÙÁàÈÁÁà±­É½Õ¹èÉ ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀÌ¤±½ÉÈèÅÁàÍ½±¥É ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀØ¤±½ÉÉI¥ÕÌèÄÈõôø(ñ¥Ø±ÍÍ9µô½Õ¹ÐµÕÀÑµ¹õíÌ¹¹ôÑµÍÕ¥àõíÌ¹ÍÕ¥áôÑµ¥µ±ÌõíÌ¹¥µ±Íô(ÍÑå±õíì½¹ÑM¥éèÈÈ±½¹Ñ]¥¡ÐèàÀÀ±½±½Èè±±ÑÑÉMÁ¥¹è´À¸ÕÁàõôùíÌ¹Ùôð½¥Øø(ñ¥ØÍÑå±õíì½¹ÑM¥éèÄÄ±½±½ÈèØÀØÙÀ±½¹Ñ]¥¡ÐèÔÀÀ±ÑáÑQÉ¹Í½É´èÕÁÁÉÍ±±ÑÑÉMÁ¥¹èÄ¸È±µÉ¥¹Q½ÀèÐõôùíÌ¹±ôð½¥Øø(ð½¥Øø(¤¥ô(ð½¥Øø(ð½¥Øø(ñ¥ØÍÑå±õíì¥ÍÁ±äè±à±±¥¹%ÑµÌè¹ÑÈ±©ÕÍÑ¥å
½¹Ñ¹Ðè¹ÑÈõôø(ñ¥ØÍÑå±õíìÝ¥Ñ èÈØÀ±¡¥¡ÐèÌÀÀ±½ÉÉI¥ÕÌèÈÀ±­É½Õ¹è±¥¹ÈµÉ¥¹Ð ÄÌÕ±É À°ÄÄä°ÈÔÔ°À¸Àà¤±É À°ÄäÄ°ÄØØ°À¸ÀÐ¤¤±½ÉÈèÅÁàÍ½±¥É À°ÄÄä°ÈÔÔ°À¸ÄÈ¤±¥ÍÁ±äè±à±±á¥ÉÑ¥½¸è½±Õµ¸±±¥¹%ÑµÌè¹ÑÈ±©ÕÍÑ¥å
½¹Ñ¹Ðè¹ÑÈ±ÀèÄØõôø(ñ¥ØÍÑå±õíìÝ¥Ñ èÜØ±¡¥¡ÐèÜØ±½ÉÉI¥ÕÌèÔÀ±­É½Õ¹è±¥¹ÈµÉ¥¹Ð ÄÌÕ°ÀÀÜÝ°ÀÁ	Ø¤±¥ÍÁ±äè±à±±¥¹%ÑµÌè¹ÑÈ±©ÕÍÑ¥å
½¹Ñ¹Ðè¹ÑÈõôø(ñÍÙÝ¥Ñ ôÌØ¡¥¡ÐôÌØÙ¥Ý	½àôÀÀÈÈÈÈ¥±°ô¹½¹øñ¥É±àôÄÄäôÄÄÈôÌ¥±°ôÝ¡¥Ñ¼øñ¥É±àôÄÄäôÄÄÈôÄ¸È¥±°ôÀÀÜÝ¼øñ±¥¹àÄôÔäÄôÔàÈôà¸ÔäÈôà¸ÔÍÑÉ½­ôÝ¡¥ÑÍÑÉ½­]¥Ñ ôÄ¸ÔÍÑÉ½­1¥¹ÀôÉ½Õ¹¼øñ±¥¹àÄôÄÜäÄôÔàÈôÄÌ¸ÔäÈôà¸ÔÍÑÉ½­ôÝ¡¥ÑÍÑÉ½­]¥Ñ ôÄ¸ÔÍÑÉ½­1¥¹ÀôÉ½Õ¹¼øñ±¥¹àÄôÔäÄôÄÜàÈôà¸ÔäÈôÄÌ¸ÔÍÑÉ½­ôÝ¡¥ÑÍÑÉ½­]¥Ñ ôÄ¸ÔÍÑÉ½­1¥¹ÀôÉ½Õ¹¼øñ±¥¹àÄôÄÜäÄôÄÜàÈôÄÌ¸ÔäÈôÄÌ¸ÔÍÑÉ½­ôÝ¡¥ÑÍÑÉ½­]¥Ñ ôÄ¸ÔÍÑÉ½­1¥¹ÀôÉ½Õ¹¼øñ¥É±àôÐäôÐÈôÈ¥±°ôÉ ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸Ð¤ÍÑÉ½­ôÝ¡¥ÑÍÑÉ½­]¥Ñ ôÀ¸à¼øñ¥É±àôÄàäôÐÈôÈ¥±°ôÉ ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸Ð¤ÍÑÉ½­ôÝ¡¥ÑÍÑÉ½­]¥Ñ ôÀ¸à¼øñ¥É±àôÐäôÄàÈôÈ¥±°ôÉ ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸Ð¤ÍÑÉ½­ôÝ¡¥ÑÍÑÉ½­]¥Ñ ôÀ¸à¼øñ¥É±àôÄàäôÄàÈôÈ¥±°ôÉ ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸Ð¤ÍÑÉ½­ôÝ¡¥ÑÍÑÉ½­]¥Ñ ôÀ¸à¼øð½ÍÙø(ð½¥Øø(ñ¥ØÍÑå±õíìÑáÑ±¥¸è¹ÑÈ±Á¥¹èÀÈÁÁàõôø(ñÀÍÑå±õíì½¹ÑM¥éèÄÐ±½¹Ñ]¥¡ÐèÜÀÀ±½±½Èè±µÉ¥¸èÀõôù)½ÍÁ AÉèð½Àø(ñÀÍÑå±õíì½¹ÑM¥éèÄÈ±½±½ÈèØÀØÙÀ±µÉ¥¸èÑÁàÀÄÉÁàõôùMÉÁ¡¥M¥¡Ð11ð½Àø(ñÀÍÑå±õíì½¹ÑM¥éèÄÄ±½±½ÈèÐÐÐÐØÀ±±¥¹!¥¡ÐèÄ¸ØõôùAÉÐÄÀÜ
Ü19ÕÑ¡½É¥éñÈ¼ùÕ±±ä%¹ÍÕÉ
Ü
=$Ù¥±±ð½Àø(ð½¥Øø(ð½¥Øø(ð½¥Øø(ð½¥Øø(ð½ÍÑ¥½¸ø((ñ
Q	¹¹ÈÑ¥Ñ±ôIäÑ¼M½Áe½ÕÈ9áÐAÉ½©ÐüÍÕôQ±°ÕÌÝ¡Ðå½Ô¹PA8°ÉÍÌ°±¥ÙÉ±Ì¸]±°Í¹å½ÔÅÕ½ÑÝ¥Ñ¡¥¸ÈÐ¡½ÕÉÌ¸Ñ¸ôÐEÕ½ÑH¼ø(ð½¥Øø(¤ì)ô((¼¼ôôôôôAI=AIQd5I-Q%9ôôôôô)Õ¹Ñ¥½¸AÉ½ÁÉÑå5É­Ñ¥¹ ¤ì(½¹ÍÐÁIôIÐ¹ÕÍI¡¹Õ±°¤ì(ÕÍAIÙ°¡ÁI¤ì(ÉÑÕÉ¸ (ñ¥ØÉõíÁIôø(ñA!É¼ÑôAÉ½ÁÉÑä5É­Ñ¥¹Ñ¥Ñ±õìðùÉ¥°A¡½Ñ½ÉÁ¡ä°Y¥¼ñÈ¼øÍQ½ÕÉÌð¼ùôÍÕÑ¥Ñ±ô51LµÉäÉ¥°½¹Ñ¹Ð±¥ÙÉ¥¸ÏLÐÕÍ¥¹ÍÌåÌ¸19µÕÑ¡½É¥é½È½¹ÑÉ½±±¥ÉÍÁ¸M¹ÕÌÑ¡A8¹å½ÕÈ±¥ÙÉ±±¥ÍÐPÝ¡¹±Ñ¡ÉÍÐ¸¹ÐôÀÀÜÝÙ¥½UÉ°õíAI=A}!I=}Y%=}UI1ô¼ø(ñÍÑ¥½¸ÍÑå±õíìÁ¥¹èàÁÁàÈÑÁà±µá]¥Ñ èÄÈÀÀ±µÉ¥¸èÀÕÑ¼õôø(ñMÑ¥½¹Q¥Ñ±Ñ¥Ñ±ô]¡Ð]±¥ÙÈÍÕôÙÉäÍÉÙ¥Í¥¹Ñ¼µ½Ù±¥ÍÑ¥¹ÌÍÑÈ¸¼ø(ñ¥Ø±ÍÍ9µôÉÍÁ½¹Í¥ÙµÉ¥´ÌÍÑå±õíì¥ÍÁ±äèÉ¥±É¥QµÁ±Ñ
½±Õµ¹ÌèÉÁÐ¡ÕÑ¼µ¥Ð±µ¥¹µà ÌÈÁÁà°ÅÈ¤¤±ÀèÈÀõôø(íAI=A}MIY%
L¹µÀ ¡Ì±¤¤ôø ñ¥Ø­äõí¥ô±ÍÍ9µôÉµ¡½ÙÈÍÑå±õíì­É½Õ¹èÉ ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀÌ¤±½ÉÈèÅÁàÍ½±¥É ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀØ¤±½ÉÉI¥ÕÌèÄÐ±Á¥¹èÌÈõôøñ ÌÍÑå±õíì½¹ÑM¥éèÄà±½¹Ñ]¥¡ÐèÜÀÀ±½±½Èè±µÉ¥¹	½ÑÑ½´èÄÀõôùíÌ¹Ñ¥Ñ±ôð½ ÌøñÀÍÑå±õíì½¹ÑM¥éèÄÌ±½±½ÈèàààáÀ±±¥¹!¥¡ÐèÄ¸ÜõôùíÌ¹Íôð½Àøð½¥Øø¤¥ô(ð½¥Øø(ð½ÍÑ¥½¸ø(ñÍÑ¥½¸ÍÑå±õíìÁ¥¹èàÁÁàÈÑÁà±­É½Õ¹èÉ ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀÄÔ¤õôø(ñ¥ØÍÑå±õíìµá]¥Ñ èÄÈÀÀ±µÉ¥¸èÀÕÑ¼õôø(ñMÑ¥½¹Q¥Ñ±Ñ¥Ñ±ôAÉ¥¥¹ÍÕôQÉ¹ÍÁÉ¹ÐÁ­Ì¸9¼¡¥¸Ì¸¼ø(ñ¥Ø±ÍÍ9µôÉÍÁ½¹Í¥ÙµÉ¥´ÌÍÑå±õíì¥ÍÁ±äèÉ¥±É¥QµÁ±Ñ
½±Õµ¹ÌèÉÁÐ¡ÕÑ¼µ¥Ð±µ¥¹µà ÈàÁÁà°ÅÈ¤¤±ÀèÈÐõôø(íAI=A}AI%
%9¹µÀ ¡À±¤¤ôø ñ¥Ø­äõí¥ô±ÍÍ9µôÉµ¡½ÙÈÍÑå±õíì­É½Õ¹éÀ¹Á½ÁÕ±Èü±¥¹ÈµÉ¥¹Ð ÄàÁ±É À°ÄÄä°ÈÔÔ°À¸Àà¤±É À°ÄÄä°ÈÔÔ°À¸ÀÈ¤¤èÉ ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀÌ¤±½ÉÈéÀ¹Á½ÁÕ±ÈüÅÁàÍ½±¥É À°ÄÄä°ÈÔÔ°À¸ÈÔ¤èÅÁàÍ½±¥É ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀØ¤±½ÉÉI¥ÕÌèÄØ±Á¥¹èÐÀ±Á½Í¥Ñ¥½¸èÉ±Ñ¥Ù±½ÙÉ±½Üè¡¥¸õôø(íÀ¹Á½ÁÕ±Èñ¥ØÍÑå±õíìÁ½Í¥Ñ¥½¸èÍ½±ÕÑ±Ñ½ÀèÄØ±É¥¡ÐèÄØ±­É½Õ¹èÀÀÜÝ±½±½Èè±½¹ÑM¥éèÄÀ±½¹Ñ]¥¡ÐèÜÀÀ±Á¥¹èÑÁàÄÉÁà±½ÉÉI¥ÕÌèÄÀÀ±±ÑÑÉMÁ¥¹èÄ±ÑáÑQÉ¹Í½É´èÕÁÁÉÍõôù5½ÍÐA½ÁÕ±Èð½¥Øùô(ñ ÌÍÑå±õíì½¹ÑM¥éèÄØ±½¹Ñ]¥¡ÐèØÀÀ±½±½ÈèàààáÀ±±ÑÑÉMÁ¥¹èÄ±ÑáÑQÉ¹Í½É´èÕÁÁÉÍ±µÉ¥¹	½ÑÑ½´èÄÈõôùíÀ¹¹µôð½ Ìø(ñ¥ØÍÑå±õíì½¹ÑM¥éèÐÈ±½¹Ñ]¥¡ÐèàÀÀ±½±½Èè±±ÑÑÉMÁ¥¹è´ÅÁà±µÉ¥¹	½ÑÑ½´èÈÐõôùíÀ¹ÁÉ¥ôð½¥Øø(ñ¥ØÍÑå±õíì¥ÍÁ±äè±à±±á¥ÉÑ¥½¸è½±Õµ¸±ÀèÄÐõôø(íÀ¹ÑÕÉÌ¹µÀ ¡±¨¤ôø ñ¥Ø­äõí©ôÍÑå±õíì¥ÍÁ±äè±à±±¥¹%ÑµÌè±àµÍÑÉÐ±ÀèÄÀõôøñÍÁ¸ÍÑå±õíì½±½ÈèÀÀÜÝ±½¹ÑM¥éèÄÐ±µÉ¥¹Q½ÀèÈ±±áM¡É¥¹¬èÀõôûrLð½ÍÁ¸øñÍÁ¸ÍÑå±õíì½¹ÑM¥éèÄÐ±½±½ÈèÁÁÀ±±¥¹!¥¡ÐèÄ¸Ôõôùíôð½ÍÁ¸øð½¥Øø¤¥ô(ð½¥Øø(ñ1¥¹¬Ñ¼ô½½¹ÑÐýÑåÁõÁÉ½ÁÉÑäµµÉ­Ñ¥¹øñÕÑÑ½¸±ÍÍ9µõíÀ¹Á½ÁÕ±ÈüÑ¸µÁÉ¥µÉäèÑ¸µ½ÕÑ±¥¹ôÍÑå±õíìÝ¥Ñ èÄÀÀ±µÉ¥¹Q½ÀèÈàõôùÐMÑÉÑð½ÕÑÑ½¸øð½1¥¹¬ø(ð½¥Øø¤¥ô(ð½¥Øø(ñ¥ØÍÑå±õíìµÉ¥¹Q½ÀèÔØõôø(ñ ÌÍÑå±õíì½¹ÑM¥éèÈÈ±½¹Ñ]¥¡ÐèÜÀÀ±½±½Èè±µÉ¥¹	½ÑÑ½´èÈÐ±ÑáÑ±¥¸è¹ÑÈõôùµ=¹Ìð½ Ìø(ñ¥ØÍÑå±õíìµá]¥Ñ èØÀÀ±µÉ¥¸èÀÕÑ¼±¥ÍÁ±äèÉ¥±ÀèÄÈõôø(íAI=A}=9L¹µÀ ¡±¤¤ôø ñ¥Ø­äõí¥ô±ÍÍ9µôÉÙ°µ¥Ñ´ÍÑå±õíì¥ÍÁ±äè±à±©ÕÍÑ¥å
½¹Ñ¹ÐèÍÁµÑÝ¸±±¥¹%ÑµÌè¹ÑÈ±Á¥¹èÄÑÁàÈÁÁà±­É½Õ¹èÉ ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀÌ¤±½ÉÈèÅÁàÍ½±¥É ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀØ¤±½ÉÉI¥ÕÌèÄÀõôøñÍÁ¸ÍÑå±õíì½¹ÑM¥éèÄÐ±½±½ÈèÁÁÀõôùí¹¹µôð½ÍÁ¸øñÍÁ¸ÍÑå±õíì½¹ÑM¥éèÄÐ±½¹Ñ]¥¡ÐèÜÀÀ±½±½Èè±±áM¡É¥¹¬èÀ±µÉ¥¹1ÐèÄØõôùí¹ÁÉ¥ôð½ÍÁ¸øð½¥Øø¤¥ô(ð½¥Øø(ñ¥ØÍÑå±õíìµá]¥Ñ èØÀÀ±µÉ¥¸èÀÕÑ¼õôøñQÉÙ±9½Ñ¹ÐôÀÀÜÝ¼øð½¥Øø(ð½¥Øø(ð½¥Øø(ð½ÍÑ¥½¸ø(ñÍÑ¥½¸ÍÑå±õíìÁ¥¹èàÁÁàÈÑÁà±µá]¥Ñ èÄÀÀÀ±µÉ¥¸èÀÕÑ¼õôø(ñMÑ¥½¹Q¥Ñ±Ñ¥Ñ±ô!½Ü%Ð]½É­Ì¼ø(ñ¥ØÍÑå±õíì¥ÍÁ±äè±à±±á¥ÉÑ¥½¸è½±Õµ¸±Á½Í¥Ñ¥½¸èÉ±Ñ¥Ùõôø(ñ¥ØÍÑå±õíìÁ½Í¥Ñ¥½¸èÍ½±ÕÑ±±ÐèÈÐ±Ñ½ÀèÌØ±½ÑÑ½´èÌØ±Ý¥Ñ èÈ±­É½Õ¹è±¥¹ÈµÉ¥¹Ð ÄàÁ°ÀÀÜÝ°ÀÁ	Ø¤±½Á¥ÑäèÀ¸Èõô¼ø(íAI=A}AI=
ML¹µÀ ¡Ì±¤¤ôø ñ¥Ø­äõí¥ô±ÍÍ9µôÉÙ°µ¥Ñ´ÍÑå±õíì¥ÍÁ±äè±à±ÀèÈà±Á¥¹èÈáÁàÀ±±¥¹%ÑµÌè±àµÍÑÉÐõôøñ¥ØÍÑå±õíìÝ¥Ñ èÔÀ±¡¥¡ÐèÔÀ±½ÉÉI¥ÕÌèÔÀ±­É½Õ¹èÉ À°ÄÄä°ÈÔÔ°À¸Ä¤±½ÉÈèÅÁàÍ½±¥É À°ÄÄä°ÈÔÔ°À¸È¤±¥ÍÁ±äè±à±±¥¹%ÑµÌè¹ÑÈ±©ÕÍÑ¥å
½¹Ñ¹Ðè¹ÑÈ±½¹ÑM¥éèÄØ±½¹Ñ]¥¡ÐèàÀÀ±½±½ÈèÀÀÜÝ±±áM¡É¥¹¬èÀ±Á½Í¥Ñ¥½¸èÉ±Ñ¥Ù±é%¹àèÈõôùíÌ¹¹Õµôð½¥Øøñ¥Øøñ ÐÍÑå±õíì½¹ÑM¥éèÄà±½¹Ñ]¥¡ÐèÜÀÀ±½±½Èè±µÉ¥¹	½ÑÑ½´èØõôùíÌ¹Ñ¥Ñ±ôð½ ÐøñÀÍÑå±õíì½¹ÑM¥éèÄÐ±½±½ÈèàààáÀ±±¥¹!¥¡ÐèÄ¸ÜõôùíÌ¹Íôð½Àøð½¥Øøð½¥Øø¤¥ô(ð½¥Øø(ð½ÍÑ¥½¸ø(ñ
Q	¹¹ÈÑ¥Ñ±ôIäÑ¼5É­Ðe½ÕÈ1¥ÍÑ¥¹üÍÕôM¹ÕÌÑ¡A8¹±¥ÙÉ±ÌPÝ±°Ðå½ÔÅÕ½ÑÝ¥Ñ¡¥¸ÈÐ¡½ÕÉÌ¸Ñ¸ôÐEÕ½ÑH¼ø(ð½¥Øø(¤ì)ô((¼¼ôôôôô
=9MQIU
Q%=8ôôôôô)Õ¹Ñ¥½¸
½¹ÍÑÉÕÑ¥½¸ ¤ì(½¹ÍÐÁIôIÐ¹ÕÍI¡¹Õ±°¤ì(ÕÍAIÙ°¡ÁI¤ì(ÉÑÕÉ¸ (ñ¥ØÉõíÁIôø(ñA!É¼Ñô
½¹ÍÑÉÕÑ¥½¸Ù±½Áµ¹ÐÑ¥Ñ±õìðùAÉ½ÉÍÌ5½¹¥Ñ½É¥¹°ñÈ¼ù5ÁÁ¥¹Y¥ÍÕ±¥éÑ¥½¸ð¼ùôÍÕÑ¥Ñ±ôÕÑ½µÑÉ½¹Á±½äÝ½É­±½ÝÌ°½ÉÑ¡½µ½Í¥µÁÁ¥¹°¹Õ¥ÐµÉä½Õµ¹ÑÑ¥½¸½ÈµÕ±Ñ¤µµ¥±±¥½¸½±±ÈÁÉ½©ÑÌ¸¹ÐôÀÁ	ØÙ¥½UÉ°õí
=9}!I=}Y%=}UI1ô¼ø(ñÍÑ¥½¸ÍÑå±õíìÁ¥¹èàÁÁàÈÑÁà±µá]¥Ñ èÄÈÀÀ±µÉ¥¸èÀÕÑ¼õôø(ñMÑ¥½¹Q¥Ñ±Ñ¥Ñ±ô
Á¥±¥Ñ¥ÌÍÕô¹ÑÉÁÉ¥ÍµÉÉ¥°½Õµ¹ÑÑ¥½¸½ÈÙÉäÁÉ½©ÐÁ¡Í¸¼ø(ñ¥Ø±ÍÍ9µôÉÍÁ½¹Í¥ÙµÉ¥´ÌÍÑå±õíì¥ÍÁ±äèÉ¥±É¥QµÁ±Ñ
½±Õµ¹ÌèÉÁÐ¡ÕÑ¼µ¥Ð±µ¥¹µà ÌÈÁÁà°ÅÈ¤¤±ÀèÈÀõôø(í
=9}
A	%1%Q%L¹µÀ ¡±¤¤ôø ñ¥Ø­äõí¥ô±ÍÍ9µôÉµ¡½ÙÈÍÑå±õíì­É½Õ¹èÉ ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀÌ¤±½ÉÈèÅÁàÍ½±¥É ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀØ¤±½ÉÉI¥ÕÌèÄÐ±Á¥¹èÌÈõôøñ ÌÍÑå±õíì½¹ÑM¥éèÄà±½¹Ñ]¥¡ÐèÜÀÀ±½±½Èè±µÉ¥¹	½ÑÑ½´èÄÀõôùí¹Ñ¥Ñ±ôð½ ÌøñÀÍÑå±õíì½¹ÑM¥éèÄÌ±½±½ÈèàààáÀ±±¥¹!¥¡ÐèÄ¸Üõôùí¹Íôð½Àøð½¥Øø¤¥ô(ð½¥Øø(ð½ÍÑ¥½¸ø(ñÍÑ¥½¸ÍÑå±õíìÁ¥¹èàÁÁàÈÑÁà±­É½Õ¹èÉ ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀÄÔ¤õôø(ñ¥ØÍÑå±õíìµá]¥Ñ èÄÈÀÀ±µÉ¥¸èÀÕÑ¼õôø(ñÍÑ¥½¸ÍÑå±õíìÁ¥¹èÀÈÑÁàØÁÁà±µá]¥Ñ èäØÀ±µÉ¥¸èÀÕÑ¼õôø(ñ¥ØÍÑå±õíì½ÉÉI¥ÕÌèÄØ±½ÙÉ±½Üè¡¥¸±½ÉÈèÅÁàÍ½±¥É À°ÄäÄ°ÄØØ°À¸ÄÔ¤õôø(ñ¥µÍÉô¡ÑÑÁÌè¼½ÉÌ¹±½Õ¥¹Éä¹½´½ÁÅ¹½¥­à½¥µ½ÕÁ±½½ØÄÜÜàÈÄÀØÐà½µÀµÍ¹ÁÍ¡½Ñ}ÄÍ¬ÈÔ¹Á¹±ÐôÉ½¹Á±½ä½ÉÑ¡½µ½Í¥µÀ´Ñ¥Ù½¹ÍÑÉÕÑ¥½¸Í¥ÑÍÑå±õíìÝ¥Ñ èÄÀÀ±¥ÍÁ±äè±½¬õô¼ø(ñ¥ØÍÑå±õíìÁ¥¹èÄÙÁàÈÑÁà±­É½Õ¹èÉ À°ÄäÄ°ÄØØ°À¸ÀÐ¤±½ÉÉQ½ÀèÅÁàÍ½±¥É À°ÄäÄ°ÄØØ°À¸Ä¤õôø(ñÀÍÑå±õíì½¹ÑM¥éèÄÈ±½±½ÈèØÀØÙÀ±µÉ¥¸èÀõôù=ÉÑ¡½µ½Í¥Í¥ÑµÀ¾þô±¥ÙÉ½¹Á±½ä±¥¡Ð°½¹ÍÑÉÕÑ¥½¸ÁÉ½ÉÍÌµ½¹¥Ñ½É¥¹°M½ÕÑ¡É¸
±¥½É¹¥¸ð½Àø(ð½¥Øø(ð½¥Øø(ð½ÍÑ¥½¸ø((ñMÑ¥½¹Q¥Ñ±Ñ¥Ñ±ô=ÕÈ]½É­±½ÜÍÕôIÁÑ±°ÕÑ½µÑ°Õ¥ÐµÉä¸¼ø(ñ¥Ø±ÍÍ9µôÉÍÁ½¹Í¥ÙµÉ¥´ÌÍÑå±õíì¥ÍÁ±äèÉ¥±É¥QµÁ±Ñ
½±Õµ¹ÌèÉÁÐ¡ÕÑ¼µ¥Ð±µ¥¹µà ÈàÁÁà°ÅÈ¤¤±ÀèÈàõôø(í
=9}MQAL¹µÀ ¡Ì±¤¤ôø ñ¥Ø­äõí¥ô±ÍÍ9µôÉµ¡½ÙÈÍÑå±õíì­É½Õ¹èÉ À°ÄäÄ°ÄØØ°À¸ÀÌ¤±½ÉÈèÅÁàÍ½±¥É À°ÄäÄ°ÄØØ°À¸Ä¤±½ÉÉI¥ÕÌèÄØ±Á¥¹èÐÀ±ÑáÑ±¥¸è¹ÑÈõôøñ¥Ø±ÍÍ9µôÉ¥¹ÐµÑáÐÍÑå±õíì½¹ÑM¥éèÐÐ±½¹Ñ]¥¡ÐèäÀÀ±µÉ¥¹	½ÑÑ½´èÄàõôùíÌ¹¹Õµôð½¥Øøñ ÌÍÑå±õíì½¹ÑM¥éèÄà±½¹Ñ]¥¡ÐèÜÀÀ±½±½Èè±µÉ¥¹	½ÑÑ½´èÄÀõôùíÌ¹Ñ¥Ñ±ôð½ ÌøñÀÍÑå±õíì½¹ÑM¥éèÄÌ±½±½ÈèàààáÀ±±¥¹!¥¡ÐèÄ¸ÜõôùíÌ¹Íôð½Àøð½¥Øø¤¥ô(ð½¥Øø(ð½¥Øø(ð½ÍÑ¥½¸ø(ñÍÑ¥½¸ÍÑå±õíìÁ¥¹èàÁÁàÈÑÁà±µá]¥Ñ èàÀÀ±µÉ¥¸èÀÕÑ¼õôø(ñMÑ¥½¹Q¥Ñ±Ñ¥Ñ±ôAÉ¥¥¹ÉµÝ½É¬ÍÕô
½¹ÍÑÉÕÑ¥½¸½Õµ¹ÑÑ¥½¸¥ÌÍ½ÁÁÈÁÉ½©Ð¸!ÉÉ½ÕÈÍÑÉÑ¥¹¹¡µÉ­Ì¸¼ø(ñ¥ØÍÑå±õíì¥ÍÁ±äèÉ¥±ÀèÄÈõôø(í
=9}AI%
%9¹µÀ ¡À±¤¤ôø ñ¥Ø­äõí¥ô±ÍÍ9µôÉÙ°µ¥Ñ´ÍÑå±õíì¥ÍÁ±äè±à±©ÕÍÑ¥å
½¹Ñ¹ÐèÍÁµÑÝ¸±±¥¹%ÑµÌè¹ÑÈ±Á¥¹èÄáÁàÈÑÁà±­É½Õ¹èÉ ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀÌ¤±½ÉÈèÅÁàÍ½±¥É ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀØ¤±½ÉÉI¥ÕÌèÄÀ±±á]ÉÀèÝÉÀ±ÀèÄÈõôøñÍÁ¸ÍÑå±õíì½¹ÑM¥éèÄÐ±½±½ÈèÁÁÀõôùíÀ¹ÍÉÙ¥ôð½ÍÁ¸øñÍÁ¸ÍÑå±õíì½¹ÑM¥éèÄÔ±½¹Ñ]¥¡ÐèÜÀÀ±½±½ÈèÀÁ	Ø±±áM¡É¥¹¬èÀõôùíÀ¹ÁÉ¥ôð½ÍÁ¸øð½¥Øø¤¥ô(ð½¥Øø(ñ¥ØÍÑå±õíìµÉ¥¹Q½ÀèÌÈ±Á¥¹èÈÐ±­É½Õ¹èÉ À°ÄäÄ°ÄØØ°À¸ÀÔ¤±½ÉÈèÅÁàÍ½±¥É À°ÄäÄ°ÄØØ°À¸ÄÈ¤±½ÉÉI¥ÕÌèÄÈõôø(ñÀÍÑå±õíì½¹ÑM¥éèÄÌ±½±½ÈèàààáÀ±±¥¹!¥¡ÐèÄ¸àõôøñÍÑÉ½¹ÍÑå±õíì½±½ÈèõôùÙÉä¹µ¹Ð¥¹±ÕÌèð½ÍÑÉ½¹øÉ½¹Á±½äÕÑ½µÑ±¥¡ÐÁ±¹Ì
Ü½Q%¬1L½1h±¥ÙÉ±Ì
ÜAÉ½½É¼	%4ÌØÀ½µÁÑ¥±½ÕÑÁÕÑÌ
Ü=É¹¥é°Ñ¥µÍÑµÁÁÉ½ÉÍÌ¥µÉä
ÜM¥ÑÍÕÁÉ¥¹Ñ¹¹Ð½½É¥¹Ñ¥½¸
Ü
=$ÁÉ½Ù¥ÕÁ½¸ÉÅÕÍÐð½Àø(ð½¥Øø(ñQÉÙ±9½Ñ¹ÐôÀÁ	Ø¼ø(ð½ÍÑ¥½¸ø(ñÍÑ¥½¸ÍÑå±õíìÁ¥¹èàÁÁàÈÑÁà±­É½Õ¹èÉ ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀÄÔ¤õôø(ñ¥ØÍÑå±õíìµá]¥Ñ èäÀÀ±µÉ¥¸èÀÕÑ¼õôø(ñMÑ¥½¹Q¥Ñ±Ñ¥Ñ±ô]¡¼]]½É¬]¥Ñ ¼ø(ñ¥Ø±ÍÍ9µôÉÍÁ½¹Í¥ÙµÉ¥´ÌÍÑå±õíì¥ÍÁ±äèÉ¥±É¥QµÁ±Ñ
½±Õµ¹ÌèÉÁÐ¡ÕÑ¼µ¥Ð±µ¥¹µà ÈÀÁÁà°ÅÈ¤¤±ÀèÄØõôø(í
=9}
1%9QL¹µÀ ¡Ü±¤¤ôø ñ¥Ø­äõí¥ô±ÍÍ9µôÉÙ°µ¥Ñ´ÍÑå±õíìÁ¥¹èÄáÁàÈÑÁà±­É½Õ¹èÉ ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀÌ¤±½ÉÈèÅÁàÍ½±¥É ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀØ¤±½ÉÉI¥ÕÌèÄÀ±ÑáÑ±¥¸è¹ÑÈ±½¹ÑM¥éèÄÐ±½¹Ñ]¥¡ÐèÔÀÀ±½±½ÈèÁÁÀõôùíÝôð½¥Øø¤¥ô(ð½¥Øø(ð½¥Øø(ð½ÍÑ¥½¸ø(ñ
Q	¹¹ÈÑ¥Ñ±ôM½Áe½ÕÈ9áÐAÉ½©ÐÍÕôM¹ÕÌå½ÕÈÍ¥ÑÑ¥±Ì¹±¥ÙÉ±ÉÅÕ¥Éµ¹ÑÌ¸]±°ÉÍÁ½¹Ý¥Ñ Ñ¥±ÁÉ½Á½Í°Ý¥Ñ¡¥¸Ðà¡½ÕÉÌ¸Ñ¸ôIÅÕÍÐAÉ½Á½Í°H¼ø(ð½¥Øø(¤ì)ô((¼¼ôôôôôA=IQ=1%<1%!Q	=`ôôôôô)Õ¹Ñ¥½¸A½ÉÑ½±¥½1¥¡Ñ½à¡ìÀ°¥µÌ°Ù¥½UÉ°°¥¹¥Ñ¥±Q°½¹
±½Íô¤ì(½¹ÍÐmÑ°ÍÑQtôIÐ¹ÕÍMÑÑ¡¥¹¥Ñ¥±Q¤ì(½¹ÍÐm¥à°ÍÑ%átôIÐ¹ÕÍMÑÑ À¤ì((IÐ¹ÕÍÐ  ¤ôøì(½¹ÍÐ ô¡¤ôøì¥¡¹­äôôôÍÁ¤½¹
±½Í ¤ìôì(Ý¥¹½Ü¹Ù¹Ñ1¥ÍÑ¹È ­å½Ý¸° ¤ì(½Õµ¹Ð¹½ä¹ÍÑå±¹½ÙÉ±½Üô¡¥¸ì(ÉÑÕÉ¸ ¤ôøìÝ¥¹½Ü¹Éµ½ÙÙ¹Ñ1¥ÍÑ¹È ­å½Ý¸° ¤ì½Õµ¹Ð¹½ä¹ÍÑå±¹½ÙÉ±½Üôìôì(ô°m½¹
±½Ít¤ì((½¹ÍÐÑÌôl(¥µÌ¹±¹Ñ A¡½Ñ½Ì°(Ù¥½UÉ°Y¥¼°(À¹µ¥ü¹Ñ½ÕÈÌØÀÌØÃ
ÀQ½ÕÈ°(À¹µ¥ü¹Ý±­Ñ¡É½Õ ]±­Ñ¡É½Õ °(t¹¥±ÑÈ¡	½½±¸¤ì((ÉÑÕÉ¸ (ñ¥ØÍÑå±õíìÁ½Í¥Ñ¥½¸è¥á±¥¹ÍÐèÀ±­É½Õ¹èÉ À°À°À°À¸äÜ¤±é%¹àèÄÀÀÀ±¥ÍÁ±äè±à±±á¥ÉÑ¥½¸è½±Õµ¸õôø(ñ¥ØÍÑå±õíì¥ÍÁ±äè±à±±¥¹%ÑµÌè¹ÑÈ±©ÕÍÑ¥å
½¹Ñ¹ÐèÍÁµÑÝ¸±Á¥¹èÄáÁàÈáÁà±½ÉÉ	½ÑÑ½´èÅÁàÍ½±¥É ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀÜ¤±±áM¡É¥¹¬èÀõôø(ñ¥ØÍÑå±õíì¥ÍÁ±äè±à±±¥¹%ÑµÌè¹ÑÈ±ÀèÄÀõôø(ñÍÁ¸ÍÑå±õíìÝ¥Ñ èà±¡¥¡Ðèà±½ÉÉI¥ÕÌèÔÀ±­É½Õ¹éÀ¹½±½È±±áM¡É¥¹¬èÀõô¼ø(ñÍÁ¸ÍÑå±õíì½±½Èè±½¹Ñ]¥¡ÐèÜÀÀ±½¹ÑM¥éèÄÜõôùíÀ¹Ñ¥Ñ±ôð½ÍÁ¸ø(ð½¥Øø(ñ¥ØÍÑå±õíì¥ÍÁ±äè±à±±¥¹%ÑµÌè¹ÑÈ±Àèà±±á]ÉÀèÝÉÀõôø(íÑÌ¹µÀ¡Ðôø (ñÕÑÑ½¸­äõíÑô½¹
±¥¬õì ¤ôùíÍÑQ¡Ð¤íÍÑ%à À¤íõô(ÍÑå±õíìÁ¥¹èÕÁàÄÑÁà±½ÉÉI¥ÕÌèÈÀ±½¹ÑM¥éèÄÈ±½¹Ñ]¥¡ÐèØÀÀ±ÕÉÍ½ÈèÁ½¥¹ÑÈ°(½ÉÈéÑôôõÐýÅÁàÍ½±¥íÀ¹½±½ÉõèÅÁàÍ½±¥É ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÄÈ¤°(­É½Õ¹éÑôôõÐýíÀ¹½±½ÉôÈÁèÑÉ¹ÍÁÉ¹Ð°(½±½ÈéÑôôõÐýÀ¹½±½ÈèàààáÀõôø(íÑô(ð½ÕÑÑ½¸ø(¤¥ô(ñÕÑÑ½¸½¹
±¥¬õí½¹
±½ÍôÍÑå±õíì½±½ÈèàààáÀ±½¹ÑM¥éèÈÈ±­É½Õ¹è¹½¹±½ÉÈè¹½¹±ÕÉÍ½ÈèÁ½¥¹ÑÈ±Á¥¹èÀÑÁà±±¥¹!¥¡ÐèÄ±µÉ¥¹1ÐèàõôûrTð½ÕÑÑ½¸ø(ð½¥Øø(ð½¥Øø(ñ¥ØÍÑå±õíì±àèÄ±½ÙÉ±½Üè¡¥¸±¥ÍÁ±äè±à±±á¥ÉÑ¥½¸è½±Õµ¸±Á¥¹èÈáÁàÐÁÁà±µ¥¹!¥¡ÐèÀõôø(íÑôôôA¡½Ñ½Ì¥µÌ¹±¹Ñ øÀ (ðø(ñ¥ØÍÑå±õíì±àèÄ±Á½Í¥Ñ¥½¸èÉ±Ñ¥Ù±¥ÍÁ±äè±à±±¥¹%ÑµÌè¹ÑÈ±©ÕÍÑ¥å
½¹Ñ¹Ðè¹ÑÈ±µ¥¹!¥¡ÐèÀõôø(ñ¥µÍÉõí¥µÍm¥áuô±ÐõíA¡½Ñ¼í¥à¬ÅõôÍÑå±õíìµá]¥Ñ èÄÀÀ±µá!¥¡ÐèÄÀÀ±½ÉÉI¥ÕÌèÄÀ±½©Ñ¥Ðè½¹Ñ¥¸õô¼ø(í¥µÌ¹±¹Ñ øÄðø(ñÕÑÑ½¸½¹
±¥¬õì ¤ôùÍÑ%à¡¤ôø¡¤´Ä­¥µÌ¹±¹Ñ ¤¥µÌ¹±¹Ñ ¥ô(ÍÑå±õíìÁ½Í¥Ñ¥½¸èÍ½±ÕÑ±±ÐèÀ±Ñ½ÀèÔÀ±ÑÉ¹Í½É´èÑÉ¹Í±Ñd ´ÔÀ¤±­É½Õ¹èÉ ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀÜ¤±½ÉÈèÅÁàÍ½±¥É ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸Ä¤±½±½Èè±½¹ÑM¥éèÈÈ±Ý¥Ñ èÐÈ±¡¥¡ÐèÐÈ±½ÉÉI¥ÕÌèÔÀ±ÕÉÍ½ÈèÁ½¥¹ÑÈõôøàÈÐäìð½ÕÑÑ½¸ø(ñÕÑÑ½¸½¹
±¥¬õì ¤ôùÍÑ%à¡¤ôø¡¤¬Ä¤¥µÌ¹±¹Ñ ¥ô(ÍÑå±õíìÁ½Í¥Ñ¥½¸èÍ½±ÕÑ±É¥¡ÐèÀ±Ñ½ÀèÔÀ±ÑÉ¹Í½É´èÑÉ¹Í±Ñd ´ÔÀ¤±­É½Õ¹èÉ ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀÜ¤±½ÉÈèÅÁàÍ½±¥É ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸Ä¤±½±½Èè±½¹ÑM¥éèÈÈ±Ý¥Ñ èÐÈ±¡¥¡ÐèÐÈ±½ÉÉI¥ÕÌèÔÀ±ÕÉÍ½ÈèÁ½¥¹ÑÈõôøàÈÔÀìð½ÕÑÑ½¸ø(ð¼ùô(ð½¥Øø(í¥µÌ¹±¹Ñ øÄ (ñ¥ØÍÑå±õíì¥ÍÁ±äè±à±ÀèØ±µÉ¥¹Q½ÀèÄÐ±½ÙÉ±½Ý`èÕÑ¼±Á¥¹èÑÁàÀ±±áM¡É¥¹¬èÀ±©ÕÍÑ¥å
½¹Ñ¹Ðè¹ÑÈõôø(í¥µÌ¹µÀ ¡ÍÉ±¤¤ôø (ñ¥Ø­äõí¥ô½¹
±¥¬õì ¤ôùÍÑ%à¡¤¥ô(ÍÑå±õíìÝ¥Ñ èØÀ±¡¥¡ÐèÐÀ±½ÉÉI¥ÕÌèÔ±½ÙÉ±½Üè¡¥¸±ÕÉÍ½ÈèÁ½¥¹ÑÈ±±áM¡É¥¹¬èÀ°(½ÉÈé¤ôôõ¥àýÉÁàÍ½±¥íÀ¹½±½ÉõèÉÁàÍ½±¥ÑÉ¹ÍÁÉ¹Ð°(½Á¥Ñäé¤ôôõ¥àüÄèÀ¸Ð±ÑÉ¹Í¥Ñ¥½¸è½Á¥ÑäÀ¸ÄÕÌõôø(ñ¥µÍÉõíÍÉô±ÐôÍÑå±õíìÝ¥Ñ èÄÀÀ±¡¥¡ÐèÄÀÀ±½©Ñ¥Ðè½ÙÈõô¼ø(ð½¥Øø(¤¥ô(ð½¥Øø(¥ô(ñÀÍÑå±õíìÑáÑ±¥¸è¹ÑÈ±µÉ¥¹Q½ÀèÄÀ±½¹ÑM¥éèÄÈ±½±½ÈèÔÔÔÔÜÀ±±áM¡É¥¹¬èÀõôùí¥à¬Åô¼í¥µÌ¹±¹Ñ¡ôð½Àø(ð¼ø(¥ô(íÑôôôY¥¼Ù¥½UÉ° (ñ¥ØÍÑå±õíì¥ÍÁ±äè±à±±¥¹%ÑµÌè¹ÑÈ±©ÕÍÑ¥å
½¹Ñ¹Ðè¹ÑÈ±¡¥¡ÐèÄÀÀõôø(ñÙ¥¼½¹ÑÉ½±ÌÕÑ½A±äÍÑå±õíìµá]¥Ñ èÄÀÀ±µá!¥¡ÐèÄÀÀ±½ÉÉI¥ÕÌèÄÀõôÍÉõíÙ¥½UÉ±ô¼ø(ð½¥Øø(¥ô(íÑôôôÌØÃ
ÀQ½ÕÈÀ¹µ¥ü¹Ñ½ÕÈÌØÀ (ñ¥ØÍÑå±õíì¡¥¡ÐèÄÀÀ±½ÉÉI¥ÕÌèÄÀ±½ÙÉ±½Üè¡¥¸õôø(ñ¥ÉµÍÉõíÀ¹µ¥¹Ñ½ÕÈÌØÁôÑ¥Ñ±ôÌØÀQ½ÕÈÍÑå±õíìÝ¥Ñ èÄÀÀ±¡¥¡ÐèÄÀÀ±½ÉÈè¹½¹õô(±±½ÜôáÈµÍÁÑ¥°µÑÉ­¥¹ìåÉ½Í½Áì±É½µÑÈ±±½ÝÕ±±MÉ¸¼ø(ð½¥Øø(¥ô(íÑôôô]±­Ñ¡É½Õ À¹µ¥ü¹Ý±­Ñ¡É½Õ  (ñ¥ØÍÑå±õíì¡¥¡ÐèÄÀÀ±½ÉÉI¥ÕÌèÄÀ±½ÙÉ±½Üè¡¥¸õôø(ñ¥ÉµÍÉõíÀ¹µ¥¹Ý±­Ñ¡É½Õ¡ôÑ¥Ñ±ô]±­Ñ¡É½Õ ÍÑå±õíìÝ¥Ñ èÄÀÀ±¡¥¡ÐèÄÀÀ±½ÉÈè¹½¹õô±±½ÝÕ±±MÉ¸¼ø(ð½¥Øø(¥ô(ð½¥Øø(ð½¥Øø(¤ì)ô((()Õ¹Ñ¥½¸A½ÉÑ½±¥½
É¡ìÀô¤ì(½¹ÍÐm¥µÌ°ÍÑ%µÍtôIÐ¹ÕÍMÑÑ¡mt¤ì(½¹ÍÐmÙ¥½UÉ°°ÍÑY¥½UÉ±tôIÐ¹ÕÍMÑÑ¡¹Õ±°¤ì(½¹ÍÐmÑ¡°ÍÑÑ¡tôIÐ¹ÕÍMÑÑ¡±Í¤ì(½¹ÍÐm±¥¡Ñ½áQ°ÍÑ1¥¡Ñ½áQtôIÐ¹ÕÍMÑÑ¡¹Õ±°¤ì((½¹ÍÐ¡Í
±ôÀ¹±½Õ¥¹Éå½±Èì((½¹ÍÐÑ¡
±½Õ¥¹ÉäôIÐ¹ÕÍ
±±¬¡Íå¹ ¤ôøì(¥ ¡Í
±ñðÑ¡¤ÉÑÕÉ¸ì(ÍÑÑ¡¡ÑÉÕ¤ì(ÑÉäì(½¹ÍÐm¥µIÌ°Ù¥IÍtôÝ¥ÐAÉ½µ¥Í¹±°¡l(Ñ ¡½Á¤½±½Õ¥¹Éäµ¥µÌý½±ÈôíÀ¹±½Õ¥¹Éå½±ÉôÑåÁõ¥µ¤¹Ñ¡¸¡ÈôùÈ¹©Í½¸ ¤¤°(Ñ ¡½Á¤½±½Õ¥¹Éäµ¥µÌý½±ÈôíÀ¹±½Õ¥¹Éå½±ÉôÑåÁõÙ¥½¤¹Ñ¡¸¡ÈôùÈ¹©Í½¸ ¤¤°(t¤ì(ÍÑ%µÌ¡¥µIÌ¹ÕÉ±Íññmt¤ì(ÍÑY¥½UÉ°¡Ù¥IÌ¹ÕÉ±Ìü¹lÁuññ¹Õ±°¤ì(ôÑ ì¼¨Í¥±¹Ð¨¼ô(ô°m¡Í
±°Ñ¡°À¹±½Õ¥¹Éå½±Ét¤ì((IÐ¹ÕÍÐ  ¤ôøì¥¡¡Í
±¤Ñ¡
±½Õ¥¹Éä ¤ìô°mt¤ì¼¼Í±¥¹Ðµ¥Í±µ±¥¹ÉÐµ¡½½­Ì½á¡ÕÍÑ¥ÙµÁÌ((½¹ÍÐÑÌôl(¡¡Í
±ñð¥µÌ¹±¹Ñ ¤A¡½Ñ½Ì°(¡¡Í
±ñðÙ¥½UÉ°¤Y¥¼°(À¹µ¥ü¹Ñ½ÕÈÌØÀÌØÃ
ÀQ½ÕÈ°(À¹µ¥ü¹Ý±­Ñ¡É½Õ ]±­Ñ¡É½Õ °(t¹¥±ÑÈ¡	½½±¸¤ì((½¹ÍÐ½Á¹1¥¡Ñ½àô¡Ñ¤ôøìÑ¡
±½Õ¥¹Éä ¤ìÍÑ1¥¡Ñ½áQ¡Ñ¤ìôì((ÉÑÕÉ¸ (ðø(ñ¥Ø±ÍÍ9µôÉµ¡½ÙÈÍÑå±õíì­É½Õ¹é±¥¹ÈµÉ¥¹Ð ÄÌÕ°íÀ¹½±½ÉôÀà°íÀ¹½±½ÉôÀÍ±½ÉÈéÅÁàÍ½±¥íÀ¹½±½ÉôÄá±½ÉÉI¥ÕÌèÄÐ±½ÙÉ±½Üè¡¥¸±¥ÍÁ±äè±à±±á¥ÉÑ¥½¸è½±Õµ¸õôø(ñ¥ØÍÑå±õíìÁ½Í¥Ñ¥½¸èÉ±Ñ¥Ù±Ý¥Ñ èÄÀÀ±¡¥¡ÐèÈÀÀ±½ÙÉ±½Üè¡¥¸±­É½Õ¹èÁÁÄÈ±±áM¡É¥¹¬èÀ±ÕÉÍ½Èé¥µÌ¹±¹Ñ øÀüÁ½¥¹ÑÈèÕ±Ðõô(½¹
±¥¬õì ¤ôù¥µÌ¹±¹Ñ øÀ½Á¹1¥¡Ñ½à A¡½Ñ½Ì¥ôø(í¥µÌ¹±¹Ñ øÀ(üñ¥µÍÉõí¥µÍlÁuô±ÐõíÀ¹Ñ¥Ñ±ôÍÑå±õíìÝ¥Ñ èÄÀÀ±¡¥¡ÐèÄÀÀ±½©Ñ¥Ðè½ÙÈ±½Á¥ÑäèÀ¸äõô¼ø(èñ¥ØÍÑå±õíìÝ¥Ñ èÄÀÀ±¡¥¡ÐèÄÀÀ±­É½Õ¹é±¥¹ÈµÉ¥¹Ð ÄÌÕ°íÀ¹½±½ÉôÄÈ°íÀ¹½±½ÉôÀÐ¥õô¼ø(ô(í¥µÌ¹±¹Ñ øÄñ¥ØÍÑå±õíìÁ½Í¥Ñ¥½¸èÍ½±ÕÑ±½ÑÑ½´èÄÀ±É¥¡ÐèÄÀ±­É½Õ¹èÉ À°À°À°À¸Ø¤±½±½Èè±½¹ÑM¥éèÄÄ±Á¥¹èÍÁàÄÁÁà±½ÉÉI¥ÕÌèÈÀ±­É½Á¥±ÑÈè±ÕÈ ÑÁà¤õôùí¥µÌ¹±¹Ñ¡ôÁ¡½Ñ½Ìð½¥Øùô(ð½¥Øø(ñ¥ØÍÑå±õíìÁ¥¹èÈà±±àèÄ±¥ÍÁ±äè±à±±á¥ÉÑ¥½¸è½±Õµ¸õôø(ñ¥ØÍÑå±õíì¥ÍÁ±äè¥¹±¥¹µ±à±±¥¹%ÑµÌè¹ÑÈ±ÀèØ±µÉ¥¹	½ÑÑ½´èÄÐõôø(ñÍÁ¸ÍÑå±õíìÝ¥Ñ èà±¡¥¡Ðèà±½ÉÉI¥ÕÌèÔÀ±­É½Õ¹éÀ¹½±½Èõô¼ø(ñÍÁ¸ÍÑå±õíì½¹ÑM¥éèÄÄ±½¹Ñ]¥¡ÐèØÀÀ±ÑáÑQÉ¹Í½É´èÕÁÁÉÍ±±ÑÑÉMÁ¥¹èÄ¸Ô±½±½ÈéÀ¹½±½ÈõôùíÀ¹Ñôð½ÍÁ¸ø(ð½¥Øø(ñ ÌÍÑå±õíì½¹ÑM¥éèÈÀ±½¹Ñ]¥¡ÐèÜÀÀ±½±½Èè±µÉ¥¹	½ÑÑ½´èàõôùíÀ¹Ñ¥Ñ±ôð½ Ìø(ñÀÍÑå±õíì½¹ÑM¥éèÄÌ±½±½ÈèàààáÀ±±àèÄ±±¥¹!¥¡ÐèÄ¸ØõôùíÀ¹±¥ÙÉ±Íôð½Àø(íÑÌ¹±¹Ñ øÀ (ñ¥ØÍÑå±õíì¥ÍÁ±äè±à±Àèà±µÉ¥¹Q½ÀèÈÀ±±á]ÉÀèÝÉÀõôø(íÑÌ¹µÀ¡Ñôø (ñÕÑÑ½¸­äõíÑô½¹
±¥¬õì ¤ôù½Á¹1¥¡Ñ½à¡Ñ¥ô(ÍÑå±õíìÁ¥¹èÕÁàÄÑÁà¥½ÉÉI¥ÕÌèÈÀ±½¹ÑM¥éèÄÈ±½¹Ñ]¥¡ÐèÔÀÀ°ÁÕÉÍ½ÈèÁ½¥¹ÑÈ°(½ÉÈéÅÁàÍ½±¥íÀ¹½±½ÉôÔÁ±­É½Õ¹éíÀ¹½±½ÉôÄÁ±½±½ÈéÀ¹½±½Èõôø(íÑôàÔääì(ð½ÕÑÑ½¸ø(¤¥ô(ð½¥Øø(¥ô(ð½¥Øø(ð½¥Øø(í±¥¡Ñ½áQñA½ÉÑ½±¥½1¥¡Ñ½àÀõíÁô¥µÌõí¥µÍôÙ¥½UÉ°õíÙ¥½UÉ±ô¥¹¥Ñ¥±Qõí±¥¡Ñ½áQô½¹
±½Íõì ¤ôùÍÑ1¥¡Ñ½áQ¡¹Õ±°¥ô¼ùô(ð¼ø(¤ì)ô((¼¼ôôôôôA=IQ=1%<ôôôôô)Õ¹Ñ¥½¸A½ÉÑ½±¥¼ ¤ì(ÉÑÕÉ¸ñA½ÉÑ½±¥½MÑ¥½¸¼øì)ô()Õ¹Ñ¥½¸MÉÙ¥É ¤ì(ÉÑÕÉ¸ (ñ¥Øø(ñA!É¼ÑôMÉÙ¥ÉÑ¥Ñ±õìðùM½ÕÑ¡É¸
¹ÑÉ°ñÈ¼ù
±¥½É¹¥ð¼ùôÍÕÑ¥Ñ±ôÉ½´M¸¥¼Ñ¼	­ÉÍ¥±°A±´MÁÉ¥¹ÌÑ¼Ñ¡½ÍÐP¥å½ÕÈÁÉ½©Ð¥Ì¥¸½ÕÈÉ¹°Ý±°½¸Í¥Ñ¸¼ø(ñÍÑ¥½¸ÍÑå±õíìÁ¥¹èÀÈÑÁàØÁÁà±µá]¥Ñ èÄÈÀÀ±µÉ¥¸èÀÕÑ¼õôø(ñ¥ØÍÑå±õíìµá]¥Ñ èäÀÀ±µÉ¥¸èÀÕÑ¼ØÁÁà±½ÉÉI¥ÕÌèÄØ±½ÉÈèÅÁàÍ½±¥É ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀØ¤±­É½Õ¹èÉ ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸ÀÈ¤±Á¥¹èÐàõôø(ñ¥ØÍÑå±õíì¥ÍÁ±äèÉ¥±É¥QµÁ±Ñ
½±Õµ¹ÌèÉÁÐ Ð°ÅÈ¤±ÀèÌÈ±ÑáÑ±¥¸è¹ÑÈõôø(ímëvã¢#r"ÆÃ¢$6÷fW&vR&Vvöç2'ÒÇ¶ã¢##²"ÆÃ¢$6FW2b6öÖ×VæFW2'ÒÇ¶ã¢#CÖ"ÆÃ¢$6÷fW&vR&FW2'ÒÇ¶ã¢%6ÖRvVV²"ÆÃ¢%G6ÂfÆ&ÆG'ÕÒæÖ2ÆÓâ¢ÆFb¶W×¶Óà¢ÆFb7GÆS×·²föçE6¦S£3"ÆföçEvVvC£Æ6öÆ÷#¢"6ffb"ÆÆWGFW%76æs¢"Ó"×Óç·2æçÓÂöFcà¢ÆFb7GÆS×·²föçE6¦S£ÆföçEvVvC£cÆ6öÆ÷#¢"3cccd"ÇFWEG&ç6f÷&Ó¢'WW&66R"ÆÆWGFW%76æs£ãRÆÖ&våF÷£b×Óç·2æÇÓÂöFcà¢ÂöFcà¢Ð¢ÂöFcà¢ÂöFcà¢Å6V7FöåFFÆRFFÆSÒ$6÷fW&vR&Vvöç2"óà¢ÆFb6Æ74æÖSÒ'&W7öç6fRÖw&BÓ""7GÆS×·²F7Æ¢&w&B"Æw&EFV×ÆFT6öÇVÖç3¢'&WVBWFòÖfBÆÖæÖ3CÃg""Æv£#×Óà¢µ$Ttôå2æÖ"ÆÓâÆFb¶W×¶Ò6Æ74æÖSÒ&6&BÖ÷fW""7GÆS×·²&6¶w&÷VæC¢'&v&#SRÃ#SRÃ#SRÃã2"Æ&÷&FW#¢#6öÆB&v&#SRÃ#SRÃ#SRÃãb"Æ&÷&FW%&FW3£BÇFFæs£3"×ÓãÆ27GÆS×·²föçE6¦S£ÆföçEvVvC£sÆ6öÆ÷#¢"6ffb"ÆÖ&vä&÷GFöÓ£b×Óç·"ææÖWÓÂö3ãÇ7GÆS×·²föçE6¦S£"Æ6öÆ÷#¢"3stdb"ÆföçEvVvC£SÆÖ&vä&÷GFöÓ£"×Óç·"æ6FW7ÓÂ÷ãÇ7GÆS×·²föçE6¦S£2Æ6öÆ÷#¢"3"ÆÆæTVvC£ãr×Óç·"æFW67ÓÂ÷ãÂöFcâÐ¢ÂöFcà¢Â÷6V7Föãà¢Ç6V7Föâ7GÆS×·²FFæs¢#c#G"ÇFWDÆvã¢&6VçFW""×Óà¢Ç7GÆS×·²föçE6¦S£RÆ6öÆ÷#¢"3"ÆÖ&vä&÷GFöÓ£×Óäæ÷B7W&RbvR6÷fW"÷W"&VóÂ÷à¢Ç7GÆS×·²föçE6¦S£ÆföçEvVvC£sÆ6öÆ÷#¢"6ffb"×Óå&V6÷WB(	Bb÷Rw&Râ&ævRÂvRvÆÂ&RFW&RãÂ÷à¢Â÷6V7Föãà¢ÂöFcà¢°§Ð¢òòÓÓÓÓÒ4ôåD5BÓÓÓÓÐ¦gVæ7Föâ6öçF7B°¢6öç7BÆö6FöâÒW6TÆö6Föâ°¢6öç7B¶f÷&ÒÂ6WDf÷&ÕÒÒ&V7BçW6U7FFR°¢æÖS¢""ÂVÖÃ¢""ÂöæS¢""ÂGS¢%&÷W'GÖ&¶WFær"À¢FG&W73¢""ÂFW63¢""ÂFÖVÆæS¢""ÂöæW÷C¢""À¢Ò°¢6öç7B·7FGW2Â6WE7FGW5ÒÒ&V7BçW6U7FFR&FÆR"°¢6öç7BWBÒ²ÂbÓâ6WDf÷&ÒÓâ²ââçÂ¶µÓ¢bÒ°¢&V7BçW6TVffV7BÓâ°¢6öç7B&×2ÒæWrU$Å6V&6&×2Æö6Föâç6V&6°¢6öç7BBÒ&×2ævWB'GR"°¢bBÓÓÒ'&÷W'GÖÖ&¶WFær"6WDf÷&ÒÓâ²ââçÂGS¢%&÷W'GÖ&¶WFær"Ò°¢VÇ6RbBÓÓÒ&6öç7G'V7Föâ"6WDf÷&ÒÓâ²ââçÂGS¢$6öç7G'V7Föâ"Ò°¢ÒÂµÒ²òòW6ÆçBÖF6&ÆRÖÆæR&V7BÖöö·2öWW7FfRÖFW0 ¢6öç7BæFÆU7V&ÖBÒ7æ2Óâ°¢bf÷&ÒææÖRÇÂf÷&ÒæVÖÂ&WGW&ã°¢6WE7FGW2'6VæFær"°¢G'°¢6öç7B&W2ÒvBfWF6"öö6öçF7B"Â°¢ÖWFöC¢%õ5B"À¢VFW'3¢²$6öçFVçBÕGR#¢&Æ6Föâö§6öâ"ÒÀ¢&öG¢¥4ôâç7G&ævgf÷&ÒÀ¢Ò°¢6WE7FGW2&W2æö²ò'7V66W72"¢&W'&÷""°¢Ò6F6°¢6WE7FGW2&W'&÷""°¢Ð¢Ó° ¢b7FGW2ÓÓÒ'7V66W72"°¢&WGW&â¢Ç6V7Föâ7GÆS×·²ÖäVvC¢#f"ÂF7Æ¢&fÆW"ÂÆväFV×3¢&6VçFW""Â§W7Fg6öçFVçC¢&6VçFW""ÂFWDÆvã¢&6VçFW""ÂFFæs¢###G"×Óà¢ÆFcà¢ÆFb7GÆS×·²föçE6¦S¢cBÂÖ&vä&÷GFöÓ¢#B×Óî)É3ÂöFcà¢Æ"7GÆS×·²föçE6¦S¢3BÂföçEvVvC¢Â6öÆ÷#¢"6ffb"ÂÖ&vä&÷GFöÓ¢b×ÓåV÷FR&WVW7B&V6VfVCÂö#à¢Ç7GÆS×·²6öÆ÷#¢"3"ÂföçE6¦S¢bÂÆæTVvC¢ãrÂÖvGF¢CSÂÖ&vã¢#WFò"×Óà¢Fæ²÷RâvRvÆÂ&WfWr÷W"&ö¦V7BFWFÇ2æB&W7öæBvFâ#B÷W'2à¢Â÷à¢ÂöFcà¢Â÷6V7Föãà¢°¢Ð ¢&WGW&â¢ÆFcà¢ÅvTW&òFsÒ$6öçF7B"FFÆSÒ$vWBV÷FR"7V'FFÆSÒ%FVÆÂW2vB÷RæVVB(	BâÂFG&W72ÂFVÆfW&&ÆW2âvRvÆÂ&W7öæBvFâ#B÷W'2â"óà¢Ç6V7Föâ7GÆS×·²FFæs¢##G"ÂÖvGF¢cCÂÖ&vã¢#WFò"×Óà¢ÆFb7GÆS×·²F7Æ¢&w&B"Âv¢#B×Óà¢ÆFb7GÆS×·²F7Æ¢&æöæR"×Óà¢ÆçWBF$æFWÒ"Ó"WFô6ö×ÆWFSÒ&öfb"fÇVS×¶f÷&ÒæöæW÷GÒöä6ævS×¶RÓâWB&öæW÷B"ÂRçF&vWBçfÇVRÒóà¢ÂöFcà¢ÆFb6Æ74æÖSÒ'&W7öç6fRÖw&BÓ""7GÆS×·²F7Æ¢&w&B"Âw&EFV×ÆFT6öÇVÖç3¢#g"g""Âv¢b×Óà¢ÆFcãÆÆ&VÂ6Æ74æÖSÒ&f÷&ÒÖÆ&VÂ#äæÖR£ÂöÆ&VÃãÆçWB6Æ74æÖSÒ&f÷&ÒÖçWB"fÇVS×¶f÷&ÒææÖWÒöä6ævS×¶RÓâWB&æÖR"ÂRçF&vWBçfÇVRÒÆ6VöÆFW#Ò%÷W"æÖR"óãÂöFcà¢ÆFcãÆÆ&VÂ6Æ74æÖSÒ&f÷&ÒÖÆ&VÂ#åöæSÂöÆ&VÃãÆçWB6Æ74æÖSÒ&f÷&ÒÖçWB"fÇVS×¶f÷&ÒçöæWÒöä6ævS×¶RÓâWB'öæR"ÂRçF&vWBçfÇVRÒÆ6VöÆFW#Ò"Ó"óãÂöFcà¢ÂöFcà¢ÆFcãÆÆ&VÂ6Æ74æÖSÒ&f÷&ÒÖÆ&VÂ#äVÖÂ£ÂöÆ&VÃãÆçWB6Æ74æÖSÒ&f÷&ÒÖçWB"fÇVS×¶f÷&ÒæVÖÇÒöä6ævS×¶RÓâWB&VÖÂ"ÂRçF&vWBçfÇVRÒÆ6VöÆFW#Ò'÷TVÖÂæ6öÒ"óãÂöFcà¢ÆFcà¢ÆÆ&VÂ6Æ74æÖSÒ&f÷&ÒÖÆ&VÂ#å&ö¦V7BGSÂöÆ&VÃà¢ÆFb7GÆS×·²F7Æ¢&fÆW"Âv¢"ÂfÆWw&¢'w&"×Óà¢µ²%&÷W'GÖ&¶WFær"Â$6öç7G'V7FöâbFWfVÆ÷ÖVçB"Â$÷FW"%ÒæÖBÓâ¢Æ'WGFöâ¶W×·GÒ6Æ74æÖSÒ&fÇFW"Ö'Fâ"öä6Æ6³×²ÓâWB'GR"ÂBÐ¢7GÆS×·²&÷&FW#¢f÷&ÒçGRÓÓÒBò#6öÆB3stdb"¢#6öÆB&v&#SRÃ#SRÃ#SRÃã"Â&6¶w&÷VæC¢f÷&ÒçGRÓÓÒBò'&v&ÃÃ#SRÃã""¢'G&ç7&VçB"Â6öÆ÷#¢f÷&ÒçGRÓÓÒBò"3stdb"¢"3"×Óà¢·GÐ¢Âö'WGFöãà¢Ð¢ÂöFcà¢ÂöFcà¢ÆFcãÆÆ&VÂ6Æ74æÖSÒ&f÷&ÒÖÆ&VÂ#å&ö¦V7BFG&W72÷"ãÂöÆ&VÃãÆçWB6Æ74æÖSÒ&f÷&ÒÖçWB"fÇVS×¶f÷&ÒæFG&W77Òöä6ævS×¶RÓâWB&FG&W72"ÂRçF&vWBçfÇVRÒÆ6VöÆFW#Ò##2Öâ7B÷"â2"óãÂöFcà¢ÆFcãÆÆ&VÂ6Æ74æÖSÒ&f÷&ÒÖÆ&VÂ#å&ö¦V7BFW67&FöãÂöÆ&VÃãÇFWF&V6Æ74æÖSÒ&f÷&ÒÖçWB"7GÆS×·²ÖäVvC¢#Â&W6¦S¢'fW'F6Â"×ÒfÇVS×¶f÷&ÒæFW67Òöä6ævS×¶RÓâWB&FW62"ÂRçF&vWBçfÇVRÒÆ6VöÆFW#Ò$FVÆfW&&ÆW2æVVFVBÂ6FR66W72æ÷FW2Â7V6f2&WV&VÖVçG2â"óãÂöFcà¢ÆFcãÆÆ&VÂ6Æ74æÖSÒ&f÷&ÒÖÆ&VÂ#å&VfW'&VBFÖVÆæSÂöÆ&VÃãÆçWB6Æ74æÖSÒ&f÷&ÒÖçWB"fÇVS×¶f÷&ÒçFÖVÆæWÒöä6ævS×¶RÓâWB'FÖVÆæR"ÂRçF&vWBçfÇVRÒÆ6VöÆFW#Ò&RærâÂvFâ"vVV·2Â4ÂfÆW&ÆR"óãÂöFcà¢·7FGW2ÓÓÒ&W'&÷""bb¢Ç7GÆS×·²6öÆ÷#¢"4dcDCDB"ÂföçE6¦S¢2ÂFWDÆvã¢&6VçFW""×Óà¢6öÖWFærvVçBw&öærâVÖÂW2F&V7FÇB¦÷6W6W&76vBæ6öÐ¢Â÷à¢Ð¢Æ'WGFöà¢6Æ74æÖSÒ&'Fâ×&Ö' ¢7GÆS×·²vGF¢#R"ÂFFæs¢bÂföçE6¦S¢RÂÖ&våF÷¢Â÷6G¢7FGW2ÓÓÒ'6VæFær"òãb¢×Ð¢öä6Æ6³×¶æFÆU7V&ÖGÐ¢F6&ÆVC×·7FGW2ÓÓÒ'6VæFær'Ð¢à¢·7FGW2ÓÓÒ'6VæFær"ò%6VæFæ~(
b"¢%7V&ÖBV÷FR&WVW7B'Ð¢Âö'WGFöãà¢ÂöFcà¢ÆFb7GÆS×·²Ö&våF÷¢SbÂFFæs¢3"Â&6¶w&÷VæC¢'&v&#SRÃ#SRÃ#SRÃã2"Â&÷&FW#¢#6öÆB&v&#SRÃ#SRÃ#SRÃãb"Â&÷&FW%&FW3¢BÂF7Æ¢&w&B"Âw&EFV×ÆFT6öÇVÖç3¢'&WVBWFòÖfBÆÖæÖÃg""Âv¢#BÂFWDÆvã¢&6VçFW""×Óà¢µ·²Æ&VÃ¢$VÖÂ"ÂfÇVS¢&¦÷6W6W&76vBæ6öÒ"Â&Vc¢&ÖÇFó¦¦÷6W6W&76vBæ6öÒ"ÒÂ²Æ&VÃ¢%öæR"ÂfÇVS¢#ã3Rã"Â&Vc¢'FVÃ£3S"ÒÂ²Æ&VÃ¢%&W7öç6RFÖR"ÂfÇVS¢%vFâ#B÷W'2"Â&Vc¢çVÆÂÕÒæÖ2ÂÓâ¢ÆFb¶W×¶Óà¢ÆFb7GÆS×·²föçE6¦S¢ÂföçEvVvC¢cÂ6öÆ÷#¢"3"ÂÆWGFW%76æs¢ãRÂFWEG&ç6f÷&Ó¢'WW&66R"ÂÖ&vä&÷GFöÓ¢b×Óç¶2æÆ&VÇÓÂöFcà¢¶2æ&VbòÆ&Vc×¶2æ&VgÒ7GÆS×·²föçE6¦S¢BÂföçEvVvC¢cÂ6öÆ÷#¢"6ffb"ÂFWDFV6÷&Föã¢&æöæR"×Óç¶2çfÇVWÓÂöâ¢ÆFb7GÆS×·²föçE6¦S¢BÂföçEvVvC¢cÂ6öÆ÷#¢"6ffb"×Óç¶2çfÇVWÓÂöFcçÐ¢ÂöFcà¢Ð¢ÂöFcà¢Â÷6V7Föãà¢ÂöFcà¢°§Ð ¢òòÓÓÓÓÒdÓÓÓÓÐ¦gVæ7Föâd°¢6öç7B¶÷VâÂ6WD÷VåÒÒ&V7BçW6U7FFRçVÆÂ°¢6öç7BFV×2Ò°¢²¢$&R÷Rd'Br6W'FfVCò"Â¢%W2â¦÷6WW&W¢öÆG2âd'Br&VÖ÷FRÆ÷B6W'Ff6FRÂ&WV&VBf÷"ÆÂ6öÖÖW&6ÂG&öæR÷W&Föç2âFRRå2âvR&RÇ6ògVÆÇç7W&VBæB6â&÷fFR6W'Ff6FRöbç7W&æ6R4ôWöâ&WVW7B(	B7FæF&Bf÷"t72Â'&ö¶W&vW2ÂæB&÷W'GÖævVÖVçB6ö×æW2â"ÒÀ¢²¢%vB&V2Fò÷R6W'fSò"Â¢%6÷WFW&âæB6VçG&Â6Æf÷&æ(	Bg&öÒ6âFVvòFò&¶W'6fVÆBÂæBFRæÆæBV×&RFòFR6ö7Bâ&Ö'6÷fW&vRæ6ÇVFW2Æ÷2ævVÆW2Â÷&ævR6÷VçGÂ&fW'6FR6÷VçGÂ6â&W&æ&Fæò6÷VçGÂFR6ö6VÆÆfÆÆWÂæB7W'&÷VæFær&V2âG&fVÂfVW2Ç&WöæB÷W"&Ö'6W'f6R¦öæRâ"ÒÀ¢²¢$÷rÆöærFöW2BF¶RFò&V6VfR×FVÆfW&&ÆW3ò"Â¢%7FæF&BGW&æ&÷VæB2>(	3B'W6æW72F2g&öÒFRFFRöbFRfÆvBâ'W6FVÆfW'(	3"'W6æW72F22fÆ&ÆR2âFBÖöââÆ&vRG&öæTFWÆ÷Öær÷"6öç7G'V7Föâ&ö¦V7G2Ö&WV&RFFFöæÂ&ö6W76ærFÖR(	BvRvÆÂ6öæf&ÒFÖVÆæW2vVâ66÷ær÷W"&ö¦V7Bâ"ÒÀ¢²¢%vBfÆRf÷&ÖG2Fò÷RFVÆfW#ò"Â¢%&÷W'GÖ&¶WFæs¢VFFVB¥Trõär÷F÷2ÔÅ2×&VGÂÕBfFVòâc£æB£b&VVÇ2õFµFö²7WG2ÂæB÷7FVB3c+F÷W"Ææ·2â6öç7G'V7FöâöÖæs¢vVõDdb÷'FöÖ÷672ÂÄ2ôÄ¢öçB6Æ÷VG2ÂæB&ö6÷&Rò$Ò3cÖ6ö×F&ÆR÷WGWG2âÆÂfÆW2FVÆfW&VBf6Æ÷VBF÷væÆöBÆæ²â"ÒÀ¢²¢$Fò÷RæFÆR'76RWF÷&¦Föãò"Â¢%W2(	BvRÖævRÆÂÄä2WF÷&¦Föç2f÷"6öçG&öÆÆVB'76RF&÷VvFRdw2WFöÖFVB77FVÒâf÷"&W7G&7FVB÷"6ö×ÆW'76RÂvRö'FâÖçVÂvfW'22æVVFVBBæòFFFöæÂ6÷7BFò÷Râ"ÒÀ¢²¢%vB2÷W"G&fVÂfVSò"Â¢%vR6&vRCãsW"ÖÆRâ¦ö'2VæFW"SÖÆW2&R&ÆÆVB&÷VæB×G&²¦ö'2SÖÆW2÷"Ö÷&R&R&ÆÆVBöæR×vâf÷"Ö÷7B&ö¦V7G2âFRw&VFW"Æ÷2ævVÆW2ÂæÆæBV×&RÂ÷"6âFVvò&V2ÂG&fVÂfVW2&RÖæÖÂ÷"¦W&òâ"ÒÀ¢²¢$÷rFò&öö²6ö÷Cò"Â¢$fÆÂ÷WB÷W"V÷FR&WVW7Bf÷&ÒvF÷W"&ö¦V7BFG&W72÷"âf÷"ÆæBö6öç7G'V7Föâ6FW2Â÷W"FVÆfW&&ÆRÆ7BÂæB÷W"FÖVÆæRâvR&W7öæBvFâ#B÷W'2vF&6æræBfÆ&ÆGâSRFW÷6B2&WV&VBFòöÆB÷W"6ö÷BFFRâ"ÒÀ¢²¢$Fò÷Rv÷&²vF&VÂW7FFRvVçG2æB'&ö¶W&vW3ò"Â¢$'6öÇWFVÇ(	BvRv÷&²vFæFfGVÂvVçG2ÂFV×2ÂæB'&ö¶W&vW2öâW"ÖÆ7Fær÷"&WFæW"&62âb÷RfR&VwVÆ"Æ7FærföÇVÖRÂ6²&÷WBvVçB&6ærâvRw&RFò'VÆBv÷&¶fÆ÷rFBfG2÷W"'W6æW72æBGW&æ&÷VæB&WV&VÖVçG2â"ÒÀ¢²¢$6â÷R66öÖÖöFFRW&vVçBFÖVÆæW3ò"Â¢%vRFò÷W"&W7BFò66öÖÖöFFRFvBFVFÆæW2â6ÖR×vVV²fÆ&ÆG2G6Ââf÷"6ÖRÖF÷"æWBÖF&WVW7G2Â&V6÷WBF&V7FÇæBvRvÆÂÖ¶RWfW'Vff÷'BFò&Röâ6FRvVâ÷RæVVBW2â"ÒÀ¢²¢%vBWVÖVçBFò÷RW6Sò"Â¢%vRfÇD¤G&öæW2Öf22&òÂçFöÒB%D²f÷"÷Föw&Â6æVÖF2fFVòÂæB&V66öâÖærâ3c+f'GVÂF÷W'2&R6GW&VBvFFR&6öFWF£æBç7F3c6W&W2â6öç7G'V7FöâfÆvBÆç2&R÷vW&VB'G&öæTFWÆ÷w2WFöÖFVBv÷&¶fÆ÷rÆFf÷&Òâ"ÒÀ¢Ó°¢&WGW&â¢ÆFcà¢ÅvTW&òFsÒ$d"FFÆSÒ$g&WVVçFÇ6¶VBVW7Föç2"7V'FFÆSÒ$WfW'Fær÷RæVVBFò¶æ÷r&÷WB&öö¶ærÂFVÆfW&&ÆW2ÂæBv÷&¶ærvF6W&26vBâ"66VçCÒ"3stdb"óà¢Ç6V7Föâ7GÆS×·²FFæs¢##G"ÆÖvGF£sÆÖ&vã¢#WFò"×Óà¢¶FV×2æÖFVÒÆÓâ¢ÆFb¶W×¶Ò7GÆS×·²&÷&FW$&÷GFöÓ¢#6öÆB&v&#SRÃ#SRÃ#SRÃãb"×Óà¢Æ'WGFöâöä6Æ6³×²Óç6WD÷Vâ÷VãÓÓÖöçVÆÃ¦Ð¢7GÆS×·²vGF¢#R"ÆF7Æ¢&fÆW"ÆÆväFV×3¢&6VçFW""Æ§W7Fg6öçFVçC¢'76RÖ&WGvVVâ"ÇFFæs¢##'"Æ&6¶w&÷VæC¢&æöæR"Æ&÷&FW#¢&æöæR"Æ7W'6÷#¢'öçFW""Æv£bÇFWDÆvã¢&ÆVgB"×Óà¢Ç7â7GÆS×·²föçE6¦S£RÆföçEvVvC£cÆ6öÆ÷#¢"6ffb"ÆÆæTVvC£ãB×Óç¶FVÒçÓÂ÷7ãà¢Ç7â7GÆS×·²6öÆ÷#¢"3stdb"ÆföçE6¦S£#"ÆfÆW6&æ³£ÇG&ç6f÷&Ó¦÷VãÓÓÖò'&÷FFRCVFVr#¢&æöæR"ÇG&ç6Föã¢'G&ç6f÷&Òã'2"ÆF7Æ¢&æÆæRÖ&Æö6²"×Óâ³Â÷7ãà¢Âö'WGFöãà¢¶÷VãÓÓÖbb¢ÆFb7GÆS×·²FFæt&÷GFöÓ£#"×Óà¢Ç7GÆS×·²föçE6¦S£BÆ6öÆ÷#¢"3"ÆÆæTVvC£ãÆÖ&vã£×Óç¶FVÒæÓÂ÷à¢ÂöFcà¢Ð¢ÂöFcà¢Ð¢Â÷6V7Föãà¢Ä5D&ææW"FFÆSÒ%7FÆÂfRVW7Föç3ò"7V#Ò%&V6÷WBF&V7FÇ(	BvR&W7öæBvFâ#B÷W'2â"'FãÒ$6öçF7BW2(i""óà¢ÂöFcà¢°§Ð ¢òòÓÓÓÓÒÔâÓÓÓÓÐ ¦W÷'BFVfVÇBgVæ7Föâ°¢&V7BçW6TVffV7BÓâ°¢6öç7BÆVæ2ÒæWrÆVæ2²GW&Föã¢ã"ÂV6æs¢BÓâÖFæÖâÂãÒÖFç÷r"ÂÓ¢BÒ°¢ÆVæ2æöâ'67&öÆÂ"Â67&öÆÅG&vvW"çWFFR°¢w6çF6¶W"æFBFÖRÓâÆVæ2ç&bFÖR¢°¢w6çF6¶W"æÆu6Öö÷Fær°¢&WGW&âÓâ²ÆVæ2æFW7G&÷²Ó°¢ÒÂµÒ° ¢&WGW&â¢ÆFcà¢²ò¢æö6Rw&â÷fW&Æ¢÷Ð¢ÆFb7GÆS×·²÷6Föã¢&fVB"Æç6WC£ÇöçFW$WfVçG3¢&æöæR"Ç¤æFW£Æ÷6G£ã3"À¢&6¶w&÷VæDÖvS¦W&Â&FF¦ÖvR÷7fr·ÖÂÂS477frfWt&÷Òs#Sb#SbrÖÆç3ÒvGG¢ò÷wwrçs2æ÷&ró#÷7frrS4RS46fÇFW"CÒvæö6RrS4RS46fUGW&'VÆVæ6RGSÒvg&7FÄæö6Rr&6Tg&WVVæ7ÒsãrçVÔö7FfW3ÒsBr7FF6FÆW3Òw7FF6ròS4RS42öfÇFW"S4RS47&V7BvGFÒsS#RrVvCÒsS#RrfÇFW#ÒwW&ÂS#6æö6RròS4RS42÷7frS4R"À¢&6¶w&÷VæE&WVC¢'&WVB"Æ&6¶w&÷VæE6¦S¢### ¢×Òóà¢Äæbóà¢Å&÷WFW3à¢Å&÷WFRFÒ"ò"VÆVÖVçC×³ÄöÖRóçÒóà¢Å&÷WFRFÒ"÷&÷W'GÖÖ&¶WFær"VÆVÖVçC×³Å&÷W'GÖ&¶WFæróçÒóà¢Å&÷WFRFÒ"ö6öç7G'V7Föâ"VÆVÖVçC×³Ä6öç7G'V7FöâóçÒóà¢Å&÷WFRFÒ"÷÷'FföÆò"VÆVÖVçC×³Å÷'FföÆòóçÒóà¢Å&÷WFRFÒ"÷6W'f6RÖ&V"VÆVÖVçC×³Å6W'f6T&VóçÒóà¢Å&÷WFRFÒ"ö6öçF7B"VÆVÖVçC×³Ä6öçF7BóçÒóà¢Å&÷WFRFÒ"öf"VÆVÖVçC×³ÄdóçÒóà¢Âõ&÷WFW3à¢Äfö÷FW"óà¢ÂöFcà¢°¢Ð
