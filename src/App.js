import React from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import {
  NAV_LINKS, STATS, PROP_SERVICES, PROP_PRICING, PROP_ADDONS,
  PROP_PROCESS, CON_CAPABILITIES, CON_PRICING, CON_STEPS,
  CON_CLIENTS, PORTFOLIO_ITEMS, REGIONS,
} from "./data/content";

// ===== NAV =====
function Nav() {
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const location = useLocation();
  const R = { Home:"/","Property Marketing":"/property-marketing",Construction:"/construction",Portfolio:"/portfolio","Service Area":"/service-area",Contact:"/contact" };

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
            <div style={{ width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#0077FF,#00BFA6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"#fff" }}>S</div>
            <span style={{ color:"#fff",fontWeight:700,fontSize:17,letterSpacing:"-0.3px" }}>Seraphic Sight</span>
          </Link>
          <div className="desktop-nav" style={{ display:"flex",alignItems:"center",gap:28 }}>
            {NAV_LINKS.map(p=><Link key={p} to={R[p]} className={`nav-link ${location.pathname===R[p]?"active":""}`}>{p}</Link>)}
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
      </div>}
    </>
  );
}

// ===== SHARED COMPONENTS =====
function PageHero({ tag, title, subtitle, accent="#0077FF" }) {
  return (
    <section style={{ position:"relative",paddingTop:140,paddingBottom:80,textAlign:"center",overflow:"hidden" }}>
      <div className="glow-orb" style={{ top:-60,right:-60,width:400,height:400,background:accent,opacity:0.07 }}/>
      <div style={{ position:"relative",zIndex:2,maxWidth:750,margin:"0 auto",padding:"0 24px" }}>
        {tag&&<div className="tag-pill" style={{ background:`${accent}15`,border:`1px solid ${accent}30`,color:accent,marginBottom:24,display:"inline-flex" }}>{tag}</div>}
        <h1 style={{ fontSize:44,fontWeight:800,color:"#fff",letterSpacing:"-1.2px",lineHeight:1.1,marginBottom:18 }}>{title}</h1>
        {subtitle&&<p style={{ fontSize:17,color:"#8888A0",lineHeight:1.7,maxWidth:580,margin:"0 auto" }}>{subtitle}</p>}
      </div>
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
  const R = { Home:"/","Property Marketing":"/property-marketing",Construction:"/construction",Portfolio:"/portfolio","Service Area":"/service-area",Contact:"/contact" };
  return (
    <footer style={{ borderTop:"1px solid rgba(255,255,255,0.06)",padding:"44px 24px",background:"rgba(0,0,0,0.3)" }}>
      <div style={{ maxWidth:1200,margin:"0 auto",display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"center",gap:24 }}>
        <div>
          <Link to="/" style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8,textDecoration:"none" }}>
            <div style={{ width:26,height:26,borderRadius:7,background:"linear-gradient(135deg,#0077FF,#00BFA6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#fff" }}>S</div>
            <span style={{ color:"#fff",fontWeight:700,fontSize:15 }}>Seraphic Sight</span>
          </Link>
          <p style={{ fontSize:11,color:"#555570" }}>© 2025 Seraphic Sight. FAA Part 107 Certified. Fully Insured.</p>
        </div>
        <div style={{ display:"flex",gap:24,flexWrap:"wrap" }}>
          {NAV_LINKS.map(p=><Link key={p} to={R[p]} style={{ color:"#A0A0B0",textDecoration:"none",fontSize:12,fontWeight:500 }}>{p}</Link>)}
        </div>
      </div>
    </footer>
  );
}

