// SpatialShowroom.js v13
// Changes from v12:
//   1. Seam fix: MEDIA_START_Z/MEDIA_END_Z guards — no seam geometry behind gallery panels
//   2. Audio: visible PLAY/PAUSE button always shown post-entry; logs failures; volume 0.7
//   3. Centerpiece prompts: proximity hint text for parcel, flight, orb
//   4. Centerpiece interactions: parcel CTA improved; flight tube -> start mission; orb -> category menu
//   5. Drone Mission: 7 waypoint rings along flight path, scoring (+100/wp + time bonus - collision penalty)
//   6. Lead capture: name+email form after mission; sessionId for backend validation
//   7. OrbMenu: 3 category choices (Property Marketing, Construction Progress, Mapping/Overlays)
//   8. Mobile tap fix: actual touch coords for raycasting (not screen center)
//   9. Mobile mission: joystick-compatible, Start/Exit mission buttons

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

const GW=18, GD=40, GH=4.8;
const EW=6,  ED=8;
const LX=-9.0, RX=9.0;
const PARCEL_POS  = [0, 1.3, 10];
const FLIGHT_Z    = [14, 20, 26];
const CLOUD_POS   = [0, 2.6, 30];
const EYE_HEIGHT  = 1.65;
// Gallery media occupies z=4..36 on side walls; seams must not appear in this range
const MEDIA_START_Z = 3.0;
const MEDIA_END_Z   = 36.5;
const MISSION_WP_T = [0, 0.17, 0.33, 0.50, 0.67, 0.83, 1.0];
const MISSION_WP_COUNT = MISSION_WP_T.length;

// ── TEXTURE GENERATORS ──────────────────────────────────────────────────────

function makeFloorTex() {
  const c=document.createElement("canvas"); c.width=1024; c.height=1024;
  const ctx=c.getContext("2d");
  ctx.fillStyle="#0A1018"; ctx.fillRect(0,0,1024,1024);
  for(let i=0;i<18000;i++){
    const x=Math.random()*1024,y=Math.random()*1024,v=Math.random()*18+2;
    ctx.fillStyle=`rgba(${v+10},${v+18},${v+32},${0.04+Math.random()*0.06})`; ctx.fillRect(x,y,1,1);
  }
  ctx.strokeStyle="rgba(30,55,100,0.18)"; ctx.lineWidth=1;
  for(let i=0;i<=1024;i+=64){ ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,1024);ctx.stroke(); ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(1024,i);ctx.stroke(); }
  ctx.strokeStyle="rgba(0,80,160,0.28)"; ctx.lineWidth=1.5;
  for(let i=0;i<=1024;i+=256){ ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,1024);ctx.stroke(); ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(1024,i);ctx.stroke(); }
  ctx.strokeStyle="rgba(0,180,160,0.38)"; ctx.lineWidth=1.5;
  for(let x=0;x<=1024;x+=256) for(let y=0;y<=1024;y+=256){ ctx.beginPath();ctx.moveTo(x-10,y);ctx.lineTo(x+10,y);ctx.stroke(); ctx.beginPath();ctx.moveTo(x,y-10);ctx.lineTo(x,y+10);ctx.stroke(); }
  return c;
}

function makeWallTex() {
  const c=document.createElement("canvas"); c.width=512; c.height=1024;
  const ctx=c.getContext("2d");
  ctx.fillStyle="#111E2E"; ctx.fillRect(0,0,512,1024);
  for(let i=0;i<8000;i++){
    const x=Math.random()*512,y=Math.random()*1024,v=Math.random()*12;
    ctx.fillStyle=`rgba(${v+8},${v+16},${v+28},${0.06+Math.random()*0.08})`; ctx.fillRect(x,y,1+Math.random()*2,1);
  }
  ctx.strokeStyle="rgba(0,50,100,0.22)"; ctx.lineWidth=1;
  for(let x=128;x<512;x+=128){ ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,1024);ctx.stroke(); }
  const grad=ctx.createLinearGradient(0,0,0,1024);
  grad.addColorStop(0,"rgba(0,30,60,0.12)"); grad.addColorStop(0.5,"rgba(0,0,0,0)"); grad.addColorStop(1,"rgba(0,10,30,0.18)");
  ctx.fillStyle=grad; ctx.fillRect(0,0,512,1024);
  return c;
}

function makeServicesTex() {
  const c=document.createElement("canvas"); c.width=900; c.height=560;
  const ctx=c.getContext("2d");
  ctx.fillStyle="#050C18"; ctx.fillRect(0,0,900,560);
  const bgGrad=ctx.createLinearGradient(0,0,900,560);
  bgGrad.addColorStop(0,"rgba(0,30,80,0.35)"); bgGrad.addColorStop(1,"rgba(0,10,30,0.15)");
  ctx.fillStyle=bgGrad; ctx.fillRect(0,0,900,560);
  for(let i=0;i<3000;i++){const x=Math.random()*900,y=Math.random()*560,v=Math.random()*10+2;ctx.fillStyle=`rgba(${v},${v+8},${v+20},0.07)`;ctx.fillRect(x,y,1,1);}
  const topLine=ctx.createLinearGradient(0,0,900,0);
  topLine.addColorStop(0,"rgba(0,80,200,0)"); topLine.addColorStop(0.35,"rgba(0,120,255,0.8)"); topLine.addColorStop(0.65,"rgba(0,200,180,0.8)"); topLine.addColorStop(1,"rgba(0,80,200,0)");
  ctx.fillStyle=topLine; ctx.fillRect(0,0,900,1.5);
  ctx.fillStyle="rgba(0,30,70,0.5)"; ctx.fillRect(0,0,900,88);
  ctx.fillStyle="#FFFFFF"; ctx.font="bold 34px Arial"; ctx.textAlign="center"; ctx.fillText("SERAPHIC SIGHT",450,40);
  ctx.fillStyle="rgba(80,180,255,0.75)"; ctx.font="11px Arial"; ctx.fillText("DRONE SERVICES",450,62);
  ctx.fillStyle="rgba(255,255,255,0.07)"; ctx.fillRect(32,88,836,1);
  const LEFT_SERVICES=[["Aerial Photography","High-res stills from FAA licensed pilots"],["Aerial Video Production","Cinematic 4K footage for listings & marketing"],["Real Estate & Land","MLS-ready assets in 3-4 business days"],["Construction Progress","Sequential site documentation for project records"]];
  const RIGHT_SERVICES=[["Site Context Docs","Surrounding area, access routes & context"],["Parcel Boundary Overlays","GPS-accurate boundary visualization on imagery"],["Drone Mapping Support","Visual reference for planning & permitting"]];
  function drawSvc(ctx,title,sub,x,y,accent){ctx.fillStyle=accent;ctx.fillRect(x,y-16,2,34);ctx.fillStyle="#D8ECFF";ctx.font="bold 17px Arial";ctx.textAlign="left";ctx.fillText(title,x+11,y);ctx.fillStyle="rgba(130,170,220,0.55)";ctx.font="12px Arial";ctx.fillText(sub,x+11,y+16);}
  const COL1_X=46,COL2_X=478,ROW_START_Y=132,ROW_STEP=106;
  LEFT_SERVICES.forEach(([t,s],i)=>{drawSvc(ctx,t,s,COL1_X,ROW_START_Y+i*ROW_STEP,"rgba(0,120,255,0.8)");if(i<LEFT_SERVICES.length-1){ctx.fillStyle="rgba(255,255,255,0.04)";ctx.fillRect(COL1_X+13,ROW_START_Y+i*ROW_STEP+30,358,1);}});
  RIGHT_SERVICES.forEach(([t,s],i)=>{drawSvc(ctx,t,s,COL2_X,ROW_START_Y+i*ROW_STEP,"rgba(0,200,160,0.8)");if(i<RIGHT_SERVICES.length-1){ctx.fillStyle="rgba(255,255,255,0.04)";ctx.fillRect(COL2_X+13,ROW_START_Y+i*ROW_STEP+30,358,1);}});
  ctx.fillStyle="rgba(0,80,180,0.18)"; ctx.fillRect(445,96,1,440);
  const btmLine=ctx.createLinearGradient(0,0,900,0);
  btmLine.addColorStop(0,"rgba(0,80,200,0)"); btmLine.addColorStop(0.5,"rgba(0,160,255,0.6)"); btmLine.addColorStop(1,"rgba(0,80,200,0)");
  ctx.fillStyle=btmLine; ctx.fillRect(0,558,900,2);
  return c;
}

function makeCTATex(text, accent="#0066EE") {
  const c=document.createElement("canvas"); c.width=512; c.height=88;
  const ctx=c.getContext("2d");
  ctx.fillStyle="rgba(4,10,24,0.92)"; ctx.roundRect(0,0,512,88,6); ctx.fill();
  const g=ctx.createLinearGradient(0,0,512,0); g.addColorStop(0,accent+"88"); g.addColorStop(1,accent+"22");
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
  ctx.fillStyle="rgba(160,220,255,0.6)"; ctx.font="12px Arial"; ctx.fillText("Boundary Mapping -- Click to learn more",140,34);
  return c;
}

