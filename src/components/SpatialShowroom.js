// SpatialShowroom.js v10
// Changes: smart CTA modal (no mailto blank-page), CTA panels repositioned,
//   one-row photo/video galleries, improved parcel exhibit (TubeGeometry boundary,
//   pulsing corners), drone flight path ribbon, 3 centerpieces equally spaced.

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const CLD = "https://res.cloudinary.com/dpc1noikx";
const cImg = (id, w=1200, h=750) =>
  `${CLD}/image/upload/w_${w},h_${h},c_fill,f_auto,q_auto:good/${id}`;
const cVid = (id) =>
  `${CLD}/video/upload/f_mp4,q_auto:good,vc_h264,w_960/${id}`;

const PHOTOS = [
  { id:"DJI_0915_w53hst",   label:"Aerial Overview"       },
  { id:"DJI_0891_tgrszt",   label:"Property Perspective"  },
  { id:"DJI_0876_imzqgc",   label:"Residential Aerial"    },
  { id:"DJI_0802_cdwyvj",   label:"Commercial Site"       },
  { id:"DJI_0730_enavrk",   label:"Mixed-Use Development" },
  { id:"DJI_0327_it5brs",   label:"Construction Progress" },
  { id:"sola-florance-construction-aerial_oapibr", label:"Sola Florance Site" },
  { id:"DJI_0322_khfwqi",   label:"Site Documentation"    },
  { id:"Aerial_27_qw5yqr",  label:"Commercial Aerial"     },
  { id:"DJI_0872_vddljb",   label:"Listing Photography"   },
];
const VIDEOS = [
  { id:"clip_joey_updated_bbfclp", label:"Cinematic Reel"      },
  { id:"joe_4_pjcua7",             label:"Property Showcase"   },
  { id:"clip1_nscwwy",             label:"Aerial Walkthrough"  },
  { id:"part_1_rzf7yo",            label:"Aerial Cinematic"    },
  { id:"Copy_of_V1_2_eshjoq",      label:"Listing Video"       },
  { id:"Copy_of_DJI_0719_rlyiv1",  label:"Drone Flight"        },
];

// Room constants
const GW=18, GD=40, GH=4.8;
const EW=6,  ED=8;
const LX=-9.0, RX=9.0;
// 3 centerpieces equally spaced: z=10, z=20, z=30 (40-unit gallery / 4 = 10)
const PARCEL_POS  = [0, 1.3, 10];
const FLIGHT_Z    = [14, 20, 26];   // flight ribbon start, center, end
const CLOUD_POS   = [0, 2.6, 30];

// Canvas texture generators
function makeFloorTex() {
  const c=document.createElement("canvas"); c.width=1024; c.height=1024;
  const ctx=c.getContext("2d");
  ctx.fillStyle="#090F1C"; ctx.fillRect(0,0,1024,1024);
  ctx.strokeStyle="rgba(35,80,150,0.4)"; ctx.lineWidth=1;
  for(let i=0;i<=1024;i+=64){
    ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,1024);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(1024,i);ctx.stroke();
  }
  ctx.strokeStyle="rgba(0,180,160,0.5)"; ctx.lineWidth=1.5;
  for(let x=0;x<=1024;x+=256) for(let y=0;y<=1024;y+=256){
    ctx.beginPath();ctx.moveTo(x-12,y);ctx.lineTo(x+12,y);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x,y-12);ctx.lineTo(x,y+12);ctx.stroke();
  }
  return c;
}
function makeServicesTex() {
  const c=document.createElement("canvas"); c.width=1024; c.height=768;
  const ctx=c.getContext("2d");
  ctx.fillStyle="#060D1A"; ctx.fillRect(0,0,1024,768);
  const grad=ctx.createLinearGradient(0,0,1024,0);
  grad.addColorStop(0,"rgba(0,80,200,0)");
  grad.addColorStop(0.5,"rgba(0,120,255,0.9)");
  grad.addColorStop(1,"rgba(0,80,200,0)");
  ctx.fillStyle=grad; ctx.fillRect(0,0,1024,2);
  ctx.fillStyle="rgba(255,255,255,0.12)"; ctx.fillRect(60,36,904,2);
  ctx.fillStyle="#FFFFFF"; ctx.font="bold 46px Arial"; ctx.textAlign="center";
  ctx.fillText("SERAPHIC SIGHT",512,90);
  ctx.fillStyle="rgba(0,150,255,0.6)"; ctx.font="18px Arial";
  ctx.fillText("SERVICES",512,124);
  ctx.fillStyle="rgba(255,255,255,0.08)"; ctx.fillRect(60,142,904,1);
  const services=[
    ["Aerial Photography",         "High-resolution stills from licensed drone pilots"],
    ["Aerial Video Production",    "Cinematic 4K footage for listings and marketing"],
    ["Real Estate & Land Marketing","MLS-ready assets delivered in 3-4 business days"],
    ["Construction Progress",      "Sequential site documentation for project records"],
    ["Site Context Documentation", "Surrounding area, access routes, and site context"],
    ["Parcel Boundary Overlays",   "GPS-accurate boundary visualization on imagery"],
    ["Drone Mapping Support",      "Visual reference for planning and permitting"],
  ];
  services.forEach(([title,sub],i)=>{
    const y=186+i*80;
    ctx.fillStyle="rgba(0,130,255,0.7)"; ctx.fillRect(60,y-22,3,40);
    ctx.fillStyle="#D8E8FF"; ctx.font="bold 26px Arial"; ctx.textAlign="left"; ctx.fillText(title,76,y);
    ctx.fillStyle="rgba(140,175,230,0.55)"; ctx.font="17px Arial"; ctx.fillText(sub,76,y+26);
  });
  ctx.fillStyle=grad; ctx.fillRect(0,766,1024,2);
  return c;
}
function makeCTATex(text, accent="#0066EE") {
  const c=document.createElement("canvas"); c.width=512; c.height=88;
  const ctx=c.getContext("2d");
  ctx.fillStyle="rgba(4,10,24,0.92)"; ctx.roundRect(0,0,512,88,6); ctx.fill();
  const g=ctx.createLinearGradient(0,0,512,0);
  g.addColorStop(0,accent+"88"); g.addColorStop(1,accent+"22");
  ctx.fillStyle=g; ctx.roundRect(0,0,512,88,6); ctx.fill();
  ctx.strokeStyle=accent; ctx.lineWidth=1; ctx.roundRect(0.5,0.5,511,87,6); ctx.stroke();
  ctx.fillStyle="#FFFFFF"; ctx.font="bold 32px Arial"; ctx.textAlign="center"; ctx.fillText(text,256,52);
  ctx.fillStyle=accent+"CC"; ctx.font="16px Arial"; ctx.fillText(">",480,52);
  return c;
}
function makeParcelLabelTex() {
  const c=document.createElement("canvas"); c.width=280; c.height=44;
  const ctx=c.getContext("2d");
  ctx.fillStyle="rgba(0,20,50,0.75)"; ctx.fillRect(0,0,280,44);
  ctx.strokeStyle="rgba(0,200,180,0.5)"; ctx.lineWidth=1; ctx.strokeRect(0.5,0.5,279,43);
  ctx.fillStyle="#00EED8"; ctx.font="bold 16px Arial"; ctx.textAlign="center"; ctx.fillText("PARCEL BOUNDARY PREVIEW",140,18);
  ctx.fillStyle="rgba(160,220,255,0.6)"; ctx.font="12px Arial"; ctx.fillText("Boundary Mapping · Drone Survey",140,34);
  return c;
}

