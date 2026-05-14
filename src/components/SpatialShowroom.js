// SpatialShowroom.js v5
// Key fix: MeshBasicMaterial for all structural geometry (walls/floor/ceiling)
// so brightness is guaranteed regardless of lighting/tone-mapping.

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

// ─── Canvas helpers ──────────────────────────────────────────────────────────
function makeFloorTex() {
  const c = document.createElement("canvas"); c.width=512; c.height=512;
  const ctx = c.getContext("2d");
  ctx.fillStyle="#1A2D48"; ctx.fillRect(0,0,512,512);
  ctx.strokeStyle="rgba(60,100,180,0.25)"; ctx.lineWidth=1;
  for (let i=0;i<=512;i+=32){
    ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,512);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(512,i);ctx.stroke();
  }
  ctx.strokeStyle="rgba(0,180,160,0.35)"; ctx.lineWidth=2;
  for (let x=0;x<=512;x+=128) for (let y=0;y<=512;y+=128){
    ctx.beginPath();ctx.moveTo(x-10,y);ctx.lineTo(x+10,y);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x,y-10);ctx.lineTo(x,y+10);ctx.stroke();
  }
  return c;
}
function makeWallTex() {
  const c = document.createElement("canvas"); c.width=256; c.height=512;
  const ctx = c.getContext("2d");
  ctx.fillStyle="#2A3F60"; ctx.fillRect(0,0,256,512);
  ctx.strokeStyle="rgba(50,80,140,0.3)"; ctx.lineWidth=0.5;
  for (let y=0;y<512;y+=64){
    ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(256,y);ctx.stroke();
  }
  for (let x=0;x<256;x+=64){
    ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,512);ctx.stroke();
  }
  return c;
}
function makeLabelTex(title, sub, accent) {
  const c=document.createElement("canvas"); c.width=512; c.height=128;
  const ctx=c.getContext("2d"); ctx.clearRect(0,0,512,128);
  ctx.fillStyle=accent+"33"; ctx.roundRect(0,0,512,128,8); ctx.fill();
  ctx.strokeStyle=accent+"99"; ctx.lineWidth=1.5; ctx.roundRect(0.5,0.5,511,127,8); ctx.stroke();
  ctx.fillStyle=accent; ctx.font="bold 38px Arial"; ctx.textAlign="center"; ctx.fillText(title,256,58);
  ctx.fillStyle="rgba(200,215,240,0.85)"; ctx.font="22px Arial"; ctx.fillText(sub,256,96);
  return c;
}
function makeSectionTex(title, accent) {
  const c=document.createElement("canvas"); c.width=1024; c.height=128;
  const ctx=c.getContext("2d"); ctx.clearRect(0,0,1024,128);
  ctx.fillStyle="rgba(5,10,25,0.8)"; ctx.fillRect(0,0,1024,128);
  ctx.fillStyle=accent; ctx.fillRect(0,0,8,128);
  ctx.fillStyle="#FFFFFF"; ctx.font="bold 68px Arial"; ctx.textAlign="left"; ctx.fillText(title,28,94);
  return c;
}