// ===== HOME =====
function Home() {
  return (
    <div>
      <section style={{ position:"relative",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden" }}>
        {[...Array(5)].map((_,i)=><div key={i} className="grid-line" style={{ left:`${20+i*16}%`,top:0,bottom:0,width:1 }}/>)}
        <div className="glow-orb" style={{ top:-100,right:-100,width:500,height:500,background:"#0077FF",opacity:0.1 }}/>
        <div className="glow-orb" style={{ bottom:-50,left:-50,width:400,height:400,background:"#00BFA6",opacity:0.08 }}/>
        <div className="animate-fadeUp" style={{ position:"relative",zIndex:2,textAlign:"center",maxWidth:860,padding:"120px 24px 80px" }}>
          <div className="tag-pill" style={{ background:"rgba(0,119,255,0.1)",border:"1px solid rgba(0,119,255,0.2)",color:"#0077FF",marginBottom:32,display:"inline-flex" }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:"#0077FF",animation:"pulse 2s infinite" }}/>
            FAA Part 107 Certified · Fully Insured
          </div>
          <h1 className="hero-title" style={{ fontSize:54,fontWeight:800,lineHeight:1.08,letterSpacing:"-1.5px",color:"#fff",marginBottom:24 }}>
            Aerial Imaging &<br/><span className="gradient-text">Site Documentation</span><br/>for Southern California
          </h1>
          <p className="hero-subtitle" style={{ fontSize:18,lineHeight:1.7,color:"#8888A0",maxWidth:600,margin:"0 auto 40px" }}>
            FAA-certified drone services for property marketing, construction monitoring, and site visualization — from APN to final deliverables.
          </p>
          <div className="btn-row" style={{ display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap" }}>
            <Link to="/property-marketing"><button className="btn-primary">Property Marketing</button></Link>
            <Link to="/construction"><button className="btn-outline">Construction & Development</button></Link>
          </div>
        </div>
      </section>

      <section style={{ borderTop:"1px solid rgba(255,255,255,0.06)",borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"40px 24px",background:"rgba(255,255,255,0.02)" }}>
        <div className="stats-bar" style={{ maxWidth:900,margin:"0 auto",display:"flex",justifyContent:"space-around",flexWrap:"wrap",gap:24 }}>
          {STATS.map((s,i)=>(<div key={i} style={{ textAlign:"center" }}><div style={{ fontSize:20,fontWeight:800,color:"#fff" }}>{s.value}</div><div style={{ fontSize:11,color:"#6666A0",fontWeight:500,marginTop:4,textTransform:"uppercase",letterSpacing:1.5 }}>{s.label}</div></div>))}
        </div>
      </section>

      <section style={{ padding:"100px 24px",maxWidth:1200,margin:"0 auto" }}>
        <SectionTitle title="Two Verticals. One Provider." sub="Whether you're selling properties or building them, we deliver."/>
        <div className="responsive-grid-2" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:24 }}>
          <div className="card-hover" style={{ background:"linear-gradient(180deg,rgba(0,119,255,0.06),rgba(0,119,255,0.02))",border:"1px solid rgba(0,119,255,0.12)",borderRadius:16,padding:44 }}>
            <div style={{ fontSize:28,marginBottom:20 }}>📸</div>
            <h3 style={{ fontSize:22,fontWeight:700,color:"#fff",marginBottom:10 }}>Property Marketing</h3>
            <p style={{ color:"#8888A0",lineHeight:1.7,fontSize:14,marginBottom:24 }}>Aerial photography, drone video, Matterport 3D tours, and complete marketing packages. Send us the APN — we handle the rest.</p>
            <Link to="/property-marketing"><button className="btn-primary" style={{ width:"100%" }}>View Services →</button></Link>
          </div>
          <div className="card-hover" style={{ background:"linear-gradient(180deg,rgba(0,191,166,0.06),rgba(0,191,166,0.02))",border:"1px solid rgba(0,191,166,0.12)",borderRadius:16,padding:44 }}>
            <div style={{ fontSize:28,marginBottom:20 }}>🏗️</div>
            <h3 style={{ fontSize:22,fontWeight:700,color:"#fff",marginBottom:10 }}>Construction & Development</h3>
            <p style={{ color:"#8888A0",lineHeight:1.7,fontSize:14,marginBottom:24 }}>DroneDeploy automated workflows, orthomosaic mapping, and progress documentation for multi-million dollar projects.</p>
            <Link to="/construction"><button className="btn-outline" style={{ width:"100%",borderColor:"rgba(0,191,166,0.3)",color:"#00BFA6" }}>View Services →</button></Link>
          </div>
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

      <CTABanner title="Ready to Scope Your Next Project?" sub="Tell us what you need — APN, address, deliverables. We'll send you a quote within 24 hours." btn="Get a Quote →"/>
    </div>
  );
}

// ===== PROPERTY MARKETING =====
function PropertyMarketing() {
  return (
    <div>
      <PageHero tag="Property Marketing" title={<>Aerial Photography, Video<br/>& 3D Tours</>} subtitle="Sell faster with professional aerial content and complete marketing packages. Send us the APN and your deliverable list — we handle the rest." accent="#0077FF"/>
      <section style={{ padding:"80px 24px",maxWidth:1200,margin:"0 auto" }}>
        <SectionTitle title="What We Deliver" sub="Every service designed to move listings faster."/>
        <div className="responsive-grid-3" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:20 }}>
          {PROP_SERVICES.map((s,i)=>(<div key={i} className="card-hover" style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:32 }}><div style={{ fontSize:28,marginBottom:14 }}>{s.icon}</div><h3 style={{ fontSize:18,fontWeight:700,color:"#fff",marginBottom:10 }}>{s.title}</h3><p style={{ fontSize:13,color:"#8888A0",lineHeight:1.7 }}>{s.desc}</p></div>))}
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
              <Link to="/contact"><button className={p.popular?"btn-primary":"btn-outline"} style={{ width:"100%",marginTop:28 }}>Get Started</button></Link>
            </div>))}
          </div>
          <div style={{ marginTop:56 }}>
            <h3 style={{ fontSize:22,fontWeight:700,color:"#fff",marginBottom:24,textAlign:"center" }}>Add-Ons</h3>
            <div style={{ maxWidth:600,margin:"0 auto",display:"grid",gap:12 }}>
              {PROP_ADDONS.map((a,i)=>(<div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10 }}><span style={{ fontSize:14,color:"#C0C0D0" }}>{a.name}</span><span style={{ fontSize:14,fontWeight:700,color:"#fff",flexShrink:0,marginLeft:16 }}>{a.price}</span></div>))}
            </div>
          </div>
        </div>
      </section>
      <section style={{ padding:"80px 24px",maxWidth:1000,margin:"0 auto" }}>
        <SectionTitle title="How It Works"/>
        <div style={{ display:"flex",flexDirection:"column",position:"relative" }}>
          <div style={{ position:"absolute",left:24,top:36,bottom:36,width:2,background:"linear-gradient(180deg,#0077FF,#00BFA6)",opacity:0.2 }}/>
          {PROP_PROCESS.map((s,i)=>(<div key={i} style={{ display:"flex",gap:28,padding:"28px 0",alignItems:"flex-start" }}><div style={{ width:50,height:50,borderRadius:"50%",background:"rgba(0,119,255,0.1)",border:"1px solid rgba(0,119,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:"#0077FF",flexShrink:0,position:"relative",zIndex:2 }}>{s.num}</div><div><h4 style={{ fontSize:18,fontWeight:700,color:"#fff",marginBottom:6 }}>{s.title}</h4><p style={{ fontSize:14,color:"#8888A0",lineHeight:1.7 }}>{s.desc}</p></div></div>))}
        </div>
      </section>
      <CTABanner title="Ready to Market Your Listing?" sub="Send us the APN and deliverables — we'll get you a quote within 24 hours." btn="Get a Quote →"/>
    </div>
  );
}

// ===== CONSTRUCTION =====
function Construction() {
  return (
    <div>
      <PageHero tag="Construction & Development" title={<>Progress Monitoring,<br/>Mapping & Visualization</>} subtitle="Automated DroneDeploy workflows, orthomosaic mapping, and audit-ready documentation for multi-million dollar projects." accent="#00BFA6"/>
      <section style={{ padding:"80px 24px",maxWidth:1200,margin:"0 auto" }}>
        <SectionTitle title="Capabilities" sub="Enterprise-grade aerial documentation for every project phase."/>
        <div className="responsive-grid-3" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:20 }}>
          {CON_CAPABILITIES.map((c,i)=>(<div key={i} className="card-hover" style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:32 }}><div style={{ fontSize:28,marginBottom:14 }}>{c.icon}</div><h3 style={{ fontSize:18,fontWeight:700,color:"#fff",marginBottom:10 }}>{c.title}</h3><p style={{ fontSize:13,color:"#8888A0",lineHeight:1.7 }}>{c.desc}</p></div>))}
        </div>
      </section>
      <section style={{ padding:"80px 24px",background:"rgba(255,255,255,0.015)" }}>
        <div style={{ maxWidth:1200,margin:"0 auto" }}>
          <SectionTitle title="Our Workflow" sub="Repeatable, automated, audit-ready."/>
          <div className="responsive-grid-3" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:28 }}>
            {CON_STEPS.map((s,i)=>(<div key={i} className="card-hover" style={{ background:"rgba(0,191,166,0.03)",border:"1px solid rgba(0,191,166,0.1)",borderRadius:16,padding:40,textAlign:"center" }}><div className="gradient-text" style={{ fontSize:44,fontWeight:900,marginBottom:18 }}>{s.num}</div><h3 style={{ fontSize:18,fontWeight:700,color:"#fff",marginBottom:10 }}>{s.title}</h3><p style={{ fontSize:13,color:"#8888A0",lineHeight:1.7 }}>{s.desc}</p></div>))}
          </div>
        </div>
      </section>
      <section style={{ padding:"80px 24px",maxWidth:800,margin:"0 auto" }}>
        <SectionTitle title="Pricing Framework" sub="Construction documentation is scoped per project. Here are our starting benchmarks."/>
        <div style={{ display:"grid",gap:12 }}>
          {CON_PRICING.map((p,i)=>(<div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 24px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,flexWrap:"wrap",gap:12 }}><span style={{ fontSize:14,color:"#C0C0D0" }}>{p.service}</span><span style={{ fontSize:15,fontWeight:700,color:"#00BFA6",flexShrink:0 }}>{p.price}</span></div>))}
        </div>
        <div style={{ marginTop:32,padding:24,background:"rgba(0,191,166,0.05)",border:"1px solid rgba(0,191,166,0.12)",borderRadius:12 }}>
          <p style={{ fontSize:13,color:"#8888A0",lineHeight:1.8 }}><strong style={{ color:"#fff" }}>Every engagement includes:</strong> DroneDeploy automated flight plans · Orthomosaic maps and progress imagery · Organized, timestamped deliverables · Site superintendent coordination · COI provided upon request</p>
        </div>
      </section>
      <section style={{ padding:"80px 24px",background:"rgba(255,255,255,0.015)" }}>
        <div style={{ maxWidth:900,margin:"0 auto" }}>
          <SectionTitle title="Who We Work With"/>
          <div className="responsive-grid-3" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16 }}>
            {CON_CLIENTS.map((w,i)=>(<div key={i} style={{ padding:"18px 24px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,textAlign:"center",fontSize:14,fontWeight:500,color:"#C0C0D0" }}>{w}</div>))}
          </div>
        </div>
      </section>
      <CTABanner title="Scope Your Next Project" sub="Send us your site details and deliverable requirements. We'll respond with a detailed proposal within 48 hours." btn="Request a Proposal →"/>
    </div>
  );
}

// ===== PORTFOLIO =====
function Portfolio() {
  const [filter, setFilter] = React.useState("All");
  const filtered = filter==="All" ? PORTFOLIO_ITEMS : PORTFOLIO_ITEMS.filter(p=>p.tag===filter);
  return (
    <div>
      <PageHero tag="Portfolio" title="Recent Work" subtitle="Selected projects across property marketing and construction documentation."/>
      <section style={{ padding:"0 24px 100px",maxWidth:1200,margin:"0 auto" }}>
        <div style={{ display:"flex",justifyContent:"center",gap:12,marginBottom:48,flexWrap:"wrap" }}>
          {["All","Property Marketing","Construction"].map(f=>(<button key={f} className="filter-btn" onClick={()=>setFilter(f)} style={{ border:filter===f?"1px solid #0077FF":"1px solid rgba(255,255,255,0.1)",background:filter===f?"rgba(0,119,255,0.12)":"transparent",color:filter===f?"#0077FF":"#8888A0" }}>{f}</button>))}
        </div>
        <div className="responsive-grid-3" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:20 }}>
          {filtered.map((p,i)=>(<div key={`${p.title}-${i}`} className="card-hover" style={{ background:`linear-gradient(135deg,${p.color}08,${p.color}03)`,border:`1px solid ${p.color}18`,borderRadius:14,padding:36,cursor:"pointer" }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:6,marginBottom:16 }}><span style={{ width:8,height:8,borderRadius:"50%",background:p.color }}/><span style={{ fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:1.5,color:p.color }}>{p.tag}</span></div>
            <h3 style={{ fontSize:20,fontWeight:700,color:"#fff",marginBottom:10 }}>{p.title}</h3>
            <p style={{ fontSize:13,color:"#8888A0" }}>{p.deliverables}</p>
            <div style={{ marginTop:20,fontSize:13,fontWeight:600,color:p.color }}>View Project →</div>
          </div>))}
        </div>
      </section>
    </div>
  );
}

