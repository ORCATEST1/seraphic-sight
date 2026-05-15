// SpatialShowroom.js v6
// Compact gallery (18w × 36d), flush panels, warm floor-wall glow, visible floor texture

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const CLD = "https://res.cloudinary.com/dpc1noikx";
const cImg = (id, w=1200, h=750) =>
  `${CLD}/image/upload/w_${w},h_${h},c_fill,f_auto,q_auto:good/${id}`;
const cVid = (id) =>
  `${CLD}/video/upload/f_mp4,q_auto:good,vc_h264,w_960/${id}`;

const PHOTOS = [
  { id:"DJI_0915_w53hst",   label:"Aerial Overview",       tag:"Real Estate"  },
  { id:"DJI_0891_tgrszt",   label:"Property Perspective",  tag:"Real Estate"  },
  { id:"DJI_0876_imzqgc",   label:"Residential Aerial",    tag:"Real Estate"  },
  { id:"DJI_0802_cdwyvj",   label:"Commercial Site",       tag:"Commercial"   },
  { id:"DJI_0730_enavrk",   label:"Mixed-Use Dev",         tag:"Commercial"   },
  { id:"DJI_0327_it5brs",   label:"Construction Progress", tag:"Construction" },
  { id:"sola-florance-construction-aerial_oapibr", label:"Sola Florance", tag:"Construction" },
  { id:"DJI_0322_khfwqi",   label:"Site Documentation",    tag:"Construction" },
  { id:"Aerial_27_qw5yqr",  label:"Commercial Aerial",     tag:"Commercial"   },
  { id:"DJI_0872_vddljb",   label:"Listing Photography",   tag:"Real Estate"  },
];

const VIDEOS = [
  { id:"clip_joey_updated_bbfclp", label:"Cinematic Reel",       tag:"Cinematic"   },
  { id:"joe_4_pjcua7",             label:"Property Showcase",    tag:"Real Estate" },
  { id:"clip1_nscwwy",             label:"Interior Walkthrough", tag:"Walkthrough" },
  { id:"part_1_rzf7yo",            label:"Aerial Cinematic",     tag:"Cinematic"   },
  { id:"Copy_of_V1_2_eshjoq",      label:"Listing Video",        tag:"Real Estate" },
  { id:"Copy_of_DJI_0719_rlyiv1",  label:"Drone Flight",         tag:"Drone"       },
];

// ── Canvas textures ──────────────────────────────────────────────────────────
function makeFloorTex() {
  const c = document.createElement("canvas"); c.width=1024; c.height=1024;
  const ctx = c.getContext("2d");
  // Base — dark navy
  ctx.fillStyle="#0B1624"; ctx.fillRect(0,0,1024,1024);
  // Fine grid lines
  ctx.strokeStyle="rgba(40,90,160,0.35)"; ctx.lineWidth=1;
  for(let i=0;i<=1024;i+=64){
    ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,1024);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(1024,i);ctx.stroke();
  }
  // Teal crosshairs at 256-intervals
  ctx.strokeStyle="rgba(0,200,180,0.55)"; ctx.lineWidth=1.5;
  for(let x=0;x<=1024;x+=256) for(let y=0;y<=1024;y+=256){
    ctx.beginPath();ctx.moveTo(x-14,y);ctx.lineTo(x+14,y);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x,y-14);ctx.lineTo(x,y+14);ctx.stroke();
  }
  // Subtle vignette center glow
  const grad=ctx.createRadialGradient(512,512,100,512,512,512);
  grad.addColorStop(0,"rgba(20,60,120,0.15)");
  grad.addColorStop(1,"rgba(0,0,0,0)");
  ctx.fillStyle=grad; ctx.fillRect(0,0,1024,1024);
  return c;
}
function makeLabelTex(title, sub, accent) {
  const c=document.createElement("canvas"); c.width=512; c.height=96;
  const ctx=c.getContext("2d"); ctx.clearRect(0,0,512,96);
  ctx.fillStyle=accent+"22"; ctx.fillRect(0,0,512,96);
  ctx.fillStyle=accent; ctx.fillRect(0,0,4,96);
  ctx.fillStyle="#FFFFFF"; ctx.font="bold 34px Arial"; ctx.textAlign="left"; ctx.fillText(title,16,44);
  ctx.fillStyle="rgba(180,210,255,0.7)"; ctx.font="20px Arial"; ctx.fillText(sub,16,74);
  return c;
}
function makeSectionTex(title, accent) {
  const c=document.createElement("canvas"); c.width=512; c.height=80;
  const ctx=c.getContext("2d"); ctx.clearRect(0,0,512,80);
  ctx.fillStyle="rgba(4,8,18,0.0)"; ctx.fillRect(0,0,512,80);
  ctx.fillStyle=accent; ctx.font="bold 52px Arial"; ctx.textAlign="center"; ctx.fillText(title,256,60);
  return c;
}

