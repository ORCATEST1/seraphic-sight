// PortfolioSection.js — Seraphic Sight
// High-tech portfolio with Cloudinary-powered media grid, deliverable bubbles,
// video autoplay on hover, and fullscreen lightbox.

import React, { useState, useRef, useEffect, useCallback } from "react";

const CLD = "https://res.cloudinary.com/dpc1noikx";

const imgUrl  = (id, w = 900, h = 600) =>
  `${CLD}/image/upload/w_${w},h_${h},c_fill,f_auto,q_auto/${id}`;
const vidThumb = (id, w = 900, h = 540) =>
  `${CLD}/video/upload/w_${w},h_${h},c_fill,f_jpg,so_2/${id}`;
const vidUrl  = (id) =>
  `${CLD}/video/upload/f_mp4,q_auto:good,vc_h264/${id}`;

const ASSETS = [
  { id:"DJI_0915_w53hst",       type:"photo", tags:["Real Estate","Residential"] },
  { id:"DJI_0891_tgrszt",       type:"photo", tags:["Real Estate","Residential"] },
  { id:"DJI_0876_imzqgc",       type:"photo", tags:["Real Estate","Residential"] },
  { id:"DJI_0802_cdwyvj",       type:"photo", tags:["Commercial","Residential"] },
  { id:"DJI_0730_enavrk",       type:"photo", tags:["Real Estate","Commercial"] },
  { id:"DJI_0872_vddljb",       type:"photo", tags:["Real Estate","Residential"] },
  { id:"DJI_0812_cb8yrn",       type:"photo", tags:["Real Estate","Residential"] },
  { id:"Aerial_27_qw5yqr",      type:"photo", tags:["Real Estate","Residential"] },
  { id:"DJI_0327_it5brs",       type:"photo", tags:["Real Estate","Commercial"] },
  { id:"Aerial_18_njtmry",      type:"photo", tags:["Real Estate","Residential"] },
  { id:"Aerial_25_y6eahl",      type:"photo", tags:["Real Estate","Residential"] },
  { id:"DJI_0780_tdioap",       type:"photo", tags:["Commercial","Industrial"] },
  { id:"DJI_0454_bkvuwb",       type:"photo", tags:["Commercial","Industrial"] },
  { id:"DJI_0888_go6uhb",       type:"photo", tags:["Commercial","Residential"] },
  { id:"DJI_0322_khfwqi",       type:"photo", tags:["Residential","Real Estate"] },
  { id:"Showcase_nmenkd",       type:"photo", tags:["Real Estate","Commercial"] },
  { id:"Showcase_2_pkjbvm",     type:"photo", tags:["Real Estate","Commercial"] },
  { id:"Showcase_3_n4gxow",     type:"photo", tags:["Real Estate","Commercial"] },
  { id:"DJI_0011_zmbnvw",       type:"photo", tags:["Construction","Commercial"] },
  { id:"sola-florance-construction-aerial_oapibr", type:"photo", tags:["Construction","Development"] },
  { id:"AB3BA538-569E-4CFE-A6D7-D15694DCC3B3_g2mxh3", type:"photo", tags:["Construction","Development"] },
  { id:"4-DJI_0960_etujxs",     type:"photo", tags:["Construction","Development"] },
  { id:"3-DJI_0014_xn3a13",     type:"photo", tags:["Construction","Development"] },
  { id:"DJI_0377_xl7frm",       type:"photo", tags:["Land","Development"] },
  { id:"94-DJI_0259_e83rda",    type:"photo", tags:["Land","Development"] },
  { id:"112-DJI_0287_vmrise",   type:"photo", tags:["Land","Development"] },
  { id:"DJI_0944_hlpmgh",       type:"photo", tags:["Land","Commercial"] },
  { id:"DJI_0715_gh4zrp",       type:"photo", tags:["Land","Residential"] },
  { id:"DJI_0726_ffmdmr",       type:"photo", tags:["Land","Residential"] },
  { id:"DJI_0036-HDR_bxyo9o",   type:"photo", tags:["Land","Development"] },
  { id:"DJI_0768_nvafya",       type:"photo", tags:["Construction","Development"] },
  { id:"DJI_0841_tmdv2e",       type:"photo", tags:["Construction","Development"] },
  { id:"DJI_0104_uzqlyr",       type:"photo", tags:["Residential","Real Estate"] },
  { id:"DJI_0002_xzpfp5",       type:"photo", tags:["Residential","Real Estate"] },
  { id:"map-snapshot_q3dk25",   type:"photo", tags:["Land","Construction"] },
  { id:"dji_fly_20230107_145206_631_1673132863018_photo_m5emzx", type:"photo", tags:["Construction","Land"] },
  { id:"clip_joey_updated_bbfclp", type:"video", tags:["Real Estate","Cinematic"] },
  { id:"joe_4_pjcua7",             type:"video", tags:["Real Estate","Cinematic"] },
  { id:"clip1_nscwwy",             type:"video", tags:["Land","Cinematic"] },
  { id:"part_1_rzf7yo",            type:"video", tags:["Land","Cinematic"] },
  { id:"Copy_of_V1_2_eshjoq",      type:"video", tags:["Residential","Cinematic"] },
  { id:"Copy_of_V3_1_pohbmu",      type:"video", tags:["Residential","Cinematic"] },
  { id:"Copy_of_DJI_0719_rlyiv1",  type:"video", tags:["Land","Cinematic"] },
  { id:"Copy_of_DJI_0896_wfhqwi",  type:"video", tags:["Construction","Walkthrough"] },
  { id:"Copy_of_DJI_0939_pcc1dl",  type:"video", tags:["Construction","Walkthrough"] },
  { id:"Copy_of_DJI_0839_reswlb",  type:"video", tags:["Commercial","Cinematic"] },
  { id:"Copy_of_DJI_0787_jyxcdb",  type:"video", tags:["Commercial","Cinematic"] },
  { id:"Copy_of_DJI_0325_kmx2a4",  type:"video", tags:["Residential","Cinematic"] },
  { id:"Copy_of_Aerial_20_qa6xjx", type:"video", tags:["Real Estate","Cinematic"] },
  { id:"V5_1_.00_01_30_08.Still005_nfgpnn", type:"video", tags:["Residential","Cinematic"] },
];

