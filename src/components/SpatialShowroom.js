// SpatialShowroom.js v3 -- Seraphic Sight 3D Gallery
// Fixes: bright lighting overhaul, correct panel heights (both rows visible),
//        double-sided section signs with correct rotations, fog pushed out to 40-110.

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

function makeFloorTex() {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 512;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#0D1A2E";
  ctx.fillRect(0,0,512,512);
  ctx.strokeStyle = "rgba(0,140,255,0.18)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 512; i += 32) {
    ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,512); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(512,i); ctx.stroke();
  }
  ctx.strokeStyle = "rgba(0,220,200,0.22)";
  ctx.lineWidth = 1.5;
  for (let x = 0; x <= 512; x += 128) for (let y = 0; y <= 512; y += 128) {
    ctx.beginPath(); ctx.moveTo(x-8,y); ctx.lineTo(x+8,y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x,y-8); ctx.lineTo(x,y+8); ctx.stroke();
  }
  return c;
}

function makeLabelTex(title, sub, accent) {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 128;
  const ctx = c.getContext("2d");
  ctx.clearRect(0,0,512,128);
  ctx.fillStyle = accent + "33";
  ctx.roundRect(0,0,512,128,8); ctx.fill();
  ctx.strokeStyle = accent + "88"; ctx.lineWidth = 1.5;
  ctx.roundRect(0.5,0.5,511,127,8); ctx.stroke();
  ctx.fillStyle = accent; ctx.font = "bold 38px Arial"; ctx.textAlign = "center";
  ctx.fillText(title, 256, 58);
  ctx.fillStyle = "rgba(200,210,230,0.8)"; ctx.font = "22px Arial";
  ctx.fillText(sub, 256, 96);
  return c;
}

function makeSectionTex(title, accent) {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 128;
  const ctx = c.getContext("2d");
  ctx.clearRect(0,0,1024,128);
  ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(0,0,1024,128);
  ctx.fillStyle = accent; ctx.fillRect(0,0,8,128);
  ctx.fillStyle = "#FFFFFF"; ctx.font = "bold 68px Arial"; ctx.textAlign = "left";
  ctx.fillText(title, 28, 94);
  return c;
}

function Minimap({ px, pz }) {
  const cvs = useRef(null);
  useEffect(() => {
    if (!cvs.current) return;
    const ctx = cvs.current.getContext("2d");
    const W = 130, H = 130;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = "rgba(4,8,20,0.9)"; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle = "rgba(0,119,255,0.4)"; ctx.lineWidth = 1; ctx.strokeRect(0,0,W,H);
    const toM = (x,z) => [(x+16)*(W/32), (z+12)*(H/95)];
    const rooms = [[-3,-12,3,80,"rgba(0,80,180,0.2)"],[-14,0,-3,72,"rgba(0,60,140,0.2)"],[3,0,14,72,"rgba(0,60,140,0.2)"]];
    rooms.forEach(([lx,lz,rx,rz,col]) => {
      const [ax,az]=toM(lx,lz), [bx,bz]=toM(rx,rz);
      ctx.fillStyle=col; ctx.fillRect(ax,az,bx-ax,bz-az);
      ctx.strokeStyle="rgba(0,150,255,0.5)"; ctx.lineWidth=1; ctx.strokeRect(ax,az,bx-ax,bz-az);
    });
    const [pdx,pdz]=toM(px,pz);
    ctx.fillStyle="#00D4FF"; ctx.beginPath(); ctx.arc(pdx,pdz,4,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle="#FFF"; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(pdx,pdz,4,0,Math.PI*2); ctx.stroke();
  },[px,pz]);
  return (
    <div style={{position:"fixed",bottom:18,left:18,zIndex:300,border:"1px solid rgba(0,119,255,0.5)",
      boxShadow:"0 0 16px rgba(0,100,255,0.3)",borderRadius:6,overflow:"hidden",background:"rgba(4,8,20,0.92)"}}>
      <canvas ref={cvs} width={130} height={130}/>
      <div style={{position:"absolute",top:4,left:6,fontSize:9,fontFamily:"monospace",
        color:"rgba(0,200,255,0.8)",letterSpacing:"0.08em"}}>MINIMAP</div>
    </div>
  );
}

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
          background:"rgba(150,0,0,0.82)",border:"none",borderBottom:"1px solid rgba(255,255,255,0.12)",
          color:"#fff",cursor:"pointer",writingMode:"vertical-rl",
          padding:"10px 8px",fontFamily:"monospace",fontSize:9,letterSpacing:"0.1em"}}>
          {b.i} {b.l}
        </button>
      ))}
      {showHelp && (
        <div style={{position:"fixed",right:50,top:110,zIndex:300,
          background:"rgba(4,6,14,0.95)",border:"1px solid rgba(0,119,255,0.25)",
          borderRadius:8,padding:"16px 20px",fontFamily:"monospace",
          color:"rgba(200,220,255,0.85)",fontSize:12,lineHeight:1.8,minWidth:220}}>
          <div style={{color:"#00D4FF",marginBottom:8,letterSpacing:"0.1em"}}>CONTROLS</div>
          <div>W A S D &nbsp;&mdash; Move</div>
          <div>Mouse &nbsp;&nbsp;&mdash; Look</div>
          <div>Click &nbsp;&nbsp;&mdash; Open panel</div>
          <div>ESC &nbsp;&nbsp;&nbsp;&mdash; Release mouse</div>
          <button onClick={()=>setShowHelp(false)} style={{marginTop:12,background:"none",
            border:"1px solid rgba(255,255,255,0.15)",color:"rgba(180,200,255,0.7)",
            cursor:"pointer",borderRadius:4,padding:"4px 12px",fontFamily:"monospace",fontSize:11}}>
            CLOSE
          </button>
        </div>
      )}
    </>
  );
}

function PanelModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:500,
      background:"rgba(2,4,8,0.92)",backdropFilter:"blur(16px)",
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"rgba(6,10,20,0.98)",
        border:"1px solid rgba(0,119,255,0.25)",borderRadius:12,padding:24,
        maxWidth:"85vw",maxHeight:"85vh",display:"flex",flexDirection:"column",alignItems:"center"}}>
        {item.type==="photo" ? (
          <img src={cImg(item.id,1400,900)} alt={item.label}
            style={{maxWidth:"100%",maxHeight:"70vh",objectFit:"contain",borderRadius:8}}/>
        ) : (
          <video src={cVid(item.id)} autoPlay muted loop playsInline controls
            style={{maxWidth:"100%",maxHeight:"70vh",borderRadius:8}}/>
        )}
        <div style={{marginTop:16,color:"#E0EAFF",fontFamily:"monospace",fontSize:14,letterSpacing:"0.06em"}}>
          {item.label} &nbsp;&middot;&nbsp; <span style={{color:"#0077FF"}}>{item.tag}</span>
        </div>
        <button onClick={onClose} style={{marginTop:14,background:"rgba(255,255,255,0.06)",
          border:"1px solid rgba(255,255,255,0.15)",color:"rgba(200,220,255,0.8)",
          cursor:"pointer",borderRadius:6,padding:"6px 20px",fontFamily:"monospace",fontSize:11}}>
          CLOSE
        </button>
      </div>
    </div>
  );
}

