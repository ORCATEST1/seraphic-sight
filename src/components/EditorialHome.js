import React from "react";
import { Link } from "react-router-dom";
import { HERO_VIDEO_URL } from "../data/content";
import "./EditorialHome.css";

const FALLBACK = "https://res.cloudinary.com/dpc1noikx/image/upload/w_1000,c_limit,f_auto,q_auto/DJI_0944_gho2t4";

const PHOTO = "https://res.cloudinary.com/dpc1noikx/image/upload/w_1400,h_1500,c_fill,f_auto,q_auto/DJI_0944_gho2t4";
const MAP = "https://res.cloudinary.com/dpc1noikx/image/upload/w_1000,f_auto,q_auto/v1778210648/map-snapshot_q3dk25.png";

function Arrow() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 13 13 3M4 3h9v9" /></svg>;
}
function EditorialLink({ to, children }) {
  return <Link className="ed-link" to={to}>{children}<Arrow /></Link>;
}
export default function EditorialHome() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const videoRef = React.useRef(null);
  const prefersStill = typeof window !== "undefined" &&
    (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !!navigator.connection?.saveData);
  const [videoPlaying, setVideoPlaying] = React.useState(false);
  const [videoFailed, setVideoFailed] = React.useState(false);
  const [videoPaused, setVideoPaused] = React.useState(false);
  React.useEffect(() => {
    document.title = "Seraphic Sight | Aerial Imaging Studio — Southern California";
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = "https://www.seraphicsight.com/";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.content = "Independent Southern California aerial imaging studio. Real estate photography, film, construction mapping and documentation.";
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", document.title);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute("content", "https://www.seraphicsight.com/");
    document.querySelector('meta[data-route-not-found="true"]')?.remove();
  }, []);
  const navLinks = [
    { label:"Work", to:"/portfolio" },
    { label:"Property", to:"/property-marketing" },
    { label:"Construction", to:"/construction" },
    { label:"Contact", to:"/contact" }
  ];
  return <div className="editorial-home">
    <a className="ed-skip" href="#ed-main">Skip to content</a>
    <header className="ed-header">
      <Link to="/" className="ed-brand" aria-label="Seraphic Sight home">SERAPHIC SIGHT<span>AERIAL IMAGING STUDIO</span></Link>
      <nav className="ed-nav" aria-label="Main navigation">{navLinks.map(link=><Link key={link.to} to={link.to}>{link.label}</Link>)}</nav>
      <button className="ed-menu-button" type="button" aria-expanded={menuOpen} aria-controls="ed-mobile-nav" onClick={()=>setMenuOpen(v=>!v)}>{menuOpen?"CLOSE −":"MENU +"}</button>
      {menuOpen&&<nav className="ed-mobile-nav" id="ed-mobile-nav" aria-label="Mobile navigation">{navLinks.map(link=><Link key={link.to} to={link.to} onClick={()=>setMenuOpen(false)}>{link.label}</Link>)}</nav>}
    </header>
    <main id="ed-main">
      <section className="ed-hero" aria-label="Aerial imaging studio">
        <div className="ed-video-shell">
          {(videoFailed || prefersStill) && <img className="ed-video-fallback" src={FALLBACK} alt="Aerial view of Southern California" />}
          {!prefersStill && !videoFailed && <video ref={videoRef} className={"ed-hero-video"+(videoPlaying?" is-playing":"")}
            autoPlay playsInline muted loop preload="metadata" aria-hidden="true"
            onPlaying={()=>{setVideoPlaying(true);setVideoPaused(false);}}
            onError={()=>setVideoFailed(true)}>
            <source src={HERO_VIDEO_URL} type="video/mp4"/>
          </video>}
          {!prefersStill && !videoFailed && videoPlaying && <button type="button" className="ed-video-control"
            aria-label={videoPaused ? "Play background video" : "Pause background video"}
            onClick={()=>{
              const video = videoRef.current;
              if (!video) return;
              if (video.paused) video.play().catch(()=>setVideoFailed(true));
              else {video.pause();setVideoPaused(true);}
            }}>{videoPaused ? "PLAY FILM" : "PAUSE FILM"}</button>}
        </div>
        <div className="ed-hero-copy">
          <div className="ed-eyebrow">INDEPENDENT AERIAL IMAGING STUDIO / SOUTHERN CALIFORNIA</div>
          <h1>A different perspective on the built world.</h1>
          <div className="ed-hero-bottom">
            <p>Photography, film, and spatial documentation for the places we build and the properties we imagine.</p>
            <EditorialLink to="/portfolio">EXPLORE SELECTED WORK</EditorialLink>
          </div>
        </div>
      </section>
      <section className="ed-section" id="ed-work">
        <div className="ed-section-head"><div className="ed-label">01 / SELECTED WORK</div><h2>Every site tells a story.<br/>We capture the whole picture.</h2></div>
        <div className="ed-work-grid">
          <Link to="/portfolio" className="ed-work-card"><div className="ed-work-media"><img src={PHOTO} alt="Seraphic Sight aerial photograph of a Southern California skyline" loading="lazy" decoding="async"/></div><div className="ed-work-meta"><strong>Aerial perspectives</strong><span>PHOTOGRAPHY / VIDEO</span></div></Link>
          <Link to="/portfolio" className="ed-work-card"><div className="ed-work-media"><img src={MAP} alt="Construction orthomosaic mapping project" loading="lazy" decoding="async"/></div><div className="ed-work-meta"><strong>The built environment</strong><span>MAPPING / DOCUMENTATION</span></div></Link>
        </div>
        <div className="ed-work-footer"><EditorialLink to="/portfolio">VIEW THE FULL PORTFOLIO</EditorialLink></div>
      </section>
      <section className="ed-statement">
        <div className="ed-label">A DIFFERENT POINT OF VIEW</div>
        <h2>Where technical precision meets visual storytelling.</h2>
        <p>From a single property to an active construction site, each assignment deserves clarity, care, and an understanding of the built environment.</p>
      </section>
      <section className="ed-section ed-services">
        <div className="ed-section-head"><div className="ed-label">02 / WHAT WE DO</div><h2>Built around the assignment.<br/>Never around a template.</h2></div>
        <div className="ed-service"><span>01</span><h3>Property imagery &amp; film</h3><div><p>Aerial photography, cinematic video, and immersive perspectives developed for listings and architectural presentation.</p><EditorialLink to="/property-marketing">EXPLORE PROPERTY SERVICES</EditorialLink></div></div>
        <div className="ed-service"><span>02</span><h3>Construction &amp; mapping</h3><div><p>Progress documentation, orthomosaic imagery, and visual reporting that help project teams understand the site at a glance.</p><EditorialLink to="/construction">EXPLORE CONSTRUCTION SERVICES</EditorialLink></div></div>
      </section>
      <section className="ed-section ed-studio">
        <div><div className="ed-label">03 / THE STUDIO</div><h2>Creative vision.<br/>Technical discipline.</h2></div>
        <div><p>Seraphic Sight is an independent aerial imaging studio serving Southern California. We connect visual storytelling with practical site intelligence, combining FAA Part 107-certified drone operations with a background in construction engineering.</p><div className="ed-facts"><span>FAA PART 107<br/>CERTIFIED</span><span>REAL ESTATE<br/>&amp; CONSTRUCTION</span><span>SOUTHERN<br/>CALIFORNIA</span></div></div>
      </section>
      <section className="ed-contact">
        <div className="ed-label">04 / START A CONVERSATION</div>
        <h2>Let's see your project<br/>from a new angle.</h2>
        <p>Tell us about the location, the deliverables you need, and your timeline.</p>
        <EditorialLink to="/contact">REQUEST A PROJECT QUOTE</EditorialLink>
        <div className="ed-contact-details"><a href="mailto:joseph@seraphicsight.com">joseph@seraphicsight.com <Arrow/></a><a href="tel:+15627431698">(562) 743-1698 <Arrow/></a></div>
        <footer className="ed-footer"><span>© {new Date().getFullYear()} SERAPHIC SIGHT LLC</span><span>AERIAL IMAGING / SOUTHERN CALIFORNIA</span><Link to="/faq">FAQ</Link><Link to="/service-area">SERVICE AREA</Link></footer>
      </section>
    </main>
  </div>;
}