const PHOTO_TAGS = ["All", "Real Estate", "Commercial", "Construction", "Land"];
const VIDEO_TAGS = ["All", "Cinematic", "Walkthrough", "Real Estate", "Construction"];

const STYLES = `
  .ps-card { position: relative; overflow: hidden; border-radius: 10px; cursor: pointer;
    background: #0a0a14; transition: transform 0.28s cubic-bezier(.2,.8,.2,1), box-shadow 0.28s; }
  .ps-card:hover { transform: scale(1.025); box-shadow: 0 12px 48px rgba(0,119,255,0.22); }
  .ps-card img { width:100%; height:100%; object-fit:cover; display:block;
    transition: opacity 0.35s; }
  .ps-card video { position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
    opacity:0; transition: opacity 0.4s; pointer-events:none; }
  .ps-card:hover video { opacity:1; }
  .ps-card:hover img { opacity:0; }
  .ps-card-overlay { position:absolute; inset:0; display:flex; flex-direction:column;
    justify-content:flex-end; padding:16px;
    background: linear-gradient(to top, rgba(5,8,16,0.88) 0%, transparent 60%);
    opacity:0; transition: opacity 0.28s; pointer-events:none; }
  .ps-card:hover .ps-card-overlay { opacity:1; }
  .ps-bubble { border:none; cursor:pointer; border-radius:20px; font-size:0.72rem;
    font-weight:600; letter-spacing:0.06em; padding:6px 16px;
    transition: background 0.18s, color 0.18s, box-shadow 0.18s; }
  .ps-bubble:hover { box-shadow: 0 0 12px rgba(0,191,166,0.3); }
  .ps-tab { background:none; border:none; cursor:pointer; padding:10px 0;
    font-size:1rem; font-weight:700; letter-spacing:-0.01em;
    transition: color 0.18s; position:relative; }
  @keyframes ps-fadein { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  .ps-grid-item { animation: ps-fadein 0.38s both; }
  .ps-play-icon { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
    width:52px; height:52px; background:rgba(0,119,255,0.7); border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 0 22px rgba(0,119,255,0.45); transition: opacity 0.28s; }
  .ps-card:hover .ps-play-icon { opacity:0; }
  @media (max-width: 768px) { .ps-grid { grid-template-columns: 1fr !important; } }
  @media (min-width: 769px) and (max-width: 1024px) { .ps-grid { grid-template-columns: repeat(2,1fr) !important; } }
`;