function Onboarding({ onStart }) {
  const [phase, setPhase] = useState("hello");
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (phase==="hello") { const t=setTimeout(()=>setPhase("mode"),2000); return ()=>clearTimeout(t); }
    if (phase==="loading") {
      let p=0;
      const iv=setInterval(()=>{ p+=Math.random()*14+4; if(p>=100){p=100;clearInterval(iv);setTimeout(()=>setPhase("enter"),400);} setProgress(Math.min(100,p)); },80);
      return ()=>clearInterval(iv);
    }
  },[phase]);
  const base={position:"fixed",inset:0,zIndex:999,display:"flex",flexDirection:"column",
    alignItems:"center",justifyContent:"center",
    background:"radial-gradient(ellipse 100% 100% at 50% 0%, #08122A 0%, #020408 70%)",
    fontFamily:"monospace"};
  if (phase==="hello") return (
    <div style={base}>
      <div style={{fontSize:48,letterSpacing:"0.35em",color:"#00D4FF",animation:"pulse 1.5s ease-in-out infinite"}}>SERAPHIC</div>
      <div style={{fontSize:14,letterSpacing:"0.5em",color:"rgba(0,180,255,0.5)",marginTop:8}}>SIGHT &middot; SHOWROOM</div>
      <style>{`@keyframes pulse{0%,100%{opacity:0.7}50%{opacity:1}}`}</style>
    </div>
  );
  if (phase==="mode") return (
    <div style={base}>
      <div style={{fontSize:13,letterSpacing:"0.3em",color:"rgba(0,200,255,0.6)",marginBottom:32}}>SELECT NAVIGATION MODE</div>
      {[{k:"normal",label:"STANDARD",desc:"WASD + Mouse Look"},{k:"easy",label:"EASY",desc:"Click to Teleport"}].map(m=>(
        <button key={m.k} onClick={()=>setPhase("loading")} style={{marginBottom:14,
          background:"rgba(255,255,255,0.03)",border:"1px solid rgba(0,119,255,0.3)",
          color:"#E0F0FF",cursor:"pointer",borderRadius:8,padding:"14px 48px",
          fontFamily:"monospace",fontSize:14,letterSpacing:"0.15em",width:280}}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,119,255,0.12)";e.currentTarget.style.borderColor="rgba(0,119,255,0.6)";}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.borderColor="rgba(0,119,255,0.3)";}}>
          <div>{m.label}</div>
          <div style={{fontSize:10,color:"rgba(180,210,255,0.5)",marginTop:4}}>{m.desc}</div>
        </button>
      ))}
    </div>
  );
  if (phase==="loading") return (
    <div style={base}>
      <div style={{fontSize:11,letterSpacing:"0.35em",color:"rgba(0,200,255,0.7)",marginBottom:20}}>INITIALIZING GALLERY</div>
      <div style={{width:300,height:2,background:"rgba(255,255,255,0.08)",borderRadius:2}}>
        <div style={{height:"100%",borderRadius:2,transition:"width 0.08s linear",
          background:"linear-gradient(90deg,#0077FF,#00BFA6)",width:`${progress}%`}}/>
      </div>
      <div style={{marginTop:12,fontSize:10,color:"rgba(0,200,255,0.5)",letterSpacing:"0.2em"}}>{Math.round(progress)}%</div>
    </div>
  );
  return (
    <div style={base}>
      <div style={{fontSize:13,letterSpacing:"0.35em",color:"rgba(0,210,255,0.7)",marginBottom:8}}>READY TO EXPLORE</div>
      <div style={{fontSize:10,color:"rgba(150,180,220,0.5)",marginBottom:32,letterSpacing:"0.15em"}}>
        <strong>Mouse</strong> to look &nbsp;&middot;&nbsp; <strong>WASD</strong> to move &nbsp;&middot;&nbsp; <strong>Click</strong> panel to view
      </div>
      <button onClick={onStart} style={{background:"linear-gradient(135deg,#0077FF,#00BFA6)",
        border:"none",color:"#fff",cursor:"pointer",borderRadius:8,padding:"14px 52px",
        fontFamily:"monospace",fontSize:14,letterSpacing:"0.2em"}}>
        ENTER GALLERY
      </button>
    </div>
  );
}