// ── MINIMAP ──────────────────────────────────────────────────────────────────
function Minimap({ px, pz }) {
  const cvs=useRef(null);
  useEffect(()=>{
    if(!cvs.current) return;
    const ctx=cvs.current.getContext("2d");
    ctx.clearRect(0,0,120,120);
    ctx.fillStyle="rgba(4,8,18,0.93)"; ctx.fillRect(0,0,120,120);
    ctx.strokeStyle="rgba(0,90,180,0.35)"; ctx.lineWidth=1; ctx.strokeRect(0,0,120,120);
    const tx=(x)=>((x+9)/18)*120, tz=(z)=>((z+8)/48)*120;
    ctx.fillStyle="rgba(0,50,130,0.28)"; ctx.fillRect(tx(LX),tz(0),tx(RX)-tx(LX),tz(GD)-tz(0));
    ctx.fillStyle="rgba(0,40,100,0.4)"; ctx.fillRect(tx(-EW/2),tz(-ED),tx(EW/2)-tx(-EW/2),tz(0)-tz(-ED));
    ctx.strokeStyle="rgba(0,120,255,0.4)"; ctx.lineWidth=0.8; ctx.strokeRect(tx(LX),tz(0),tx(RX)-tx(LX),tz(GD)-tz(0));
    ctx.fillStyle="rgba(0,150,255,0.45)"; ctx.beginPath(); ctx.arc(tx(CLOUD_POS[0]),tz(CLOUD_POS[2]),3,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#00D4FF"; ctx.beginPath(); ctx.arc(tx(px),tz(pz),3.5,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle="#FFF"; ctx.lineWidth=0.8; ctx.beginPath(); ctx.arc(tx(px),tz(pz),3.5,0,Math.PI*2); ctx.stroke();
  },[px,pz]);
  return (
    <div style={{position:"fixed",bottom:16,left:16,zIndex:300,border:"1px solid rgba(0,90,200,0.4)",borderRadius:4,overflow:"hidden"}}>
      <canvas ref={cvs} width={120} height={120}/>
      <div style={{position:"absolute",top:3,left:5,fontSize:8,fontFamily:"monospace",color:"rgba(0,170,255,0.65)",letterSpacing:"0.1em"}}>MINIMAP</div>
    </div>
  );
}

// ── HUD ───────────────────────────────────────────────────────────────────────
function HUD({ zone, showHelp, setShowHelp, isMobile }) {
  return (
    <>
      <div style={{position:"fixed",top:22,right:22,zIndex:200,fontFamily:"monospace",fontSize:10,
        letterSpacing:"0.16em",color:"rgba(0,200,255,0.9)",textTransform:"uppercase",
        background:"rgba(4,8,20,0.8)",padding:"5px 12px",
        border:"1px solid rgba(0,130,255,0.22)",borderRadius:3,backdropFilter:"blur(8px)"}}>
        1F &nbsp;&middot;&nbsp; {zone}
      </div>
      {!isMobile && (
        <svg style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:200,pointerEvents:"none",opacity:0.6}} width={24} height={24}>
          <line x1={12} y1={2}  x2={12} y2={9}  stroke="#00D4FF" strokeWidth={1.5}/>
          <line x1={12} y1={15} x2={12} y2={22} stroke="#00D4FF" strokeWidth={1.5}/>
          <line x1={2}  y1={12} x2={9}  y2={12} stroke="#00D4FF" strokeWidth={1.5}/>
          <line x1={15} y1={12} x2={22} y2={12} stroke="#00D4FF" strokeWidth={1.5}/>
        </svg>
      )}
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
          {isMobile ? (
            <><div>Left joystick &mdash; Move</div><div>Right drag &mdash; Look</div><div>SPRINT btn &mdash; Sprint</div><div>JUMP btn &mdash; Jump</div><div>Tap object &mdash; Interact</div></>
          ) : (
            <><div>W A S D &mdash; Move</div><div>Mouse &mdash; Look</div><div>Shift &mdash; Sprint</div><div>Space &mdash; Jump</div><div>Click object &mdash; Interact</div><div>ESC &mdash; Release mouse</div></>
          )}
          <button onClick={()=>setShowHelp(false)} style={{marginTop:10,background:"none",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(140,180,255,0.6)",cursor:"pointer",borderRadius:3,padding:"3px 10px",fontFamily:"monospace",fontSize:10}}>CLOSE</button>
        </div>
      )}
    </>
  );
}

// ── AUDIO CONTROLS ───────────────────────────────────────────────────────────
function AudioControls({ audioRef }) {
  const [playing, setPlaying] = useState(false);
  const toggle = () => {
    const a = audioRef.current;
    if(!a) return;
    if(playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play()
        .then(() => setPlaying(true))
        .catch(err => {
          console.warn("[Audio] Play failed:", err.message);
          setPlaying(false);
        });
    }
  };
  return (
    <button onClick={toggle} style={{
      position:"fixed", bottom:16, right:16, zIndex:300,
      background:"rgba(4,10,26,0.92)",
      border:`1px solid ${playing?"rgba(0,200,160,0.55)":"rgba(0,100,200,0.35)"}`,
      color:playing?"#00EED8":"rgba(120,180,255,0.7)",
      fontFamily:"monospace", fontSize:9, letterSpacing:"0.18em",
      padding:"8px 16px", borderRadius:3, cursor:"pointer",
      backdropFilter:"blur(8px)", transition:"border 0.2s,color 0.2s",
      touchAction:"manipulation"
    }}>
      {playing ? "|| PAUSE AUDIO" : "> PLAY AUDIO"}
    </button>
  );
}

// ── PROXIMITY PROMPT ─────────────────────────────────────────────────────────
function ProximityPrompt({ text }) {
  if(!text) return null;
  return (
    <div style={{
      position:"fixed", bottom:80, left:"50%", transform:"translateX(-50%)",
      zIndex:300, background:"rgba(0,10,30,0.88)",
      border:"1px solid rgba(0,150,255,0.3)", borderRadius:4,
      padding:"6px 20px", fontFamily:"monospace", fontSize:10,
      color:"rgba(0,210,255,0.95)", letterSpacing:"0.18em",
      pointerEvents:"none", textTransform:"uppercase", whiteSpace:"nowrap"
    }}>
      {text}
    </div>
  );
}

// ── MISSION HUD ───────────────────────────────────────────────────────────────
function MissionHUD({ state, onExit }) {
  if(!state.active) return null;
  return (
    <div style={{
      position:"fixed", top:70, left:"50%", transform:"translateX(-50%)",
      zIndex:300, background:"rgba(0,10,30,0.92)",
      border:"1px solid rgba(0,200,160,0.45)", borderRadius:6,
      padding:"10px 24px", fontFamily:"monospace",
      display:"flex", gap:22, alignItems:"center",
      backdropFilter:"blur(8px)"
    }}>
      <div style={{color:"#00FFCC", fontSize:11, letterSpacing:"0.15em"}}>DRONE MISSION</div>
      <div style={{color:"#FFF", fontSize:15, fontWeight:"bold"}}>{state.score} pts</div>
      <div style={{color:"rgba(0,200,255,0.7)", fontSize:11}}>
        WP {Math.min(state.wp + 1, state.total)} / {state.total}
      </div>
      <button onClick={onExit} style={{
        background:"none", border:"1px solid rgba(255,80,80,0.3)",
        color:"rgba(255,120,120,0.7)", cursor:"pointer", borderRadius:3,
        padding:"3px 10px", fontFamily:"monospace", fontSize:9, letterSpacing:"0.1em"
      }}>EXIT</button>
    </div>
  );
}

// ── ORB MENU ──────────────────────────────────────────────────────────────────
function OrbMenu({ open, onClose, onSelect }) {
  if(!open) return null;
  const cats = [
    { label:"Property Marketing", accent:"#0077FF",
      body:"High-res aerial stills and cinematic video reels for listings,\ndevelopments, and real estate marketing.",
      action:"BROWSE PORTFOLIO", href:"/portfolio" },
    { label:"Construction Progress", accent:"#00AAFF",
      body:"Sequential aerial documentation capturing milestones\nfrom ground break to completion.",
      action:"VIEW EXAMPLES", href:"/portfolio" },
    { label:"Mapping / Overlays", accent:"#00CCAA",
      body:"GPS-accurate parcel boundaries, site context overlays,\nand drone mapping for planning and permitting.",
      action:"GET A QUOTE", href:"/contact" },
  ];
  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, zIndex:500,
      background:"rgba(1,3,8,0.88)", backdropFilter:"blur(14px)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14
    }}>
      <div style={{color:"#D0E8FF", fontFamily:"monospace", fontSize:14, letterSpacing:"0.18em", marginBottom:6, textTransform:"uppercase"}}>Portfolio Explorer</div>
      {cats.map((c,i) => (
        <button key={i} onClick={e=>{ e.stopPropagation(); onSelect({cta:true,title:c.label,body:c.body,action:c.action,href:c.href,accent:c.accent}); onClose(); }}
          style={{
            background:"rgba(4,10,26,0.96)", border:`1px solid ${c.accent}44`,
            color:"#D0E8FF", cursor:"pointer", borderRadius:8,
            padding:"14px 32px", fontFamily:"monospace", fontSize:12,
            letterSpacing:"0.1em", width:340, textAlign:"left",
            touchAction:"manipulation"
          }}>
          <div style={{color:c.accent, marginBottom:5, fontSize:10, letterSpacing:"0.22em"}}>{c.label.toUpperCase()}</div>
          <div style={{color:"rgba(160,200,255,0.5)", fontSize:10, lineHeight:1.55, whiteSpace:"pre-line"}}>{c.body}</div>
          <div style={{marginTop:8, color:c.accent, fontSize:9, letterSpacing:"0.18em"}}>{c.action} -&gt;</div>
        </button>
      ))}
      <button onClick={onClose} style={{
        background:"none", border:"1px solid rgba(255,255,255,0.1)",
        color:"rgba(140,170,220,0.5)", cursor:"pointer", borderRadius:3,
        padding:"5px 18px", fontFamily:"monospace", fontSize:10, marginTop:6
      }}>CLOSE</button>
    </div>
  );
}

