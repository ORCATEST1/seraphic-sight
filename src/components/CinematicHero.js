// CinematicHero.js — LiDAR Point Cloud v3
// Uses PointsMaterial (reliable across all Three.js versions).
// Reveal effect via setDrawRange — no shader alpha tricks.

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STYLES = `
  .ch-text { pointer-events:none; position:absolute; opacity:0; }
  .ch-bar  {
    position:absolute; top:0; left:0; height:2px; width:0%;
    background:linear-gradient(90deg,#0077FF,#00BFA6);
    box-shadow:0 0 8px rgba(0,191,166,.55);
    z-index:20; pointer-events:none;
  }
`;

function rng(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}
function terrainH(x, z) {
  return Math.sin(x*.18)*3.5 + Math.sin(z*.22)*3 + Math.sin(x*.55+z*.40)*1.4
       + Math.sin(x*.12+z*.15)*5 + Math.cos(x*.38+z*.32)*2;
}
function elevColor(t) {
  const tc = Math.max(0, Math.min(1, t));
  if (tc < .20) { const p=tc/.20; return [0, p*.20, .30+p*.50]; }
  if (tc < .45) { const p=(tc-.20)/.25; return [0, .20+p*.27, .80-p*.10]; }
  if (tc < .72) { const p=(tc-.45)/.27; return [p*.18, .47+p*.45, .70-p*.38]; }
  const p=(tc-.72)/.28; return [.18+p*.82, .92+p*.08, .32+p*.68];
}