// ─── Minimap ─────────────────────────────────────────────────────────────────
function Minimap({ px, pz }) {
  const cvs=useRef(null);
  useEffect(()=>{
    if(!cvs.current) return;
    const ctx=cvs.current.getContext("2d");
    ctx.clearRect(0,0,130,130);
    ctx.fillStyle="rgba(4,8,20,0.9)"; ctx.fillRect(0,0,130,130);
    ctx.strokeStyle="rgba(0,119,255,0.4)"; ctx.lineWidth=1; ctx.strokeRect(0,0,130,130);
    const tM=(x,z)=>[(x+16)*(130/32),(z+12)*(130/95)];
    const [ax,az]=tM(-14,0),[bx,bz]=tM(14,72);
    ctx.fillStyle="rgba(0,70,160,0.25)"; ctx.fillRect(ax,az,bx-ax,bz-az);
    ctx.strokeStyle="rgba(0,140,255,0.5)"; ctx.lineWidth=1; ctx.strokeRect(ax,az,bx-ax,bz-az);
    const [cx2,cz2]=tM(-3,-12),[dx,dz]=tM(3,0);
    ctx.fillStyle="rgba(0,60,140,0.3)"; ctx.fillRect(cx2,cz2,dx-cx2,dz-cz2);
    const [pdx,pdz]=tM(px,pz);
    ctx.fillStyle="#00D4FF"; ctx.beginPath(); ctx.arc(pdx,pdz,4,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle="#FFF"; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(pdx,pdz,4,0,Math.PI*2); ctx.stroke();
  },[px,pz]);
  return (
    <div style={{position:"fixed",bottom:18,left:18,zIndex:300,
      border:"1px solid rgba(0,119,255,0.5)",boxShadow:"0 0 16px rgba(0,100,255,0.3)",
      borderRadius:6,overflow:"hidden",background:"rgba(4,8,20,0.92)"}}>
      <canvas ref={cvs} width={130} height={130}/>
      <div style={{position:"absolute",top:4,left:6,fontSize:9,fontFamily:"monospace",
        color:"rgba(0,200,255,0.8)",letterSpacing:"0.08em"}}>MINIMAP</div>
    </div>
  );
}

// ─── HUD ─────────────────────────────────────────────────────────────────────
function HUD({ zone, showHelp, setShowHelp }) {
  return (
    <>
      <div style={{position:"fixed",top:24,right:24,zIndex:200,fontFamily:"monospace",fontSize:11,
        letterSpacing:"0.14em",color:"rgba(0,210,255,0.9)",textTransform:"uppercase",
        background:"rgba(4,8,22,0.75)",padding:"6px 12px",
        border:"1px solid rgba(0,140,255,0.3)",borderRadius:4,backdropFilter:"blur(6px)"}}>
        1F &nbsp;&middot;&nbsp; {zone}
      </div>
      <svg style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
        zIndex:200,pointerEvents:"none",opacity:0.7}} width={28} height={28}>
        <line x1={14} y1={4}  x2={14} y2={11} stroke="#00D4FF" strokeWidth={1.5}/>
        <line x1={14} y1={17} x2={14} y2={24} stroke="#00D4FF" strokeWidth={1.5}/>
        <line x1={4}  y1={14} x2={11} y2={14} stroke="#00D4FF" strokeWidth={1.5}/>
        <line x1={17} y1={14} x2={24} y2={14} stroke="#00D4FF" strokeWidth={1.5}/>
        <circle cx={14} cy={14} r={2.5} fill="none" stroke="#00D4FF" strokeWidth={1}/>
      </svg>
      {[{l:"SHARE",i:"↗",top:120},{l:"SOUND",i:"♪",top:168},{l:"INFO",i:"i",top:216}].map(b=>(
        <button key={b.l} onClick={b.l==="INFO"?()=>setShowHelp(h=>!h):null} style={{
          position:"fixed",right:0,zIndex:300,top:b.top,
          background:"rgba(140,0,0,0.85)",border:"none",borderBottom:"1px solid rgba(255,255,255,0.12)",
          color:"#fff",cursor:"pointer",writingMode:"vertical-rl",
          padding:"10px 8px",fontFamily:"monospace",fontSize:9,letterSpacing:"0.1em"}}>{b.i} {b.l}</button>
      ))}
      {showHelp && (
        <div style={{position:"fixed",right:50,top:110,zIndex:300,background:"rgba(4,6,14,0.95)",
          border:"1px solid rgba(0,119,255,0.25)",borderRadius:8,padding:"16px 20px",
          fontFamily:"monospace",color:"rgba(200,220,255,0.85)",fontSize:12,lineHeight:1.8,minWidth:220}}>
          <div style={{color:"#00D4FF",marginBottom:8,letterSpacing:"0.1em"}}>CONTROLS</div>
          <div>W A S D &mdash; Move</div><div>Mouse &mdash; Look</div>
          <div>Click panel &mdash; View full size</div><div>ESC &mdash; Release mouse</div>
          <button onClick={()=>setShowHelp(false)} style={{marginTop:12,background:"none",
            border:"1px solid rgba(255,255,255,0.15)",color:"rgba(180,200,255,0.7)",
            cursor:"pointer",borderRadius:4,padding:"4px 12px",fontFamily:"monospace",fontSize:11}}>CLOSE</button>
        </div>
      )}
    </>
  );
}