// Minimap
function Minimap({ px, pz }) {
  const cvs=useRef(null);
  useEffect(()=>{
    if(!cvs.current) return;
    const ctx=cvs.current.getContext("2d");
    ctx.clearRect(0,0,120,120);
    ctx.fillStyle="rgba(4,8,18,0.93)"; ctx.fillRect(0,0,120,120);
    ctx.strokeStyle="rgba(0,90,180,0.35)"; ctx.lineWidth=1; ctx.strokeRect(0,0,120,120);
    const tx=(x)=>((x+9)/18)*120;
    const tz=(z)=>((z+8)/48)*120;
    ctx.fillStyle="rgba(0,50,130,0.28)";
    ctx.fillRect(tx(LX),tz(0),tx(RX)-tx(LX),tz(GD)-tz(0));
    ctx.fillStyle="rgba(0,40,100,0.4)";
    ctx.fillRect(tx(-EW/2),tz(-ED),tx(EW/2)-tx(-EW/2),tz(0)-tz(-ED));
    ctx.strokeStyle="rgba(0,120,255,0.4)"; ctx.lineWidth=0.8;
    ctx.strokeRect(tx(LX),tz(0),tx(RX)-tx(LX),tz(GD)-tz(0));
    ctx.fillStyle="rgba(0,150,255,0.45)";
    ctx.beginPath(); ctx.arc(tx(CLOUD_POS[0]),tz(CLOUD_POS[2]),3,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#00D4FF";
    ctx.beginPath(); ctx.arc(tx(px),tz(pz),3.5,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle="#FFF"; ctx.lineWidth=0.8;
    ctx.beginPath(); ctx.arc(tx(px),tz(pz),3.5,0,Math.PI*2); ctx.stroke();
  },[px,pz]);
  return (
    <div style={{position:"fixed",bottom:16,left:16,zIndex:300,
      border:"1px solid rgba(0,90,200,0.4)",borderRadius:4,overflow:"hidden"}}>
      <canvas ref={cvs} width={120} height={120}/>
      <div style={{position:"absolute",top:3,left:5,fontSize:8,fontFamily:"monospace",
        color:"rgba(0,170,255,0.65)",letterSpacing:"0.1em"}}>MINIMAP</div>
    </div>
  );
}

// HUD
function HUD({ zone, showHelp, setShowHelp }) {
  return (
    <>
      <div style={{position:"fixed",top:22,right:22,zIndex:200,fontFamily:"monospace",fontSize:10,
        letterSpacing:"0.16em",color:"rgba(0,200,255,0.9)",textTransform:"uppercase",
        background:"rgba(4,8,20,0.8)",padding:"5px 12px",
        border:"1px solid rgba(0,130,255,0.22)",borderRadius:3,backdropFilter:"blur(8px)"}}>
        1F &nbsp;&middot;&nbsp; {zone}
      </div>
      <svg style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
        zIndex:200,pointerEvents:"none",opacity:0.6}} width={24} height={24}>
        <line x1={12} y1={2}  x2={12} y2={9}  stroke="#00D4FF" strokeWidth={1.5}/>
        <line x1={12} y1={15} x2={12} y2={22} stroke="#00D4FF" strokeWidth={1.5}/>
        <line x1={2}  y1={12} x2={9}  y2={12} stroke="#00D4FF" strokeWidth={1.5}/>
        <line x1={15} y1={12} x2={22} y2={12} stroke="#00D4FF" strokeWidth={1.5}/>
      </svg>
      <button onClick={()=>setShowHelp(h=>!h)} style={{
        position:"fixed",right:0,zIndex:300,top:110,
        background:"rgba(10,20,50,0.9)",border:"none",borderBottom:"1px solid rgba(255,255,255,0.08)",
        color:"rgba(160,200,255,0.8)",cursor:"pointer",writingMode:"vertical-rl",
        padding:"10px 7px",fontFamily:"monospace",fontSize:8,letterSpacing:"0.14em"}}>i INFO</button>
      {showHelp && (
        <div style={{position:"fixed",right:40,top:105,zIndex:300,background:"rgba(3,6,14,0.97)",
          border:"1px solid rgba(0,90,255,0.18)",borderRadius:6,padding:"14px 18px",
          fontFamily:"monospace",color:"rgba(200,220,255,0.8)",fontSize:11,lineHeight:1.9,minWidth:200}}>
          <div style={{color:"#00D4FF",marginBottom:6,letterSpacing:"0.12em"}}>CONTROLS</div>
          <div>W A S D &mdash; Move</div><div>Mouse &mdash; Look</div>
          <div>Click panel &mdash; Full view</div><div>ESC &mdash; Release mouse</div>
          <button onClick={()=>setShowHelp(false)} style={{marginTop:10,background:"none",
            border:"1px solid rgba(255,255,255,0.1)",color:"rgba(140,180,255,0.6)",
            cursor:"pointer",borderRadius:3,padding:"3px 10px",fontFamily:"monospace",fontSize:10}}>CLOSE</button>
        </div>
      )}
    </>
  );
}