export default function CinematicHero() {
  const containerRef = useRef(null);
  const canvasRef    = useRef(null);
  const barRef       = useRef(null);
  const t1Ref = useRef(null), t2Ref = useRef(null), t3Ref = useRef(null);
  const chRef = useRef(null), hintRef = useRef(null), altRef = useRef(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    const styleEl = document.createElement("style");
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);

    // ── Renderer ──────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current, antialias: !isMobile,
      powerPreference: isMobile ? "default" : "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // ── Scene / Camera ────────────────────────────────────────────
    const scene  = new THREE.Scene();
    scene.background = new THREE.Color(0x050810);
    scene.fog = new THREE.FogExp2(0x050810, isMobile ? 0.022 : 0.016);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 300);
    camera.position.set(0, 28, 48);
    camera.lookAt(0, 0, 0);

    // ── Build point cloud (sorted by Y for reveal) ─────────────────
    const rand   = rng(42);
    const SPREAD = 90;
    const N      = isMobile ? 45000 : 140000;
    const MIN_Y  = -8, MAX_Y = 15, YRANGE = MAX_Y - MIN_Y;

    const pts = [];
    for (let i = 0; i < N; i++) {
      const x = (rand() - .5) * SPREAD;
      const z = (rand() - .5) * SPREAD;
      const y = terrainH(x, z) + (rand() - .5) * .22;
      const [r,g,b] = elevColor((y - MIN_Y) / YRANGE);
      pts.push({ x, y, z, r, g, b });
    }

    // Buildings
    const structs = [
      {x:-18,z:-12,w:7,d:7,h:9},{x:12,z:-6,w:9,d:8,h:12},
      {x:-6,z:16,w:5,d:5,h:7},{x:22,z:8,w:8,d:10,h:14},
      {x:-24,z:4,w:6,d:6,h:8},{x:4,z:-22,w:7,d:7,h:10},
      {x:-2,z:3,w:12,d:10,h:5},
    ];
    const NS = isMobile ? 5000 : 22000;
    structs.forEach(s => {
      const base = terrainH(s.x, s.z);
      const perS = Math.floor(NS / structs.length);
      for (let i = 0; i < perS; i++) {
        const x = s.x + (rand()-.5)*s.w;
        const z = s.z + (rand()-.5)*s.d;
        const y = base + rand()*s.h;
        const [r,g,b] = elevColor(Math.min(1,(y-MIN_Y)/YRANGE+.12));
        pts.push({ x, y, z, r:r*1.08, g:g*1.08, b:b*1.08 });
      }
    });

    // Sort by Y ascending so setDrawRange reveals bottom-to-top
    pts.sort((a, b) => a.y - b.y);

    const TOTAL = pts.length;
    const pos   = new Float32Array(TOTAL * 3);
    const col   = new Float32Array(TOTAL * 3);
    pts.forEach((p, i) => {
      pos[i*3]=p.x; pos[i*3+1]=p.y; pos[i*3+2]=p.z;
      col[i*3]=p.r; col[i*3+1]=p.g; col[i*3+2]=p.b;
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color",    new THREE.BufferAttribute(col, 3));
    // Start with all points visible (no reveal needed — cloud shows immediately)
    geo.setDrawRange(0, TOTAL);

    // PointsMaterial — always works, no shader magic needed
    const mat = new THREE.PointsMaterial({
      vertexColors: true,
      size: isMobile ? 0.18 : 0.14,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
    });

    const cloud = new THREE.Points(geo, mat);
    scene.add(cloud);

    // ── Scan beam (glowing horizontal plane) ──────────────────────
    const scanMat = new THREE.MeshBasicMaterial({
      color: 0x00FFCC, transparent: true, opacity: 0.18, side: THREE.DoubleSide,
    });
    const scanPlane = new THREE.Mesh(new THREE.PlaneGeometry(200, 0.6), scanMat);
    scanPlane.rotation.x = Math.PI / 2;
    scanPlane.position.y = 18;
    scene.add(scanPlane);

    // Scan glow line (thin bright line at scan height)
    const scanLineMat = new THREE.LineBasicMaterial({ color: 0x00FFCC, transparent: true, opacity: 0.5 });
    const scanLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-50, 0, 0), new THREE.Vector3(50, 0, 0),
    ]);
    const scanLine = new THREE.Line(scanLineGeo, scanLineMat);
    scanLine.position.y = 18;
    scene.add(scanLine);

    // ── Animation state ───────────────────────────────────────────
    const state = {
      camY: 28, camZ: 48,
      scanY: 16,          // scan beam starts high
      scanOpacity: 0.18,
      cloudRotY: 0,
      visible: TOTAL,     // all points visible from start
    };

    // ── GSAP scroll timeline ──────────────────────────────────────
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top", end: "bottom bottom",
        scrub: 1.4,
        onUpdate(self) {
          if (barRef.current)
            barRef.current.style.width = (self.progress * 100).toFixed(1) + "%";
          if (chRef.current) {
            const p = self.progress;
            if      (p < .02) chRef.current.style.opacity = "0";
            else if (p < .38) { chRef.current.textContent = "I — Scanning";     chRef.current.style.opacity = "1"; }
            else if (p < .68) { chRef.current.textContent = "II — Mapping";     chRef.current.style.opacity = "1"; }
            else              { chRef.current.textContent = "III — Delivering"; chRef.current.style.opacity = "1"; }
          }
          if (altRef.current) {
            altRef.current.textContent = `ALT ${Math.round(350 - self.progress * 320)}ft AGL`;
          }
        },
      },
    });

    // Scene 1: scan sweeps down through terrain, camera descends
    tl.to(state, { scanY: -10, scanOpacity: 0.28, camY: 22, camZ: 42, duration: 34, ease: "power2.inOut" }, 0);
    tl.to(t1Ref.current, { opacity: 1, duration: 6 }, 5);
    tl.to(t1Ref.current, { opacity: 0, duration: 5 }, 24);
    tl.to(hintRef.current, { opacity: 0, duration: 4 }, 5);

    // Scene 2: camera descends, scan fades
    tl.to(state, { scanY: -22, scanOpacity: 0.06, camY: 11, camZ: 27, cloudRotY: 0.38, duration: 34, ease: "power2.inOut" }, 34);
    tl.to(t2Ref.current, { opacity: 1, duration: 6 }, 39);
    tl.to(t2Ref.current, { opacity: 0, duration: 5 }, 57);

    // Scene 3: low flythrough
    tl.to(state, { scanOpacity: 0, camY: 5, camZ: 15, cloudRotY: 0.75, duration: 32, ease: "power3.in" }, 68);
    tl.to(t3Ref.current, { opacity: 1, duration: 6 }, 73);
    tl.to(t3Ref.current, { opacity: 0, duration: 5 }, 91);

    // ── Input parallax ────────────────────────────────────────────
    let mx = 0, my = 0, offX = 0, offY = 0;
    const onMouse = e => { mx=(e.clientX/window.innerWidth-.5)*2; my=(e.clientY/window.innerHeight-.5)*2; };
    const onTouch = e => {
      if (e.touches[0]) { mx=(e.touches[0].clientX/window.innerWidth-.5)*2; my=(e.touches[0].clientY/window.innerHeight-.5)*2; }
    };
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("touchmove", onTouch, { passive: true });

    // ── Render loop ───────────────────────────────────────────────
    let rafId;

    const tick = ts => {
      rafId = requestAnimationFrame(tick);

      offX += (mx * 3.5 - offX) * .04;
      offY += (-my * 2.0 - offY) * .04;

      camera.position.set(
        Math.sin(state.cloudRotY * .5) * state.camZ * .22 + offX,
        state.camY + offY,
        state.camZ
      );
      camera.lookAt(0, 0, 0);

      scanPlane.position.y = state.scanY;
      scanLine.position.y  = state.scanY;
      scanMat.opacity = state.scanOpacity;
      scanLineMat.opacity = Math.min(1, state.scanOpacity * 2.5);

      // Slow ambient rotation
      cloud.rotation.y = state.cloudRotY * .14 + ts * .000007;

      renderer.render(scene, camera);
    };
    tick(0);

    // ── Resize ────────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("resize", onResize);
      tl.scrollTrigger?.kill();
      tl.kill();
      renderer.dispose();
      document.head.removeChild(styleEl);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ height:"350vh", position:"relative" }}>
      <div style={{ position:"sticky", top:0, width:"100%", height:"100vh", overflow:"hidden" }}>
        <canvas ref={canvasRef} style={{ display:"block", width:"100%", height:"100%" }} />
        <div ref={barRef} className="ch-bar" />

        {/* Vignette */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none",
          background:"radial-gradient(ellipse 85% 75% at 50% 50%, transparent 35%, rgba(5,8,16,.65) 100%)" }} />

        {/* HUD top-left */}
        <div style={{ position:"absolute", top:"1.6rem", left:"2rem",
          fontFamily:"monospace", fontSize:"clamp(.5rem,.9vw,.65rem)",
          color:"rgba(0,191,166,.6)", zIndex:15, pointerEvents:"none", lineHeight:2 }}>
          <div ref={chRef} style={{ letterSpacing:".3em", textTransform:"uppercase",
            marginBottom:".2rem", opacity:0, transition:"opacity .4s" }} />
          <div>LIDAR · 905nm · 1cm/pt</div>
          <div ref={altRef}>ALT 350ft AGL</div>
        </div>

        {/* HUD bottom-right */}
        <div style={{ position:"absolute", bottom:"2rem", right:"2rem",
          fontFamily:"monospace", fontSize:"clamp(.5rem,.85vw,.62rem)",
          color:"rgba(0,191,166,.45)", zIndex:10, pointerEvents:"none",
          textAlign:"right", lineHeight:1.9 }}>
          <div>SERAPHIC SIGHT</div>
          <div>FAA 107 · INSURED</div>
          <div>SoCal · <span style={{ color:"rgba(0,119,255,.7)" }}>ACTIVE</span></div>
        </div>

        {/* Scene 1 */}
        <div ref={t1Ref} className="ch-text"
          style={{ top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center" }}>
          <p style={{ fontSize:"clamp(.58rem,1.15vw,.8rem)", letterSpacing:".42em",
            textTransform:"uppercase", color:"#00BFA6", marginBottom:"1rem", fontWeight:600 }}>
            FAA Part 107 · Southern California
          </p>
          <h1 style={{ fontSize:"clamp(2.2rem,6.5vw,5rem)", fontWeight:800,
            letterSpacing:"-.025em", color:"#fff", lineHeight:1.06,
            textShadow:"0 0 50px rgba(0,119,255,.45),0 0 100px rgba(0,119,255,.2)" }}>
            Seraphic Sight
          </h1>
          <p style={{ marginTop:"1rem", fontSize:"clamp(.72rem,1.4vw,.95rem)",
            letterSpacing:".22em", color:"rgba(0,191,166,.75)", textTransform:"uppercase" }}>
            Aerial Imaging &amp; Site Documentation
          </p>
        </div>

        {/* Scene 2 */}
        <div ref={t2Ref} className="ch-text"
          style={{ bottom:"18%", left:"8%", maxWidth:"min(400px,46vw)" }}>
          <h2 style={{ fontSize:"clamp(1.3rem,3.2vw,2.4rem)", fontWeight:700,
            letterSpacing:"-.03em", lineHeight:1.2, color:"#fff" }}>
            Sell listings<br />
            <span style={{ background:"linear-gradient(90deg,#0077FF,#00BFA6)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>faster.</span>
          </h2>
          <p style={{ fontSize:"clamp(.76rem,1.2vw,.88rem)", color:"#8888A0", marginTop:".7rem", lineHeight:1.7 }}>
            MLS-ready aerial photography &amp; drone video — delivered in 3–4 days.
          </p>
        </div>

        {/* Scene 3 */}
        <div ref={t3Ref} className="ch-text"
          style={{ top:"22%", right:"8%", maxWidth:"min(360px,42vw)", textAlign:"right" }}>
          <h2 style={{ fontSize:"clamp(1.1rem,2.8vw,2.1rem)", fontWeight:700,
            letterSpacing:"-.02em", lineHeight:1.3, color:"#fff" }}>
            Document every<br />
            <span style={{ background:"linear-gradient(90deg,#00BFA6,#0077FF)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>phase.</span>
          </h2>
          <p style={{ fontSize:"clamp(.7rem,1.1vw,.86rem)", color:"#8888A0", marginTop:".7rem", lineHeight:1.7 }}>
            DroneDeploy workflows &amp; audit-ready progress docs.
          </p>
        </div>

        {/* Scroll hint */}
        <div ref={hintRef} style={{ position:"absolute", bottom:"2.2rem", left:"50%",
          transform:"translateX(-50%)", textAlign:"center",
          color:"rgba(255,255,255,.38)", fontSize:".58rem", letterSpacing:".3em",
          textTransform:"uppercase", zIndex:15 }}>
          Scroll to explore
          <span style={{ display:"block", width:1, height:34, margin:"6px auto 0",
            background:"linear-gradient(to bottom,transparent,rgba(0,191,166,.5))" }} />
        </div>
      </div>
    </div>
  );
}