// ─── PanelModal ───────────────────────────────────────────────────────────────
function PanelModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:500,
      background:"rgba(2,4,8,0.92)",backdropFilter:"blur(16px)",
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"rgba(6,10,20,0.98)",
        border:"1px solid rgba(0,119,255,0.25)",borderRadius:12,padding:24,
        maxWidth:"85vw",maxHeight:"85vh",display:"flex",flexDirection:"column",alignItems:"center"}}>
        {item.type==="photo"
          ? <img src={cImg(item.id,1400,900)} alt={item.label}
              style={{maxWidth:"100%",maxHeight:"70vh",objectFit:"contain",borderRadius:8}}/>
          : <video src={cVid(item.id)} autoPlay muted loop playsInline controls
              style={{maxWidth:"100%",maxHeight:"70vh",borderRadius:8}}/>}
        <div style={{marginTop:16,color:"#E0EAFF",fontFamily:"monospace",fontSize:14,letterSpacing:"0.06em"}}>
          {item.label} &nbsp;&middot;&nbsp; <span style={{color:"#0077FF"}}>{item.tag}</span>
        </div>
        <button onClick={onClose} style={{marginTop:14,background:"rgba(255,255,255,0.06)",
          border:"1px solid rgba(255,255,255,0.15)",color:"rgba(200,220,255,0.8)",
          cursor:"pointer",borderRadius:6,padding:"6px 20px",fontFamily:"monospace",fontSize:11}}>CLOSE</button>
      </div>
    </div>
  );
}