function Lightbox({ assets, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx);
  const asset = assets[idx];
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx(i => (i + 1) % assets.length);
      if (e.key === "ArrowLeft")  setIdx(i => (i - 1 + assets.length) % assets.length);
    };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [assets.length, onClose]);
  const isVideo = asset.type === "video";
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:2000,background:"rgba(3,5,14,0.97)",display:"flex",flexDirection:"column",backdropFilter:"blur(8px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 28px",borderBottom:"1px solid rgba(255,255,255,0.06)",flexShrink:0 }}>
        <div style={{ display:"flex",gap:10,alignItems:"center" }}>
          <span style={{ fontFamily:"monospace",fontSize:"0.7rem",color:"#00BFA6",letterSpacing:"0.25em",textTransform:"uppercase" }}>{isVideo?"Drone Video":"Aerial Photography"}</span>
          <span style={{ color:"#333355",fontSize:"0.7rem" }}>·</span>
          <span style={{ fontFamily:"monospace",fontSize:"0.68rem",color:"#555575" }}>{idx+1} / {assets.length}</span>
        </div>
        <div style={{ display:"flex",gap:8,alignItems:"center" }}>
          <div style={{ display:"flex",gap:6 }}>
            {asset.tags.map(t=>(
              <span key={t} style={{ padding:"3px 10px",borderRadius:12,fontSize:"0.65rem",fontWeight:600,background:"rgba(0,119,255,0.12)",color:"#0077FF",border:"1px solid rgba(0,119,255,0.25)" }}>{t}</span>
            ))}
          </div>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"#8888A0",fontSize:22,lineHeight:1,padding:"0 4px",marginLeft:8 }}>✕</button>
        </div>
      </div>
      <div onClick={e=>e.stopPropagation()} style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"24px 60px",minHeight:0,position:"relative" }}>
        {assets.length>1&&<>
          <button onClick={()=>setIdx(i=>(i-1+assets.length)%assets.length)} style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#fff",width:44,height:44,borderRadius:"50%",cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center",zIndex:10 }}>‹</button>
          <button onClick={()=>setIdx(i=>(i+1)%assets.length)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#fff",width:44,height:44,borderRadius:"50%",cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center",zIndex:10 }}>›</button>
        </>}
        {isVideo
          ? <video key={asset.id} controls autoPlay style={{ maxWidth:"100%",maxHeight:"100%",borderRadius:12,boxShadow:"0 0 80px rgba(0,119,255,0.15)" }} src={vidUrl(asset.id)}/>
          : <img key={asset.id} alt="" style={{ maxWidth:"100%",maxHeight:"100%",borderRadius:12,objectFit:"contain",boxShadow:"0 0 80px rgba(0,119,255,0.15)" }} src={imgUrl(asset.id,1920,1080)}/>
        }
      </div>
      <div onClick={e=>e.stopPropagation()} style={{ display:"flex",gap:8,padding:"12px 28px 20px",overflowX:"auto",borderTop:"1px solid rgba(255,255,255,0.06)",flexShrink:0,justifyContent:assets.length<8?"center":"flex-start" }}>
        {assets.map((a,i)=>(
          <div key={a.id} onClick={()=>setIdx(i)} style={{ width:72,height:46,borderRadius:6,overflow:"hidden",cursor:"pointer",flexShrink:0,transition:"opacity 0.15s,border-color 0.15s",border:i===idx?"2px solid #0077FF":"2px solid transparent",opacity:i===idx?1:0.42 }}>
            <img alt="" src={a.type==="video"?vidThumb(a.id,144,92):imgUrl(a.id,144,92)} style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoCard({ asset, onClick, style }) {
  const vidRef = useRef(null);
  const handleMouseEnter = () => { if (vidRef.current) vidRef.current.play().catch(()=>{}); };
  const handleMouseLeave = () => { if (vidRef.current) { vidRef.current.pause(); vidRef.current.currentTime=0; } };
  return (
    <div className="ps-card ps-grid-item" style={style} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={onClick}>
      <img alt="" src={vidThumb(asset.id)} loading="lazy" style={{ width:"100%",height:"100%",objectFit:"cover",display:"block" }}/>
      <video ref={vidRef} muted loop playsInline preload="none" src={vidUrl(asset.id)}/>
      <div className="ps-play-icon"><svg width="20" height="22" viewBox="0 0 20 22" fill="none"><path d="M2 2L18 11L2 20V2Z" fill="white"/></svg></div>
      <div className="ps-card-overlay">
        <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
          {asset.tags.map(t=><span key={t} style={{ padding:"2px 8px",borderRadius:10,fontSize:"0.6rem",fontWeight:600,background:"rgba(0,119,255,0.3)",color:"#7bb8ff",border:"1px solid rgba(0,119,255,0.4)",backdropFilter:"blur(4px)" }}>{t}</span>)}
        </div>
        <div style={{ fontFamily:"monospace",fontSize:"0.62rem",color:"rgba(0,191,166,0.7)",marginTop:6,letterSpacing:"0.1em" }}>DRONE VIDEO · HD</div>
      </div>
    </div>
  );
}

function PhotoCard({ asset, onClick, style }) {
  return (
    <div className="ps-card ps-grid-item" style={style} onClick={onClick}>
      <img alt="" src={imgUrl(asset.id)} loading="lazy" style={{ width:"100%",height:"100%",objectFit:"cover",display:"block" }}/>
      <div className="ps-card-overlay">
        <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
          {asset.tags.map(t=><span key={t} style={{ padding:"2px 8px",borderRadius:10,fontSize:"0.6rem",fontWeight:600,background:"rgba(0,119,255,0.3)",color:"#7bb8ff",border:"1px solid rgba(0,119,255,0.4)",backdropFilter:"blur(4px)" }}>{t}</span>)}
        </div>
        <div style={{ fontFamily:"monospace",fontSize:"0.62rem",color:"rgba(0,191,166,0.7)",marginTop:6,letterSpacing:"0.1em" }}>AERIAL · FAA 107</div>
      </div>
    </div>
  );
}

export default function PortfolioSection() {
  const [category, setCategory]   = useState("photo");
  const [activeTag, setActiveTag] = useState("All");
  const [lightbox, setLightbox]   = useState(null);
  const styleInjected             = useRef(false);

  useEffect(() => {
    if (styleInjected.current) return;
    styleInjected.current = true;
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => { if (el.parentNode) el.parentNode.removeChild(el); };
  }, []);

  useEffect(() => { setActiveTag("All"); }, [category]);

  const tagList    = category === "photo" ? PHOTO_TAGS : VIDEO_TAGS;
  const baseAssets = ASSETS.filter(a => a.type === category);
  const filtered   = activeTag === "All" ? baseAssets : baseAssets.filter(a => a.tags.includes(activeTag));
  const openLightbox = useCallback((assets, idx) => setLightbox({ assets, startIdx: idx }), []);
  const heights = ["260px","300px","260px","280px","260px","300px","280px","260px","300px"];

  return (
    <div style={{ background:"#050810",minHeight:"100vh",paddingBottom:80 }}>
      <div style={{ textAlign:"center",padding:"72px 24px 0" }}>
        <p style={{ fontFamily:"monospace",fontSize:"0.72rem",letterSpacing:"0.4em",textTransform:"uppercase",color:"#00BFA6",marginBottom:"1rem" }}>5 Years · SoCal</p>
        <h1 style={{ fontSize:"clamp(2rem,5.5vw,3.8rem)",fontWeight:800,letterSpacing:"-0.035em",color:"#fff",lineHeight:1.1,marginBottom:"1.2rem" }}>Our Work</h1>
        <p style={{ fontSize:"clamp(0.85rem,1.4vw,1rem)",color:"#8888A0",maxWidth:560,margin:"0 auto",lineHeight:1.7 }}>Aerial imagery and video across Southern California — residential, commercial, construction, and land.</p>
      </div>

      <div style={{ display:"flex",justifyContent:"center",gap:48,margin:"40px auto 0",padding:"0 24px",borderBottom:"1px solid rgba(255,255,255,0.06)",maxWidth:900 }}>
        {[
          { key:"photo", label:"Aerial Photography", count:ASSETS.filter(a=>a.type==="photo").length },
          { key:"video", label:"Drone Video",        count:ASSETS.filter(a=>a.type==="video").length },
        ].map(({ key, label, count }) => (
          <button key={key} className="ps-tab" onClick={()=>setCategory(key)} style={{ color:category===key?"#fff":"#8888A0" }}>
            {label}
            <span style={{ marginLeft:8,fontSize:"0.7rem",fontWeight:600,color:category===key?"#0077FF":"#555575" }}>{count}</span>
            {category===key&&<div style={{ position:"absolute",bottom:-1,left:0,right:0,height:2,background:"linear-gradient(90deg,#0077FF,#00BFA6)",borderRadius:2 }}/>}
          </button>
        ))}
      </div>

      <div style={{ display:"flex",justifyContent:"center",gap:10,padding:"28px 24px 0",flexWrap:"wrap" }}>
        {tagList.map(tag => {
          const isActive = activeTag === tag;
          const cnt = tag==="All" ? baseAssets.length : baseAssets.filter(a=>a.tags.includes(tag)).length;
          return (
            <button key={tag} className="ps-bubble" onClick={()=>setActiveTag(tag)} style={{ background:isActive?"rgba(0,119,255,0.15)":"rgba(255,255,255,0.04)",color:isActive?"#0077FF":"#8888A0",border:isActive?"1px solid rgba(0,119,255,0.4)":"1px solid rgba(255,255,255,0.08)" }}>
              {tag}<span style={{ marginLeft:6,fontSize:"0.65rem",color:isActive?"rgba(0,119,255,0.7)":"#444460" }}>({cnt})</span>
            </button>
          );
        })}
      </div>

      <div style={{ display:"flex",alignItems:"center",gap:16,maxWidth:1280,margin:"28px auto 0",padding:"0 32px" }}>
        <div style={{ height:1,flex:1,background:"rgba(255,255,255,0.05)" }}/>
        <span style={{ fontFamily:"monospace",fontSize:"0.65rem",letterSpacing:"0.2em",color:"#444460",textTransform:"uppercase" }}>
          {filtered.length} {category==="photo"?"Photos":"Videos"}{activeTag!=="All"?` · ${activeTag}`:""}
        </span>
        <div style={{ height:1,flex:1,background:"rgba(255,255,255,0.05)" }}/>
      </div>

      <div className="ps-grid" style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,maxWidth:1280,margin:"20px auto 0",padding:"0 32px" }}>
        {filtered.map((asset,i) => {
          const h = heights[i % heights.length];
          const handleClick = () => openLightbox(filtered, i);
          return asset.type==="video"
            ? <VideoCard key={asset.id} asset={asset} onClick={handleClick} style={{ height:h }}/>
            : <PhotoCard key={asset.id} asset={asset} onClick={handleClick} style={{ height:h }}/>;
        })}
      </div>

      {lightbox&&<Lightbox assets={lightbox.assets} startIdx={lightbox.startIdx} onClose={()=>setLightbox(null)}/>}
    </div>
  );
}