// ── LEAD CAPTURE ─────────────────────────────────────────────────────────────
function LeadCapture({ data, onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [err, setErr] = useState("");
  const overlay = {position:"fixed",inset:0,zIndex:600,background:"rgba(1,3,8,0.96)",backdropFilter:"blur(18px)",display:"flex",alignItems:"center",justifyContent:"center"};
  const card = {background:"rgba(4,9,22,0.99)",border:"1px solid rgba(0,200,160,0.25)",borderRadius:10,padding:"36px 44px",display:"flex",flexDirection:"column",alignItems:"center",gap:14,minWidth:320,maxWidth:460};
  const inp = {background:"rgba(255,255,255,0.05)",border:"1px solid rgba(0,120,200,0.3)",borderRadius:4,padding:"9px 14px",fontFamily:"monospace",fontSize:12,color:"#C0D8FF",width:"100%",outline:"none",letterSpacing:"0.06em"};
  const btn = {background:"linear-gradient(135deg,#0055CC,#00AAA0)",border:"none",color:"#fff",cursor:"pointer",borderRadius:6,padding:"12px 36px",fontFamily:"monospace",fontSize:13,letterSpacing:"0.18em",touchAction:"manipulation"};
  const close = {background:"none",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(140,170,220,0.45)",cursor:"pointer",borderRadius:3,padding:"4px 14px",fontFamily:"monospace",fontSize:10};

  const submit = () => {
    if(!name.trim()){ setErr("Please enter your name."); return; }
    if(!email.includes("@")){ setErr("Please enter a valid email."); return; }
    // Frontend submission — connect Supabase/Firebase for server-side validation
    console.log("[Mission Reward Claim]", { name, email, score:data.score, time:data.time, sessionId:data.sessionId, wpOrder:data.wpOrder, collisions:data.collisions });
    setSubmitted(true);
  };

  if(submitted) return (
    <div style={overlay}>
      <div style={card}>
        <div style={{color:"#00FFCC",fontSize:20,letterSpacing:"0.08em"}}>REWARD UNLOCKED</div>
        <div style={{color:"#D0E8FF",fontSize:13,textAlign:"center",lineHeight:1.7}}>
          Thanks, {name}. A free parcel overlay consultation has been added to your next quote.
          We will follow up at {email}.
        </div>
        <div style={{color:"rgba(0,200,255,0.55)",fontSize:11,letterSpacing:"0.1em"}}>Final score: {data.score} pts &nbsp;&middot;&nbsp; Time: {Math.round(data.time)}s</div>
        <button style={btn} onClick={onClose}>RETURN TO SHOWROOM</button>
      </div>
    </div>
  );

  return (
    <div style={overlay}>
      <div style={card}>
        <div style={{color:"#00FFCC",fontSize:18,letterSpacing:"0.08em"}}>MISSION COMPLETE</div>
        <div style={{color:"rgba(0,200,255,0.7)",fontSize:13}}>Score: {data.score} pts &nbsp;&middot;&nbsp; Time: {Math.round(data.time)}s</div>
        <div style={{color:"#D0E8FF",fontSize:12,textAlign:"center",lineHeight:1.7}}>
          Mission complete: unlock a free parcel overlay with your quote.
          Enter your details to claim your reward.
        </div>
        <input style={inp} placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}/>
        <input style={inp} placeholder="Email address" type="email" value={email} onChange={e=>setEmail(e.target.value)}/>
        {err && <div style={{color:"#FF7777",fontSize:11}}>{err}</div>}
        <button style={btn} onClick={submit}>CLAIM REWARD</button>
        <button style={close} onClick={onClose}>Skip for now</button>
      </div>
    </div>
  );
}

// ── PANEL MODAL ───────────────────────────────────────────────────────────────
function PanelModal({ item, onClose }) {
  const [copied, setCopied] = useState(false);
  if(!item) return null;
  if(item.cta) {
    const isMailto = item.href && item.href.startsWith("mailto:");
    const isExternal = item.href && (item.href.startsWith("http://") || item.href.startsWith("https://"));
    const email = isMailto ? item.href.replace("mailto:","") : null;
    return (
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:500,background:"rgba(1,3,8,0.94)",backdropFilter:"blur(18px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div onClick={e=>e.stopPropagation()} style={{background:"rgba(5,9,22,0.99)",border:"1px solid rgba(0,100,255,0.2)",borderRadius:10,padding:"36px 48px",display:"flex",flexDirection:"column",alignItems:"center",gap:16,minWidth:320,maxWidth:480}}>
          <div style={{color:"#D0E8FF",fontFamily:"monospace",fontSize:20,letterSpacing:"0.08em",fontWeight:700}}>{item.title}</div>
          <div style={{color:"rgba(140,175,230,0.7)",fontFamily:"monospace",fontSize:12,textAlign:"center",whiteSpace:"pre-line",lineHeight:1.7}}>{item.body}</div>
          {isMailto ? (
            <>
              <div style={{color:"#A0C8FF",fontFamily:"monospace",fontSize:13}}>{email}</div>
              <button onClick={()=>{navigator.clipboard.writeText(email);setCopied(true);setTimeout(()=>setCopied(false),2200);}} style={{background:"linear-gradient(135deg,#0055CC,#00AAA0)",border:"none",color:"#fff",cursor:"pointer",borderRadius:6,padding:"12px 36px",fontFamily:"monospace",fontSize:13,letterSpacing:"0.18em"}}>
                {copied?"COPIED!":"COPY EMAIL"}
              </button>
            </>
          ) : (
            <a href={item.href} target={isExternal?"_blank":undefined} rel={isExternal?"noopener noreferrer":undefined}
              style={{background:"linear-gradient(135deg,#0055CC,#00AAA0)",border:"none",color:"#fff",cursor:"pointer",borderRadius:6,padding:"12px 36px",fontFamily:"monospace",fontSize:13,letterSpacing:"0.18em",textDecoration:"none"}}>
              {item.action}
            </a>
          )}
          <button onClick={onClose} style={{background:"none",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(140,170,220,0.5)",cursor:"pointer",borderRadius:3,padding:"4px 14px",fontFamily:"monospace",fontSize:10}}>CLOSE</button>
        </div>
      </div>
    );
  }
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:500,background:"rgba(1,3,8,0.94)",backdropFilter:"blur(18px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"rgba(5,9,20,0.99)",border:"1px solid rgba(0,100,255,0.18)",borderRadius:10,padding:22,maxWidth:"88vw",maxHeight:"88vh",display:"flex",flexDirection:"column",alignItems:"center"}}>
        {item.type==="photo"
          ? <img src={cImg(item.id,1400,900)} alt={item.label} style={{maxWidth:"100%",maxHeight:"72vh",objectFit:"contain",borderRadius:6}}/>
          : <video src={cVid(item.id)} autoPlay muted loop playsInline controls style={{maxWidth:"100%",maxHeight:"72vh",borderRadius:6}}/>}
        <div style={{marginTop:14,color:"#D8E8FF",fontFamily:"monospace",fontSize:13}}>{item.label}</div>
        <button onClick={onClose} style={{marginTop:12,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(160,200,255,0.7)",cursor:"pointer",borderRadius:4,padding:"5px 18px",fontFamily:"monospace",fontSize:10}}>CLOSE</button>
      </div>
    </div>
  );
}

// ── ONBOARDING ────────────────────────────────────────────────────────────────
function Onboarding({ onStart, onEnter, isMobile }) {
  const [phase,setPhase]=useState("hello");
  const [prog,setProg]=useState(0);
  const [fading,setFading]=useState(false);
  useEffect(()=>{
    if(phase==="hello"){ const t=setTimeout(()=>setPhase("enter"),2000); return()=>clearTimeout(t); }
    if(phase==="loading"){
      let p=0;
      const iv=setInterval(()=>{
        p+=Math.random()*16+6;
        if(p>=100){ p=100; clearInterval(iv); setFading(true); setTimeout(()=>onStart(),750); }
        setProg(Math.min(100,p));
      },65);
      return()=>clearInterval(iv);
    }
  },[phase,onStart]);
  const base={position:"fixed",inset:0,zIndex:999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"radial-gradient(ellipse 110% 100% at 50% 0%,#060E20 0%,#010306 78%)",fontFamily:"monospace",opacity:fading?0:1,transition:"opacity 0.75s ease",pointerEvents:fading?"none":"auto"};
  if(phase==="hello") return (
    <div style={base}>
      <style>{`@keyframes pls{0%,100%{opacity:0.55}50%{opacity:1}} @keyframes riseIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{animation:"riseIn 1.1s ease forwards",textAlign:"center"}}>
        <div style={{fontSize:44,letterSpacing:"0.18em",color:"#00C8FF",fontWeight:300,animation:"pls 2s ease-in-out infinite",textTransform:"uppercase"}}>Seraphic Sight</div>
        <div style={{fontSize:13,letterSpacing:"0.55em",color:"rgba(0,180,255,0.45)",marginTop:10,textTransform:"lowercase"}}>showroom</div>
      </div>
    </div>
  );
  if(phase==="enter") return (
    <div style={base}>
      <div style={{marginBottom:10,textAlign:"center"}}>
        <div style={{fontSize:28,letterSpacing:"0.18em",color:"rgba(0,190,255,0.75)",fontWeight:300,textTransform:"uppercase"}}>Seraphic Sight</div>
        <div style={{fontSize:11,letterSpacing:"0.55em",color:"rgba(0,160,255,0.38)",marginTop:6,textTransform:"lowercase"}}>showroom</div>
      </div>
      <div style={{height:1,width:120,background:"linear-gradient(90deg,transparent,rgba(0,180,255,0.3),transparent)",margin:"22px 0 28px"}}/>
      <button onClick={()=>{ onEnter(); setPhase("loading"); }} style={{
        background:"linear-gradient(135deg,#0044BB,#009990)",border:"none",color:"#fff",
        cursor:"pointer",borderRadius:6,padding:"13px 54px",fontFamily:"monospace",
        fontSize:13,letterSpacing:"0.22em",boxShadow:"0 0 28px rgba(0,90,200,0.38)",touchAction:"manipulation"}}>
        ENTER GALLERY
      </button>
      <div style={{marginTop:18,fontSize:9,color:"rgba(120,155,210,0.42)",letterSpacing:"0.18em"}}>
        {isMobile?"JOYSTICK  LOOK DRAG  TAP TO INTERACT":"WASD  MOUSE LOOK  CLICK TO INTERACT"}
      </div>
    </div>
  );
  return (
    <div style={base}>
      <div style={{marginBottom:22,textAlign:"center"}}>
        <div style={{fontSize:28,letterSpacing:"0.18em",color:"rgba(0,190,255,0.6)",fontWeight:300,textTransform:"uppercase"}}>Seraphic Sight</div>
        <div style={{fontSize:11,letterSpacing:"0.55em",color:"rgba(0,160,255,0.3)",marginTop:6,textTransform:"lowercase"}}>showroom</div>
      </div>
      <div style={{width:240,height:1,background:"rgba(255,255,255,0.06)"}}>
        <div style={{height:"100%",background:"linear-gradient(90deg,#0044BB,#00BFA6)",width:`${prog}%`,transition:"width 0.06s linear",boxShadow:"0 0 6px rgba(0,130,190,0.7)"}}/>
      </div>
      <div style={{marginTop:8,fontSize:9,color:"rgba(0,170,255,0.38)",letterSpacing:"0.2em"}}>{Math.round(prog)}%</div>
    </div>
  );
}

// ── MOBILE CONTROLS ───────────────────────────────────────────────────────────
function MobileControls({ joystickRef, sprintingRef, jumpRef, missionActive, onStartMission }) {
  const joystickAreaRef=useRef(null), stickRef=useRef(null);
  useEffect(()=>{
    const el=joystickAreaRef.current; if(!el) return;
    let id=null,bx=0,by=0;
    const onTS=(e)=>{ if(id!==null) return; const t=e.changedTouches[0]; id=t.identifier; bx=t.clientX; by=t.clientY; joystickRef.current={x:0,y:0}; };
    const onTM=(e)=>{ for(let i=0;i<e.changedTouches.length;i++){ const t=e.changedTouches[i]; if(t.identifier!==id) continue; const dx=t.clientX-bx,dy=t.clientY-by,mag=Math.sqrt(dx*dx+dy*dy),maxR=42; const nx=mag>maxR?dx/mag:dx/maxR,ny=mag>maxR?dy/mag:dy/maxR; joystickRef.current={x:nx,y:ny}; if(stickRef.current) stickRef.current.style.transform=`translate(${nx*maxR}px,${ny*maxR}px)`; } };
    const onTE=(e)=>{ for(let i=0;i<e.changedTouches.length;i++) if(e.changedTouches[i].identifier===id){ id=null; joystickRef.current={x:0,y:0}; if(stickRef.current) stickRef.current.style.transform="translate(0,0)"; } };
    el.addEventListener("touchstart",onTS,{passive:true}); el.addEventListener("touchmove",onTM,{passive:true}); el.addEventListener("touchend",onTE,{passive:true});
    return()=>{ el.removeEventListener("touchstart",onTS); el.removeEventListener("touchmove",onTM); el.removeEventListener("touchend",onTE); };
  },[joystickRef]);
  const btnStyle=(color)=>({width:56,height:56,borderRadius:"50%",border:`2px solid ${color}`,background:`${color}22`,color,fontFamily:"monospace",fontSize:10,fontWeight:"bold",letterSpacing:"0.06em",display:"flex",alignItems:"center",justifyContent:"center",userSelect:"none",WebkitUserSelect:"none",cursor:"pointer",touchAction:"none"});
  return (
    <>
      <div ref={joystickAreaRef} style={{position:"fixed",bottom:40,left:32,zIndex:400,width:100,height:100,borderRadius:"50%",background:"rgba(0,80,180,0.12)",border:"2px solid rgba(0,120,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center",touchAction:"none",userSelect:"none"}}>
        <div ref={stickRef} style={{width:38,height:38,borderRadius:"50%",background:"rgba(0,140,255,0.45)",border:"2px solid rgba(0,180,255,0.65)",pointerEvents:"none"}}/>
      </div>
      <div style={{position:"fixed",bottom:40,right:32,zIndex:400,display:"flex",flexDirection:"column",gap:10,alignItems:"center"}}>
        <div style={btnStyle("#00CCAA")} onTouchStart={()=>{sprintingRef.current=true;}} onTouchEnd={()=>{sprintingRef.current=false;}}>SPRINT</div>
        <div style={btnStyle("#4499FF")} onTouchStart={()=>{jumpRef.current=true;}} onTouchEnd={()=>{jumpRef.current=false;}}>JUMP</div>
        {!missionActive && (
          <div style={{...btnStyle("#00FFCC"),width:70,height:40,borderRadius:6,fontSize:8}} onTouchStart={onStartMission}>MISSION</div>
        )}
      </div>
    </>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function SpatialShowroom() {
  const mountRef       = useRef(null);
  const audioRef       = useRef(null);
  const handleHotRef   = useRef(null); // RAF -> React bridge for clicks
  const missionRef     = useRef({ active:false, currentWP:0, score:0, startTime:0, collisions:0, wpOrder:[], done:false });
  const lastPromptRef  = useRef("");
  const nearTargetRef  = useRef(null); // userData of nearest interactable centerpiece
  const sessionIdRef   = useRef(Math.random().toString(36).substr(2,9) + Date.now().toString(36));
  const missionWPRef   = useRef([]); // mission waypoint ring meshes inside 3D scene

  const [started,    setStarted]    = useState(false);
  const [pos,        setPos]        = useState([0,-5]);
  const [zone,       setZone]       = useState("ENTRY HALL");
  const [modal,      setModal]      = useState(null);
  const [showHelp,   setShowHelp]   = useState(false);
  const [prompt,     setPrompt]     = useState("");
  const [missionState, setMissionState] = useState({ active:false, score:0, wp:0, total:MISSION_WP_COUNT, done:false });
  const [orbMenu,    setOrbMenu]    = useState(false);
  const [leadCapture,setLeadCapture]= useState(null);

  const isMobile = typeof window!=="undefined" &&
    (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);

  const joystickRef   = useRef({x:0,y:0});
  const sprintingRef  = useRef(false);
  const jumpTriggerRef= useRef(false);

  // Audio — create on mount, ready to play on first user gesture
  useEffect(()=>{
    const audio = new Audio("/audio/seraphic-sight-overview.mp3");
    audio.volume = 0.7;
    audio.loop   = true;
    audioRef.current = audio;
    return()=>{ audio.pause(); audio.src=""; audioRef.current=null; };
  },[]);

  const startBgMusic = () => {
    if(audioRef.current)
      audioRef.current.play()
        .catch(err => console.warn("[Audio] Autoplay blocked:", err.message));
  };

  // Keep handleHotRef current (safe to call from RAF closure)
  handleHotRef.current = (userData) => {
    if(!userData) return;
    if(userData.type === "drone-mission") {
      // Start mission
      const wp = missionWPRef.current;
      wp.forEach((r,i)=>{ r.material.opacity=i===0?0.92:0.22; r.material.emissiveIntensity=i===0?5:1.5; r.material.color.set(i===0?0x00FFCC:0x00AACC); });
      missionRef.current = { active:true, currentWP:0, score:0, startTime:Date.now(), collisions:0, wpOrder:[], done:false };
      setMissionState({ active:true, score:0, wp:0, total:MISSION_WP_COUNT, done:false });
    } else if(userData.type === "orb") {
      setOrbMenu(true);
    } else {
      setModal(userData);
    }
  };

  const exitMission = () => {
    missionRef.current.active = false;
    missionRef.current.done   = true;
    missionWPRef.current.forEach(r=>{ r.material.opacity=0; });
    setMissionState(s=>({...s, active:false}));
  };

  // ── 3D SCENE ──────────────────────────────────────────────────────────────
  useEffect(()=>{
    if(!started) return;
    const el = mountRef.current; if(!el) return;

    const renderer = new THREE.WebGLRenderer({antialias:!isMobile});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile?1.5:2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1.0;
    el.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    scene.background = new THREE.Color(0x060C18);
    scene.fog = new THREE.Fog(0x060C18, 38, 95);

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 100);
    camera.position.set(0, EYE_HEIGHT, -6);
    camera.lookAt(0, EYE_HEIGHT, 1);

    // Textures
    const floorTex = new THREE.CanvasTexture(makeFloorTex());
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(5, 14);
    const wallTex = new THREE.CanvasTexture(makeWallTex());
    wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
    const servicesTex = new THREE.CanvasTexture(makeServicesTex());
    servicesTex.colorSpace = THREE.SRGBColorSpace;
    servicesTex.needsUpdate = true;

    // Geometry helpers
    const bsic = (col,opts={}) => new THREE.MeshBasicMaterial({color:col,...opts});
    const emit  = (col,em,ei=2) => new THREE.MeshStandardMaterial({color:col,emissive:new THREE.Color(em),emissiveIntensity:ei,roughness:0.25,metalness:0.3});
    const wallMat = () => new THREE.MeshStandardMaterial({map:wallTex,roughness:0.75,metalness:0.06,color:new THREE.Color(0x18293E)});
    const box   = (px,py,pz,w,h,d,mat)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(px,py,pz); scene.add(m); return m; };
    const hPlane= (px,py,pz,w,d,mat)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat); m.rotation.x=-Math.PI/2; m.position.set(px,py,pz); scene.add(m); return m; };
    const vPlane= (px,py,pz,w,h,mat,ry=0)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat); m.position.set(px,py,pz); m.rotation.y=ry; scene.add(m); return m; };

    const wallC = 0x18293E;

    // Floors
    hPlane(0,0,GD/2, GW,GD, new THREE.MeshStandardMaterial({map:floorTex,roughness:0.48,metalness:0.16,color:0xffffff}));
    hPlane(0,0,-ED/2, EW,ED, new THREE.MeshStandardMaterial({map:floorTex,roughness:0.5,metalness:0.14,color:0x7799AA}));

    // Ceiling
    const ceilTex=(()=>{ const cv=document.createElement("canvas"); cv.width=512; cv.height=256; const cx=cv.getContext("2d"); cx.fillStyle="#0B1622"; cx.fillRect(0,0,512,256); cx.strokeStyle="rgba(0,40,90,0.25)"; cx.lineWidth=1; for(let x=128;x<512;x+=128){cx.beginPath();cx.moveTo(x,0);cx.lineTo(x,256);cx.stroke();} cx.strokeStyle="rgba(0,40,90,0.15)"; for(let y=64;y<256;y+=64){cx.beginPath();cx.moveTo(0,y);cx.lineTo(512,y);cx.stroke();} return new THREE.CanvasTexture(cv); })();
    ceilTex.wrapS=ceilTex.wrapT=THREE.RepeatWrapping; ceilTex.repeat.set(3,6);
    box(0,GH,GD/2, GW,0.18,GD, new THREE.MeshStandardMaterial({map:ceilTex,roughness:0.9,metalness:0.04,color:0xCCDDEE}));
    box(0,GH,-ED/2, EW,0.18,ED, bsic(0x0C1A2C));

    // Outer walls
    const wL=wallMat(), wR=wallMat(); wL.map=wR.map=wallTex;
    box(LX, GH/2,GD/2, 0.12,GH,GD, wL);
    box(RX, GH/2,GD/2, 0.12,GH,GD, wR);
    box(0, GH/2,GD+0.06, GW,GH,0.12, bsic(wallC));
    box(0, GH/2,-ED-0.06, EW,GH,0.12, bsic(wallC));
    box(-EW/2-0.06, GH/2,-ED/2, 0.12,GH,ED, bsic(wallC));
    box( EW/2+0.06, GH/2,-ED/2, 0.12,GH,ED, bsic(wallC));
    const sw=Math.abs(LX)-EW/2;
    box(-(Math.abs(LX)+EW/2)/2, GH/2, 0, sw,GH,0.12, bsic(wallC));
    box( (Math.abs(LX)+EW/2)/2, GH/2, 0, sw,GH,0.12, bsic(wallC));

    // ── WALL SEAMS — fixed: skip range behind gallery media ─────────────
    // Gallery panels occupy LX+0.07 / RX-0.07 at z = MEDIA_START_Z..MEDIA_END_Z
    // Do NOT draw seam geometry inside that range.
    {
      const seamMat = new THREE.MeshBasicMaterial({color:0x1A4A7A,transparent:true,opacity:0.28});
      for(let sz=0; sz<=GD; sz+=4){
        if(sz >= MEDIA_START_Z && sz <= MEDIA_END_Z) continue;
        if(sz >= GD-0.5) continue;
        const sl = new THREE.Mesh(new THREE.BoxGeometry(0.015,GH,0.01), seamMat.clone());
        sl.position.set(LX+0.07, GH/2, sz); scene.add(sl);
        const sr = new THREE.Mesh(new THREE.BoxGeometry(0.015,GH,0.01), seamMat.clone());
        sr.position.set(RX-0.07, GH/2, sz); scene.add(sr);
      }
    }

    // Baseboards & glow
    const warmGlow=emit(0xFFFFFF,0xFFEEDD,2.2), ceilGlow=emit(0x99AAEE,0x334488,1.8);
    const bbMat = new THREE.MeshStandardMaterial({color:0x08111E,roughness:0.85,metalness:0.1});
    box(LX+0.09,0.07,GD/2, 0.06,0.14,GD, bbMat.clone());
    box(RX-0.09,0.07,GD/2, 0.06,0.14,GD, bbMat.clone());
    box(LX+0.07,0.04,GD/2, 0.04,0.07,GD, warmGlow.clone());
    box(RX-0.07,0.04,GD/2, 0.04,0.07,GD, warmGlow.clone());
    box(LX+0.07,GH-0.05,GD/2, 0.03,0.05,GD, ceilGlow.clone());
    box(RX-0.07,GH-0.05,GD/2, 0.03,0.05,GD, ceilGlow.clone());
    const archMat=emit(0x88AAFF,0x2244AA,2.5);
    box(-EW/2+0.07,GH/2,0.06, 0.05,GH,0.05, archMat.clone());
    box( EW/2-0.07,GH/2,0.06, 0.05,GH,0.05, archMat.clone());
    box(0,GH-0.04,0.06, EW,0.04,0.05, archMat.clone());

    // Gallery backing panels (tram rails)
    const bkgMat=new THREE.MeshBasicMaterial({color:0x020810,transparent:true,opacity:0.72});
    const pBk=new THREE.Mesh(new THREE.PlaneGeometry(0.04,GH*0.65),bkgMat.clone()); pBk.position.set(LX+0.05,GH*0.42,GD/2-2); pBk.rotation.y=Math.PI/2; scene.add(pBk);
    const vBk=new THREE.Mesh(new THREE.PlaneGeometry(0.04,GH*0.65),bkgMat.clone()); vBk.position.set(RX-0.05,GH*0.42,GD/2-2); vBk.rotation.y=-Math.PI/2; scene.add(vBk);
    [0,1].forEach(i=>{ const y=i===0?GH*0.72:GH*0.14,col=i===0?0x2255FF:0x1133AA,em=i===0?0x0033BB:0x0022AA; const m=new THREE.Mesh(new THREE.BoxGeometry(0.012,0.018,34),new THREE.MeshStandardMaterial({color:col,emissive:new THREE.Color(em),emissiveIntensity:i===0?2.8:2.2})); m.position.set(LX+0.05,y,GD/2-2); scene.add(m); });
    [0,1].forEach(i=>{ const y=i===0?GH*0.72:GH*0.14,col=i===0?0x00CCAA:0x008866,em=i===0?0x009977:0x006644; const m=new THREE.Mesh(new THREE.BoxGeometry(0.012,0.018,34),new THREE.MeshStandardMaterial({color:col,emissive:new THREE.Color(em),emissiveIntensity:i===0?2.8:2.2})); m.position.set(RX-0.05,y,GD/2-2); scene.add(m); });

    // Ceiling lights
    scene.add(new THREE.AmbientLight(0xCCDDFF, isMobile?0.55:0.3));
    if(!isMobile){
      [4,10,16,22,28,34,38].forEach(z=>{ box(-3.5,GH-0.08,z,4.5,0.05,0.07,emit(0xFFFFEE,0xFFEECC,2.2)); box(3.5,GH-0.08,z,4.5,0.05,0.07,emit(0xFFFFEE,0xFFEECC,2.2)); const pl=new THREE.PointLight(0xFFEEDD,3.2,20); pl.position.set(0,GH-0.3,z); scene.add(pl); });
      [-6,-2].forEach(z=>{ const pl=new THREE.PointLight(0xFFEEDD,2.8,10); pl.position.set(0,GH-0.4,z); scene.add(pl); });
      [5,14,23,32].forEach(z=>{ const l=new THREE.PointLight(0xFFEEDD,1.6,8); l.position.set(LX+1.5,0.2,z); scene.add(l); const r=new THREE.PointLight(0xFFEEDD,1.6,8); r.position.set(RX-1.5,0.2,z); scene.add(r); });
    } else {
      [8,24,38].forEach(z=>{ box(-3.5,GH-0.08,z,4.5,0.05,0.07,emit(0xFFFFEE,0xFFEECC,2.2)); box(3.5,GH-0.08,z,4.5,0.05,0.07,emit(0xFFFFEE,0xFFEECC,2.2)); const pl=new THREE.PointLight(0xFFEEDD,4.0,28); pl.position.set(0,GH-0.3,z); scene.add(pl); });
    }

    // Section signs
    function signTex(text,accent){ const cv=document.createElement("canvas"); cv.width=512; cv.height=72; const cx=cv.getContext("2d"); cx.clearRect(0,0,512,72); cx.fillStyle=accent; cx.font="bold 44px Arial"; cx.textAlign="center"; cx.fillText(text,256,54); return new THREE.CanvasTexture(cv); }
    vPlane(LX+0.08,GH-0.5,4,5,0.65,new THREE.MeshBasicMaterial({color:0xffffff,map:signTex("PHOTO GALLERY","#4499FF"),transparent:true,side:THREE.DoubleSide}),Math.PI/2);
    vPlane(RX-0.08,GH-0.5,4,5,0.65,new THREE.MeshBasicMaterial({color:0xffffff,map:signTex("VIDEO GALLERY","#00CCAA"),transparent:true,side:THREE.DoubleSide}),-Math.PI/2);

    // Services wall
    const svcBacking=new THREE.Mesh(new THREE.PlaneGeometry(9.8,4.4),new THREE.MeshBasicMaterial({color:0x020810,transparent:true,opacity:0.90,side:THREE.DoubleSide,depthWrite:false}));
    svcBacking.position.set(0,GH/2-0.15,GD-0.08); svcBacking.rotation.y=Math.PI; svcBacking.renderOrder=7; scene.add(svcBacking);
    const svcPanel=new THREE.Mesh(new THREE.PlaneGeometry(9.2,4.0),new THREE.MeshBasicMaterial({color:0xffffff,map:servicesTex,transparent:false,side:THREE.DoubleSide,depthWrite:true,depthTest:true}));
    svcPanel.position.set(0,GH/2-0.15,GD-0.20); svcPanel.rotation.y=Math.PI; svcPanel.renderOrder=9; scene.add(svcPanel);
    const svcY=GH/2-0.15;
    box(0,svcY+2.12,GD-0.18,9.6,0.018,0.012,new THREE.MeshStandardMaterial({color:0x0060FF,emissive:new THREE.Color(0x0040CC),emissiveIntensity:3.0}));
    box(0,svcY-2.12,GD-0.18,9.6,0.018,0.012,new THREE.MeshStandardMaterial({color:0x00CCAA,emissive:new THREE.Color(0x009977),emissiveIntensity:2.5}));

    // CTA panels
    const hotspots=[];
    function addCTA(px,py,pz,text,ry,ctaData){
      const tex=new THREE.CanvasTexture(makeCTATex(text,ctaData.accent||"#0066EE"));
      const front=new THREE.Mesh(new THREE.PlaneGeometry(2.8,0.62),new THREE.MeshBasicMaterial({color:0xffffff,map:tex,transparent:true,side:THREE.DoubleSide,depthWrite:false}));
      front.position.set(px,py,pz-0.03); front.rotation.y=ry; front.renderOrder=10; scene.add(front);
      const back=new THREE.Mesh(new THREE.PlaneGeometry(2.85,0.67),new THREE.MeshBasicMaterial({color:0x001030,transparent:true,opacity:0.65,depthWrite:false}));
      back.position.set(px,py,pz-0.06); back.rotation.y=ry; back.renderOrder=9; scene.add(back);
      front.userData={cta:true,...ctaData}; hotspots.push(front);
    }
    addCTA(-6.2,1.6,GD-0.15,"GET A QUOTE",Math.PI,{title:"Get a Quote",body:"FAA Part 107 certified drone services\nSouthern & Central California",action:"CONTACT US",href:"/contact",accent:"#0066EE"});
    addCTA( 6.2,1.6,GD-0.15,"VIEW PORTFOLIO",Math.PI,{title:"Full Portfolio",body:"Browse the complete aerial photography\nand video portfolio",action:"OPEN PORTFOLIO",href:"/portfolio",accent:"#009977"});

    // ── CENTERPIECE 1: PARCEL EXHIBIT ────────────────────────────────────
    const [PX,PY,PZ]=PARCEL_POS;
    const parcelGroup=new THREE.Group();
    parcelGroup.position.set(PX,PY,PZ);
    parcelGroup.scale.set(1.25,1.25,1.25);
    scene.add(parcelGroup);
    const ped=new THREE.Mesh(new THREE.CylinderGeometry(0.7,0.75,0.12,32),bsic(0x0E1E30));
    ped.position.set(PX,0.06,PZ); scene.add(ped);
    const flRing=new THREE.Mesh(new THREE.TorusGeometry(1.1,0.022,6,64),emit(0x00CCBB,0x009988,2.2));
    flRing.rotation.x=Math.PI/2; flRing.position.set(PX,0.02,PZ); scene.add(flRing);

    const pts2d=[[-1.0,-0.7],[1.3,-0.85],[1.6,0.7],[0.2,1.2],[-1.2,0.9]];
    const pts3d=pts2d.map(([x,z])=>new THREE.Vector3(x,0.02,z));
    const closedPts=[...pts3d,pts3d[0]];
    const bndCurve=new THREE.CatmullRomCurve3(closedPts,true);
    const bndMat=new THREE.MeshStandardMaterial({color:0x00ffee,emissive:new THREE.Color(0x00ddcc),emissiveIntensity:3.5,transparent:true,opacity:0.95});
    const bndTube=new THREE.Mesh(new THREE.TubeGeometry(bndCurve,120,0.025,8,true),bndMat);
    parcelGroup.add(bndTube);
    bndTube.userData={
      cta:true,
      title:"Parcel Boundary Preview",
      body:"Aerial boundary overlays help buyers, agents, and developers\nunderstand site limits, access, frontage, and usable land at a glance.\nGPS-accurate and delivered on imagery.",
      action:"ADD PARCEL OVERLAY TO MY QUOTE",
      href:"/contact?service=parcel-overlay",
      accent:"#00CCAA"
    };
    hotspots.push(bndTube);

    const shape=new THREE.Shape(pts2d.map(([x,z])=>new THREE.Vector2(x,z)));
    const fillMesh=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshBasicMaterial({color:0x00AAFF,transparent:true,opacity:0.13,side:THREE.DoubleSide}));
    fillMesh.rotation.x=-Math.PI/2; parcelGroup.add(fillMesh);
    const cornerPins=[];
    pts3d.forEach(pt=>{
      const pin=new THREE.Mesh(new THREE.SphereGeometry(0.07,8,8),emit(0x00FFCC,0x00EEAA,3.0));
      pin.position.copy(pt); parcelGroup.add(pin); cornerPins.push(pin);
      parcelGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([pt,new THREE.Vector3(pt.x,-PY,pt.z)]),new THREE.LineBasicMaterial({color:0x0088BB,transparent:true,opacity:0.45})));
    });
    for(let g=-0.9;g<=0.9;g+=0.25){
      parcelGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1.4,0.01,g),new THREE.Vector3(1.7,0.01,g)]),new THREE.LineBasicMaterial({color:0x005577,transparent:true,opacity:0.5})));
    }
    const plabelTex=new THREE.CanvasTexture(makeParcelLabelTex());
    const plabel=new THREE.Mesh(new THREE.PlaneGeometry(1.8,0.3),new THREE.MeshBasicMaterial({map:plabelTex,transparent:true,side:THREE.DoubleSide,color:0xffffff}));
    plabel.position.set(0,1.55,0); parcelGroup.add(plabel);
    const parcelLight=new THREE.PointLight(0x00DDCC,1.4,9); parcelLight.position.set(PX,2,PZ); scene.add(parcelLight);
    const scanRingGeo=new THREE.RingGeometry(0.08,1.55,48);
    const scanRingMat=new THREE.MeshBasicMaterial({color:0x00FFDD,transparent:true,opacity:0.35,side:THREE.DoubleSide,depthWrite:false});
    const scanRing=new THREE.Mesh(scanRingGeo,scanRingMat);
    scanRing.rotation.x=-Math.PI/2; parcelGroup.add(scanRing);
    let scanY=-1.1;

    // ── CENTERPIECE 2: DRONE FLIGHT PATH ─────────────────────────────────
    const [FZ_START,,FZ_END]=FLIGHT_Z;
    const flightPts=[
      new THREE.Vector3(-2.2,3.5,FZ_START),
      new THREE.Vector3(-1.0,3.7,FZ_START+2),
      new THREE.Vector3( 0.8,3.8,FZ_START+4),
      new THREE.Vector3( 1.8,3.6,FZ_START+6),
      new THREE.Vector3( 0.4,3.75,FZ_START+8),
      new THREE.Vector3(-1.2,3.65,FZ_START+10),
      new THREE.Vector3( 0.0,3.7,FZ_END),
    ];
    const flightCurve=new THREE.CatmullRomCurve3(flightPts,false);
    const flightTubeMat=new THREE.MeshStandardMaterial({color:0x00DDFF,emissive:new THREE.Color(0x0099CC),emissiveIntensity:2.5,transparent:true,opacity:0.65});
    const flightTube=new THREE.Mesh(new THREE.TubeGeometry(flightCurve,80,0.014,6,false),flightTubeMat);
    flightTube.userData={type:"drone-mission"};
    scene.add(flightTube);
    hotspots.push(flightTube);

    // Waypoint dots (visual)
    const wpDots=[];
    MISSION_WP_T.forEach(u=>{
      const wp=new THREE.Mesh(new THREE.SphereGeometry(0.05,8,8),emit(0x00FFEE,0x00CCDD,3.2));
      wp.position.copy(flightCurve.getPointAt(u)); scene.add(wp); wpDots.push(wp);
    });

    // Pulse sphere + drone marker
    const pulseMesh=new THREE.Mesh(new THREE.SphereGeometry(0.06,8,8),emit(0xFFFFFF,0x00DDFF,4.5));
    scene.add(pulseMesh);
    const droneMesh=new THREE.Mesh(new THREE.ConeGeometry(0.07,0.22,4),new THREE.MeshStandardMaterial({color:0x00FFEE,emissive:new THREE.Color(0x00CCBB),emissiveIntensity:3.2,roughness:0.3,metalness:0.5}));
    scene.add(droneMesh);
    const droneTrail=new THREE.Mesh(new THREE.SphereGeometry(0.04,6,6),new THREE.MeshBasicMaterial({color:0x00FFEE,transparent:true,opacity:0.45}));
    scene.add(droneTrail);
    let flightU=0;
    const flightLight=new THREE.PointLight(0x00CCFF,1.2,12); scene.add(flightLight);

    // Mission waypoint rings on the floor (XZ positions of flight curve, at y=0.1)
    const missionWPPositions = MISSION_WP_T.map(u=>{
      const p=flightCurve.getPointAt(u);
      return new THREE.Vector3(p.x, EYE_HEIGHT, p.z); // detect at camera height
    });
    const missionWPMeshes = missionWPPositions.map(pos=>{
      const ringMat=new THREE.MeshStandardMaterial({
        color:0x00FFCC, emissive:new THREE.Color(0x00CCAA),
        emissiveIntensity:0, transparent:true, opacity:0, depthWrite:false
      });
      const ring=new THREE.Mesh(new THREE.TorusGeometry(1.3,0.07,6,36),ringMat);
      ring.rotation.x=Math.PI/2;
      ring.position.set(pos.x, 0.12, pos.z);
      scene.add(ring);
      return ring;
    });
    missionWPRef.current = missionWPMeshes;

    // ── CENTERPIECE 3: POINT CLOUD ORB ────────────────────────────────────
    const [CX,CY,CZ]=CLOUD_POS;
    const N_PTS=isMobile?2500:6500;
    const cPos=new Float32Array(N_PTS*3), cColBase=new Float32Array(N_PTS*3);
    let _s=11; const rnd=()=>{_s=(_s*9301+49297)%233280;return _s/233280;};
    for(let i=0;i<N_PTS;i++){
      const th=rnd()*Math.PI*2,ph=Math.acos(2*rnd()-1),r=1.35*(0.88+0.12*rnd());
      cPos[i*3]=r*Math.sin(ph)*Math.cos(th); cPos[i*3+1]=r*Math.cos(ph); cPos[i*3+2]=r*Math.sin(ph)*Math.sin(th);
      const t2=(cPos[i*3+1]+1.35)/2.7;
      if(t2<0.33){ cColBase[i*3]=0.3+t2*0.4; cColBase[i*3+1]=0.0+t2*0.3; cColBase[i*3+2]=0.7+t2*0.2; }
      else if(t2<0.66){ const f=(t2-0.33)/0.33; cColBase[i*3]=0.42-f*0.3; cColBase[i*3+1]=0.3+f*0.5; cColBase[i*3+2]=0.9; }
      else { const f=(t2-0.66)/0.34; cColBase[i*3]=0.12-f*0.08; cColBase[i*3+1]=0.8+f*0.2; cColBase[i*3+2]=0.9-f*0.3; }
    }
    const cloudGeo=new THREE.BufferGeometry();
    cloudGeo.setAttribute("position",new THREE.BufferAttribute(cPos,3));
    const cColLive=new Float32Array(cColBase);
    cloudGeo.setAttribute("color",new THREE.BufferAttribute(cColLive,3));
    const cloudMesh=new THREE.Points(cloudGeo,new THREE.PointsMaterial({vertexColors:true,size:0.05,sizeAttenuation:true,transparent:true,opacity:0.9,depthWrite:false}));
    cloudMesh.position.set(CX,CY,CZ); scene.add(cloudMesh);
    const icoMesh=new THREE.Mesh(new THREE.IcosahedronGeometry(1.35*0.62,1),new THREE.MeshBasicMaterial({color:0x0055BB,wireframe:true,transparent:true,opacity:0.16}));
    icoMesh.position.set(CX,CY,CZ); scene.add(icoMesh);
    const rmk=(col,em,ei=2.4)=>new THREE.MeshStandardMaterial({color:col,emissive:new THREE.Color(em),emissiveIntensity:ei,roughness:0.15,metalness:0.25,transparent:true,opacity:0.7});
    const OR=1.55;
    const ring1=new THREE.Mesh(new THREE.TorusGeometry(OR,0.013,6,90),rmk(0x00CCFF,0x0088CC));
    ring1.position.set(CX,CY,CZ); ring1.rotation.x=Math.PI/2; scene.add(ring1);
    const ring2=new THREE.Mesh(new THREE.TorusGeometry(OR*0.88,0.010,6,80),rmk(0x00FFCC,0x009988));
    ring2.position.set(CX,CY,CZ); ring2.rotation.set(Math.PI/3,Math.PI/6,0); scene.add(ring2);
    const ring3=new THREE.Mesh(new THREE.TorusGeometry(OR*0.72,0.008,6,72),rmk(0xBB88FF,0x7733CC,2.0));
    ring3.position.set(CX,CY,CZ); ring3.rotation.set(Math.PI/5,Math.PI/2.5,Math.PI/4); scene.add(ring3);
    const orbLight=new THREE.PointLight(0x0077FF,1.8,14); orbLight.position.set(CX,CY,CZ); scene.add(orbLight);
    // Invisible hit sphere for orb raycasting
    const orbHitSphere=new THREE.Mesh(new THREE.SphereGeometry(1.7,8,8),new THREE.MeshBasicMaterial({visible:false}));
    orbHitSphere.position.set(CX,CY,CZ); orbHitSphere.userData={type:"orb"}; scene.add(orbHitSphere); hotspots.push(orbHitSphere);

    // ── GALLERY PANELS ────────────────────────────────────────────────────
    const loader=new THREE.TextureLoader(); loader.crossOrigin="anonymous";
    const PHOTO_W=2.85, PHOTO_H=1.65, VIDEO_W=3.65, VIDEO_H=2.05, GALLERY_Y=2.45;
    const videoEls=[];

    function addPhoto(ph,y,z){
      vPlane(LX+0.05,y,z,PHOTO_W+0.14,PHOTO_H+0.14,bsic(0x14233A,{transparent:true,opacity:0.88}),Math.PI/2);
      const tex=loader.load(cImg(ph.id,840,560)); tex.colorSpace=THREE.SRGBColorSpace;
      const sc=new THREE.Mesh(new THREE.PlaneGeometry(PHOTO_W,PHOTO_H),new THREE.MeshBasicMaterial({map:tex}));
      sc.position.set(LX+0.07,y,z); sc.rotation.y=Math.PI/2; scene.add(sc);
      vPlane(LX+0.08,y+PHOTO_H/2+0.04,z,PHOTO_W,0.035,new THREE.MeshStandardMaterial({color:0x2255FF,emissive:new THREE.Color(0x0033CC),emissiveIntensity:3.5}),Math.PI/2);
      if(!isMobile){ const sl=new THREE.SpotLight(0xFFFFFF,5.0,14,Math.PI/9,0.4); sl.position.set(LX+5,y+1.5,z); sl.target.position.set(LX+0.1,y,z); scene.add(sl); scene.add(sl.target); }
      sc.userData={type:"photo",...ph}; hotspots.push(sc);
    }
    function addVideo(vid,y,z){
      const vGroup=new THREE.Group(); scene.add(vGroup);
      const videoEl=document.createElement("video");
      videoEl.src=cVid(vid.id); videoEl.loop=true; videoEl.muted=true; videoEl.playsInline=true; videoEl.crossOrigin="anonymous";
      if(!isMobile){ videoEl.autoplay=true; videoEl.play().catch(()=>{}); }
      videoEl.addEventListener("error",()=>{ vGroup.visible=false; });
      videoEls.push({el:videoEl,z});
      const vTex=new THREE.VideoTexture(videoEl); vTex.colorSpace=THREE.SRGBColorSpace;
      const bd=new THREE.Mesh(new THREE.PlaneGeometry(VIDEO_W+0.14,VIDEO_H+0.14),bsic(0x0A1820,{transparent:true,opacity:0.88}));
      bd.position.set(RX-0.05,y,z); bd.rotation.y=-Math.PI/2; vGroup.add(bd);
      const sc=new THREE.Mesh(new THREE.PlaneGeometry(VIDEO_W,VIDEO_H),new THREE.MeshBasicMaterial({map:vTex}));
      sc.position.set(RX-0.07,y,z); sc.rotation.y=-Math.PI/2; vGroup.add(sc);
      const gw=new THREE.Mesh(new THREE.PlaneGeometry(VIDEO_W,0.035),new THREE.MeshStandardMaterial({color:0x00CCAA,emissive:new THREE.Color(0x009977),emissiveIntensity:3.5}));
      gw.position.set(RX-0.08,y+VIDEO_H/2+0.04,z); gw.rotation.y=-Math.PI/2; vGroup.add(gw);
      if(!isMobile){ const sl=new THREE.SpotLight(0xFFFFFF,5.0,14,Math.PI/9,0.4); sl.position.set(RX-5,y+1.5,z); sl.target.position.set(RX-0.1,y,z); vGroup.add(sl); scene.add(sl.target); }
      sc.userData={type:"video",...vid}; hotspots.push(sc);
    }
    function layoutOneRow(items,fn,y,s,e){ const step=items.length>1?(e-s)/(items.length-1):0; items.forEach((it,i)=>fn(it,y,s+i*step)); }
    layoutOneRow(PHOTOS,addPhoto,GALLERY_Y,4,36);
    layoutOneRow(VIDEOS,addVideo,GALLERY_Y,4,36);

    // ── COLLISION & ZONE ──────────────────────────────────────────────────
    function constrainPos(x,z){
      const nz=Math.max(-(ED-0.5),Math.min(GD-0.5,z));
      const nx=nz<0.5?Math.max(-(EW/2-0.35),Math.min(EW/2-0.35,x)):Math.max(-(GW/2-0.35),Math.min(GW/2-0.35,x));
      return [nx,nz];
    }
    const getZone=p=>{ if(p.z<0) return "ENTRY HALL"; if(p.x<-2) return "PHOTO GALLERY"; if(p.x>2) return "VIDEO GALLERY"; if(p.z>GD-6) return "SERVICES"; return "MAIN GALLERY"; };

    // ── CONTROLS ──────────────────────────────────────────────────────────
    const keys={}, euler=new THREE.Euler(0,0,0,"YXZ");
    let locked=false;
    const onKeyDown=e=>{
      const ta=document.activeElement?.tagName;
      if(ta==="INPUT"||ta==="TEXTAREA") return; // don't capture keys while form is focused
      keys[e.code]=true;
      // [E] to interact with nearest centerpiece — no need to click in pointer-lock mode
      if(e.code==="KeyE" && nearTargetRef.current){
        handleHotRef.current(nearTargetRef.current);
      }
    };
    const onKeyUp=e=>{ keys[e.code]=false; };
    const onMove=e=>{ if(!locked||isMobile) return; euler.setFromQuaternion(camera.quaternion); euler.y-=e.movementX*.0018; euler.x-=e.movementY*.0018; euler.x=Math.max(-Math.PI*.32,Math.min(Math.PI*.32,euler.x)); camera.quaternion.setFromEuler(euler); };
    const onLock=()=>{ locked=document.pointerLockElement===renderer.domElement; };
    const raycaster=new THREE.Raycaster();

    const handleHit=(hits)=>{ if(hits.length>0) handleHotRef.current(hits[0].object.userData); };

    // Desktop click
    const onClick=()=>{
      if(!locked){ renderer.domElement.requestPointerLock(); return; }
      raycaster.setFromCamera({x:0,y:0},camera);
      handleHit(raycaster.intersectObjects(hotspots,true));
    };

    // Mobile look + tap (item 7/8: use actual touch coords for raycasting)
    let lookTouchId=null,lastLookX=0,lastLookY=0;
    const onTSL=(e)=>{ for(let i=0;i<e.changedTouches.length;i++){ const t=e.changedTouches[i]; if(t.clientX>window.innerWidth*0.45&&lookTouchId===null){ lookTouchId=t.identifier; lastLookX=t.clientX; lastLookY=t.clientY; } } };
    const onTML=(e)=>{ if(!isMobile) return; for(let i=0;i<e.changedTouches.length;i++){ const t=e.changedTouches[i]; if(t.identifier!==lookTouchId) continue; const dx=t.clientX-lastLookX,dy=t.clientY-lastLookY; lastLookX=t.clientX; lastLookY=t.clientY; euler.setFromQuaternion(camera.quaternion); euler.y-=dx*0.003; euler.x-=dy*0.003; euler.x=Math.max(-Math.PI*.32,Math.min(Math.PI*.32,euler.x)); camera.quaternion.setFromEuler(euler); } };
    const onTEL=(e)=>{ for(let i=0;i<e.changedTouches.length;i++) if(e.changedTouches[i].identifier===lookTouchId) lookTouchId=null; };

    let tapSX=0,tapSY=0;
    const onTST=(e)=>{ const t=e.changedTouches[0]; tapSX=t.clientX; tapSY=t.clientY; };
    const onTET=(e)=>{
      const t=e.changedTouches[0];
      if(Math.sqrt((t.clientX-tapSX)**2+(t.clientY-tapSY)**2)<12){
        // Item 7: raycast from actual tap position, not screen center
        const rect=renderer.domElement.getBoundingClientRect();
        const nx=((t.clientX-rect.left)/rect.width)*2-1;
        const ny=-((t.clientY-rect.top)/rect.height)*2+1;
        raycaster.setFromCamera({x:nx,y:ny},camera);
        handleHit(raycaster.intersectObjects(hotspots,true));
      }
    };

    if(!isMobile){
      window.addEventListener("keydown",onKeyDown); window.addEventListener("keyup",onKeyUp);
      document.addEventListener("mousemove",onMove); document.addEventListener("pointerlockchange",onLock);
      renderer.domElement.addEventListener("click",onClick);
    } else {
      renderer.domElement.addEventListener("touchstart",onTSL,{passive:true});
      renderer.domElement.addEventListener("touchmove",onTML,{passive:true});
      renderer.domElement.addEventListener("touchend",onTEL,{passive:true});
      renderer.domElement.addEventListener("touchstart",onTST,{passive:true});
      renderer.domElement.addEventListener("touchend",onTET,{passive:true});
    }

    // ── PHYSICS ───────────────────────────────────────────────────────────
    const BASE_SPEED=0.092, SPRINT_MULT=1.75, GRAVITY=0.018, JUMP_FORCE=0.22;
    let yVel=0, grounded=true;
    const onJumpKey=(e)=>{ if(e.code==="Space"){ const t=document.activeElement?.tagName; if(t==="INPUT"||t==="TEXTAREA") return; if(grounded){ yVel=JUMP_FORCE; grounded=false; e.preventDefault(); } } };
    if(!isMobile) window.addEventListener("keydown",onJumpKey);

    const fwd=new THREE.Vector3(), rgt=new THREE.Vector3(), camVec=new THREE.Vector3();
    const parcelVec=new THREE.Vector3(PX,PY,PZ);
    const flightMidVec=new THREE.Vector3(0,3.7,(FZ_START+FZ_END)/2);
    const orbVec=new THREE.Vector3(CX,CY,CZ);

    let rafId, frameCount=0;

    const tick=(ts)=>{
      rafId=requestAnimationFrame(tick);
      const t=ts*0.0004;
      frameCount++;

      // ── PROXIMITY ───────────────────────────────────────────────────
      camVec.copy(camera.position);
      const dParcel=camVec.distanceTo(parcelVec);
      const dFlight=camVec.distanceTo(flightMidVec);
      const dOrb=camVec.distanceTo(orbVec);
      const proxParcel=Math.max(0,Math.min(1,1-(dParcel-1.5)/5.5));
      const proxFlight=Math.max(0,Math.min(1,1-(dFlight-1.5)/5.5));
      const proxOrb=Math.max(0,Math.min(1,1-(dOrb-1.5)/5.5));

      // Proximity prompt (item 3) — press E to interact, no pointer aim needed
      if(frameCount%20===0){
        let np=""; let nt=null;
        if(proxParcel>0.5)      { np="[E]  Scan Parcel";        nt=bndTube.userData; }
        else if(proxFlight>0.5) { np="[E]  Start Drone Mission"; nt=flightTube.userData; }
        else if(proxOrb>0.5)    { np="[E]  Explore Portfolio";   nt=orbHitSphere.userData; }
        nearTargetRef.current = nt;
        if(np!==lastPromptRef.current){ lastPromptRef.current=np; setPrompt(np); }
      }

      // ── PARCEL ANIMATION ────────────────────────────────────────────
      parcelGroup.position.y=PY+Math.sin(t*0.85)*0.05;
      parcelGroup.rotation.y=t*0.1;
      parcelLight.intensity=1.2+Math.sin(t*1.4)*0.3+proxParcel*2.5;
      bndMat.emissiveIntensity=3.5+proxParcel*3.0;
      cornerPins.forEach((pin,i)=>{ const s=0.75+Math.sin(t*2.8+i*1.2)*0.35*(1+proxParcel*0.5); pin.scale.setScalar(s); });
      scanY+=0.007+proxParcel*0.005;
      if(scanY>1.4) scanY=-1.1;
      scanRing.position.y=scanY;
      const scanFade=Math.max(0,Math.min(1,1-Math.abs(scanY)/1.3));
      scanRingMat.opacity=(0.28+proxParcel*0.22)*scanFade;

      // ── FLIGHT PATH ANIMATION ────────────────────────────────────────
      const flightSpeed=0.0012+proxFlight*0.0018;
      flightU=(flightU+flightSpeed)%1;
      const pp=flightCurve.getPointAt(flightU);
      pulseMesh.position.copy(pp);
      pulseMesh.scale.setScalar(0.6+Math.sin(t*5)*0.2+proxFlight*0.3);
      const nextU=Math.min(1,flightU+0.015);
      const pp2=flightCurve.getPointAt(nextU);
      droneMesh.position.copy(pp);
      droneMesh.lookAt(pp2);
      droneMesh.rotateX(Math.PI/2);
      droneTrail.position.set(pp.x,pp.y-0.12,pp.z);
      flightLight.position.copy(pp);
      flightLight.intensity=0.9+Math.sin(t*4)*0.4+proxFlight*1.8;
      flightTubeMat.emissiveIntensity=2.5+proxFlight*2.0;

      // Mission waypoint rings pulse when active
      if(missionRef.current.active){
        const cwp=missionRef.current.currentWP;
        missionWPMeshes.forEach((r,i)=>{
          if(i===cwp) r.material.emissiveIntensity=3.5+Math.sin(t*8)*1.5;
        });
      }

      // ── ORB ANIMATION ───────────────────────────────────────────────
      const orbSpeedMult=1+proxOrb*0.5;
      cloudMesh.rotation.y=t*0.65*orbSpeedMult;
      cloudMesh.rotation.x=Math.sin(t*0.28)*0.1;
      icoMesh.rotation.y=-t*0.45*orbSpeedMult;
      icoMesh.rotation.z=t*0.18;
      ring1.rotation.z=t*0.38*orbSpeedMult;
      ring2.rotation.y=t*0.55*orbSpeedMult;
      ring3.rotation.x=t*0.22*orbSpeedMult;
      const floatY=Math.sin(t*1.05)*0.07;
      [cloudMesh,icoMesh,ring1,ring2,ring3,orbHitSphere].forEach(o=>{ o.position.y=CY+floatY; });
      orbLight.intensity=1.6+Math.sin(t*1.7)*0.3+proxOrb*2.0;
      ring1.material.emissiveIntensity=2.4+proxOrb*2.5;
      ring2.material.emissiveIntensity=2.4+proxOrb*2.5;
      ring3.material.emissiveIntensity=2.0+proxOrb*2.0;

      if(!isMobile&&frameCount%3===0){
        const hueShift=Math.sin(t*0.4)*0.12, brightBoost=0.8+proxOrb*0.2;
        for(let i=0;i<N_PTS;i++){
          cColLive[i*3  ]=Math.min(1,cColBase[i*3  ]*brightBoost+hueShift*0.15);
          cColLive[i*3+1]=Math.min(1,cColBase[i*3+1]*brightBoost);
          cColLive[i*3+2]=Math.min(1,cColBase[i*3+2]*brightBoost-hueShift*0.08);
        }
        cloudGeo.attributes.color.needsUpdate=true;
      }

      // ── DRONE MISSION DETECTION ──────────────────────────────────────
      if(missionRef.current.active && !missionRef.current.done){
        const cwp=missionRef.current.currentWP;
        if(cwp < MISSION_WP_COUNT){
          const wpPos=missionWPPositions[cwp];
          // XZ detection so player doesn't need to jump to flight-path height
          const dx=camera.position.x-wpPos.x, dz=camera.position.z-wpPos.z;
          const dist2d=Math.sqrt(dx*dx+dz*dz);
          if(dist2d<2.0){
            // Hit!
            missionRef.current.wpOrder.push(cwp);
            missionRef.current.score+=100;
            const hitRing=missionWPMeshes[cwp];
            hitRing.material.color.set(0x00FF88);
            hitRing.material.emissiveIntensity=10;
            setTimeout(()=>{ hitRing.material.opacity=0.08; hitRing.material.emissiveIntensity=0.2; },500);
            missionRef.current.currentWP++;
            if(missionRef.current.currentWP<MISSION_WP_COUNT){
              const next=missionWPMeshes[missionRef.current.currentWP];
              next.material.opacity=0.92;
              next.material.emissiveIntensity=5;
              next.material.color.set(0x00FFCC);
            } else {
              // Mission complete
              missionRef.current.done=true;
              const elapsed=(Date.now()-missionRef.current.startTime)/1000;
              const timeBonus=Math.max(0,Math.floor((90-elapsed)*3));
              missionRef.current.score+=timeBonus;
              const finalScore=missionRef.current.score;
              setLeadCapture({ score:finalScore, time:elapsed, sessionId:sessionIdRef.current, wpOrder:[...missionRef.current.wpOrder], collisions:missionRef.current.collisions });
              setMissionState({ active:false, score:finalScore, wp:MISSION_WP_COUNT, total:MISSION_WP_COUNT, done:true });
            }
          }
        }
        // Sync UI every 15 frames
        if(frameCount%15===0){
          const s=missionRef.current.score, w=missionRef.current.currentWP;
          setMissionState(prev => prev.score!==s||prev.wp!==w ? {...prev,score:s,wp:w} : prev);
        }
      }

      // ── PLAYER MOVEMENT ──────────────────────────────────────────────
      camera.getWorldDirection(fwd); fwd.y=0; fwd.normalize();
      rgt.crossVectors(fwd,new THREE.Vector3(0,1,0)).normalize();
      const vel=new THREE.Vector3();
      if(!isMobile){
        if(keys["KeyW"]||keys["ArrowUp"])    vel.add(fwd);
        if(keys["KeyS"]||keys["ArrowDown"])  vel.sub(fwd);
        if(keys["KeyA"]||keys["ArrowLeft"])  vel.sub(rgt);
        if(keys["KeyD"]||keys["ArrowRight"]) vel.add(rgt);
        if(vel.length()>0) vel.normalize().multiplyScalar((keys["ShiftLeft"]||keys["ShiftRight"])?BASE_SPEED*SPRINT_MULT:BASE_SPEED);
      } else {
        const jx=joystickRef.current.x, jy=joystickRef.current.y;
        if(Math.abs(jx)>0.08||Math.abs(jy)>0.08){
          vel.add(fwd.clone().multiplyScalar(-jy)).add(rgt.clone().multiplyScalar(jx));
          vel.normalize().multiplyScalar(sprintingRef.current?BASE_SPEED*SPRINT_MULT:BASE_SPEED);
        }
        if(jumpTriggerRef.current&&grounded){ yVel=JUMP_FORCE; grounded=false; jumpTriggerRef.current=false; }
      }
      if(vel.length()>0){
        const prevX=camera.position.x, prevZ=camera.position.z;
        const [nx,nz]=constrainPos(camera.position.x+vel.x, camera.position.z+vel.z);
        // Collision penalty for mission
        if(missionRef.current.active&&!missionRef.current.done){
          if(Math.abs(nx-(prevX+vel.x))>0.02||Math.abs(nz-(prevZ+vel.z))>0.02){
            missionRef.current.collisions++;
            missionRef.current.score=Math.max(0,missionRef.current.score-10);
          }
        }
        camera.position.x=nx; camera.position.z=nz;
      }

      // Jump physics
      yVel-=GRAVITY; camera.position.y+=yVel;
      if(camera.position.y<=EYE_HEIGHT){ camera.position.y=EYE_HEIGHT; yVel=0; grounded=true; }

      // Lazy video (mobile)
      if(isMobile&&frameCount%30===0){
        const camZ=camera.position.z;
        videoEls.forEach(({el,z})=>{ const d=Math.abs(z-camZ); if(d<12&&el.paused) el.play().catch(()=>{}); else if(d>=12&&!el.paused) el.pause(); });
      }

      setPos([Math.round(camera.position.x*10)/10, Math.round(camera.position.z*10)/10]);
      setZone(getZone(camera.position));
      renderer.render(scene,camera);
    };
    tick(0);

    const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); };
    window.addEventListener("resize",onResize);

    return()=>{
      cancelAnimationFrame(rafId);
      if(!isMobile){
        window.removeEventListener("keydown",onKeyDown); window.removeEventListener("keyup",onKeyUp);
        window.removeEventListener("keydown",onJumpKey);
        document.removeEventListener("mousemove",onMove); document.removeEventListener("pointerlockchange",onLock);
        renderer.domElement.removeEventListener("click",onClick);
      } else {
        renderer.domElement.removeEventListener("touchstart",onTSL); renderer.domElement.removeEventListener("touchmove",onTML); renderer.domElement.removeEventListener("touchend",onTEL);
        renderer.domElement.removeEventListener("touchstart",onTST); renderer.domElement.removeEventListener("touchend",onTET);
      }
      window.removeEventListener("resize",onResize);
      if(document.pointerLockElement) document.exitPointerLock();
      videoEls.forEach(({el})=>{ el.pause(); el.src=""; });
      renderer.dispose();
      if(el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[started]);

  // Exit pointer lock whenever a modal, orb menu, or lead-capture form opens
  // so the user can click buttons freely. Re-lock happens on next canvas click.
  useEffect(()=>{
    if(modal || orbMenu || leadCapture){
      if(document.pointerLockElement) document.exitPointerLock();
    }
  },[modal, orbMenu, leadCapture]);

  return (
    <div style={{width:"100vw",height:"100vh",overflow:"hidden",background:"#060C18"}}>
      {!started && <Onboarding onStart={()=>setStarted(true)} onEnter={startBgMusic} isMobile={isMobile}/>}
      <div ref={mountRef} style={{width:"100%",height:"100%",display:started?"block":"none"}}/>
      {started && (
        <>
          {!isMobile && <Minimap px={pos[0]} pz={pos[1]}/>}
          <HUD zone={zone} showHelp={showHelp} setShowHelp={setShowHelp} isMobile={isMobile}/>
          <AudioControls audioRef={audioRef}/>
          <ProximityPrompt text={prompt}/>
          <MissionHUD state={missionState} onExit={exitMission}/>
          <PanelModal item={modal} onClose={()=>setModal(null)}/>
          <OrbMenu open={orbMenu} onClose={()=>setOrbMenu(false)} onSelect={item=>setModal(item)}/>
          {leadCapture && <LeadCapture data={leadCapture} onClose={()=>{ setLeadCapture(null); exitMission(); }}/>}
          {isMobile ? (
            <MobileControls
              joystickRef={joystickRef}
              sprintingRef={sprintingRef}
              jumpRef={jumpTriggerRef}
              missionActive={missionState.active}
              onStartMission={()=>handleHotRef.current({type:"drone-mission"})}
            />
          ) : (
            <div style={{position:"fixed",bottom:44,left:"50%",transform:"translateX(-50%)",
              fontFamily:"monospace",fontSize:10,letterSpacing:"0.2em",
              color:"rgba(0,170,255,0.3)",textTransform:"uppercase",pointerEvents:"none",zIndex:200}}>
              Click canvas &middot; WASD move &middot; Shift sprint &middot; Space jump &middot; [E] interact &middot; ESC release
            </div>
          )}
        </>
      )}
    </div>
  );
}