// ─── Onboarding ───────────────────────────────────────────────────────────────
function Onboarding({ onStart }) {
  const [phase,setPhase]=useState("hello");
  const [prog,setProg]=useState(0);
  useEffect(()=>{
    if(phase==="hello"){const t=setTimeout(()=>setPhase("mode"),2000);return()=>clearTimeout(t);}
    if(phase==="loading"){
      let p=0;
      const iv=setInterval(()=>{p+=Math.random()*14+4;if(p>=100){p=100;clearInterval(iv);setTimeout(()=>setPhase("enter"),400);}setProg(Math.min(100,p));},80);
      return()=>clearInterval(iv);
    }
  },[phase]);
  const base={position:"fixed",inset:0,zIndex:999,display:"flex",flexDirection:"column",
    alignItems:"center",justifyContent:"center",
    background:"radial-gradient(ellipse 100% 100% at 50% 0%,#08122A 0%,#020408 70%)",fontFamily:"monospace"};
  if(phase==="hello") return (
    <div style={base}>
      <div style={{fontSize:48,letterSpacing:"0.35em",color:"#00D4FF",animation:"pls 1.5s ease-in-out infinite"}}>SERAPHIC</div>
      <div style={{fontSize:14,letterSpacing:"0.5em",color:"rgba(0,180,255,0.5)",marginTop:8}}>SIGHT &middot; SHOWROOM</div>
      <style>{`@keyframes pls{0%,100%{opacity:0.7}50%{opacity:1}}`}</style>
    </div>
  );
  if(phase==="mode") return (
    <div style={base}>
      <div style={{fontSize:13,letterSpacing:"0.3em",color:"rgba(0,200,255,0.6)",marginBottom:32}}>SELECT MODE</div>
      {["STANDARD","EASY"].map(m=>(
        <button key={m} onClick={()=>setPhase("loading")} style={{marginBottom:14,
          background:"rgba(255,255,255,0.03)",border:"1px solid rgba(0,119,255,0.3)",
          color:"#E0F0FF",cursor:"pointer",borderRadius:8,padding:"14px 48px",
          fontFamily:"monospace",fontSize:14,letterSpacing:"0.15em",width:280}}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,119,255,0.12)";e.currentTarget.style.borderColor="rgba(0,119,255,0.6)";}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.borderColor="rgba(0,119,255,0.3)";}}>
          {m}
        </button>
      ))}
    </div>
  );
  if(phase==="loading") return (
    <div style={base}>
      <div style={{fontSize:11,letterSpacing:"0.35em",color:"rgba(0,200,255,0.7)",marginBottom:20}}>LOADING GALLERY</div>
      <div style={{width:300,height:2,background:"rgba(255,255,255,0.08)",borderRadius:2}}>
        <div style={{height:"100%",borderRadius:2,background:"linear-gradient(90deg,#0077FF,#00BFA6)",width:`${prog}%`,transition:"width 0.08s linear"}}/>
      </div>
      <div style={{marginTop:12,fontSize:10,color:"rgba(0,200,255,0.5)",letterSpacing:"0.2em"}}>{Math.round(prog)}%</div>
    </div>
  );
  return (
    <div style={base}>
      <div style={{fontSize:13,letterSpacing:"0.35em",color:"rgba(0,210,255,0.7)",marginBottom:8}}>READY</div>
      <div style={{fontSize:10,color:"rgba(150,180,220,0.5)",marginBottom:32,letterSpacing:"0.15em"}}>
        Mouse to look &nbsp;&middot;&nbsp; WASD to move &nbsp;&middot;&nbsp; Click panel to view
      </div>
      <button onClick={onStart} style={{background:"linear-gradient(135deg,#0077FF,#00BFA6)",
        border:"none",color:"#fff",cursor:"pointer",borderRadius:8,
        padding:"14px 52px",fontFamily:"monospace",fontSize:14,letterSpacing:"0.2em"}}>
        ENTER GALLERY
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SpatialShowroom() {
  const mountRef=useRef(null);
  const [started,setStarted]=useState(false);
  const [pos,setPos]=useState([0,-10]);
  const [zone,setZone]=useState("ENTRY HALL");
  const [modal,setModal]=useState(null);
  const [showHelp,setShowHelp]=useState(false);

  useEffect(()=>{
    if(!started) return;
    const el=mountRef.current; if(!el) return;

    // Renderer — no tone mapping so BasicMaterial colors render exactly as specified
    const renderer=new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.shadowMap.enabled=false;
    renderer.toneMapping=THREE.LinearToneMapping;
    renderer.toneMappingExposure=1.0;
    el.appendChild(renderer.domElement);

    // Scene
    const scene=new THREE.Scene();
    scene.background=new THREE.Color(0x0D1C33);
    scene.fog=new THREE.Fog(0x0D1C33,50,130);

    const camera=new THREE.PerspectiveCamera(72,window.innerWidth/window.innerHeight,0.1,140);
    camera.position.set(0,1.7,-10);
    camera.lookAt(0,1.7,0);

    // ── Textures ────────────────────────────────────────────────────
    const floorTex=new THREE.CanvasTexture(makeFloorTex());
    floorTex.wrapS=floorTex.wrapT=THREE.RepeatWrapping;
    floorTex.repeat.set(6,18);

    const wallTex=new THREE.CanvasTexture(makeWallTex());
    wallTex.wrapS=wallTex.wrapT=THREE.RepeatWrapping;
    wallTex.repeat.set(4,2);

    // ── MATERIALS (BasicMaterial = unlit, always shows color) ──────
    const floorMat = new THREE.MeshBasicMaterial({map:floorTex});
    const wallMat  = new THREE.MeshBasicMaterial({map:wallTex,color:0x3A5580});
    const ceilMat  = new THREE.MeshBasicMaterial({color:0x1E3050});

    // Emissive trim strips (still StandardMaterial so they glow)
    const trimBlueMat = new THREE.MeshStandardMaterial({color:0x3377FF,emissive:new THREE.Color(0x1155DD),emissiveIntensity:2.0,roughness:0.2,metalness:0.5});
    const trimTealMat = new THREE.MeshStandardMaterial({color:0x00CCBB,emissive:new THREE.Color(0x00AA99),emissiveIntensity:1.8,roughness:0.2,metalness:0.5});

    function bx(px,py,pz,w,h,d,mat){
      const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
      m.position.set(px,py,pz); scene.add(m); return m;
    }
    function fl(px,py,pz,w,d,mat){
      const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat);
      m.rotation.x=-Math.PI/2; m.position.set(px,py,pz); scene.add(m);
    }
    function strip(px,py,pz,len,mat){
      const m=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.06,len),mat.clone());
      m.position.set(px,py,pz); scene.add(m);
    }

    // ── GEOMETRY: OPEN T-JUNCTION ──────────────────────────────────
    // Entry corridor: x=-3..+3, z=-12..0  (6w x 12d)
    // Main gallery:   x=-14..+14, z=0..72 (28w x 72d) — fully open

    // FLOORS
    fl(0,0,-6,  6, 12, floorMat.clone());       // entry corridor
    fl(0,0,36, 28, 72, floorMat);               // main gallery

    // CEILING
    bx(0,5.5,-6,  6,0.3,12, ceilMat.clone());  // entry corridor ceiling
    bx(0,5.5,36, 28,0.3,72, ceilMat.clone());  // gallery ceiling

    // WALLS — side walls of gallery
    // Clone wallTex repeat for each long wall section
    const makeWallMat = ()=>{
      const t=wallTex.clone(); t.needsUpdate=true;
      t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(4,1.5);
      return new THREE.MeshBasicMaterial({map:t,color:0x3A5580});
    };
    bx(-14.08,2.75,36, 0.15,5.5,72, makeWallMat()); // left gallery wall
    bx( 14.08,2.75,36, 0.15,5.5,72, makeWallMat()); // right gallery wall

    // Entry corridor side walls (ONLY z=-12..0)
    bx(-3.08,2.75,-6, 0.15,5.5,12, makeWallMat());
    bx( 3.08,2.75,-6, 0.15,5.5,12, makeWallMat());

    // Connector walls at gallery entrance (fill gap from entry to gallery walls)
    bx(-8.5,2.75,-0.07, 11,5.5,0.15, makeWallMat());
    bx( 8.5,2.75,-0.07, 11,5.5,0.15, makeWallMat());

    // Corner pillar posts at entry-gallery junction
    [[-3.08,2.75,0],[3.08,2.75,0]].forEach(([x,y,z])=>{
      bx(x,y,z,0.3,5.5,0.3,new THREE.MeshBasicMaterial({color:0x4A6A9A}));
    });

    // Far end wall + entry back wall
    bx(0,2.75, 72.08, 28,5.5,0.15, makeWallMat());
    bx(0,2.75,-12.08,  6,5.5,0.15, makeWallMat());

    // ── TRIM STRIPS ───────────────────────────────────────────────
    [[-14.05,0.04,36,72],[14.05,0.04,36,72],[-3.08,0.04,-6,12],[3.08,0.04,-6,12]]
      .forEach(([x,y,z,l])=>strip(x,y,z,l,trimBlueMat));
    [[-14.05,5.47,36,72],[14.05,5.47,36,72]]
      .forEach(([x,y,z,l])=>strip(x,y,z,l,trimTealMat));

    // Entry arch ring
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.5,0.07,8,64),
      new THREE.MeshStandardMaterial({color:0x0066EE,emissive:new THREE.Color(0x0044BB),emissiveIntensity:2.5,roughness:0.2,metalness:0.8}));
    ring.position.set(0,2.75,-0.1); ring.rotation.x=Math.PI/2; scene.add(ring);

    // Center guide lines
    const guideMat=new THREE.MeshBasicMaterial({color:0x1A3050});
    const gL=new THREE.Mesh(new THREE.PlaneGeometry(0.08,72),guideMat);
    gL.rotation.x=-Math.PI/2; gL.position.set(-1.5,0.01,36); scene.add(gL);
    const gR=new THREE.Mesh(new THREE.PlaneGeometry(0.08,72),guideMat.clone());
    gR.rotation.x=-Math.PI/2; gR.position.set(1.5,0.01,36); scene.add(gR);

    // ── LIGHTING (for panel illumination and glowing trims) ────────
    // Minimal ambient so StandardMaterial glows still work
    scene.add(new THREE.AmbientLight(0xFFFFFF,0.6));
    // Ceiling point lights
    [2,10,18,26,34,42,50,58,66].forEach(z=>{
      const disc=new THREE.Mesh(new THREE.CircleGeometry(0.3,16),
        new THREE.MeshBasicMaterial({color:0xFFFFEE}));
      disc.rotation.x=Math.PI/2; disc.position.set(0,5.42,z); scene.add(disc);
      const pl=new THREE.PointLight(0xFFEEDD,4.0,28);
      pl.position.set(0,5.2,z); scene.add(pl);
    });
    // Wall-wash for photos (left) and videos (right)
    [6,16,26,36,46,56,66].forEach(z=>{
      const l=new THREE.PointLight(0xFFEECC,3.0,14);
      l.position.set(-11,3.5,z); scene.add(l);
      const r=new THREE.PointLight(0xFFEECC,3.0,14);
      r.position.set(11,3.5,z); scene.add(r);
    });
    // Floor fill
    [10,26,42,58].forEach(z=>{
      const pl=new THREE.PointLight(0xCCDDFF,1.2,22);
      pl.position.set(0,0.8,z); scene.add(pl);
    });
    // Entry corridor lights
    [-8,-4].forEach(z=>{
      const pl=new THREE.PointLight(0xFFEEDD,3.0,12);
      pl.position.set(0,4.8,z); scene.add(pl);
    });

    // ── SECTION SIGNS ─────────────────────────────────────────────
    [
      {text:"PHOTO GALLERY", x:-9,  y:4.8, z:2,    accent:"#0088FF"},
      {text:"VIDEO GALLERY", x: 9,  y:4.8, z:2,    accent:"#00BFA6"},
      {text:"SERAPHIC SIGHT",x: 0,  y:4.2, z:-9.5, accent:"#0088FF"},
    ].forEach(s=>{
      const tex=new THREE.CanvasTexture(makeSectionTex(s.text,s.accent));
      const m=new THREE.Mesh(new THREE.PlaneGeometry(6.5,0.85),
        new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide}));
      m.position.set(s.x,s.y,s.z); scene.add(m);
    });

    // ── PANELS ────────────────────────────────────────────────────
    const hotspots=[];
    const loader=new THREE.TextureLoader(); loader.crossOrigin="anonymous";
    const FW=3.8, FH=2.2, ZGAP=5.2;
    const YU=3.2, YL=1.1;

    PHOTOS.forEach((ph,i)=>{
      const col=i%2, row=Math.floor(i/2);
      const y=col===0?YU:YL, z=3+row*ZGAP;
      const wx=-13.9;
      // Frame
      bx(wx+0.08,y,z, FW+0.18,FH+0.18,0.1,
        new THREE.MeshStandardMaterial({color:0x1A2A3E,roughness:0.2,metalness:0.9,
          emissive:new THREE.Color(0x001C44),emissiveIntensity:0.8}));
      // Screen (photo texture)
      const tex=loader.load(cImg(ph.id,840,560));
      tex.colorSpace=THREE.SRGBColorSpace;
      const sc=new THREE.Mesh(new THREE.PlaneGeometry(FW,FH),
        new THREE.MeshBasicMaterial({map:tex}));
      sc.position.set(wx+0.14,y,z); sc.rotation.y=Math.PI/2; scene.add(sc);
      // Label
      const lt=new THREE.CanvasTexture(makeLabelTex(ph.label,ph.tag,"#0077FF"));
      const lb=new THREE.Mesh(new THREE.PlaneGeometry(FW,0.65),
        new THREE.MeshBasicMaterial({map:lt,transparent:true}));
      lb.position.set(wx+0.15,y-(FH/2+0.43),z); lb.rotation.y=Math.PI/2; scene.add(lb);
      // Glow top bar
      const gm=new THREE.Mesh(new THREE.BoxGeometry(FW+0.18,0.06,0.06),
        new THREE.MeshStandardMaterial({color:0x2255FF,emissive:new THREE.Color(0x0044EE),emissiveIntensity:3.0}));
      gm.position.set(wx+0.07,y+FH/2+0.12,z); gm.rotation.y=Math.PI/2; scene.add(gm);
      // Spotlight from gallery center
      const sl=new THREE.SpotLight(0xFFFFFF,6.0,16,Math.PI/8,0.35);
      sl.position.set(wx+6,y+2,z); sl.target.position.set(wx+0.1,y,z);
      scene.add(sl); scene.add(sl.target);
      sc.userData={type:"photo",...ph}; hotspots.push(sc);
    });

    VIDEOS.forEach((vid,i)=>{
      const col=i%2, row=Math.floor(i/2);
      const y=col===0?YU:YL, z=3+row*ZGAP;
      const wx=13.9;
      bx(wx-0.08,y,z, FW+0.18,FH+0.18,0.1,
        new THREE.MeshStandardMaterial({color:0x1A1F35,roughness:0.2,metalness:0.9,
          emissive:new THREE.Color(0x001830),emissiveIntensity:0.8}));
      const videoEl=document.createElement("video");
      videoEl.src=cVid(vid.id); videoEl.loop=true; videoEl.muted=true;
      videoEl.playsInline=true; videoEl.crossOrigin="anonymous"; videoEl.autoplay=true;
      videoEl.play().catch(()=>{});
      const vTex=new THREE.VideoTexture(videoEl);
      vTex.colorSpace=THREE.SRGBColorSpace;
      const sc=new THREE.Mesh(new THREE.PlaneGeometry(FW,FH),
        new THREE.MeshBasicMaterial({map:vTex}));
      sc.position.set(wx-0.14,y,z); sc.rotation.y=-Math.PI/2; scene.add(sc);
      const lt=new THREE.CanvasTexture(makeLabelTex(vid.label,vid.tag,"#00BFA6"));
      const lb=new THREE.Mesh(new THREE.PlaneGeometry(FW,0.65),
        new THREE.MeshBasicMaterial({map:lt,transparent:true}));
      lb.position.set(wx-0.15,y-(FH/2+0.43),z); lb.rotation.y=-Math.PI/2; scene.add(lb);
      const gm=new THREE.Mesh(new THREE.BoxGeometry(FW+0.18,0.06,0.06),
        new THREE.MeshStandardMaterial({color:0x00AABB,emissive:new THREE.Color(0x008899),emissiveIntensity:3.0}));
      gm.position.set(wx-0.07,y+FH/2+0.12,z); gm.rotation.y=-Math.PI/2; scene.add(gm);
      const sl=new THREE.SpotLight(0xFFFFFF,6.0,16,Math.PI/8,0.35);
      sl.position.set(wx-6,y+2,z); sl.target.position.set(wx-0.1,y,z);
      scene.add(sl); scene.add(sl.target);
      sc.userData={type:"video",...vid}; hotspots.push(sc);
    });

    // ── CONTROLS ──────────────────────────────────────────────────
    const keys={};
    const euler=new THREE.Euler(0,0,0,"YXZ");
    let locked=false;
    const onKeyDown=(e)=>{keys[e.code]=true;};
    const onKeyUp=(e)=>{keys[e.code]=false;};
    const onMove=(e)=>{
      if(!locked) return;
      euler.setFromQuaternion(camera.quaternion);
      euler.y-=e.movementX*.0018; euler.x-=e.movementY*.0018;
      euler.x=Math.max(-Math.PI*.35,Math.min(Math.PI*.35,euler.x));
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

    const dir=new THREE.Vector3(),right=new THREE.Vector3();
    const SPEED=0.09;
    const getZone=(p)=>{
      if(p.z<0) return "ENTRY HALL";
      if(p.x<-4) return "PHOTO GALLERY";
      if(p.x>4)  return "VIDEO GALLERY";
      if(p.z>68) return "GALLERY END";
      return "MAIN GALLERY";
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
      if(vel.length()>0){
        vel.normalize().multiplyScalar(SPEED);
        const nx=Math.max(-13.5,Math.min(13.5,camera.position.x+vel.x));
        const nz=Math.max(-11.5,Math.min(71.5,camera.position.z+vel.z));
        camera.position.x=nx; camera.position.z=nz; camera.position.y=1.7;
      }
      setPos([Math.round(camera.position.x*10)/10,Math.round(camera.position.z*10)/10]);
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
    <div style={{width:"100vw",height:"100vh",overflow:"hidden",background:"#0D1C33"}}>
      {!started && <Onboarding onStart={()=>setStarted(true)}/>}
      <div ref={mountRef} style={{width:"100%",height:"100%",display:started?"block":"none"}}/>
      {started && (
        <>
          <Minimap px={pos[0]} pz={pos[1]}/>
          <HUD zone={zone} showHelp={showHelp} setShowHelp={setShowHelp}/>
          <PanelModal item={modal} onClose={()=>setModal(null)}/>
          <div style={{position:"fixed",bottom:50,left:"50%",transform:"translateX(-50%)",
            fontFamily:"monospace",fontSize:11,letterSpacing:"0.18em",
            color:"rgba(0,200,255,0.45)",textTransform:"uppercase",pointerEvents:"none",zIndex:200}}>
            Click to start &nbsp;&middot;&nbsp; WASD to move &nbsp;&middot;&nbsp; ESC to release
          </div>
        </>
      )}
    </div>
  );
}
