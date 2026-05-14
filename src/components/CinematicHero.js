// CinematicHero.js — LiDAR Point Cloud Edition
// Seraphic Sight · src/components/CinematicHero.js
//
// Scroll-driven Three.js LiDAR point cloud hero.
// Mobile-optimized: fewer points, 30fps cap, touch parallax, pixelRatio capped at 1.5.

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STYLES = `
  .ch-overlay-text { pointer-events: none; position: absolute; opacity: 0; }
  .ch-progress {
    position: absolute; top: 0; left: 0; height: 2px; width: 0%;
    background: linear-gradient(90deg, #0077FF, #00BFA6);
    box-shadow: 0 0 8px rgba(0,191,166,0.55);
    z-index: 20; pointer-events: none; transition: width 0.05s linear;
  }
`;

function makeRng(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

function terrainH(x, z) {
  return (
    Math.sin(x * 0.18) * 3.5 +
    Math.sin(z * 0.22) * 3.0 +
    Math.sin(x * 0.55 + z * 0.40) * 1.4 +
    Math.sin(x * 0.12 + z * 0.15) * 5.0 +
    Math.cos(x * 0.38 + z * 0.32) * 2.0
  );
}

function elevColor(t) {
  const tc = Math.max(0, Math.min(1, t));
  let r, g, b;
  if (tc < 0.20) {
    const p = tc / 0.20;
    r = 0;           g = p * 0.20;        b = 0.30 + p * 0.50;
  } else if (tc < 0.45) {
    const p = (tc - 0.20) / 0.25;
    r = 0;           g = 0.20 + p * 0.27; b = 0.80 - p * 0.10;
  } else if (tc < 0.72) {
    const p = (tc - 0.45) / 0.27;
    r = p * 0.18;    g = 0.47 + p * 0.45; b = 0.70 - p * 0.38;
  } else {
    const p = (tc - 0.72) / 0.28;
    r = 0.18 + p * 0.82; g = 0.92 + p * 0.08; b = 0.32 + p * 0.68;
  }
  return [r, g, b];
}

export default function CinematicHero() {
  const containerRef = useRef(null);
  const canvasRef    = useRef(null);
  const progressRef  = useRef(null);
  const textOpenRef  = useRef(null);
  const textMidRef   = useRef(null);
  const textEndRef   = useRef(null);
  const chapterRef   = useRef(null);
  const hintRef      = useRef(null);
  const hudAltRef    = useRef(null);

  useEffect(() => {
    const mobile = window.innerWidth < 768 || navigator.maxTouchPoints > 1;

    const styleEl = document.createElement("style");
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);

    // ── Renderer ───────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: !mobile,
      powerPreference: mobile ? "default" : "high-performance",
    });
    renderer.setPixelRatio(mobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // ── Scene ──────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050810);
    scene.fog = new THREE.FogExp2(0x050810, mobile ? 0.022 : 0.016);

    // ── Camera ─────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 300);
    camera.position.set(0, 28, 48);
    camera.lookAt(0, 0, 0);

    // ── Build point cloud ──────────────────────────────────────────
    const rng       = makeRng(42);
    const positions = [];
    const colors    = [];
    const MIN_Y = -8, MAX_Y = 15, YRANGE = MAX_Y - MIN_Y;
    const SPREAD    = 90;
    const N_TERRAIN = mobile ? 42000 : 135000;

    for (let i = 0; i < N_TERRAIN; i++) {
      const x = (rng() - 0.5) * SPREAD;
      const z = (rng() - 0.5) * SPREAD;
      const y = terrainH(x, z) + (rng() - 0.5) * 0.22;
      positions.push(x, y, z);
      const [r, g, b] = elevColor((y - MIN_Y) / YRANGE);
      colors.push(r, g, b);
    }

    const structs = [
      { x: -18, z: -12, w: 7,  d: 7,  h: 9  },
      { x:  12, z:  -6, w: 9,  d: 8,  h: 12 },
      { x:  -6, z:  16, w: 5,  d: 5,  h: 7  },
      { x:  22, z:   8, w: 8,  d: 10, h: 14 },
      { x: -24, z:   4, w: 6,  d: 6,  h: 8  },
      { x:   4, z: -22, w: 7,  d: 7,  h: 10 },
      { x:  -2, z:   3, w: 12, d: 10, h: 5  },
    ];
    const N_STRUCT = mobile ? 5000 : 22000;
    const perS     = Math.floor(N_STRUCT / structs.length);
    structs.forEach(s => {
      const base = terrainH(s.x, s.z);
      for (let i = 0; i < perS; i++) {
        const x = s.x + (rng() - 0.5) * s.w;
        const z = s.z + (rng() - 0.5) * s.d;
        const y = base + rng() * s.h;
        positions.push(x, y, z);
        const [r, g, b] = elevColor(Math.min(1, (y - MIN_Y) / YRANGE + 0.12));
        colors.push(r * 1.08, g * 1.08, b * 1.08);
      }
    });

    // ── Shader — points ALWAYS visible; scan beam adds glow ────────
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uScanY:   { value: 16.0 },   // starts above terrain → full cloud visible
        uScanW:   { value: 3.2  },
        uScanStr: { value: 0.8  },   // glow visible from the start
        uDpr:     { value: renderer.getPixelRatio() },
      },
      vertexShader: `
        attribute vec3 color;
        uniform float uScanY;
        uniform float uScanW;
        uniform float uScanStr;
        uniform float uDpr;
        varying vec3  vColor;
        varying float vGlow;
        void main() {
          vColor = color;
          float ds = abs(position.y - uScanY);
          vGlow    = max(0.0, 1.0 - ds / uScanW) * uScanStr;
          vec4 mv  = modelViewMatrix * vec4(position, 1.0);
          float d  = max(1.0, -mv.z);
          gl_PointSize = clamp((2.2 + vGlow * 5.0) * (30.0 / d) * uDpr, 1.0, 8.0);
          gl_Position  = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying vec3  vColor;
        varying float vGlow;
        void main() {
          vec2  uv = gl_PointCoord - 0.5;
          float r  = length(uv);
          if (r > 0.5) discard;
          float soft = 1.0 - smoothstep(0.28, 0.5, r);
          vec3  col  = vColor + vGlow * vec3(0.25, 1.0, 0.82);
          // base alpha 0.82 so cloud is always visible
          gl_FragColor = vec4(col, soft * 0.82);
        }
      `,
      transparent: true,
      depthWrite:  false,
      vertexColors: true,
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("color",    new THREE.Float32BufferAttribute(colors,    3));
    const cloud = new THREE.Points(geo, mat);
    scene.add(cloud);

    // ── Scan beam plane ────────────────────────────────────────────
    const scanPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 0.5),
      new THREE.MeshBasicMaterial({ color: 0x00FFCC, transparent: true, opacity: 0.14, side: THREE.DoubleSide })
    );
    scanPlane.rotation.x = Math.PI / 2;
    scanPlane.position.y = 16;
    scene.add(scanPlane);

    // ── Animation state ────────────────────────────────────────────
    const state = {
      camY: 28, camZ: 48,
      scanY: 16, scanStr: 0.8,
      cloudRotY: 0,
    };

    // ── GSAP scroll timeline ───────────────────────────────────────
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start:   "top top",
        end:     "bottom bottom",
        scrub:   1.4,
        onUpdate(self) {
          if (progressRef.current)
            progressRef.current.style.width = (self.progress * 100).toFixed(1) + "%";
          if (chapterRef.current) {
            const p = self.progress;
            if      (p < 0.02) chapterRef.current.style.opacity = 0;
            else if (p < 0.38) { chapterRef.current.textContent = "I — Scanning";     chapterRef.current.style.opacity = 1; }
            else if (p < 0.68) { chapterRef.current.textContent = "II — Mapping";     chapterRef.current.style.opacity = 1; }
            else               { chapterRef.current.textContent = "III — Delivering"; chapterRef.current.style.opacity = 1; }
          }
          if (hudAltRef.current) {
            const alt = Math.round(350 - self.progress * 320);
            hudAltRef.current.textContent = `ALT ${alt}ft AGL`;
          }
        },
      },
    });

    // Scene 1 (0–34): Scan sweeps down through terrain, camera descends
    tl.to(state, { scanY: -6, scanStr: 1.4, camY: 22, camZ: 42, duration: 34, ease: "power2.inOut" }, 0);
    tl.to(textOpenRef.current, { opacity: 1, duration: 6 }, 5);
    tl.to(textOpenRef.current, { opacity: 0, duration: 5 }, 24);
    tl.to(hintRef.current,     { opacity: 0, duration: 4 }, 5);

    // Scene 2 (34–68): Camera descends closer, scan fades out
    tl.to(state, { scanY: -20, scanStr: 0.2, camY: 11, camZ: 27, cloudRotY: 0.38, duration: 34, ease: "power2.inOut" }, 34);
    tl.to(textMidRef.current,  { opacity: 1, duration: 6 }, 39);
    tl.to(textMidRef.current,  { opacity: 0, duration: 5 }, 57);

    // Scene 3 (68–100): Low flythrough, cloud rotates
    tl.to(state, { scanStr: 0, camY: 5, camZ: 15, cloudRotY: 0.75, duration: 32, ease: "power3.in" }, 68);
    tl.to(textEndRef.current,  { opacity: 1, duration: 6 }, 73);
    tl.to(textEndRef.current,  { opacity: 0, duration: 5 }, 91);

    // ── Mouse / touch parallax ─────────────────────────────────────
    let mx = 0, my = 0, offX = 0, offY = 0;
    const onMouse = e => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onTouch = e => {
      if (e.touches[0]) {
        mx = (e.touches[0].clientX / window.innerWidth  - 0.5) * 2;
        my = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
      }
    };
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("touchmove", onTouch, { passive: true });

    // ── Render loop ────────────────────────────────────────────────
    let rafId, lastTs = 0;
    const FRAME_MS = mobile ? 1000 / 30 : 1000 / 60;

    const tick = ts => {
      rafId = requestAnimationFrame(tick);
      if (ts - lastTs < FRAME_MS) return;
      lastTs = ts;

      offX += (mx * 3.5 - offX) * 0.04;
      offY += (-my * 2.0 - offY) * 0.04;
      camera.position.set(
        Math.sin(state.cloudRotY * 0.5) * state.camZ * 0.22 + offX,
        state.camY + offY,
        state.camZ
      );
      camera.lookAt(0, 0, 0);

      mat.uniforms.uScanY.value   = state.scanY;
      mat.uniforms.uScanStr.value = state.scanStr;

      scanPlane.position.y       = state.scanY;
      scanPlane.material.opacity = state.scanStr * 0.16;

      cloud.rotation.y = state.cloudRotY * 0.14 + (lastTs / 1000) * 0.007;

      renderer.render(scene, camera);
    };
    tick(0);

    // ── Resize ─────────────────────────────────────────────────────
    const onResize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={containerRef} style={{ height: "350vh", position: "relative" }}>
      <div style={{
        position: "sticky", top: 0,
        width: "100%", height: "100vh", overflow: "hidden",
      }}>
        <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
        <div ref={progressRef} className="ch-progress" />

        {/* Lens vignette */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 85% 75% at 50% 50%, transparent 35%, rgba(5,8,16,0.65) 100%)",
        }} />

        {/* HUD — top-left */}
        <div style={{
          position: "absolute", top: "1.6rem", left: "2rem",
          fontFamily: "monospace", fontSize: "clamp(0.5rem, 0.9vw, 0.65rem)",
          color: "rgba(0,191,166,0.6)", zIndex: 15, pointerEvents: "none", lineHeight: 2,
        }}>
          <div ref={chapterRef} style={{ letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "0.2rem", opacity: 0, transition: "opacity 0.4s" }} />
          <div>LIDAR · 905nm · 1cm/pt</div>
          <div ref={hudAltRef}>ALT 350ft AGL</div>
        </div>

        {/* HUD — bottom-right */}
        <div style={{
          position: "absolute", bottom: "2rem", right: "2rem",
          fontFamily: "monospace", fontSize: "clamp(0.5rem, 0.85vw, 0.62rem)",
          color: "rgba(0,191,166,0.45)", zIndex: 10, pointerEvents: "none",
          textAlign: "right", lineHeight: 1.9,
        }}>
          <div>SERAPHIC SIGHT</div>
          <div>FAA 107 · INSURED</div>
          <div>SoCal · <span style={{ color: "rgba(0,119,255,0.7)" }}>ACTIVE</span></div>
        </div>

        {/* Scene 1 */}
        <div ref={textOpenRef} className="ch-overlay-text"
          style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
          <p style={{
            fontSize: "clamp(0.58rem, 1.15vw, 0.8rem)", letterSpacing: "0.42em",
            textTransform: "uppercase", color: "#00BFA6", marginBottom: "1rem", fontWeight: 600,
          }}>FAA Part 107 · Southern California</p>
          <h1 style={{
            fontSize: "clamp(2.2rem, 6.5vw, 5rem)", fontWeight: 800,
            letterSpacing: "-0.025em", color: "#fff", lineHeight: 1.06,
            textShadow: "0 0 50px rgba(0,119,255,0.45), 0 0 100px rgba(0,119,255,0.2)",
          }}>Seraphic Sight</h1>
          <p style={{
            marginTop: "1rem", fontSize: "clamp(0.72rem, 1.4vw, 0.95rem)",
            letterSpacing: "0.22em", color: "rgba(0,191,166,0.75)", textTransform: "uppercase",
          }}>Aerial Imaging &amp; Site Documentation</p>
        </div>

        {/* Scene 2 */}
        <div ref={textMidRef} className="ch-overlay-text"
          style={{ bottom: "18%", left: "8%", maxWidth: "min(400px, 46vw)" }}>
          <h2 style={{
            fontSize: "clamp(1.3rem, 3.2vw, 2.4rem)", fontWeight: 700,
            letterSpacing: "-0.03em", lineHeight: 1.2, color: "#fff",
          }}>Sell listings<br />
            <span style={{ background: "linear-gradient(90deg,#0077FF,#00BFA6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>faster.</span>
          </h2>
          <p style={{ fontSize: "clamp(0.76rem,1.2vw,0.88rem)", color: "#8888A0", marginTop: "0.7rem", lineHeight: 1.7 }}>
            MLS-ready aerial photography &amp; drone video — delivered in 3–4 days.
          </p>
        </div>

        {/* Scene 3 */}
        <div ref={textEndRef} className="ch-overlay-text"
          style={{ top: "22%", right: "8%", maxWidth: "min(360px, 42vw)", textAlign: "right" }}>
          <h2 style={{
            fontSize: "clamp(1.1rem, 2.8vw, 2.1rem)", fontWeight: 700,
            letterSpacing: "-0.02em", lineHeight: 1.3, color: "#fff",
          }}>Document every<br />
            <span style={{ background: "linear-gradient(90deg,#00BFA6,#0077FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>phase.</span>
          </h2>
          <p style={{ fontSize: "clamp(0.7rem,1.1vw,0.86rem)", color: "#8888A0", marginTop: "0.7rem", lineHeight: 1.7 }}>
            DroneDeploy workflows &amp; audit-ready progress docs.
          </p>
        </div>

        {/* Scroll hint */}
        <div ref={hintRef} style={{
          position: "absolute", bottom: "2.2rem", left: "50%",
          transform: "translateX(-50%)", textAlign: "center",
          color: "rgba(255,255,255,0.38)", fontSize: "0.58rem", letterSpacing: "0.3em",
          textTransform: "uppercase", zIndex: 15,
        }}>
          Scroll to explore
          <span style={{
            display: "block", width: 1, height: 34,
            background: "linear-gradient(to bottom, transparent, rgba(0,191,166,0.5))",
            margin: "6px auto 0",
          }} />
        </div>
      </div>
    </div>
  );
}