// ===== SERVICE AREA =====
function ServiceArea() {
  return (
    <div>
      <PageHero tag="Service Area" title={<>Southern & Central<br/>California</>} subtitle="From San Diego to Bakersfield, Palm Springs to the coast — if your project is in our range, we'll be on site."/>
      <section style={{ padding:"0 24px 60px",maxWidth:1200,margin:"0 auto" }}>
        <div style={{ maxWidth:900,margin:"0 auto 60px",borderRadius:16,border:"1px solid rgba(255,255,255,0.06)",background:"rgba(255,255,255,0.02)",padding:48,textAlign:"center" }}>
          <div style={{ fontSize:64,marginBottom:16 }}>🗺️</div>
          <p style={{ color:"#8888A0",fontSize:14 }}>Interactive coverage map — embed your Google Map or custom graphic here</p>
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
  const [form, setForm] = React.useState({
    name: "", email: "", phone: "", type: "Property Marketing",
    address: "", desc: "", timeline: "",
  });
  const [status, setStatus] = React.useState("idle");
  const [turnstileToken, setTurnstileToken] = React.useState(null);
  const turnstileRef = React.useRef(null);
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  React.useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.turnstile && turnstileRef.current) {
        window.turnstile.render(turnstileRef.current, {
          sitekey: "0x4AAAAAACseEo-rHq3RJalk",
          callback: (token) => setTurnstileToken(token),
          "expired-callback": () => setTurnstileToken(null),
          size: "invisible",
        });
      }
    };
  }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.email) return;
    if (!turnstileToken) {
      if (window.turnstile && turnstileRef.current) {
        window.turnstile.execute(turnstileRef.current);
      }
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, turnstileToken }),
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

          <div ref={turnstileRef} />

          {status === "error" && (
            <p style={{ color: "#FF4D4D", fontSize: 13, textAlign: "center" }}>
              Something went wrong. Email us directly at Joseph@SeraphicSight.com
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
          {[{ label: "Email", value: "Joseph@SeraphicSight.com" }, { label: "Phone", value: "909.315.9891" }, { label: "Response Time", value: "Within 24 hours" }].map((c, i) => (
            <div key={i}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#8888A0", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>{c.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{c.value}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ===== MAIN APP =====
export default function App() {
  return (
    <div>
      <Nav/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/property-marketing" element={<PropertyMarketing/>}/>
        <Route path="/construction" element={<Construction/>}/>
        <Route path="/portfolio" element={<Portfolio/>}/>
        <Route path="/service-area" element={<ServiceArea/>}/>
        <Route path="/contact" element={<Contact/>}/>
      </Routes>
      <Footer/>
    </div>
  );
}