// Modal — smart link handling: no mailto blank-page bug
function PanelModal({ item, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!item) return null;

  if (item.cta) {
    const isMailto = item.href && item.href.startsWith("mailto:");
    const isExternal = item.href && (item.href.startsWith("http://") || item.href.startsWith("https://"));
    const email = isMailto ? item.href.replace("mailto:","") : null;
    return (
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:500,
        background:"rgba(1,3,8,0.94)",backdropFilter:"blur(18px)",
        display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div onClick={e=>e.stopPropagation()} style={{background:"rgba(5,9,22,0.99)",
          border:"1px solid rgba(0,100,255,0.2)",borderRadius:10,padding:"36px 48px",
          display:"flex",flexDirection:"column",alignItems:"center",gap:16,minWidth:320}}>
          <div style={{color:"#D0E8FF",fontFamily:"monospace",fontSize:20,letterSpacing:"0.08em",fontWeight:700}}>{item.title}</div>
          <div style={{color:"rgba(140,175,230,0.7)",fontFamily:"monospace",fontSize:12,textAlign:"center",whiteSpace:"pre-line"}}>{item.body}</div>
          {isMailto ? (
            <>
              <div style={{color:"#A0C8FF",fontFamily:"monospace",fontSize:13,letterSpacing:"0.04em"}}>{email}</div>
              <button onClick={()=>{navigator.clipboard.writeText(email);setCopied(true);setTimeout(()=>setCopied(false),2200);}}
                style={{background:"linear-gradient(135deg,#0055CC,#00AAA0)",border:"none",color:"#fff",
                  cursor:"pointer",borderRadius:6,padding:"12px 36px",fontFamily:"monospace",
                  fontSize:13,letterSpacing:"0.18em",marginTop:4}}>
                {copied ? "COPIED!" : "COPY EMAIL"}
              </button>
            </>
          ) : (
            <a href={item.href} target={isExternal?"_blank":undefined}
              rel={isExternal?"noopener noreferrer":undefined}
              style={{background:"linear-gradient(135deg,#0055CC,#00AAA0)",border:"none",color:"#fff",
                cursor:"pointer",borderRadius:6,padding:"12px 36px",fontFamily:"monospace",
                fontSize:13,letterSpacing:"0.18em",textDecoration:"none",marginTop:4}}>
              {item.action}
            </a>
          )}
          <button onClick={onClose} style={{background:"none",border:"1px solid rgba(255,255,255,0.1)",
            color:"rgba(140,170,220,0.5)",cursor:"pointer",borderRadius:3,
            padding:"4px 14px",fontFamily:"monospace",fontSize:10}}>CLOSE</button>
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:500,
      background:"rgba(1,3,8,0.94)",backdropFilter:"blur(18px)",
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"rgba(5,9,20,0.99)",
        border:"1px solid rgba(0,100,255,0.18)",borderRadius:10,padding:22,
        maxWidth:"88vw",maxHeight:"88vh",display:"flex",flexDirection:"column",alignItems:"center"}}>
        {item.type==="photo"
          ? <img src={cImg(item.id,1400,900)} alt={item.label}
              style={{maxWidth:"100%",maxHeight:"72vh",objectFit:"contain",borderRadius:6}}/>
          : <video src={cVid(item.id)} autoPlay muted loop playsInline controls
              style={{maxWidth:"100%",maxHeight:"72vh",borderRadius:6}}/>}
        <div style={{marginTop:14,color:"#D8E8FF",fontFamily:"monospace",fontSize:13}}>{item.label}</div>
        <button onClick={onClose} style={{marginTop:12,background:"rgba(255,255,255,0.04)",
          border:"1px solid rgba(255,255,255,0.1)",color:"rgba(160,200,255,0.7)",
          cursor:"pointer",borderRadius:4,padding:"5px 18px",fontFamily:"monospace",fontSize:10}}>CLOSE</button>
      </div>
    </div>
  );
}