export default function SpatialShowroom() {
  const mountRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [pos, setPos] = useState([0,-10]);
  const [zone, setZone] = useState("ENTRY HALL");
  const [modal, setModal] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(()=>{
    if (!started) return;
    const el = mountRef.current;
    if (!el) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias:true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.8;
    el.appendChild(renderer.domElement);

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0B1628);
    scene.fog = new THREE.Fog(0x0B1628, 40, 110);

    const camera = new THREE.PerspectiveCamera(72, window.innerWidth/window.innerHeight, 0.1, 120);
    camera.position.set(0, 1.7, -10);
    camera.lookAt(0, 1.7, 0);

    // Materials
    const floorTex = new THREE.CanvasTexture(makeFloorTex());
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(8, 20);
    const floorMat = new THREE.MeshStandardMaterial({ map:floorTex, roughness:0.1, metalness:0.5, color:0x131E30 });
    const ceilMat  = new THREE.MeshStandardMaterial({ color:0x0F1829, roughness:0.9, metalness:0.05 });
    const wallMat  = new THREE.MeshStandardMaterial({ color:0x1E2D45, roughness:0.8, metalness:0.08 });
    const trimMatB = new THREE.MeshStandardMaterial({ color:0x2266FF, emissive:new THREE.Color(0x0044CC), emissiveIntensity:1.2, roughness:0.2, metalness:0.6 });
    const trimMatT = new THREE.MeshStandardMaterial({ color:0x00BBAA, emissive:new THREE.Color(0x009988), emissiveIntensity:1.0, roughness:0.2, metalness:0.6 });

    function box(px,py,pz,w,h,d,mat) {
      const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
      m.position.set(px,py,pz); m.receiveShadow=true; scene.add(m); return m;
    }
    function floor(px,py,pz,w,d,mat) {
      const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat);
      m.rotation.x=-Math.PI/2; m.position.set(px,py,pz); m.receiveShadow=true; scene.add(m);
    }
    function strip(px,py,pz,len,mat) {
      const m=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.05,len),mat.clone());
      m.position.set(px,py,pz); scene.add(m);
    }

    // Floors
    floor(0,0,34,30,92,floorMat);
    floor(-8.5,0,36,11,72,floorMat.clone());
    floor(8.5,0,36,11,72,floorMat.clone());

    // Ceilings
    box(0,5.5,34,30,0.3,92,ceilMat.clone());
    box(-8.5,5.5,36,11,0.3,72,ceilMat.clone());
    box(8.5,5.5,36,11,0.3,72,ceilMat.clone());

    // Walls
    box(-3.08,2.75,33,0.15,5.5,92,wallMat.clone());
    box(3.08,2.75,33,0.15,5.5,92,wallMat.clone());
    box(-14.08,2.75,36,0.15,5.5,72,wallMat.clone());
    box(14.08,2.75,36,0.15,5.5,72,wallMat.clone());
    box(-8.5,2.75,-1,11,5.5,0.15,wallMat.clone());
    box(8.5,2.75,-1,11,5.5,0.15,wallMat.clone());
    box(0,2.75,80,30,5.5,0.15,wallMat.clone());
    box(-8.5,2.75,72,11,5.5,0.15,wallMat.clone());
    box(8.5,2.75,72,11,5.5,0.15,wallMat.clone());

    // Trim
    [[-14.05,0.03,36,72],[-3.05,0.03,33,92],[3.05,0.03,33,92],[14.05,0.03,36,72]].forEach(([x,y,z,l])=>strip(x,y,z,l,trimMatB));
    [[-14.05,5.48,36,72],[-3.05,5.48,33,92],[3.05,5.48,33,92],[14.05,5.48,36,72]].forEach(([x,y,z,l])=>strip(x,y,z,l,trimMatT));

    // Entry arch ring
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.4,0.06,8,64),new THREE.MeshStandardMaterial({
      color:0x0066EE,emissive:new THREE.Color(0x0044BB),emissiveIntensity:1.5,roughness:0.2,metalness:0.8}));
    ring.position.set(0,2.75,-11); ring.rotation.x=Math.PI/2; scene.add(ring);

    // LIGHTING -- the big fix
    scene.add(new THREE.AmbientLight(0xFFFFFF, 1.2));
    scene.add(new THREE.HemisphereLight(0x6688CC, 0x112233, 2.0));
    // Ceiling point lights: warm white, 2.5 intensity, 22 unit range
    [[0,-8],[0,2],[0,12],[0,22],[0,32],[0,42],[0,52],[0,62],[0,72],
     [-8.5,6],[-8.5,18],[-8.5,30],[-8.5,42],[-8.5,54],[-8.5,66],
     [8.5,6],[8.5,18],[8.5,30],[8.5,42],[8.5,54],[8.5,66]
    ].forEach(([x,z])=>{
      const disc=new THREE.Mesh(new THREE.CircleGeometry(0.28,16),new THREE.MeshBasicMaterial({color:0xEEEEFF}));
      disc.rotation.x=Math.PI/2; disc.position.set(x,5.4,z); scene.add(disc);
      const pl=new THREE.PointLight(0xFFEEDD,2.5,22);
      pl.position.set(x,5.2,z); scene.add(pl);
    });

    // Section signs -- DoubleSide, correct positions facing corridor entrance
    [
      {text:"PHOTO GALLERY",x:-8.5,y:4.6,z:-0.3,accent:"#0088FF"},
      {text:"VIDEO GALLERY",x:8.5,y:4.6,z:-0.3,accent:"#00BFA6"},
      {text:"SERAPHIC SIGHT",x:0,y:4.2,z:-10.5,accent:"#0088FF"},
    ].forEach(s=>{
      const tex=new THREE.CanvasTexture(makeSectionTex(s.text,s.accent));
      const m=new THREE.Mesh(new THREE.PlaneGeometry(6,0.8),
        new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide}));
      m.position.set(s.x,s.y,s.z); scene.add(m);
    });

    // Panels
    const hotspots=[];
    const loader=new THREE.TextureLoader();
    loader.crossOrigin="anonymous";
    const FW=3.8, FH=2.2, ZGAP=4.8;
    const YU=3.3, YL=1.1;  // upper row: frame 2.2-4.4, lower row: frame 0.0-2.2

    PHOTOS.forEach((ph,i)=>{
      const col=i%2, row=Math.floor(i/2);
      const y=col===0?YU:YL, z=3+row*ZGAP;
      const pX=-13.9;
      // Frame
      const fm=new THREE.Mesh(new THREE.BoxGeometry(FW+0.16,FH+0.16,0.09),
        new THREE.MeshStandardMaterial({color:0x1A2A3E,roughness:0.25,metalness:0.85,emissive:new THREE.Color(0x002255),emissiveIntensity:0.5}));
      fm.position.set(pX+0.07,y,z); fm.rotation.y=Math.PI/2; fm.castShadow=true; scene.add(fm);
      // Screen
      const tex=loader.load(cImg(ph.id,840,560));
      tex.colorSpace=THREE.SRGBColorSpace;
      const sc=new THREE.Mesh(new THREE.PlaneGeometry(FW,FH),new THREE.MeshBasicMaterial({map:tex}));
      sc.position.set(pX+0.12,y,z); sc.rotation.y=Math.PI/2; scene.add(sc);
      // Label
      const lt=new THREE.CanvasTexture(makeLabelTex(ph.label,ph.tag,"#0077FF"));
      const lb=new THREE.Mesh(new THREE.PlaneGeometry(FW,0.65),new THREE.MeshBasicMaterial({map:lt,transparent:true}));
      lb.position.set(pX+0.13,y-(FH/2+0.42),z); lb.rotation.y=Math.PI/2; scene.add(lb);
      // Glow bar
      const gm=new THREE.Mesh(new THREE.BoxGeometry(FW+0.16,0.04,0.04),
        new THREE.MeshStandardMaterial({color:0x0055FF,emissive:new THREE.Color(0x0033CC),emissiveIntensity:2.0}));
      gm.position.set(pX+0.06,y+FH/2+0.1,z); gm.rotation.y=Math.PI/2; scene.add(gm);
      // Spotlight
      const sl=new THREE.SpotLight(0xFFFFFF,4.0,12,Math.PI/7,0.5);
      sl.position.set(pX+5,y+2,z); sl.target.position.set(pX+0.1,y,z);
      scene.add(sl); scene.add(sl.target);
      sc.userData={type:"photo",...ph}; hotspots.push(sc);
    });

    VIDEOS.forEach((vid,i)=>{
      const col=i%2, row=Math.floor(i/2);
      const y=col===0?YU:YL, z=3+row*ZGAP;
      const pX=13.9;
      const fm=new THREE.Mesh(new THREE.BoxGeometry(FW+0.16,FH+0.16,0.09),
        new THREE.MeshStandardMaterial({color:0x1A2035,roughness:0.25,metalness:0.85,emissive:new THREE.Color(0x001C33),emissiveIntensity:0.5}));
      fm.position.set(pX-0.07,y,z); fm.rotation.y=-Math.PI/2; fm.castShadow=true; scene.add(fm);
      const videoEl=document.createElement("video");
      videoEl.src=cVid(vid.id); videoEl.loop=true; videoEl.muted=true;
      videoEl.playsInline=true; videoEl.crossOrigin="anonymous"; videoEl.autoplay=true;
      videoEl.play().catch(()=>{});
      const vTex=new THREE.VideoTexture(videoEl);
      vTex.colorSpace=THREE.SRGBColorSpace;
      const sc=new THREE.Mesh(new THREE.PlaneGeometry(FW,FH),new THREE.MeshBasicMaterial({map:vTex}));
      sc.position.set(pX-0.12,y,z); sc.rotation.y=-Math.PI/2; scene.add(sc);
      const lt=new THREE.CanvasTexture(makeLabelTex(vid.label,vid.tag,"#00BFA6"));
      const lb=new THREE.Mesh(new THREE.PlaneGeometry(FW,0.65),new THREE.MeshBasicMaterial({map:lt,transparent:true}));
      lb.position.set(pX-0.13,y-(FH/2+0.42),z); lb.rotation.y=-Math.PI/2; scene.add(lb);
      const gm=new THREE.Mesh(new THREE.BoxGeometry(FW+0.16,0.04,0.04),
        new THREE.MeshStandardMaterial({color:0x00AABB,emissive:new THREE.Color(0x007788),emissiveIntensity:2.0}));
      gm.position.set(pX-0.06,y+FH/2+0.1,z); gm.rotation.y=-Math.PI/2; scene.add(gm);
      const sl=new THREE.SpotLight(0xFFFFFF,4.0,12,Math.PI/7,0.5);
      sl.position.set(pX-5,y+2,z); sl.target.position.set(pX-0.1,y,z);
      scene.add(sl); scene.add(sl.target);
      sc.userData={type:"video",...vid}; hotspots.push(sc);
    });

    // Controls
    const keys={};
    const euler=new THREE.Euler(0,0,0,"YXZ");
    let locked=false;
    const onKey=(e,v)=>{keys[e.code]=v;};
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
    window.addEventListener("keydown",e=>onKey(e,true));
    window.addEventListener("keyup",e=>onKey(e,false));
    document.addEventListener("mousemove",onMove);
    document.addEventListener("pointerlockchange",onLock);
    renderer.domElement.addEventListener("click",onClick);

    const dir=new THREE.Vector3(), right=new THREE.Vector3();
    const SPEED=0.07;
    const getZone=(p)=>{
      if(p.z<0) return "ENTRY HALL";
      if(p.x<-3.5) return "PHOTO GALLERY";
      if(p.x>3.5)  return "VIDEO GALLERY";
      if(p.z>72)   return "CONTACT";
      return "MAIN CORRIDOR";
    };
    let rafId;
    const tick=()=>{
      rafId=requestAnimationFrame(tick);
      camera.getWorldDirection(dir); dir.y=0; dir.normalize();
      right.crossVectors(dir,new THREE.Vector3(0,1,0)).normalize();
      const vel=new THREE.Vector3();
      if(keys["KeyW"]||keys["ArrowUp"])   vel.add(dir);
      if(keys["KeyS"]||keys["ArrowDown"]) vel.sub(dir);
      if(keys["KeyA"]||keys["ArrowLeft"]) vel.sub(right);
      if(keys["KeyD"]||keys["ArrowRight"])vel.add(right);
      if(vel.length()>0){
        vel.normalize().multiplyScalar(SPEED);
        const nx=Math.max(-13.7,Math.min(13.7,camera.position.x+vel.x));
        const nz=Math.max(-11.5,Math.min(79.5,camera.position.z+vel.z));
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
    <div style={{width:"100vw",height:"100vh",overflow:"hidden",background:"#0B1628"}}>
      {!started && <Onboarding onStart={()=>setStarted(true)}/>}
      <div ref={mountRef} style={{width:"100%",height:"100%",display:started?"block":"none"}}/>
      {started && (
        <>
          <Minimap px={pos[0]} pz={pos[1]}/>
          <HUD zone={zone} showHelp={showHelp} setShowHelp={setShowHelp}/>
          <PanelModal item={modal} onClose={()=>setModal(null)}/>
          <div style={{position:"fixed",bottom:52,left:"50%",transform:"translateX(-50%)",
            fontFamily:"monospace",fontSize:11,letterSpacing:"0.18em",
            color:"rgba(0,200,255,0.5)",textTransform:"uppercase",pointerEvents:"none",zIndex:200}}>
            Click canvas to start &nbsp;&middot;&nbsp; WASD to move &nbsp;&middot;&nbsp; ESC to release
          </div>
        </>
      )}
    </div>
  );
}
