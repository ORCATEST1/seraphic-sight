// SpatialShowroom.js v2 — Seraphic Sight 3D Gallery
// High-tech dark showroom with real Cloudinary photo + video textures.
// Architecture: central corridor, photo wing left, video wing right, contact end.

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// ─── CLOUDINARY ───────────────────────────────────────────────────────────────
const CLD = "https://res.cloudinary.com/dpc1noikx";
const cImg = (id, w=1200, h=750) =>
  `${CLD}/image/upload/w_${w},h_${h},c_fill,f_auto,q_auto:good/${id}`;
const cVid = (id) =>
  `${CLD}/video/upload/f_mp4,q_auto:good,vc_h264,w_960/${id}`;

const PHOTOS = [
  { id:"DJI_0915_w53hst",   label:"Aerial Overview",        tag:"Real Estate"  },
  { id:"DJI_0891_tgrszt",   label:"Property Perspective",   tag:"Real Estate"  },
  { id:"DJI_0876_imzqgc",   label:"Residential Aerial",     tag:"Real Estate"  },
  { id:"DJI_0802_cdwyvj",   label:"Commercial Site",        tag:"Commercial"   },
  { id:"DJI_0730_enavrk",   label:"Mixed-Use Development",  tag:"Commercial"   },
  { id:"DJI_0327_it5brs",   label:"Construction Progress",  tag:"Construction" },
  { id:"sola-florance-construction-aerial_oapibr", label:"Sola Florance", tag:"Construction" },
  { id:"DJI_0322_khfwqi",   label:"Site Documentation",     tag:"Construction" },
  { id:"Aerial_27_qw5yqr",  label:"Commercial Aerial",      tag:"Commercial"   },
  { id:"DJI_0872_vddljb",   label:"Listing Photography",    tag:"Real Estate"  },
];

const VIDEOS = [
  { id:"clip_joey_updated_bbfclp", label:"Cinematic Reel",       tag:"Cinematic"   },
  { id:"joe_4_pjcua7",             label:"Property Showcase",    tag:"Real Estate" },
  { id:"clip1_nscwwy",             label:"Interior Walkthrough", tag:"Walkthrough" },
  { id:"part_1_rzf7yo",            label:"Aerial Cinematic",     tag:"Cinematic"   },
  { id:"Copy_of_V1_2_eshjoq",      label:"Listing Video",        tag:"Real Estate" },
  { id:"Copy_of_DJI_0719_rlyiv1",  label:"Drone Flight",         tag:"Drone"       },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function makeFloorTex() {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 512;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#060810";
  ctx.fillRect(0,0,512,512);
  // Grid lines
  ctx.strokeStyle = "rgba(0,119,255,0.08)";
  ctx.lineWidth = 1;
  for (let i=0;i<=512;i+=32) {
    ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,512); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(512,i); ctx.stroke();
  }
  // Accent cross-hairs at grid intersections
  ctx.strokeStyle = "rgba(0,191,166,0.12)";
  ctx.lineWidth = 1;
  for (let x=0;x<=512;x+=128) for (let y=0;y<=512;y+=128) {
    ctx.beginPath(); ctx.moveTo(x-6,y); ctx.lineTo(x+6,y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x,y-6); ctx.lineTo(x,y+6); ctx.stroke();
  }
  return c;
}

function makeLabelTex(title, sub, accent="#0077FF") {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 128;
  const ctx = c.getContext("2d");
  ctx.clearRect(0,0,512,128);
  // Tag pill
  ctx.fillStyle = accent + "22";
  ctx.roundRect(0, 0, 512, 128, 8);
  ctx.fill();
  ctx.strokeStyle = accent + "55";
  ctx.lineWidth = 1;
  ctx.roundRect(0.5, 0.5, 511, 127, 8);
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.font = "bold 38px Arial";
  ctx.textAlign = "center";
  ctx.fillText(title, 256, 58);
  ctx.fillStyle = "rgba(180,180,200,0.65)";
  ctx.font = "22px Arial";
  ctx.fillText(sub, 256, 96);
  return c;
}

function makeSectionTex(title, accent="#0077FF") {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 128;
  const ctx = c.getContext("2d");
  ctx.clearRect(0,0,1024,128);
  ctx.fillStyle = accent;
  ctx.font = "bold 72px Arial";
  ctx.textAlign = "left";
  ctx.letterSpacing = "8px";
  ctx.fillText(title.toUpperCase(), 24, 96);
  return c;
}

