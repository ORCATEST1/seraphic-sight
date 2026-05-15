// SpatialShowroom.js v7
// - Tags removed from panels
// - Floating decorative point-cloud sphere centerpiece

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const CLD = "https://res.cloudinary.com/dpc1noikx";
const cImg = (id, w=1200, h=750) =>
  `${CLD}/image/upload/w_${w},h_${h},c_fill,f_auto,q_auto:good/${id}`;
const cVid = (id) =>
  `${CLD}/video/upload/f_mp4,q_auto:good,vc_h264,w_960/${id}`;

// No tags — just labels
const PHOTOS = [
  { id:"DJI_0915_w53hst",   label:"Aerial Overview"       },
  { id:"DJI_0891_tgrszt",   label:"Property Perspective"  },
  { id:"DJI_0876_imzqgc",   label:"Residential Aerial"    },
  { id:"DJI_0802_cdwyvj",   label:"Commercial Site"       },
  { id:"DJI_0730_enavrk",   label:"Mixed-Use Dev"         },
  { id:"DJI_0327_it5brs",   label:"Construction Progress" },
  { id:"sola-florance-construction-aerial_oapibr", label:"Sola Florance" },
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

// ── Canvas textures ──────────────────────────────────────────────────────────
function makeFloorTex() {
  const c = document.createElement("canvas"); c.width=1024; c.height=1024;
  const ctx = c.getContext("2d");
  ctx.fillStyle="#0B1624"; ctx.fillRect(0,0,1024,1024);
  ctx.strokeStyle="rgba(40,90,160,0.35)"; ctx.lineWidth=1;
  for(let i=0;i<=1024;i+=64){
    ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,1024);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(1024,i);ctx.stroke();
  }
  ctx.strokeStyle="rgba(0,200,180,0.55)"; ctx.lineWidth=1.5;
  for(let x=0;x<=1024;x+=256) for(let y=0;y<=1024;y+=256){
    ctx.beginPath();ctx.moveTo(x-14,y);ctx.lineTo(x+14,y);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x,y-14);ctx.lineTo(x,y+14);ctx.stroke();
  }
  return c;
}
function makeLabelTex(title) {
  const c=document.createElement("canvas"); c.width=512; c.height=72;
  const ctx=c.getContext("2d"); ctx.clearRect(0,0,512,72);
  ctx.fillStyle="rgba(8,16,36,0.75)"; ctx.fillRect(0,0,512,72);
  ctx.fillStyle="rgba(60,120,255,0.9)"; ctx.fillRect(0,0,4,72);
  ctx.fillStyle="#FFFFFF"; ctx.font="bold 32px Arial"; ctx.textAlign="left"; ctx.fillText(title,14,46);
  return c;
}
function makeSectionTex(title, accent) {
  const c=document.createElement("canvas"); c.width=512; c.height=80;
  const ctx=c.getContext("2d"); ctx.clearRect(0,0,512,80);
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
    const tx=(x)=>((x+11)/22)*110;
    const tz=(z)=>((z+8)/46)*110;
    ctx.fillStyle="rgba(0,50,120,0.3)";
    ctx.fillRect(tx(-9),tz(0),tx(9)-tx(-9),tz(36)-tz(0));
    ctx.fillStyle="rgba(0,40,100,0.4)";
    ctx.fillRect(tx(-3),tz(-8),tx(3)-tx(-3),tz(0)-tz(-8));
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
      <svg style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
        zIndex:200,pointerEvents:"none",opacity:0.65}} width={24} height={24}>
        <line x1={12} y1={2}  x2={12} y2={9}  stroke="#00D4FF" strokeWidth={1.5}/>
        <line x1={12} y1={15} x2={12} y2={22} stroke="#00D4FF" strokeWidth={1.5}/>
        <line x1={2}  y1={12} x2={9}  y2={12} stroke="#00D4FF" strokeWidth={1.5}/>
        <line x1={15} y1={12} x2={22} y2={12} stroke="#00D4FF" strokeWidth={1.5}/>
      </svg>
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
          {item.label}
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

    const renderer=new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.toneMapping=THREE.LinearToneMapping;
    renderer.toneMappingExposure=1.0;
    el.appendChild(renderer.domElement);

    const scene=new THREE.Scene();
    scene.background=new THREE.Color(0x060E1C);
    scene.fog=new THREE.Fog(0x060E1C,32,85);

    const camera=new THREE.PerspectiveCamera(72,window.innerWidth/window.innerHeight,0.1,100);
    camera.position.set(0,1.65,-6);
    camera.lookAt(0,1.65,0);

    const floorTex=new THREE.CanvasTexture(makeFloorTex());
    floorTex.wrapS=floorTex.wrapT=THREE.RepeatWrapping;
    floorTex.repeat.set(4,10);

    const basic=(color,opts={})=>new THREE.MeshBasicMaterial({color,...opts});
    const emissive=(color,em,ei=1.5)=>new THREE.MeshStandardMaterial({
      color,emissive:new THREE.Color(em),emissiveIntensity:ei,roughness:0.2,metalness:0.3});

    function box(px,py,pz,w,h,d,mat){
      const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
      m.position.set(px,py,pz); scene.add(m); return m;
    }
    function plane(px,py,pz,w,d,mat,rx=-Math.PI/2){
      const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat);
      m.rotation.x=rx; m.position.set(px,py,pz); scene.add(m); return m;
    }

    // Layout constants
    const GW=18, GD=36, GH=4.8;
    const EW=6,  ED=8;
    const LX=-9.0, RX=9.0;
    const wallC=0x1C2F4A;

    // Floors
    plane(0,0,GD/2, GW,GD, new THREE.MeshBasicMaterial({map:floorTex}));
    plane(0,0,-ED/2, EW,ED, new THREE.MeshBasicMaterial({map:floorTex,color:0x8AAABB}));

    // Ceilings
    box(0,GH,GD/2,   GW,0.2,GD,  basic(0x0E1C30));
    box(0,GH,-ED/2,  EW,0.2,ED,  basic(0x0E1C30));

    // Walls
    box(LX, GH/2, GD/2,  0.12,GH,GD, basic(wallC));
    box(RX, GH/2, GD/2,  0.12,GH,GD, basic(wallC));
    box(0,  GH/2, GD+0.06,  GW,GH,0.12, basic(wallC));
    box(0,  GH/2, -ED-0.06, EW,GH,0.12, basic(wallC));
    box(-EW/2-0.06, GH/2, -ED/2, 0.12,GH,ED, basic(wallC));
    box( EW/2+0.06, GH/2, -ED/2, 0.12,GH,ED, basic(wallC));
    // Shoulder walls connecting entry to gallery
    const shoulderW=Math.abs(LX)-EW/2;
    box(-(Math.abs(LX)+EW/2)/2, GH/2, 0, shoulderW,GH,0.12, basic(wallC));
    box( (Math.abs(LX)+EW/2)/2, GH/2, 0, shoulderW,GH,0.12, basic(wallC));

    // ── FLOOR-WALL GLOW STRIPS (warm amber, like reference) ───────
    const glowAmber=emissive(0xFF9933,0xFF7700,3.5);
    const glowBlue=emissive(0x1144DD,0x0022AA,2.2);
    box(LX+0.07, 0.04, GD/2, 0.05,0.09,GD, glowAmber.clone());
    box(RX-0.07, 0.04, GD/2, 0.05,0.09,GD, glowAmber.clone());
    box(LX+0.07, GH-0.05, GD/2, 0.04,0.06,GD, glowBlue.clone());
    box(RX-0.07, GH-0.05, GD/2, 0.04,0.06,GD, glowBlue.clone());
    // Entry arch pillars
    const archMat=emissive(0x0066EE,0x0044BB,2.8);
    box(-EW/2+0.07,GH/2,0.06, 0.06,GH,0.06, archMat.clone());
    box( EW/2-0.07,GH/2,0.06, 0.06,GH,0.06, archMat.clone());
    box(0,GH-0.04,0.06, EW,0.06,0.06, archMat.clone());

    // ── CEILING LIGHTS ────────────────────────────────────────────
    [4,10,16,22,28,34].forEach(z=>{
      box(-4,GH-0.09,z, 5,0.06,0.08, emissive(0xFFFFEE,0xFFDDAA,2.5));
      box( 4,GH-0.09,z, 5,0.06,0.08, emissive(0xFFFFEE,0xFFDDAA,2.5));
      const pl=new THREE.PointLight(0xFFEEDD,3.5,22);
      pl.position.set(0,GH-0.3,z); scene.add(pl);
    });
    [-6,-2].forEach(z=>{
      const pl=new THREE.PointLight(0xFFEEDD,3.0,10);
      pl.position.set(0,GH-0.4,z); scene.add(pl);
    });
    // Floor-level warm fill from glow strips
    [4,12,20,28].forEach(z=>{
      const pl=new THREE.PointLight(0xFF8822,2.0,9);
      pl.position.set(LX+1,0.25,z); scene.add(pl);
      const pr=new THREE.PointLight(0xFF8822,2.0,9);
      pr.position.set(RX-1,0.25,z); scene.add(pr);
    });
    scene.add(new THREE.AmbientLight(0xCCDDFF,0.35));

    // ── SECTION SIGNS ─────────────────────────────────────────────
    [
      {text:"PHOTO GALLERY", x:LX+0.1, ry:Math.PI/2,  accent:"#4499FF"},
      {text:"VIDEO GALLERY", x:RX-0.1, ry:-Math.PI/2, accent:"#00CCAA"},
    ].forEach(s=>{
      const tex=new THREE.CanvasTexture(makeSectionTex(s.text,s.accent));
      const m=new THREE.Mesh(new THREE.PlaneGeometry(5,0.7),
        new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide}));
      m.position.set(s.x,GH-0.55,2); m.rotation.y=s.ry; scene.add(m);
    });

    // ── FLOATING CENTERPIECE CLOUD ────────────────────────────────
    // Seraphic Sight branded LiDAR-style point cloud orb
    // Positioned at gallery midpoint, floating at eye level
    const CLOUD_Z = GD/2;   // center of gallery depth
    const CLOUD_Y = 2.5;    // floating height
    const CLOUD_R = 1.4;    // radius
    const N_CLOUD = 6000;

    const cloudPos = new Float32Array(N_CLOUD * 3);
    const cloudCol = new Float32Array(N_CLOUD * 3);

    // Seed RNG
    let _s=7; const rnd=()=>{_s=(_s*9301+49297)%233280;return _s/233280;};

    for(let i=0;i<N_CLOUD;i++){
      // Spherical coordinates with some terrain-like distortion
      const theta = rnd()*Math.PI*2;
      const phi   = Math.acos(2*rnd()-1);
      const r     = CLOUD_R*(0.85 + 0.15*rnd());
      const x = r*Math.sin(phi)*Math.cos(theta);
      const y = r*Math.cos(phi) + Math.sin(theta*3)*0.15;
      const z = r*Math.sin(phi)*Math.sin(theta);
      cloudPos[i*3]=x; cloudPos[i*3+1]=y; cloudPos[i*3+2]=z;
      // Color: blend from deep blue (bottom) to cyan (mid) to white (top)
      const t=(y+CLOUD_R)/(2*CLOUD_R); // 0=bottom, 1=top
      const cl=t<0.4
        ? [0, 0.1+t*0.5, 0.4+t*0.8]                 // deep blue → cyan
        : [0.1+(t-0.4)*0.6, 0.3+(t-0.4)*0.7, 1.0];  // cyan → white
      cloudCol[i*3]=cl[0]; cloudCol[i*3+1]=cl[1]; cloudCol[i*3+2]=cl[2];
    }

    const cloudGeo=new THREE.BufferGeometry();
    cloudGeo.setAttribute("position",new THREE.BufferAttribute(cloudPos,3));
    cloudGeo.setAttribute("color",   new THREE.BufferAttribute(cloudCol,3));
    const cloudMat=new THREE.PointsMaterial({
      vertexColors:true, size:0.055, sizeAttenuation:true,
      transparent:true, opacity:0.92, depthWrite:false
    });
    const cloud=new THREE.Points(cloudGeo,cloudMat);
    cloud.position.set(0,CLOUD_Y,CLOUD_Z);
    scene.add(cloud);

    // Inner wireframe icosahedron for structure
    const icoGeo=new THREE.IcosahedronGeometry(CLOUD_R*0.65,1);
    const icoMat=new THREE.MeshBasicMaterial({
      color:0x0066CC, wireframe:true, transparent:true, opacity:0.18
    });
    const ico=new THREE.Mesh(icoGeo,icoMat);
    ico.position.set(0,CLOUD_Y,CLOUD_Z);
    scene.add(ico);

    // Outer ring glow lines (equatorial)
    const ringGeo=new THREE.TorusGeometry(CLOUD_R*0.95,0.012,6,80);
    const ringMat=new THREE.MeshStandardMaterial({
      color:0x00AAFF, emissive:new THREE.Color(0x0077CC), emissiveIntensity:2.5,
      roughness:0.2,metalness:0.3,transparent:true,opacity:0.7
    });
    const ring1=new THREE.Mesh(ringGeo,ringMat);
    ring1.position.set(0,CLOUD_Y,CLOUD_Z); ring1.rotation.x=Math.PI/2;
    scene.add(ring1);
    // Tilted second ring
    const ring2=new THREE.Mesh(ringGeo.clone(),ringMat.clone());
    ring2.position.set(0,CLOUD_Y,CLOUD_Z); ring2.rotation.set(Math.PI/4,Math.PI/5,0);
    scene.add(ring2);

    // Soft glow light from centerpiece
    const cloudLight=new THREE.PointLight(0x0077FF,2.0,12);
    cloudLight.position.set(0,CLOUD_Y,CLOUD_Z);
    scene.add(cloudLight);

    // ── PANELS ────────────────────────────────────────────────────
    const hotspots=[];
    const loader=new THREE.TextureLoader(); loader.crossOrigin="anonymous";
    const PW=3.6, PH=2.1, ZGAP=4.2, YU=3.2, YL=1.1;

    function addPhoto(ph,y,z){
      const tex=loader.load(cImg(ph.id,840,560));
      tex.colorSpace=THREE.SRGBColorSpace;
      const sc=new THREE.Mesh(new THREE.PlaneGeometry(PW,PH),
        new THREE.MeshBasicMaterial({map:tex}));
      sc.position.set(LX+0.07,y,z); sc.rotation.y=Math.PI/2; scene.add(sc);
      // Border
      const bd=new THREE.Mesh(new THREE.PlaneGeometry(PW+0.14,PH+0.14),
        new THREE.MeshBasicMaterial({color:0x162440,transparent:true,opacity:0.9}));
      bd.position.set(LX+0.05,y,z); bd.rotation.y=Math.PI/2; scene.add(bd);
      // Top glow
      const gw=new THREE.Mesh(new THREE.PlaneGeometry(PW,0.04),
        new THREE.MeshStandardMaterial({color:0x3366FF,emissive:new THREE.Color(0x1144DD),emissiveIntensity:3.5}));
      gw.position.set(LX+0.08,y+PH/2+0.05,z); gw.rotation.y=Math.PI/2; scene.add(gw);
      // Label
      const lt=new THREE.CanvasTexture(makeLabelTex(ph.label));
      const lb=new THREE.Mesh(new THREE.PlaneGeometry(PW,0.5),
        new THREE.MeshBasicMaterial({map:lt,transparent:true}));
      lb.position.set(LX+0.08,y-PH/2-0.32,z); lb.rotation.y=Math.PI/2; scene.add(lb);
      // Spotlight
      const sl=new THREE.SpotLight(0xFFFFFF,5.0,14,Math.PI/9,0.4);
      sl.position.set(LX+5,y+1.5,z); sl.target.position.set(LX+0.1,y,z);
      scene.add(sl); scene.add(sl.target);
      sc.userData={type:"photo",...ph}; hotspots.push(sc);
    }

    function addVideo(vid,y,z){
      const videoEl=document.createElement("video");
      videoEl.src=cVid(vid.id); videoEl.loop=true; videoEl.muted=true;
      videoEl.playsInline=true; videoEl.crossOrigin="anonymous"; videoEl.autoplay=true;
      videoEl.play().catch(()=>{});
      const vTex=new THREE.VideoTexture(videoEl);
      vTex.colorSpace=THREE.SRGBColorSpace;
      const sc=new THREE.Mesh(new THREE.PlaneGeometry(PW,PH),
        new THREE.MeshBasicMaterial({map:vTex}));
      sc.position.set(RX-0.07,y,z); sc.rotation.y=-Math.PI/2; scene.add(sc);
      const bd=new THREE.Mesh(new THREE.PlaneGeometry(PW+0.14,PH+0.14),
        new THREE.MeshBasicMaterial({color:0x0A1E1E,transparent:true,opacity:0.9}));
      bd.position.set(RX-0.05,y,z); bd.rotation.y=-Math.PI/2; scene.add(bd);
      const gw=new THREE.Mesh(new THREE.PlaneGeometry(PW,0.04),
        new THREE.MeshStandardMaterial({color:0x00CCAA,emissive:new THREE.Color(0x00AA88),emissiveIntensity:3.5}));
      gw.position.set(RX-0.08,y+PH/2+0.05,z); gw.rotation.y=-Math.PI/2; scene.add(gw);
      const lt=new THREE.CanvasTexture(makeLabelTex(vid.label));
      const lb=new THREE.Mesh(new THREE.PlaneGeometry(PW,0.5),
        new THREE.MeshBasicMaterial({map:lt,transparent:true}));
      lb.position.set(RX-0.08,y-PH/2-0.32,z); lb.rotation.y=-Math.PI/2; scene.add(lb);
      const sl=new THREE.SpotLight(0xFFFFFF,5.0,14,Math.PI/9,0.4);
      sl.position.set(RX-5,y+1.5,z); sl.target.position.set(RX-0.1,y,z);
      scene.add(sl); scene.add(sl.target);
      sc.userData={type:"video",...vid}; hotspots.push(sc);
    }

    PHOTOS.forEach((ph,i)=>{
      const col=i%2, row=Math.floor(i/2);
      addPhoto(ph, col===0?YU:YL, 1.5+row*ZGAP);
    });
    VIDEOS.forEach((vid,i)=>{
      const col=i%2, row=Math.floor(i/2);
      addVideo(vid, col===0?YU:YL, 1.5+row*ZGAP);
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

    const fwd=new THREE.Vector3(), right=new THREE.Vector3();
    const SPEED=0.09;
    const getZone=p=>{
      if(p.z<0) return "ENTRY HALL";
      if(p.x<-2) return "PHOTO GALLERY";
      if(p.x>2)  return "VIDEO GALLERY";
      if(p.z>32) return "GALLERY END";
      return "MAIN GALLERY";
    };

    let rafId;
    const tick=(ts)=>{
      rafId=requestAnimationFrame(tick);
      // Animate centerpiece
      const t=ts*0.0004;
      cloud.rotation.y = t*0.7;
      cloud.rotation.x = Math.sin(t*0.3)*0.12;
      ico.rotation.y  = -t*0.5;
      ico.rotation.z  =  t*0.2;
      ring1.rotation.z = t*0.4;
      ring2.rotation.y = t*0.6;
      // Subtle float
      const floatY=Math.sin(t*1.1)*0.08;
      cloud.position.y=CLOUD_Y+floatY;
      ico.position.y  =CLOUD_Y+floatY;
      ring1.position.y=CLOUD_Y+floatY;
      ring2.position.y=CLOUD_Y+floatY;
      cloudLight.position.y=CLOUD_Y+floatY;
      // Pulse light intensity
      cloudLight.intensity=1.8+Math.sin(t*1.8)*0.4;
      // Movement
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