// Onboarding
function Onboarding({ onStart }) {
  const [phase,setPhase]=useState("hello");
  const [prog,setProg]=useState(0);
  useEffect(()=>{
    if(phase==="hello"){const t=setTimeout(()=>setPhase("enter"),1800);return()=>clearTimeout(t);}
    if(phase==="loading"){
      let p=0;
      const iv=setInterval(()=>{
        p+=Math.random()*16+6;
        if(p>=100){p=100;clearInterval(iv);setTimeout(()=>onStart(),250);}
        setProg(Math.min(100,p));
      },65);
      return()=>clearInterval(iv);
    }
  },[phase,onStart]);
  const base={position:"fixed",inset:0,zIndex:999,display:"flex",flexDirection:"column",
    alignItems:"center",justifyContent:"center",
    background:"radial-gradient(ellipse 110% 100% at 50% 0%,#060E20 0%,#010306 78%)",
    fontFamily:"monospace"};
  if(phase==="hello") return (
    <div style={base}>
      <div style={{fontSize:42,letterSpacing:"0.4em",color:"#00C8FF",animation:"pls 1.6s ease-in-out infinite"}}>SERAPHIC</div>
      <div style={{fontSize:12,letterSpacing:"0.55em",color:"rgba(0,160,255,0.42)",marginTop:6}}>SIGHT &middot; SHOWROOM</div>
      <style>{`@keyframes pls{0%,100%{opacity:0.6}50%{opacity:1}}`}</style>
    </div>
  );
  if(phase==="enter") return (
    <div style={base}>
      <div style={{fontSize:10,letterSpacing:"0.42em",color:"rgba(0,185,255,0.5)",marginBottom:38,textTransform:"uppercase"}}>Virtual Portfolio Gallery</div>
      <button onClick={()=>setPhase("loading")} style={{
        background:"linear-gradient(135deg,#0044BB,#009990)",border:"none",color:"#fff",
        cursor:"pointer",borderRadius:6,padding:"13px 54px",fontFamily:"monospace",
        fontSize:13,letterSpacing:"0.22em",boxShadow:"0 0 28px rgba(0,90,200,0.38)"}}>
        ENTER GALLERY
      </button>
      <div style={{marginTop:18,fontSize:9,color:"rgba(120,155,210,0.42)",letterSpacing:"0.18em"}}>WASD &middot; MOUSE LOOK &middot; CLICK TO INSPECT</div>
    </div>
  );
  return (
    <div style={base}>
      <div style={{fontSize:10,letterSpacing:"0.4em",color:"rgba(0,185,255,0.55)",marginBottom:16,textTransform:"uppercase"}}>Initializing Gallery</div>
      <div style={{width:240,height:1,background:"rgba(255,255,255,0.06)"}}>
        <div style={{height:"100%",background:"linear-gradient(90deg,#0044BB,#00BFA6)",
          width:`${prog}%`,transition:"width 0.06s linear",boxShadow:"0 0 6px rgba(0,130,190,0.7)"}}/>
      </div>
      <div style={{marginTop:8,fontSize:9,color:"rgba(0,170,255,0.38)",letterSpacing:"0.2em"}}>{Math.round(prog)}%</div>
    </div>
  );
}