// ─── ONBOARDING ──────────────────────────────────────────────────────────────
function Onboarding({ onStart }) {
  const [phase, setPhase] = useState("hello");
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (phase === "hello") {
      const t = setTimeout(() => setPhase("mode"), 2000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "loading") {
      let p = 0;
      const iv = setInterval(() => {
        p += Math.random() * 7 + 3;
        if (p >= 100) { p = 100; clearInterval(iv); setTimeout(() => setPhase("ready"), 500); }
        setProgress(Math.min(100, p));
      }, 50);
      return () => clearInterval(iv);
    }
  }, [phase]);

  const enter = () => { setFading(true); setTimeout(onStart, 600); };

  const wrap = {
    position:"fixed", inset:0, zIndex:1000,
    background:"radial-gradient(ellipse 100% 100% at 50% 0%, #08122A 0%, #020408 70%)",
    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
    fontFamily:"'Arial',sans-serif", transition:"opacity 0.6s",
    opacity: fading ? 0 : 1, pointerEvents: fading ? "none" : "all",
  };

  if (phase==="hello") return (
    <div style={wrap}>
      <style>{`@keyframes helloIn{from{opacity:0;transform:scale(.8) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
      <div style={{ fontSize:"clamp(3rem,12vw,8rem)", fontWeight:900, letterSpacing:".3em",
        color:"#fff", textTransform:"uppercase", animation:"helloIn .9s cubic-bezier(.2,.8,.3,1) both" }}>
        HELLO
      </div>
      <div style={{ marginTop:16, fontSize:".7rem", letterSpacing:".4em", color:"rgba(0,191,166,.5)", textTransform:"uppercase" }}>
        SERAPHIC SIGHT · SHOWROOM
      </div>
    </div>
  );

  if (phase==="mode") return (
    <div style={wrap}>
      <p style={{ color:"rgba(0,191,166,.7)", fontSize:".65rem", letterSpacing:".4em",
        textTransform:"uppercase", marginBottom:40 }}>SELECT NAVIGATION MODE</p>
      <div style={{ display:"flex", gap:20 }}>
        {[
          { id:"normal", label:"NORMAL", sub:"WASD + Mouse Look", hint:"Click canvas to lock cursor" },
          { id:"easy",   label:"EASY",   sub:"Click Panels",       hint:"Teleport between exhibits" },
        ].map(m => (
          <button key={m.id} onClick={() => setPhase("loading")}
            style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(0,119,255,.2)",
              borderRadius:12, padding:"32px 44px", cursor:"pointer", color:"#fff",
              textAlign:"center", transition:"all .2s", outline:"none" }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,119,255,.1)"; e.currentTarget.style.borderColor="rgba(0,119,255,.5)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.03)"; e.currentTarget.style.borderColor="rgba(0,119,255,.2)";}}>
            <div style={{ fontSize:"1.5rem", fontWeight:900, letterSpacing:".08em", marginBottom:8 }}>{m.label}</div>
            <div style={{ fontSize:".72rem", color:"#0077FF", letterSpacing:".12em", marginBottom:6 }}>{m.sub}</div>
            <div style={{ fontSize:".6rem", color:"rgba(255,255,255,.35)" }}>{m.hint}</div>
          </button>
        ))}
      </div>
    </div>
  );

  if (phase==="loading") return (
    <div style={wrap}>
      <p style={{ color:"rgba(0,191,166,.6)", fontSize:".62rem", letterSpacing:".4em",
        textTransform:"uppercase", marginBottom:28 }}>LOADING SHOWROOM</p>
      <div style={{ width:300, height:2, background:"rgba(255,255,255,.07)", borderRadius:2 }}>
        <div style={{ height:"100%", width:`${progress}%`,
          background:"linear-gradient(90deg,#0077FF,#00BFA6)",
          boxShadow:"0 0 14px rgba(0,191,166,.6)", transition:"width .06s linear",
          borderRadius:2 }} />
      </div>
      <p style={{ marginTop:14, color:"rgba(255,255,255,.2)", fontSize:".58rem",
        fontFamily:"monospace", letterSpacing:".15em" }}>{Math.floor(progress).toString().padStart(3,"0")}%</p>
    </div>
  );

  return (
    <div style={wrap}>
      <p style={{ color:"rgba(0,191,166,.6)", fontSize:".62rem", letterSpacing:".4em",
        textTransform:"uppercase", marginBottom:24 }}>READY</p>
      <h1 style={{ fontSize:"clamp(2rem,5vw,4rem)", fontWeight:900, color:"#fff",
        letterSpacing:"-.02em", marginBottom:16 }}>Welcome.</h1>
      <p style={{ color:"rgba(180,180,200,.55)", fontSize:".85rem", marginBottom:36,
        textAlign:"center", maxWidth:380, lineHeight:1.75 }}>
        Walk through our aerial imaging gallery. Click exhibits to explore services and see our work.
      </p>
      <div style={{ display:"flex", gap:20, marginBottom:40, fontSize:".6rem",
        color:"rgba(255,255,255,.25)", letterSpacing:".18em", textTransform:"uppercase" }}>
        <span>WASD Move</span><span style={{color:"rgba(255,255,255,.1)"}}>·</span>
        <span>Mouse Look</span><span style={{color:"rgba(255,255,255,.1)"}}>·</span>
        <span>Click Panels</span>
      </div>
      <button onClick={enter} style={{
        background:"linear-gradient(135deg,#0077FF,#00BFA6)",
        border:"none", borderRadius:8, padding:"16px 56px", color:"#fff",
        fontSize:".85rem", fontWeight:700, letterSpacing:".15em",
        textTransform:"uppercase", cursor:"pointer",
        boxShadow:"0 0 40px rgba(0,119,255,.35), 0 0 80px rgba(0,191,166,.15)",
      }}>ENTER SHOWROOM</button>
    </div>
  );
}

// ─── MINIMAP ─────────────────────────────────────────────────────────────────
function Minimap({ px, pz }) {
  const ref = useRef(null);
  const W=160, H=120;
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle="rgba(4,6,14,.9)";
    ctx.fillRect(0,0,W,H);
    // Corridor
    const sc=1.2, ox=W/2-px*sc, oy=H/2-pz*sc;
    const rooms=[
      {x:-14,z:0,w:28,h:10,label:"ENTRY"},
      {x:-14,z:10,w:4,h:60,label:"PHOTO"},
      {x:10,z:10,w:4,h:60,label:"VIDEO"},
      {x:-10,z:10,w:20,h:6,label:"CORR"},
      {x:-10,z:70,w:20,h:14,label:"CONTACT"},
    ];
    rooms.forEach(r=>{
      ctx.fillStyle="rgba(0,119,255,.06)";
      ctx.fillRect(r.x*sc+ox, r.z*sc+oy, r.w*sc, r.h*sc);
      ctx.strokeStyle="rgba(0,119,255,.25)";
      ctx.lineWidth=1;
      ctx.strokeRect(r.x*sc+ox, r.z*sc+oy, r.w*sc, r.h*sc);
    });
    // Player
    const dx=W/2, dy=H/2;
    ctx.beginPath(); ctx.arc(dx,dy,4,0,Math.PI*2);
    ctx.fillStyle="#0077FF"; ctx.fill();
    ctx.beginPath(); ctx.arc(dx,dy,8,0,Math.PI*2);
    ctx.strokeStyle="rgba(0,119,255,.4)"; ctx.lineWidth=1; ctx.stroke();
  },[px,pz]);
  return (
    <canvas ref={ref} width={W} height={H} style={{
      position:"fixed", bottom:24, left:24, zIndex:100, borderRadius:6,
      border:"1px solid rgba(0,119,255,.2)",
      boxShadow:"0 0 20px rgba(0,119,255,.12)",
    }}/>
  );
}

// ─── HUD ─────────────────────────────────────────────────────────────────────
function HUD({ zone, showHelp, setShowHelp }) {
  return (
    <>
      {/* Zone label */}
      <div style={{ position:"fixed", top:24, right:24, zIndex:100,
        fontFamily:"monospace", textAlign:"right", pointerEvents:"none" }}>
        <div style={{ fontSize:"1.2rem", fontWeight:900, color:"#fff",
          letterSpacing:".08em" }}>1F</div>
        <div style={{ fontSize:".6rem", letterSpacing:".25em",
          color:"rgba(0,191,166,.55)", marginTop:2, textTransform:"uppercase" }}>{zone}</div>
      </div>

      {/* Crosshair */}
      <div style={{ position:"fixed", top:"50%", left:"50%",
        transform:"translate(-50%,-50%)", zIndex:100, pointerEvents:"none" }}>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <line x1="12" y1="2" x2="12" y2="9"  stroke="rgba(255,255,255,.4)" strokeWidth="1.2"/>
          <line x1="12" y1="15" x2="12" y2="22" stroke="rgba(255,255,255,.4)" strokeWidth="1.2"/>
          <line x1="2"  y1="12" x2="9"  y2="12" stroke="rgba(255,255,255,.4)" strokeWidth="1.2"/>
          <line x1="15" y1="12" x2="22" y2="12" stroke="rgba(255,255,255,.4)" strokeWidth="1.2"/>
          <circle cx="12" cy="12" r="1.8" fill="rgba(255,255,255,.55)"/>
        </svg>
      </div>

      {/* Right panel */}
      <div style={{ position:"fixed", right:0, top:"50%", transform:"translateY(-50%)",
        zIndex:100, display:"flex", flexDirection:"column" }}>
        {[{l:"SHARE",i:"↗"},{l:"SOUND",i:"♪"},{l:"INFO",i:"i",cb:()=>setShowHelp(v=>!v)}].map(b=>(
          <button key={b.l} onClick={b.cb}
            style={{ background:"rgba(180,0,0,.8)", border:"none", borderBottom:"1px solid rgba(255,255,255,.1)",
              color:"#fff", writingMode:"vertical-rl", padding:"14px 8px",
              fontSize:".52rem", letterSpacing:".2em", textTransform:"uppercase",
              cursor:"pointer", fontFamily:"monospace" }}>
            {b.i} {b.l}
          </button>
        ))}
      </div>

      {/* Help */}
      {showHelp && (
        <div style={{ position:"fixed", bottom:80, left:"50%", transform:"translateX(-50%)",
          zIndex:200, background:"rgba(4,6,14,.95)", border:"1px solid rgba(0,119,255,.2)",
          borderRadius:12, padding:"20px 32px", textAlign:"center",
          color:"rgba(255,255,255,.65)", fontSize:".75rem", lineHeight:1.9,
          backdropFilter:"blur(12px)", maxWidth:400 }}>
          <div style={{ fontWeight:700, color:"#fff", marginBottom:8, letterSpacing:".1em" }}>NAVIGATION</div>
          <strong>WASD</strong> or <strong>Arrow Keys</strong> to walk<br/>
          <strong>Mouse</strong> to look around · <strong>Click canvas</strong> to lock cursor<br/>
          <strong>Click glowing panels</strong> to view in full<br/>
          <strong>ESC</strong> to release cursor
          <br/>
          <button onClick={()=>setShowHelp(false)} style={{
            marginTop:14, background:"none", border:"1px solid rgba(255,255,255,.12)",
            color:"rgba(255,255,255,.4)", borderRadius:6, padding:"5px 20px",
            cursor:"pointer", fontSize:".62rem" }}>CLOSE</button>
        </div>
      )}

      {/* Bottom hint */}
      <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
        zIndex:100, fontFamily:"monospace", fontSize:".52rem", letterSpacing:".25em",
        color:"rgba(255,255,255,.18)", textTransform:"uppercase", pointerEvents:"none",
        textAlign:"center" }}>
        Click canvas · WASD to move · ESC to release
      </div>
    </>
  );
}

// ─── PANEL MODAL ─────────────────────────────────────────────────────────────
function PanelModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, zIndex:500,
      background:"rgba(2,4,8,.92)", backdropFilter:"blur(16px)",
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"rgba(6,10,20,.98)", border:"1px solid rgba(0,119,255,.2)",
        borderRadius:16, padding:32, maxWidth:"90vw", maxHeight:"90vh",
        display:"flex", flexDirection:"column", gap:16,
      }}>
        {item.type==="photo" ? (
          <img src={cImg(item.id,1400,900)} alt={item.label}
            style={{ maxWidth:"80vw", maxHeight:"70vh", objectFit:"contain",
              borderRadius:8, display:"block" }}/>
        ) : (
          <video src={cVid(item.id)} autoPlay loop muted playsInline controls
            style={{ maxWidth:"80vw", maxHeight:"70vh", borderRadius:8, display:"block" }}/>
        )}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ color:"#fff", fontWeight:700, fontSize:"1rem" }}>{item.label}</div>
            <div style={{ color:"rgba(0,191,166,.7)", fontSize:".7rem",
              letterSpacing:".12em", marginTop:4 }}>{item.tag}</div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,.05)",
            border:"1px solid rgba(255,255,255,.1)", borderRadius:8, padding:"8px 24px",
            color:"rgba(255,255,255,.6)", cursor:"pointer", fontSize:".75rem" }}>CLOSE</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function SpatialShowroom() {
  const mountRef = useRef(null);
  const [started, setStarted]   = useState(false);
  const [pos, setPos]           = useState([0,0]);
  const [zone, setZone]         = useState("ENTRY HALL");
  const [showHelp, setShowHelp] = useState(false);
  const [modal, setModal]       = useState(null);

  useEffect(() => {
    if (!started) return;
    const el = mountRef.current; if (!el) return;

    // ── Renderer ──────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020408);
    scene.fog = new THREE.Fog(0x020408, 18, 55);

    const camera = new THREE.PerspectiveCamera(72, window.innerWidth/window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.7, -10);
    camera.lookAt(0, 1.7, 0);

    // ── Materials ──────────────────────────────────────────────────
    const floorTex = new THREE.CanvasTexture(makeFloorTex());
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(8, 20);

    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex, roughness: 0.08, metalness: 0.55, color: 0x0A0E1A,
    });
    const ceilMat = new THREE.MeshStandardMaterial({
      color: 0x050810, roughness: 1, metalness: 0,
    });
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x070B15, roughness: 0.85, metalness: 0.1,
    });
    const trimMat = new THREE.MeshBasicMaterial({ color: 0x0044AA });
    const trimTealMat = new THREE.MeshBasicMaterial({ color: 0x004444 });

    // ── Build geometry: corridor + wings ───────────────────────────
    // Main corridor: -3 to +3 X, -12 to 80 Z
    // Photo gallery left: -14 to -10 X, 0 to 72 Z
    // Video gallery right: 10 to 14 X, 0 to 72 Z

    function addBox(px,py,pz,w,h,d,mat,castShadow=false,receiveShadow=true) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
      m.position.set(px,py,pz); m.castShadow=castShadow; m.receiveShadow=receiveShadow;
      scene.add(m); return m;
    }
    function addPlane(px,py,pz,w,d,mat,rotY=0) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w,d), mat);
      m.rotation.x=-Math.PI/2; m.rotation.z=rotY;
      m.position.set(px,py,pz); m.receiveShadow=true;
      scene.add(m); return m;
    }
    function addWall(px,py,pz,w,h,rotY,mat) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w,h), mat.clone());
      m.position.set(px,py,pz); m.rotation.y=rotY; m.receiveShadow=true;
      scene.add(m); return m;
    }
    function addTrim(px,py,pz,len,rotY=0,mat=trimMat) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(len,.04,.04), mat.clone());
      m.position.set(px,py,pz); m.rotation.y=rotY; scene.add(m);
    }

    // FLOOR (whole showroom)
    addPlane(0,0,34, 30,92, floorMat);
    // CEILING
    addBox(0,5.5,34, 30,0.3,92, ceilMat);

    // Entry arch + walls
    addWall(-3,2.75,-12, 0.2,5.5, 0, wallMat.clone()).scale.set(1,1,1);

    // CORRIDOR walls (left/right inner)
    addWall(-3,2.75,34, 0.15,5.5, 0, wallMat).scale.x = 90; // left corridor wall (long box is better)
    addBox(-3.08,2.75,33, 0.15,5.5,92, wallMat.clone());
    addBox(3.08,2.75,33, 0.15,5.5,92, wallMat.clone());

    // Outer gallery walls
    addBox(-14.08,2.75,36, 0.15,5.5,72, wallMat.clone()); // far left
    addBox(14.08,2.75,36, 0.15,5.5,72, wallMat.clone());  // far right

    // Gallery ceiling sections
    addBox(-8.5,5.5,36, 11,0.3,72, ceilMat.clone());
    addBox(8.5,5.5,36, 11,0.3,72, ceilMat.clone());

    // Gallery floors
    const gFloorMat = floorMat.clone();
    addPlane(-8.5,0,36, 11,72, gFloorMat);
    addPlane(8.5,0,36, 11,72, gFloorMat);

    // Gallery back walls (connecting corridor to wings)
    addBox(-8.5,2.75,-1, 11,5.5,0.15, wallMat.clone());
    addBox(8.5,2.75,-1, 11,5.5,0.15, wallMat.clone());

    // Far end wall
    addBox(0,2.75,80, 30,5.5,0.15, wallMat.clone());

    // ACCENT TRIM — baseboards (blue glow)
    [[-3,0.03,34],[-14,0.03,36],[3,0.03,34],[14,0.03,36]].forEach(([x,y,z])=>
      addTrim(x,y,z, 0.01, 0, trimMat) // handled by box strips below
    );
    // Baseboard glow strips
    [[-14.05,0.05,36,72,0],[-3.05,0.05,33,92,0],[3.05,0.05,33,92,0],[14.05,0.05,36,72,0]].forEach(([x,y,z,len])=>{
      const m=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.04,len), trimMat.clone());
      m.position.set(x,y,z); scene.add(m);
    });

    // Ceiling accent strips
    [[-14.05,5.48,36,72],[-3.05,5.48,33,92],[3.05,5.48,33,92],[14.05,5.48,36,72]].forEach(([x,y,z,len])=>{
      const m=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.04,len), trimTealMat.clone());
      m.position.set(x,y,z); scene.add(m);
    });

    // Ceiling recessed lights (emissive dots)
    [[0,5.4,-8],[0,5.4,2],[0,5.4,12],[0,5.4,22],[0,5.4,32],[0,5.4,42],[0,5.4,52],[0,5.4,62],[0,5.4,72],
     [-8.5,5.4,6],[-8.5,5.4,18],[-8.5,5.4,30],[-8.5,5.4,42],[-8.5,5.4,54],[-8.5,5.4,66],
     [8.5,5.4,6],[8.5,5.4,18],[8.5,5.4,30],[8.5,5.4,42],[8.5,5.4,54],[8.5,5.4,66],
    ].forEach(([x,y,z])=>{
      const spot=new THREE.Mesh(new THREE.CircleGeometry(.25,16),
        new THREE.MeshBasicMaterial({color:0xCCDDFF}));
      spot.rotation.x=Math.PI/2; spot.position.set(x,y,z); scene.add(spot);
      const pl=new THREE.PointLight(0x8899FF,0.9,12);
      pl.position.set(x,5.2,z); scene.add(pl);
    });

    // Ambient
    scene.add(new THREE.AmbientLight(0x101828, 1.2));

    // ── Photo panels (left gallery wall, X≈-13.9) ─────────────────
    const hotspots = [];
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";

    const FRAME_W=4.2, FRAME_H=2.8;
    const LABEL_H=0.7;
    const GAP=1.2;
    const COL_COUNT=2; // 2 columns
    const photoWallX=-13.9;
    const videoWallX=13.9;

    PHOTOS.forEach((ph, i) => {
      const col = i % COL_COUNT;
      const row = Math.floor(i / COL_COUNT);
      const y = 2.9 - col*(FRAME_H+0.4);
      const z = 4 + row*(FRAME_H+GAP+LABEL_H);

      // Frame box
      const frameMat = new THREE.MeshStandardMaterial({
        color:0x0D1525, roughness:0.3, metalness:0.8,
        emissive:new THREE.Color(0x001133), emissiveIntensity:0.4,
      });
      const frame = new THREE.Mesh(new THREE.BoxGeometry(FRAME_W+0.14,FRAME_H+0.14,0.08), frameMat);
      frame.position.set(photoWallX+0.06, y, z);
      frame.rotation.y=Math.PI/2;
      frame.castShadow=true;
      scene.add(frame);

      // Screen with Cloudinary image
      const tex = loader.load(cImg(ph.id, 840, 560));
      tex.colorSpace = THREE.SRGBColorSpace;
      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(FRAME_W, FRAME_H),
        new THREE.MeshBasicMaterial({ map: tex })
      );
      screen.position.set(photoWallX+0.11, y, z);
      screen.rotation.y=Math.PI/2;
      scene.add(screen);

      // Label below
      const lTex = new THREE.CanvasTexture(makeLabelTex(ph.label, ph.tag, "#0077FF"));
      const label = new THREE.Mesh(
        new THREE.PlaneGeometry(FRAME_W, LABEL_H),
        new THREE.MeshBasicMaterial({ map:lTex, transparent:true })
      );
      label.position.set(photoWallX+0.12, y-(FRAME_H/2+LABEL_H/2+0.1), z);
      label.rotation.y=Math.PI/2;
      scene.add(label);

      // Accent glow at top of frame
      const glowMat=new THREE.MeshBasicMaterial({color:0x0044CC,transparent:true,opacity:0.7});
      const glow=new THREE.Mesh(new THREE.BoxGeometry(FRAME_W+0.14,0.03,0.03), glowMat);
      glow.position.set(photoWallX+0.05, y+FRAME_H/2+0.07+0.07, z);
      glow.rotation.y=Math.PI/2;
      scene.add(glow);

      // Panel spotlight
      const sl=new THREE.SpotLight(0x4477FF, 1.2, 10, Math.PI/6, 0.4);
      sl.position.set(photoWallX+4, y+3, z);
      sl.target.position.set(photoWallX+0.1, y, z);
      scene.add(sl); scene.add(sl.target);

      // Hotspot for click
      screen.userData = { type:"photo", ...ph };
      hotspots.push(screen);
    });

    // ── Video panels (right gallery wall, X≈13.9) ─────────────────
    VIDEOS.forEach((vid, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const y = 2.9 - col*(FRAME_H+0.4);
      const z = 4 + row*(FRAME_H+GAP+LABEL_H);

      const frameMat = new THREE.MeshStandardMaterial({
        color:0x0D1020, roughness:0.3, metalness:0.8,
        emissive:new THREE.Color(0x001122), emissiveIntensity:0.4,
      });
      const frame = new THREE.Mesh(new THREE.BoxGeometry(FRAME_W+0.14,FRAME_H+0.14,0.08), frameMat);
      frame.position.set(videoWallX-0.06, y, z);
      frame.rotation.y=-Math.PI/2;
      frame.castShadow=true;
      scene.add(frame);

      // Video element → VideoTexture
      const videoEl = document.createElement("video");
      videoEl.src = cVid(vid.id);
      videoEl.loop = true;
      videoEl.muted = true;
      videoEl.playsInline = true;
      videoEl.crossOrigin = "anonymous";
      videoEl.autoplay = true;
      videoEl.play().catch(()=>{});

      const vTex = new THREE.VideoTexture(videoEl);
      vTex.colorSpace = THREE.SRGBColorSpace;
      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(FRAME_W, FRAME_H),
        new THREE.MeshBasicMaterial({ map: vTex })
      );
      screen.position.set(videoWallX-0.11, y, z);
      screen.rotation.y=-Math.PI/2;
      scene.add(screen);

      // Label
      const lTex = new THREE.CanvasTexture(makeLabelTex(vid.label, vid.tag, "#00BFA6"));
      const label = new THREE.Mesh(
        new THREE.PlaneGeometry(FRAME_W, LABEL_H),
        new THREE.MeshBasicMaterial({ map:lTex, transparent:true })
      );
      label.position.set(videoWallX-0.12, y-(FRAME_H/2+LABEL_H/2+0.1), z);
      label.rotation.y=-Math.PI/2;
      scene.add(label);

      const glowMat=new THREE.MeshBasicMaterial({color:0x004433,transparent:true,opacity:0.7});
      const glow=new THREE.Mesh(new THREE.BoxGeometry(FRAME_W+0.14,0.03,0.03), glowMat);
      glow.position.set(videoWallX-0.05, y+FRAME_H/2+0.07+0.07, z);
      glow.rotation.y=-Math.PI/2;
      scene.add(glow);

      const sl=new THREE.SpotLight(0x004455, 1.2, 10, Math.PI/6, 0.4);
      sl.position.set(videoWallX-4, y+3, z);
      sl.target.position.set(videoWallX-0.1, y, z);
      scene.add(sl); scene.add(sl.target);

      screen.userData = { type:"video", ...vid };
      hotspots.push(screen);
    });

    // ── Section signs on corridor walls ───────────────────────────
    [
      { text:"PHOTO GALLERY", x:-2.9, y:4.5, z:2, accent:"#0077FF" },
      { text:"VIDEO GALLERY", x:2.9, y:4.5, z:2, accent:"#00BFA6", ry:Math.PI },
      { text:"SERAPHIC SIGHT", x:0, y:3.5, z:-11.8, accent:"#0077FF" },
    ].forEach(s=>{
      const cvs=makeSectionTex(s.text, s.accent);
      const tex=new THREE.CanvasTexture(cvs);
      const m=new THREE.Mesh(
        new THREE.PlaneGeometry(5,0.7),
        new THREE.MeshBasicMaterial({map:tex,transparent:true})
      );
      m.position.set(s.x,s.y,s.z);
      if(s.ry) m.rotation.y=s.ry;
      scene.add(m);
    });

    // Entry arch glow ring
    const ringGeo=new THREE.TorusGeometry(2.2,0.05,8,64);
    const ringMat=new THREE.MeshBasicMaterial({color:0x0044BB,transparent:true,opacity:0.6});
    const ring=new THREE.Mesh(ringGeo,ringMat);
    ring.position.set(0,2.75,-11); ring.rotation.x=Math.PI/2; scene.add(ring);

    // ── Movement / pointer lock ────────────────────────────────────
    const keys={};
    const euler=new THREE.Euler(0,0,0,"YXZ");
    let locked=false;

    const onKey=(e,v)=>{keys[e.code]=v;};
    const onMove=(e)=>{
      if(!locked) return;
      euler.setFromQuaternion(camera.quaternion);
      euler.y -= e.movementX*.0018;
      euler.x -= e.movementY*.0018;
      euler.x = Math.max(-Math.PI*.35, Math.min(Math.PI*.35, euler.x));
      camera.quaternion.setFromEuler(euler);
    };
    const onLock=()=>{ locked=document.pointerLockElement===renderer.domElement; };
    const onClick=()=>{
      if(!locked){ renderer.domElement.requestPointerLock(); return; }
      raycaster.setFromCamera({x:0,y:0}, camera);
      const hits=raycaster.intersectObjects(hotspots);
      if(hits.length>0) setModal(hits[0].object.userData);
    };

    window.addEventListener("keydown",e=>onKey(e,true));
    window.addEventListener("keyup",e=>onKey(e,false));
    document.addEventListener("mousemove",onMove);
    document.addEventListener("pointerlockchange",onLock);
    renderer.domElement.addEventListener("click",onClick);

    const raycaster=new THREE.Raycaster();
    const dir=new THREE.Vector3(), right=new THREE.Vector3();
    const SPEED=0.06;

    // Zone detection
    const getZone=(p)=>{
      if(p.z < 0) return "ENTRY HALL";
      if(p.x < -3.5) return "PHOTO GALLERY";
      if(p.x > 3.5) return "VIDEO GALLERY";
      if(p.z > 72) return "CONTACT";
      return "MAIN CORRIDOR";
    };

    let rafId;
    const tick=()=>{
      rafId=requestAnimationFrame(tick);
      camera.getWorldDirection(dir); dir.y=0; dir.normalize();
      right.crossVectors(dir,new THREE.Vector3(0,1,0)).normalize();
      const vel=new THREE.Vector3();
      if(keys["KeyW"]||keys["ArrowUp"])    vel.add(dir);
      if(keys["KeyS"]||keys["ArrowDown"])  vel.sub(dir);
      if(keys["KeyA"]||keys["ArrowLeft"])  vel.sub(right);
      if(keys["KeyD"]||keys["ArrowRight"]) vel.add(right);
      if(vel.length()>0) {
        vel.normalize().multiplyScalar(SPEED);
        const nx=Math.max(-13.7,Math.min(13.7, camera.position.x+vel.x));
        const nz=Math.max(-11.5,Math.min(79.5, camera.position.z+vel.z));
        camera.position.x=nx; camera.position.z=nz; camera.position.y=1.7;
      }
      const cp=camera.position;
      setPos([Math.round(cp.x*10)/10, Math.round(cp.z*10)/10]);
      setZone(getZone(cp));

      // Glow pulse on frames
      const t=performance.now()*.001;
      hotspots.forEach((h,i)=>{
        const dist=camera.position.distanceTo(h.position);
        if(h.parent) {
          // subtle breathe effect on nearby panels
        }
      });

      renderer.render(scene,camera);
    };
    tick();

    const onResize=()=>{
      camera.aspect=window.innerWidth/window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth,window.innerHeight);
    };
    window.addEventListener("resize",onResize);

    return ()=>{
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown",e=>onKey(e,true));
      window.removeEventListener("keyup",e=>onKey(e,false));
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
    <div style={{width:"100vw",height:"100vh",overflow:"hidden",background:"#020408"}}>
      {!started && <Onboarding onStart={()=>setStarted(true)}/>}
      <div ref={mountRef} style={{width:"100%",height:"100%",display:started?"block":"none"}}/>
      {started && (
        <>
          <Minimap px={pos[0]} pz={pos[1]}/>
          <HUD zone={zone} showHelp={showHelp} setShowHelp={setShowHelp}/>
          <PanelModal item={modal} onClose={()=>setModal(null)}/>
        </>
      )}
    </div>
  );
}