// ── Minimap ──────────────────────────────────────────────────────────────────
function Minimap({ px, pz }) {
  const cvs=useRef(null);
  useEffect(()=>{
    if(!cvs.current) return;
    const ctx=cvs.current.getContext("2d");
    ctx.clearRect(0,0,110,110);
    ctx.fillStyle="rgba(4,8,18,0.92)"; ctx.fillRect(0,0,110,110);
    ctx.strokeStyle="rgba(0,100,200,0.35)"; ctx.lineWidth=1; ctx.strokeRect(0,0,110,110);
    // Scale: x=-11..11 (22u) → 0..110, z=-8..38 (46u) → 0..110
    const tx=(x)=>((x+11)/22)*110;
    const tz=(z)=>((z+8)/46)*110;
    // Gallery floor
    ctx.fillStyle="rgba(0,50,120,0.3)";
    ctx.fillRect(tx(-9),tz(0),tx(9)-tx(-9),tz(36)-tz(0));
    // Entry
    ctx.fillStyle="rgba(0,40,100,0.4)";
    ctx.fillRect(tx(-3),tz(-8),tx(3)-tx(-3),tz(0)-tz(-8));
    // Player dot
    const pdx=tx(px), pdz=tz(pz);
    ctx.fillStyle="#00D4FF"; ctx.beginPath(); ctx.arc(pdx,pdz,3.5,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle="#FFF"; ctx.lineWidth=0.8; ctx.beginPath(); ctx.arc(pdx,pdz,3.5,0,Math.PI*2); ctx.stroke();
  },[px,pz]);
  return (
    <div style={{position:"fixed",bottom:16,left:16,zIndex:300,
      border:"1px solid rgba(0,100,200,0.45)",borderRadius:4,overflow:"hidden"}}>
      <canvas ref={cvs} width={110} height={110}/>
      <div style={{position:"absolute",top:3,left:5,fontSize:8,fontFamily:"monospace",
        color:"rgba(0,180,255,0.7)",letterSpacing:"0.1em"}}>MINIMAP</div>
    </div>
  );
}

// ── HUD ──────────────────────────────────────────────────────────────────────
function HUD({ zone, showHelp, setShowHelp }) {
  return (
    <>
      <div style={{position:"fixed",top:22,right:22,zIndex:200,fontFamily:"monospace",fontSize:10,
        letterSpacing:"0.16em",color:"rgba(0,200,255,0.9)",textTransform:"uppercase",
        background:"rgba(4,8,20,0.8)",padding:"5px 12px",
        border:"1px solid rgba(0,140,255,0.25)",borderRadius:3,backdropFilter:"blur(8px)"}}>
        1F &nbsp;&middot;&nbsp; {zone}
      </div>
      {/* Crosshair */}
      <svg style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
        zIndex:200,pointerEvents:"none",opacity:0.65}} width={24} height={24}>
        <line x1={12} y1={2}  x2={12} y2={9}  stroke="#00D4FF" strokeWidth={1.5}/>
        <line x1={12} y1={15} x2={12} y2={22} stroke="#00D4FF" strokeWidth={1.5}/>
        <line x1={2}  y1={12} x2={9}  y2={12} stroke="#00D4FF" strokeWidth={1.5}/>
        <line x1={15} y1={12} x2={22} y2={12} stroke="#00D4FF" strokeWidth={1.5}/>
      </svg>
      {/* Side buttons */}
      {[{l:"SHARE",i:"↗",top:110},{l:"INFO",i:"i",top:158}].map(b=>(
        <button key={b.l} onClick={b.l==="INFO"?()=>setShowHelp(h=>!h):null} style={{
          position:"fixed",right:0,zIndex:300,top:b.top,
          background:"rgba(120,0,0,0.88)",border:"none",borderBottom:"1px solid rgba(255,255,255,0.1)",
          color:"#fff",cursor:"pointer",writingMode:"vertical-rl",
          padding:"10px 7px",fontFamily:"monospace",fontSize:8,letterSpacing:"0.12em"}}>{b.i} {b.l}</button>
      ))}
      {showHelp && (
        <div style={{position:"fixed",right:44,top:105,zIndex:300,background:"rgba(3,6,14,0.96)",
          border:"1px solid rgba(0,100,255,0.2)",borderRadius:6,padding:"14px 18px",
          fontFamily:"monospace",color:"rgba(200,220,255,0.8)",fontSize:11,lineHeight:1.9,minWidth:200}}>
          <div style={{color:"#00D4FF",marginBottom:6,letterSpacing:"0.12em"}}>CONTROLS</div>
          <div>W A S D — Move</div><div>Mouse — Look</div>
          <div>Click panel — Full view</div><div>ESC — Release</div>
          <button onClick={()=>setShowHelp(false)} style={{marginTop:10,background:"none",
            border:"1px solid rgba(255,255,255,0.12)",color:"rgba(160,190,255,0.6)",
            cursor:"pointer",borderRadius:3,padding:"3px 10px",fontFamily:"monospace",fontSize:10}}>CLOSE</button>
        </div>
      )}
    </>
  );
}