// Main component
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

    const renderer=new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.toneMapping=THREE.LinearToneMapping;
    renderer.toneMappingExposure=1.0;
    el.appendChild(renderer.domElement);

    const scene=new THREE.Scene();
    scene.background=new THREE.Color(0x060C18);
    scene.fog=new THREE.Fog(0x060C18,38,95);

    const camera=new THREE.PerspectiveCamera(70,window.innerWidth/window.innerHeight,0.1,100);
    camera.position.set(0,1.65,-6);
    camera.lookAt(0,1.65,1);

    // Textures
    const floorTex=new THREE.CanvasTexture(makeFloorTex());
    floorTex.wrapS=floorTex.wrapT=THREE.RepeatWrapping;
    floorTex.repeat.set(5,14);

    // Helpers
    const bsic=(col,opts={})=>new THREE.MeshBasicMaterial({color:col,...opts});
    const emit=(col,em,ei=2)=>new THREE.MeshStandardMaterial({
      color:col,emissive:new THREE.Color(em),emissiveIntensity:ei,roughness:0.25,metalness:0.3});

    function box(px,py,pz,w,h,d,mat){
      const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
      m.position.set(px,py,pz); scene.add(m); return m;
    }
    function hPlane(px,py,pz,w,d,mat){
      const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat);
      m.rotation.x=-Math.PI/2; m.position.set(px,py,pz); scene.add(m); return m;
    }
    function vPlane(px,py,pz,w,h,mat,ry=0){
      const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);
      m.position.set(px,py,pz); m.rotation.y=ry; scene.add(m); return m;
    }

    const wallC=0x18293E;

    // FLOORS
    hPlane(0,0,GD/2,    GW,GD,   new THREE.MeshBasicMaterial({map:floorTex}));
    hPlane(0,0,-ED/2,   EW,ED,   new THREE.MeshBasicMaterial({map:floorTex,color:0x7799AA}));

    // CEILING
    box(0,GH,GD/2,  GW,0.18,GD, bsic(0x0C1A2C));
    box(0,GH,-ED/2, EW,0.18,ED, bsic(0x0C1A2C));

    // OUTER WALLS
    box(LX,  GH/2,GD/2,  0.12,GH,GD, bsic(wallC));
    box(RX,  GH/2,GD/2,  0.12,GH,GD, bsic(wallC));
    box(0,   GH/2,GD+0.06, GW,GH,0.12, bsic(wallC));
    box(0,   GH/2,-ED-0.06, EW,GH,0.12, bsic(wallC));
    box(-EW/2-0.06, GH/2,-ED/2, 0.12,GH,ED, bsic(wallC));
    box( EW/2+0.06, GH/2,-ED/2, 0.12,GH,ED, bsic(wallC));
    const sw=Math.abs(LX)-EW/2;
    box(-(Math.abs(LX)+EW/2)/2, GH/2, 0, sw,GH,0.12, bsic(wallC));
    box( (Math.abs(LX)+EW/2)/2, GH/2, 0, sw,GH,0.12, bsic(wallC));

    // FLOOR-WALL GLOW
    const warmGlow=emit(0xFFFFFF,0xFFEEDD,2.2);
    const ceilGlow=emit(0x99AAEE,0x334488,1.8);
    box(LX+0.07,0.04,GD/2, 0.04,0.07,GD, warmGlow.clone());
    box(RX-0.07,0.04,GD/2, 0.04,0.07,GD, warmGlow.clone());
    box(LX+0.07,GH-0.05,GD/2, 0.03,0.05,GD, ceilGlow.clone());
    box(RX-0.07,GH-0.05,GD/2, 0.03,0.05,GD, ceilGlow.clone());
    const archMat=emit(0x88AAFF,0x2244AA,2.5);
    box(-EW/2+0.07,GH/2,0.06, 0.05,GH,0.05, archMat.clone());
    box( EW/2-0.07,GH/2,0.06, 0.05,GH,0.05, archMat.clone());
    box(0,GH-0.04,0.06, EW,0.04,0.05, archMat.clone());

    // CEILING LIGHTS
    scene.add(new THREE.AmbientLight(0xCCDDFF,0.3));
    [4,10,16,22,28,34,38].forEach(z=>{
      box(-3.5,GH-0.08,z, 4.5,0.05,0.07, emit(0xFFFFEE,0xFFEECC,2.2));
      box( 3.5,GH-0.08,z, 4.5,0.05,0.07, emit(0xFFFFEE,0xFFEECC,2.2));
      const pl=new THREE.PointLight(0xFFEEDD,3.2,20); pl.position.set(0,GH-0.3,z); scene.add(pl);
    });
    [-6,-2].forEach(z=>{
      const pl=new THREE.PointLight(0xFFEEDD,2.8,10); pl.position.set(0,GH-0.4,z); scene.add(pl);
    });
    [5,14,23,32].forEach(z=>{
      const l=new THREE.PointLight(0xFFEEDD,1.6,8); l.position.set(LX+1.5,0.2,z); scene.add(l);
      const r=new THREE.PointLight(0xFFEEDD,1.6,8); r.position.set(RX-1.5,0.2,z); scene.add(r);
    });

    // SECTION SIGNS
    function signTex(text,accent){
      const c=document.createElement("canvas"); c.width=512; c.height=72;
      const ctx=c.getContext("2d"); ctx.clearRect(0,0,512,72);
      ctx.fillStyle=accent; ctx.font="bold 44px Arial"; ctx.textAlign="center"; ctx.fillText(text,256,54);
      return new THREE.CanvasTexture(c);
    }
    vPlane(LX+0.08,GH-0.5,4, 5,0.65, new THREE.MeshBasicMaterial({color:0xffffff,map:signTex("PHOTO GALLERY","#4499FF"),transparent:true,side:THREE.DoubleSide}), Math.PI/2);
    vPlane(RX-0.08,GH-0.5,4, 5,0.65, new THREE.MeshBasicMaterial({color:0xffffff,map:signTex("VIDEO GALLERY","#00CCAA"),transparent:true,side:THREE.DoubleSide}),-Math.PI/2);

    // SERVICES WALL (centered, 10 wide)
    const servicesTex=new THREE.CanvasTexture(makeServicesTex());
    vPlane(0,GH/2-0.1,GD-0.1, 10,4.5, new THREE.MeshBasicMaterial({color:0xffffff,map:servicesTex,side:THREE.DoubleSide}), Math.PI);

    // CTA PANELS — far left and far right, clear of services text
    const hotspots=[];
    function addCTA(px,py,pz,text,ry,ctaData){
      const tex=new THREE.CanvasTexture(makeCTATex(text,ctaData.accent||"#0066EE"));
      const m=new THREE.Mesh(new THREE.PlaneGeometry(2.8,0.62),
        new THREE.MeshBasicMaterial({color:0xffffff,map:tex,transparent:true,side:THREE.DoubleSide}));
      m.position.set(px,py,pz); m.rotation.y=ry; scene.add(m);
      const back=new THREE.Mesh(new THREE.PlaneGeometry(2.85,0.67),
        bsic(0x001030,{transparent:true,opacity:0.65}));
      back.position.set(px,py-0.002,pz); back.rotation.y=ry; scene.add(back);
      m.userData={cta:true,...ctaData}; hotspots.push(m);
    }
    addCTA(-6.2, 1.6, GD-0.15, "GET A QUOTE", Math.PI,
      {title:"Get a Quote",body:"FAA Part 107 certified drone services\nSouthern & Central California",action:"CONTACT US",href:"/contact",accent:"#0066EE"});
    addCTA( 6.2, 1.6, GD-0.15, "VIEW PORTFOLIO", Math.PI,
      {title:"Full Portfolio",body:"Browse the complete aerial photography\nand video portfolio",action:"OPEN PORTFOLIO",href:"/portfolio",accent:"#009977"});

    // ── CENTERPIECE 1: HOLOGRAPHIC PARCEL EXHIBIT (z=10) ─────────────
    const [PX,PY,PZ]=PARCEL_POS;
    const parcelGroup=new THREE.Group();
    parcelGroup.position.set(PX,PY,PZ);
    parcelGroup.scale.set(1.25,1.25,1.25);
    scene.add(parcelGroup);

    // Pedestal
    const ped=new THREE.Mesh(new THREE.CylinderGeometry(0.7,0.75,0.12,32),bsic(0x0E1E30));
    ped.position.set(PX,0.06,PZ); scene.add(ped);
    // Floor ring
    const flRing=new THREE.Mesh(new THREE.TorusGeometry(1.1,0.022,6,64), emit(0x00CCBB,0x009988,2.2));
    flRing.rotation.x=Math.PI/2; flRing.position.set(PX,0.02,PZ); scene.add(flRing);

    // Parcel boundary points
    const pts2d=[[-1.0,-0.7],[1.3,-0.85],[1.6,0.7],[0.2,1.2],[-1.2,0.9]];
    const pts3d=pts2d.map(([x,z])=>new THREE.Vector3(x,0.02,z));

    // Thick boundary using TubeGeometry + CatmullRomCurve3
    const closedPts=[...pts3d, pts3d[0]];
    const bndCurve=new THREE.CatmullRomCurve3(closedPts, true);
    const bndMat=new THREE.MeshStandardMaterial({
      color:0x00ffee, emissive:new THREE.Color(0x00ddcc),
      emissiveIntensity:3.5, transparent:true, opacity:0.95});
    const bndTube=new THREE.Mesh(new THREE.TubeGeometry(bndCurve,120,0.025,8,true), bndMat);
    parcelGroup.add(bndTube);

    // Fill plane (raised opacity)
    const shape=new THREE.Shape(pts2d.map(([x,z])=>new THREE.Vector2(x,z)));
    const fillMesh=new THREE.Mesh(new THREE.ShapeGeometry(shape),
      new THREE.MeshBasicMaterial({color:0x00AAFF,transparent:true,opacity:0.13,side:THREE.DoubleSide}));
    fillMesh.rotation.x=-Math.PI/2; parcelGroup.add(fillMesh);

    // Corner pins (pulsing, tracked for animation)
    const cornerPins=[];
    pts3d.forEach(pt=>{
      const pin=new THREE.Mesh(new THREE.SphereGeometry(0.07,8,8), emit(0x00FFCC,0x00EEAA,3.0));
      pin.position.copy(pt); parcelGroup.add(pin); cornerPins.push(pin);
      // Vertical projection line to floor
      const dl=new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([pt, new THREE.Vector3(pt.x,-PY,pt.z)]),
        new THREE.LineBasicMaterial({color:0x0088BB,transparent:true,opacity:0.45}));
      parcelGroup.add(dl);
    });

    // Topo lines inside parcel
    for(let g=-0.9;g<=0.9;g+=0.25){
      const row=new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-1.4,0.01,g), new THREE.Vector3(1.7,0.01,g)]),
        new THREE.LineBasicMaterial({color:0x005577,transparent:true,opacity:0.5}));
      parcelGroup.add(row);
    }

    // Parcel label (compact, attached to exhibit)
    const plabelTex=new THREE.CanvasTexture(makeParcelLabelTex());
    const plabel=new THREE.Mesh(new THREE.PlaneGeometry(1.8,0.3),
      new THREE.MeshBasicMaterial({map:plabelTex,transparent:true,side:THREE.DoubleSide,color:0xffffff}));
    plabel.position.set(0,1.55,0); parcelGroup.add(plabel);

    const parcelLight=new THREE.PointLight(0x00DDCC,1.4,9); parcelLight.position.set(PX,2,PZ); scene.add(parcelLight);

    // ── CENTERPIECE 2: DRONE FLIGHT PATH RIBBON (z=14-26, center=20) ─
    const [FZ_START, , FZ_END]=FLIGHT_Z;
    const flightPts=[
      new THREE.Vector3(-2.2, 3.5, FZ_START),
      new THREE.Vector3(-1.0, 3.7, FZ_START+2),
      new THREE.Vector3( 0.8, 3.8, FZ_START+4),
      new THREE.Vector3( 1.8, 3.6, FZ_START+6),
      new THREE.Vector3( 0.4, 3.75, FZ_START+8),
      new THREE.Vector3(-1.2, 3.65, FZ_START+10),
      new THREE.Vector3( 0.0, 3.7, FZ_END),
    ];
    const flightCurve=new THREE.CatmullRomCurve3(flightPts, false);
    const flightTubeMat=new THREE.MeshStandardMaterial({
      color:0x00DDFF, emissive:new THREE.Color(0x0099CC),
      emissiveIntensity:2.5, transparent:true, opacity:0.65});
    const flightTube=new THREE.Mesh(new THREE.TubeGeometry(flightCurve,80,0.014,6,false), flightTubeMat);
    scene.add(flightTube);

    // Waypoint dots along path
    [0, 0.17, 0.33, 0.5, 0.67, 0.83, 1].forEach(u=>{
      const wp=new THREE.Mesh(new THREE.SphereGeometry(0.05,8,8), emit(0x00FFEE,0x00CCDD,3.2));
      wp.position.copy(flightCurve.getPointAt(u)); scene.add(wp);
    });

    // Animated pulse mesh
    const pulseMesh=new THREE.Mesh(new THREE.SphereGeometry(0.1,8,8), emit(0xFFFFFF,0x00DDFF,5.0));
    scene.add(pulseMesh);
    let flightU=0;

    // Flight path glow light
    const flightLight=new THREE.PointLight(0x00CCFF,1.0,10); scene.add(flightLight);

    // ── CENTERPIECE 3: POINT CLOUD ORB (z=30) ─────────────────────────
    const [CX,CY,CZ]=CLOUD_POS;
    const N_PTS=6500;
    const cPos=new Float32Array(N_PTS*3), cCol=new Float32Array(N_PTS*3);
    let _s=11; const rnd=()=>{_s=(_s*9301+49297)%233280;return _s/233280;};
    for(let i=0;i<N_PTS;i++){
      const th=rnd()*Math.PI*2, ph=Math.acos(2*rnd()-1), r=1.35*(0.88+0.12*rnd());
      cPos[i*3]=r*Math.sin(ph)*Math.cos(th);
      cPos[i*3+1]=r*Math.cos(ph);
      cPos[i*3+2]=r*Math.sin(ph)*Math.sin(th);
      const t2=(cPos[i*3+1]+1.35)/(2.7);
      cCol[i*3]  =t2<0.45?0:(t2-0.45)*0.5;
      cCol[i*3+1]=t2<0.4?0.1+t2*0.4:0.26+(t2-0.4)*0.74;
      cCol[i*3+2]=t2<0.5?0.5+t2*0.5:1.0;
    }
    const cloudGeo=new THREE.BufferGeometry();
    cloudGeo.setAttribute("position",new THREE.BufferAttribute(cPos,3));
    cloudGeo.setAttribute("color",   new THREE.BufferAttribute(cCol,3));
    const cloudMesh=new THREE.Points(cloudGeo,new THREE.PointsMaterial({
      vertexColors:true,size:0.05,sizeAttenuation:true,transparent:true,opacity:0.9,depthWrite:false}));
    cloudMesh.position.set(CX,CY,CZ); scene.add(cloudMesh);

    const icoMesh=new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.35*0.62,1),
      new THREE.MeshBasicMaterial({color:0x0055BB,wireframe:true,transparent:true,opacity:0.16}));
    icoMesh.position.set(CX,CY,CZ); scene.add(icoMesh);

    const ringMat=(col,em,ei=2.2)=>new THREE.MeshStandardMaterial({
      color:col,emissive:new THREE.Color(em),emissiveIntensity:ei,
      roughness:0.2,metalness:0.2,transparent:true,opacity:0.65});
    const OR=1.55;
    const ring1=new THREE.Mesh(new THREE.TorusGeometry(OR,0.012,6,90),ringMat(0x00AAFF,0x0066CC));
    ring1.position.set(CX,CY,CZ); ring1.rotation.x=Math.PI/2; scene.add(ring1);
    const ring2=new THREE.Mesh(new THREE.TorusGeometry(OR*0.88,0.009,6,80),ringMat(0x00EEDD,0x008877));
    ring2.position.set(CX,CY,CZ); ring2.rotation.set(Math.PI/3,Math.PI/6,0); scene.add(ring2);
    const ring3=new THREE.Mesh(new THREE.TorusGeometry(OR*0.72,0.007,6,72),ringMat(0x8899FF,0x3344AA,1.8));
    ring3.position.set(CX,CY,CZ); ring3.rotation.set(Math.PI/5,Math.PI/2.5,Math.PI/4); scene.add(ring3);
    const orbLight=new THREE.PointLight(0x0077FF,1.8,14); orbLight.position.set(CX,CY,CZ); scene.add(orbLight);

    // ── GALLERY PANELS — one-row layout ──────────────────────────────
    const loader=new THREE.TextureLoader(); loader.crossOrigin="anonymous";
    const PHOTO_W=2.5, PHOTO_H=1.45;
    const VIDEO_W=3.2, VIDEO_H=1.8;
    const GALLERY_Y=2.45;

    function addPhoto(ph, y, z){
      vPlane(LX+0.05,y,z, PHOTO_W+0.14,PHOTO_H+0.14,
        bsic(0x14233A,{transparent:true,opacity:0.88}), Math.PI/2);
      const tex=loader.load(cImg(ph.id,840,560));
      tex.colorSpace=THREE.SRGBColorSpace;
      const sc=new THREE.Mesh(new THREE.PlaneGeometry(PHOTO_W,PHOTO_H),
        new THREE.MeshBasicMaterial({map:tex}));
      sc.position.set(LX+0.07,y,z); sc.rotation.y=Math.PI/2; scene.add(sc);
      vPlane(LX+0.08,y+PHOTO_H/2+0.04,z, PHOTO_W,0.035,
        new THREE.MeshStandardMaterial({color:0x2255FF,emissive:new THREE.Color(0x0033CC),emissiveIntensity:3.5}),
        Math.PI/2);
      const sl=new THREE.SpotLight(0xFFFFFF,5.0,14,Math.PI/9,0.4);
      sl.position.set(LX+5,y+1.5,z); sl.target.position.set(LX+0.1,y,z);
      scene.add(sl); scene.add(sl.target);
      sc.userData={type:"photo",...ph}; hotspots.push(sc);
    }

    function addVideo(vid, y, z){
      const vGroup=new THREE.Group(); scene.add(vGroup);
      const videoEl=document.createElement("video");
      videoEl.src=cVid(vid.id); videoEl.loop=true; videoEl.muted=true;
      videoEl.playsInline=true; videoEl.crossOrigin="anonymous"; videoEl.autoplay=true;
      videoEl.play().catch(()=>{});
      videoEl.addEventListener("error",()=>{ vGroup.visible=false; });
      const vTex=new THREE.VideoTexture(videoEl);
      vTex.colorSpace=THREE.SRGBColorSpace;
      const bd=new THREE.Mesh(new THREE.PlaneGeometry(VIDEO_W+0.14,VIDEO_H+0.14),
        bsic(0x0A1820,{transparent:true,opacity:0.88}));
      bd.position.set(RX-0.05,y,z); bd.rotation.y=-Math.PI/2; vGroup.add(bd);
      const sc=new THREE.Mesh(new THREE.PlaneGeometry(VIDEO_W,VIDEO_H),
        new THREE.MeshBasicMaterial({map:vTex}));
      sc.position.set(RX-0.07,y,z); sc.rotation.y=-Math.PI/2; vGroup.add(sc);
      const gw=new THREE.Mesh(new THREE.PlaneGeometry(VIDEO_W,0.035),
        new THREE.MeshStandardMaterial({color:0x00CCAA,emissive:new THREE.Color(0x009977),emissiveIntensity:3.5}));
      gw.position.set(RX-0.08,y+VIDEO_H/2+0.04,z); gw.rotation.y=-Math.PI/2; vGroup.add(gw);
      const sl=new THREE.SpotLight(0xFFFFFF,5.0,14,Math.PI/9,0.4);
      sl.position.set(RX-5,y+1.5,z); sl.target.position.set(RX-0.1,y,z);
      vGroup.add(sl); scene.add(sl.target);
      sc.userData={type:"video",...vid}; hotspots.push(sc);
    }

    // One-row layout: evenly space items along z=4..36
    function layoutOneRow(items, addFn, y, startZ, endZ){
      const step=items.length>1?(endZ-startZ)/(items.length-1):0;
      items.forEach((item,i)=>addFn(item, y, startZ+i*step));
    }
    layoutOneRow(PHOTOS, addPhoto, GALLERY_Y, 4, 36);
    layoutOneRow(VIDEOS, addVideo, GALLERY_Y, 4, 36);

    // ── ZONE-AWARE COLLISION ──────────────────────────────────────────
    function constrainPos(x,z){
      const nz=Math.max(-(ED-0.5), Math.min(GD-0.5, z));
      let nx;
      if(nz<0.5){
        nx=Math.max(-(EW/2-0.35), Math.min(EW/2-0.35, x));
      } else {
        nx=Math.max(-(GW/2-0.35), Math.min(GW/2-0.35, x));
      }
      return [nx,nz];
    }

    const getZone=p=>{
      if(p.z<0) return "ENTRY HALL";
      if(p.x<-2) return "PHOTO GALLERY";
      if(p.x>2)  return "VIDEO GALLERY";
      if(p.z>GD-6) return "SERVICES";
      return "MAIN GALLERY";
    };

    // ── CONTROLS ─────────────────────────────────────────────────────
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
    const onLock=()=>{ locked=document.pointerLockElement===renderer.domElement; };
    const raycaster=new THREE.Raycaster();
    const onClick=()=>{
      if(!locked){renderer.domElement.requestPointerLock();return;}
      raycaster.setFromCamera({x:0,y:0},camera);
      const hits=raycaster.intersectObjects(hotspots,true);
      if(hits.length>0) setModal(hits[0].object.userData);
    };
    window.addEventListener("keydown",onKeyDown);
    window.addEventListener("keyup",onKeyUp);
    document.addEventListener("mousemove",onMove);
    document.addEventListener("pointerlockchange",onLock);
    renderer.domElement.addEventListener("click",onClick);

    const fwd=new THREE.Vector3(), rgt=new THREE.Vector3();
    const SPEED=0.092;
    let rafId;
    const tick=(ts)=>{
      rafId=requestAnimationFrame(tick);
      const t=ts*0.0004;

      // Animate orb (centerpiece 3)
      cloudMesh.rotation.y= t*0.65;
      cloudMesh.rotation.x= Math.sin(t*0.28)*0.1;
      icoMesh.rotation.y  =-t*0.45;
      icoMesh.rotation.z  = t*0.18;
      ring1.rotation.z    = t*0.38;
      ring2.rotation.y    = t*0.55;
      ring3.rotation.x    = t*0.22;
      const floatY=Math.sin(t*1.05)*0.07;
      [cloudMesh,icoMesh,ring1,ring2,ring3].forEach(o=>{ o.position.y=CY+floatY; });
      orbLight.intensity=1.6+Math.sin(t*1.7)*0.3;

      // Animate parcel (centerpiece 1)
      parcelGroup.position.y=PY+Math.sin(t*0.85)*0.05;
      parcelGroup.rotation.y=t*0.1;
      parcelLight.intensity=1.2+Math.sin(t*1.4)*0.3;
      // Pulsing corner pins
      cornerPins.forEach((pin,i)=>{
        const s=0.75+Math.sin(t*2.8+i*1.2)*0.35;
        pin.scale.setScalar(s);
      });

      // Animate flight path pulse (centerpiece 2)
      flightU=(flightU+0.0012)%1;
      const pp=flightCurve.getPointAt(flightU);
      pulseMesh.position.copy(pp);
      pulseMesh.scale.setScalar(0.7+Math.sin(t*5)*0.3);
      flightLight.position.copy(pp);
      flightLight.intensity=0.8+Math.sin(t*4)*0.4;

      // Player movement
      camera.getWorldDirection(fwd); fwd.y=0; fwd.normalize();
      rgt.crossVectors(fwd,new THREE.Vector3(0,1,0)).normalize();
      const vel=new THREE.Vector3();
      if(keys["KeyW"]||keys["ArrowUp"])    vel.add(fwd);
      if(keys["KeyS"]||keys["ArrowDown"])  vel.sub(fwd);
      if(keys["KeyA"]||keys["ArrowLeft"])  vel.sub(rgt);
      if(keys["KeyD"]||keys["ArrowRight"]) vel.add(rgt);
      if(vel.length()>0){
        vel.normalize().multiplyScalar(SPEED);
        const [nx,nz]=constrainPos(camera.position.x+vel.x, camera.position.z+vel.z);
        camera.position.x=nx;
        camera.position.z=nz;
        camera.position.y=1.65;
      }
      setPos([Math.round(camera.position.x*10)/10, Math.round(camera.position.z*10)/10]);
      setZone(getZone(camera.position));
      renderer.render(scene,camera);
    };
    tick(0);

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
    <div style={{width:"100vw",height:"100vh",overflow:"hidden",background:"#060C18"}}>
      {!started && <Onboarding onStart={()=>setStarted(true)}/>}
      <div ref={mountRef} style={{width:"100%",height:"100%",display:started?"block":"none"}}/>
      {started && (
        <>
          <Minimap px={pos[0]} pz={pos[1]}/>
          <HUD zone={zone} showHelp={showHelp} setShowHelp={setShowHelp}/>
          <PanelModal item={modal} onClose={()=>setModal(null)}/>
          <div style={{position:"fixed",bottom:44,left:"50%",transform:"translateX(-50%)",
            fontFamily:"monospace",fontSize:10,letterSpacing:"0.2em",
            color:"rgba(0,170,255,0.3)",textTransform:"uppercase",pointerEvents:"none",zIndex:200}}>
            Click canvas &middot; WASD to move &middot; ESC to release
          </div>
        </>
      )}
    </div>
  );
}