// ── Modal ────────────────────────────────────────────────────────────────────
function PanelModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:500,
      background:"rgba(1,3,8,0.94)",backdropFilter:"blur(18px)",
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"rgba(5,9,20,0.99)",
        border:"1px solid rgba(0,100,255,0.2)",borderRadius:10,padding:22,
        maxWidth:"88vw",maxHeight:"88vh",display:"flex",flexDirection:"column",alignItems:"center"}}>
        {item.type==="photo"
          ? <img src={cImg(item.id,1400,900)} alt={item.label}
              style={{maxWidth:"100%",maxHeight:"72vh",objectFit:"contain",borderRadius:6}}/>
          : <video src={cVid(item.id)} autoPlay muted loop playsInline controls
              style={{maxWidth:"100%",maxHeight:"72vh",borderRadius:6}}/>}
        <div style={{marginTop:14,color:"#D8E8FF",fontFamily:"monospace",fontSize:13,letterSpacing:"0.06em"}}>
          {item.label} <span style={{color:"rgba(0,150,255,0.7)"}}>· {item.tag}</span>
        </div>
        <button onClick={onClose} style={{marginTop:12,background:"rgba(255,255,255,0.04)",
          border:"1px solid rgba(255,255,255,0.12)",color:"rgba(180,210,255,0.7)",
          cursor:"pointer",borderRadius:4,padding:"5px 18px",fontFamily:"monospace",fontSize:10}}>CLOSE</button>
      </div>
    </div>
  );
}

// ── Onboarding ───────────────────────────────────────────────────────────────
function Onboarding({ onStart }) {
  const [phase,setPhase]=useState("hello");
  const [prog,setProg]=useState(0);
  useEffect(()=>{
    if(phase==="hello"){const t=setTimeout(()=>setPhase("enter"),1800);return()=>clearTimeout(t);}
    if(phase==="loading"){
      let p=0;
      const iv=setInterval(()=>{
        p+=Math.random()*16+5;
        if(p>=100){p=100;clearInterval(iv);setTimeout(()=>onStart(),300);}
        setProg(Math.min(100,p));
      },70);
      return()=>clearInterval(iv);
    }
  },[phase,onStart]);
  const base={position:"fixed",inset:0,zIndex:999,display:"flex",flexDirection:"column",
    alignItems:"center",justifyContent:"center",
    background:"radial-gradient(ellipse 110% 100% at 50% 0%,#060E20 0%,#010306 75%)",
    fontFamily:"monospace"};
  if(phase==="hello") return (
    <div style={base}>
      <div style={{fontSize:44,letterSpacing:"0.4em",color:"#00C8FF",animation:"pls 1.6s ease-in-out infinite"}}>SERAPHIC</div>
      <div style={{fontSize:12,letterSpacing:"0.55em",color:"rgba(0,160,255,0.45)",marginTop:6}}>SIGHT · SHOWROOM</div>
      <style>{`@keyframes pls{0%,100%{opacity:0.6}50%{opacity:1}}`}</style>
    </div>
  );
  if(phase==="enter") return (
    <div style={base}>
      <div style={{fontSize:11,letterSpacing:"0.4em",color:"rgba(0,190,255,0.55)",marginBottom:36,textTransform:"uppercase"}}>Virtual Gallery</div>
      <button onClick={()=>setPhase("loading")} style={{
        background:"linear-gradient(135deg,#0055CC,#00AAA0)",border:"none",color:"#fff",
        cursor:"pointer",borderRadius:6,padding:"14px 56px",fontFamily:"monospace",
        fontSize:13,letterSpacing:"0.22em",boxShadow:"0 0 32px rgba(0,100,220,0.4)"}}>
        ENTER GALLERY
      </button>
      <div style={{marginTop:20,fontSize:9,color:"rgba(130,160,210,0.45)",letterSpacing:"0.18em"}}>
        WASD · MOUSE LOOK · CLICK TO INSPECT
      </div>
    </div>
  );
  return (
    <div style={base}>
      <div style={{fontSize:10,letterSpacing:"0.4em",color:"rgba(0,190,255,0.6)",marginBottom:18,textTransform:"uppercase"}}>Loading Gallery</div>
      <div style={{width:260,height:1,background:"rgba(255,255,255,0.06)",borderRadius:1}}>
        <div style={{height:"100%",borderRadius:1,background:"linear-gradient(90deg,#0055CC,#00BFA6)",
          width:`${prog}%`,transition:"width 0.07s linear",boxShadow:"0 0 8px rgba(0,140,200,0.8)"}}/>
      </div>
      <div style={{marginTop:10,fontSize:9,color:"rgba(0,180,255,0.4)",letterSpacing:"0.22em"}}>{Math.round(prog)}%</div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function SpatialShowroom() {
  const mountRef=useRef(null);
  const [started,setStarted]=useState(false);
  const [pos,setPos]=useState([0,-5]);
  const [zone,setZone]=useState("ENTRY HALL");
  const [modal,setModal]=useState(null);
  const [showHelp,setShowHelp]=useState(false);

  useEffect(()=>{
    if(!started) return;
    const el=mountRef.current; if(!el) return;

    // ── Renderer ─────────────────────────────────────────────────
    const renderer=new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.toneMapping=THREE.LinearToneMapping;
    renderer.toneMappingExposure=1.0;
    el.appendChild(renderer.domElement);

    const scene=new THREE.Scene();
    scene.background=new THREE.Color(0x060E1C);
    scene.fog=new THREE.Fog(0x060E1C,30,80);

    const camera=new THREE.PerspectiveCamera(72,window.innerWidth/window.innerHeight,0.1,100);
    camera.position.set(0,1.65,-6);
    camera.lookAt(0,1.65,0);

    // ── Floor texture ─────────────────────────────────────────────
    const floorTex=new THREE.CanvasTexture(makeFloorTex());
    floorTex.wrapS=floorTex.wrapT=THREE.RepeatWrapping;
    floorTex.repeat.set(4,10);

    // ── Geometry helpers ──────────────────────────────────────────
    const basic=(color,opts={})=>new THREE.MeshBasicMaterial({color,...opts});
    const emissive=(color,em,ei=1.5)=>new THREE.MeshStandardMaterial({
      color,emissive:new THREE.Color(em),emissiveIntensity:ei,roughness:0.2,metalness:0.3});

    function box(px,py,pz,w,h,d,mat){
      const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
      m.position.set(px,py,pz); scene.add(m); return m;
    }
    function plane(px,py,pz,w,d,mat,rotX=-Math.PI/2){
      const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat);
      m.rotation.x=rotX; m.position.set(px,py,pz); scene.add(m); return m;
    }

    // ─────────────────────────────────────────────────────────────
    // LAYOUT
    // Entry corridor: x=-3..3, z=-8..0
    // Gallery:        x=-9..9, z=0..36
    // Photos: LEFT wall x=-9   (facing +x)
    // Videos: RIGHT wall x=+9  (facing -x)
    // ─────────────────────────────────────────────────────────────
    const GW=18, GD=36, GH=4.8;           // gallery width, depth, height
    const EW=6,  ED=8;                    // entry width, depth
    const LX=-9.0, RX=9.0;               // left/right wall x

    // FLOOR
    plane(0,0,GD/2, GW,GD, new THREE.MeshBasicMaterial({map:floorTex}));
    plane(0,0,-ED/2, EW,ED, new THREE.MeshBasicMaterial({map:floorTex,color:0x8AAABB}));

    // CEILING
    box(0,GH,GD/2,    GW,0.2,GD, basic(0x0E1C30));  // gallery ceiling
    box(0,GH,-ED/2,   EW,0.2,ED, basic(0x0E1C30));  // entry ceiling

    // WALLS — all MeshBasicMaterial, solid visible color
    const wallC=0x1C2F4A;
    // LEFT gallery wall (panels mounted here)
    box(LX, GH/2, GD/2,  0.12, GH, GD, basic(wallC));
    // RIGHT gallery wall
    box(RX, GH/2, GD/2,  0.12, GH, GD, basic(wallC));
    // FAR end wall
    box(0,  GH/2, GD+0.06, GW, GH, 0.12, basic(wallC));
    // ENTRY back wall
    box(0,  GH/2, -ED-0.06, EW, GH, 0.12, basic(wallC));
    // ENTRY side walls
    box(-EW/2-0.06, GH/2, -ED/2, 0.12, GH, ED, basic(wallC));
    box( EW/2+0.06, GH/2, -ED/2, 0.12, GH, ED, basic(wallC));
    // CONNECTOR walls: entry-to-gallery shoulder walls at z=0
    // Left shoulder (from entry left wall to gallery left wall)
    box(-(LX+EW/2)/2, GH/2, 0, Math.abs(LX)-EW/2, GH, 0.12, basic(wallC));
    // Right shoulder
    box( (LX+EW/2)/2, GH/2, 0, Math.abs(LX)-EW/2, GH, 0.12, basic(wallC));

    // ── FLOOR-WALL GLOW STRIP ────────────────────────────────────
    // Warm amber strip right at base of left + right walls (like reference)
    const glowMat=emissive(0xFFAA55,0xFF8822,3.0);
    box(LX+0.07, 0.04, GD/2, 0.04, 0.08, GD, glowMat.clone()); // left wall base
    box(RX-0.07, 0.04, GD/2, 0.04, 0.08, GD, glowMat.clone()); // right wall base
    // Subtler blue glow on ceiling edge
    const ceilGlowMat=emissive(0x1155EE,0x0033AA,2.0);
    box(LX+0.07, GH-0.06, GD/2, 0.04, 0.06, GD, ceilGlowMat.clone());
    box(RX-0.07, GH-0.06, GD/2, 0.04, 0.06, GD, ceilGlowMat.clone());
    // Entry arch glow
    const archMat=emissive(0x0077EE,0x0044BB,2.5);
    box(-EW/2+0.07, GH/2, 0.06, 0.06, GH, 0.06, archMat.clone());
    box( EW/2-0.07, GH/2, 0.06, 0.06, GH, 0.06, archMat.clone());
    box(0, GH-0.04, 0.06, EW, 0.06, 0.06, archMat.clone());

    // ── CEILING LIGHT FIXTURES ────────────────────────────────────
    // Ceiling light strips and point lights
    [4,10,16,22,28,34].forEach(z=>{
      // Two strips across width
      box(-4,GH-0.09,z, 5,0.06,0.08, emissive(0xFFFFEE,0xFFDDAA,2.5));
      box( 4,GH-0.09,z, 5,0.06,0.08, emissive(0xFFFFEE,0xFFDDAA,2.5));
      // Point light
      const pl=new THREE.PointLight(0xFFEEDD,3.5,22);
      pl.position.set(0,GH-0.3,z); scene.add(pl);
    });
    // Entry lights
    [-6,-2].forEach(z=>{
      const pl=new THREE.PointLight(0xFFEEDD,3.0,10);
      pl.position.set(0,GH-0.4,z); scene.add(pl);
    });
    // Floor-level warm fill from glow strips
    [4,12,20,28].forEach(z=>{
      const pl=new THREE.PointLight(0xFF9944,1.8,8);
      pl.position.set(LX+1,0.2,z); scene.add(pl);
      const pr=new THREE.PointLight(0xFF9944,1.8,8);
      pr.position.set(RX-1,0.2,z); scene.add(pr);
    });
    // Ambient fill
    scene.add(new THREE.AmbientLight(0xCCDDFF,0.35));

    // ── SECTION SIGNS ─────────────────────────────────────────────
    const signMat=(text,accent)=>{
      const tex=new THREE.CanvasTexture(makeSectionTex(text,accent));
      return new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide});
    };
    // Photo sign on left wall, near entrance
    {
      const m=new THREE.Mesh(new THREE.PlaneGeometry(5,0.7),signMat("PHOTO GALLERY","#4499FF"));
      m.position.set(LX+0.1, GH-0.6, 2); m.rotation.y=Math.PI/2; scene.add(m);
    }
    {
      const m=new THREE.Mesh(new THREE.PlaneGeometry(5,0.7),signMat("VIDEO GALLERY","#00CCAA"));
      m.position.set(RX-0.1, GH-0.6, 2); m.rotation.y=-Math.PI/2; scene.add(m);
    }

    // ── PANELS ────────────────────────────────────────────────────
    const hotspots=[];
    const loader=new THREE.TextureLoader(); loader.crossOrigin="anonymous";
    // Panel dimensions: 16:10 ratio, fits 2 rows on 4.8m wall
    const PW=3.6, PH=2.1;
    const ZGAP=4.2;
    const YU=3.2, YL=1.1;

    // Helper: add photo panel on left wall
    function addPhotoPanel(ph,y,z){
      const tex=loader.load(cImg(ph.id,840,560));
      tex.colorSpace=THREE.SRGBColorSpace;
      // Screen flush to wall
      const sc=new THREE.Mesh(new THREE.PlaneGeometry(PW,PH),
        new THREE.MeshBasicMaterial({map:tex}));
      sc.position.set(LX+0.07,y,z); sc.rotation.y=Math.PI/2; scene.add(sc);
      // Thin border
      const border=new THREE.Mesh(new THREE.PlaneGeometry(PW+0.12,PH+0.12),
        new THREE.MeshBasicMaterial({color:0x1A3060,transparent:true,opacity:0.9}));
      border.position.set(LX+0.05,y,z); border.rotation.y=Math.PI/2; scene.add(border);
      // Top glow bar
      const glow=new THREE.Mesh(new THREE.PlaneGeometry(PW,0.04),
        new THREE.MeshStandardMaterial({color:0x3366FF,emissive:new THREE.Color(0x1144DD),emissiveIntensity:3}));
      glow.position.set(LX+0.08,y+PH/2+0.04,z); glow.rotation.y=Math.PI/2; scene.add(glow);
      // Label below
      const lt=new THREE.CanvasTexture(makeLabelTex(ph.label,ph.tag,"#4488FF"));
      const lb=new THREE.Mesh(new THREE.PlaneGeometry(PW,0.55),
        new THREE.MeshBasicMaterial({map:lt,transparent:true}));
      lb.position.set(LX+0.08,y-PH/2-0.36,z); lb.rotation.y=Math.PI/2; scene.add(lb);
      // Spotlight
      const sl=new THREE.SpotLight(0xFFFFFF,5.0,14,Math.PI/9,0.4);
      sl.position.set(LX+5,y+1.5,z); sl.target.position.set(LX+0.1,y,z);
      scene.add(sl); scene.add(sl.target);
      sc.userData={type:"photo",...ph}; hotspots.push(sc);
    }

    // Helper: add video panel on right wall
    function addVideoPanel(vid,y,z){
      const videoEl=document.createElement("video");
      videoEl.src=cVid(vid.id); videoEl.loop=true; videoEl.muted=true;
      videoEl.playsInline=true; videoEl.crossOrigin="anonymous"; videoEl.autoplay=true;
      videoEl.play().catch(()=>{});
      const vTex=new THREE.VideoTexture(videoEl);
      vTex.colorSpace=THREE.SRGBColorSpace;
      const sc=new THREE.Mesh(new THREE.PlaneGeometry(PW,PH),
        new THREE.MeshBasicMaterial({map:vTex}));
      sc.position.set(RX-0.07,y,z); sc.rotation.y=-Math.PI/2; scene.add(sc);
      const border=new THREE.Mesh(new THREE.PlaneGeometry(PW+0.12,PH+0.12),
        new THREE.MeshBasicMaterial({color:0x0A2020,transparent:true,opacity:0.9}));
      border.position.set(RX-0.05,y,z); border.rotation.y=-Math.PI/2; scene.add(border);
      const glow=new THREE.Mesh(new THREE.PlaneGeometry(PW,0.04),
        new THREE.MeshStandardMaterial({color:0x00CCAA,emissive:new THREE.Color(0x00AA88),emissiveIntensity:3}));
      glow.position.set(RX-0.08,y+PH/2+0.04,z); glow.rotation.y=-Math.PI/2; scene.add(glow);
      const lt=new THREE.CanvasTexture(makeLabelTex(vid.label,vid.tag,"#00BBAA"));
      const lb=new THREE.Mesh(new THREE.PlaneGeometry(PW,0.55),
        new THREE.MeshBasicMaterial({map:lt,transparent:true}));
      lb.position.set(RX-0.08,y-PH/2-0.36,z); lb.rotation.y=-Math.PI/2; scene.add(lb);
      const sl=new THREE.SpotLight(0xFFFFFF,5.0,14,Math.PI/9,0.4);
      sl.position.set(RX-5,y+1.5,z); sl.target.position.set(RX-0.1,y,z);
      scene.add(sl); scene.add(sl.target);
      sc.userData={type:"video",...vid}; hotspots.push(sc);
    }

    // Place panels: 2 rows (upper/lower), columns along Z
    PHOTOS.forEach((ph,i)=>{
      const col=i%2, row=Math.floor(i/2);
      addPhotoPanel(ph, col===0?YU:YL, 1.5+row*ZGAP);
    });
    VIDEOS.forEach((vid,i)=>{
      const col=i%2, row=Math.floor(i/2);
      addVideoPanel(vid, col===0?YU:YL, 1.5+row*ZGAP);
    });

    // ── CONTROLS ──────────────────────────────────────────────────
    const keys={};
    const euler=new THREE.Euler(0,0,0,"YXZ");
    let locked=false;
    const onKeyDown=e=>{ keys[e.code]=true; };
    const onKeyUp=e=>{ keys[e.code]=false; };
    const onMove=e=>{
      if(!locked) return;
      euler.setFromQuaternion(camera.quaternion);
      euler.y-=e.movementX*.0018; euler.x-=e.movementY*.0018;
      euler.x=Math.max(-Math.PI*.32,Math.min(Math.PI*.32,euler.x));
      camera.quaternion.setFromEuler(euler);
    };
    const onLock=()=>{locked=document.pointerLockElement===renderer.domElement;};
    const raycaster=new THREE.Raycaster();
    const onClick=()=>{
      if(!locked){renderer.domElement.requestPointerLock();return;}
      raycaster.setFromCamera({x:0,y:0},camera);
      const hits=raycaster.intersectObjects(hotspots);
      if(hits.length>0) setModal(hits[0].object.userData);
    };
    window.addEventListener("keydown",onKeyDown);
    window.addEventListener("keyup",onKeyUp);
    document.addEventListener("mousemove",onMove);
    document.addEventListener("pointerlockchange",onLock);
    renderer.domElement.addEventListener("click",onClick);

    const fwd=new THREE.Vector3(),right=new THREE.Vector3();
    const SPEED=0.09;
    const getZone=p=>{
      if(p.z<0) return "ENTRY HALL";
      if(p.x<-2) return "PHOTO GALLERY";
      if(p.x>2)  return "VIDEO GALLERY";
      if(p.z>32) return "GALLERY END";
      return "MAIN GALLERY";
    };

    let rafId;
    const tick=()=>{
      rafId=requestAnimationFrame(tick);
      camera.getWorldDirection(fwd); fwd.y=0; fwd.normalize();
      right.crossVectors(fwd,new THREE.Vector3(0,1,0)).normalize();
      const vel=new THREE.Vector3();
      if(keys["KeyW"]||keys["ArrowUp"])    vel.add(fwd);
      if(keys["KeyS"]||keys["ArrowDown"])  vel.sub(fwd);
      if(keys["KeyA"]||keys["ArrowLeft"])  vel.sub(right);
      if(keys["KeyD"]||keys["ArrowRight"]) vel.add(right);
      if(vel.length()>0){
        vel.normalize().multiplyScalar(SPEED);
        camera.position.x=Math.max(-8.5,Math.min(8.5, camera.position.x+vel.x));
        camera.position.z=Math.max(-7.5,Math.min(35.5,camera.position.z+vel.z));
        camera.position.y=1.65;
      }
      setPos([Math.round(camera.position.x*10)/10, Math.round(camera.position.z*10)/10]);
      setZone(getZone(camera.position));
      renderer.render(scene,camera);
    };
    tick();

    const onResize=()=>{
      camera.aspect=window.innerWidth/window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth,window.innerHeight);
    };
    window.addEventListener("resize",onResize);

    return()=>{
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown",onKeyDown);
      window.removeEventListener("keyup",onKeyUp);
      document.removeEventListener("mousemove",onMove);
      document.removeEventListener("pointerlockchange",onLock);
      renderer.domElement.removeEventListener("click",onClick);
      window.removeEventListener("resize",onResize);
      if(document.pointerLockElement) document.exitPointerLock();
      renderer.dispose();
      if(el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  },[started]);

  return (
    <div style={{width:"100vw",height:"100vh",overflow:"hidden",background:"#060E1C"}}>
      {!started && <Onboarding onStart={()=>setStarted(true)}/>}
      <div ref={mountRef} style={{width:"100%",height:"100%",display:started?"block":"none"}}/>
      {started && (
        <>
          <Minimap px={pos[0]} pz={pos[1]}/>
          <HUD zone={zone} showHelp={showHelp} setShowHelp={setShowHelp}/>
          <PanelModal item={modal} onClose={()=>setModal(null)}/>
          <div style={{position:"fixed",bottom:46,left:"50%",transform:"translateX(-50%)",
            fontFamily:"monospace",fontSize:10,letterSpacing:"0.2em",
            color:"rgba(0,180,255,0.35)",textTransform:"uppercase",pointerEvents:"none",zIndex:200}}>
            Click canvas · WASD to move · ESC to release
          </div>
        </>
      )}
    </div>
  );
}
