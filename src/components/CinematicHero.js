// ═══════════════════════════════════════════════════════════════════
//  CinematicHero.js  —  Seraphic Sight
//
//  Scroll-driven Three.js entrance for the home page.
//  Drop this file into:  src/components/CinematicHero.js
//
//  Dependencies (already installed):  gsap, gsap/ScrollTrigger
//  New dependency to install:          three
//    → run in your project root:  npm install three
//
//  How it works:
//   • A tall scroll container (350vh) creates scroll distance
//   • An inner div (position: sticky, height: 100vh) keeps the
//     canvas pinned while the user scrolls through the cinematic
//   • GSAP ScrollTrigger maps scroll progress → a plain state object
//   • Three.js render loop reads state every frame (60fps)
//   • Mouse position adds subtle camera parallax on top
//
//  Brand colours used (matches your existing palette):
//    #0077FF  —  primary blue
//    #00BFA6  —  teal accent
//    #0a0a12  —  background (same as index.css body)
// ═══════════════════════════════════════════════════════════════════

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── Shared CSS injected once ────────────────────────────────────────
const STYLES = `
  @keyframes ch-bounce {
    0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.45; }
    50%       { transform: translateX(-50%) translateY(6px); opacity: 0.85; }
  }
  .ch-overlay-text { pointer-events: none; position: absolute; opacity: 0; }
  .ch-progress {
    position: absolute; top: 0; left: 0; height: 2px; width: 0%;
    background: linear-gradient(90deg, #0077FF, #00BFA6, #0077FF);
    box-shadow: 0 0 10px #0077FF88;
    z-index: 20; pointer-events: none;
  }
`;

export default function CinematicHero() {
  const containerRef = useRef(null);
  const stickyRef    = useRef(null);
  const canvasRef    = useRef(null);
  const progressRef  = useRef(null);
  const textOpenRef  = useRef(null);
  const textMidRef   = useRef(null);
  const textEndRef   = useRef(null);
  const chapterRef   = useRef(null);
  const hintRef      = useRef(null);

  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);

    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a12);
    scene.fog = new THREE.FogExp2(0x0a0a12, 0.016);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 400);
    camera.position.set(0, 2, 90);

    const ambient = new THREE.AmbientLight(0x060a1a, 2.5);
    scene.add(ambient);
    const primaryLight = new THREE.PointLight(0x0077ff, 0, 120);
    primaryLight.position.set(0, 0, 15);
    scene.add(primaryLight);
    const rimLight = new THREE.PointLight(0x00bfa6, 1.4, 180);
    rimLight.position.set(-40, 30, 0);
    scene.add(rimLight);
    const fillLight = new THREE.PointLight(0x001833, 0.6, 100);
    fillLight.position.set(0, -30, 20);
    scene.add(fillLight);

    const starGeo = new THREE.BufferGeometry();
    const STAR_COUNT = 2200;
    const starPos = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      starPos[i * 3]     = (Math.random() - 0.5) * 400;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 400;
      starPos[i * 3 + 2] = -100 + Math.random() * -200;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, transparent: true, opacity: 0.5 }));
    scene.add(stars);

    function makeLayer(count, zMin, zMax, size, color, opacity) {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        pos[i * 3]     = (Math.random() - 0.5) * 110;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 110;
        pos[i * 3 + 2] = zMin + Math.random() * (zMax - zMin);
      }
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      return new THREE.Points(geo, new THREE.PointsMaterial({
        color, size, transparent: true, opacity,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
    }
    const layerFar  = makeLayer(900, -80, -25, 0.12, 0x0055cc, 0.30);
    const layerMid  = makeLayer(600, -25,  5,  0.22, 0x00bfa6, 0.45);
    const layerNear = makeLayer(250,   5, 40,  0.40, 0xffffff, 0.75);
    scene.add(layerFar, layerMid, layerNear);

    const orbGeo = new THREE.SphereGeometry(5, 64, 64);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0x0088ff, emissive: 0x0044cc, emissiveIntensity: 0.7,
      metalness: 0.6, roughness: 0.3, transparent: true, opacity: 0,
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.set(0, 0, 10);
    scene.add(orb);

    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x80d4ff, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const core = new THREE.Mesh(new THREE.SphereGeometry(3, 32, 32), coreMat);
    orb.add(core);

    function makeRing(radius, tube, color, emissive) {
      return new THREE.Mesh(
        new THREE.TorusGeometry(radius, tube, 16, 120),
        new THREE.MeshStandardMaterial({
          color, emissive, emissiveIntensity: 1.6,
          metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0,
        })
      );
    }
    const ring1 = makeRing(8.5, 0.22, 0x0077ff, 0x0044cc);
    ring1.rotation.x = Math.PI * 0.42;
    ring1.position.copy(orb.position);
    scene.add(ring1);
    const ring2 = makeRing(11, 0.14, 0x00bfa6, 0x007a6b);
    ring2.rotation.x = -Math.PI * 0.28;
    ring2.rotation.y = Math.PI * 0.3;
    ring2.position.copy(orb.position);
    scene.add(ring2);

    const satellites = [];
    for (let i = 0; i < 14; i++) {
      const angle  = (i / 14) * Math.PI * 2;
      const radius = 13 + (i % 3) * 3;
      const sGeo   = new THREE.SphereGeometry(0.2 + Math.random() * 0.4, 12, 12);
      const sMat   = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x0077ff : 0x00bfa6,
        transparent: true, opacity: 0, blending: THREE.AdditiveBlending,
      });
      const s = new THREE.Mesh(sGeo, sMat);
      s.userData = { angle, radius, speed: 0.10 + Math.random() * 0.14, phase: Math.random() * Math.PI * 2 };
      scene.add(s);
      satellites.push(s);
    }

    function makeFlare(size, color) {
      return new THREE.Mesh(
        new THREE.PlaneGeometry(size, size),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
      );
    }
    const flare1 = makeFlare(8,  0x0077ff);
    const flare2 = makeFlare(20, 0x0044aa);
    const flare3 = makeFlare(44, 0x002266);
    flare1.position.set(0, 0, 11);
    flare2.position.set(0, 0, 10.5);
    flare3.position.set(0, 0, 10);
    scene.add(flare1, flare2, flare3);

    const state = {
      camZ: 90, camY: 2, camRotY: 0, fogDensity: 0.016,
      ambientIntensity: 2.5, primaryIntensity: 0,
      orbOpacity: 0, coreOpacity: 0, ring1Opacity: 0, ring2Opacity: 0,
      satOpacity: 0, flare1Op: 0, flare2Op: 0, flare3Op: 0,
      exposure: 1.0, drift: 0.3,
    };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end:   "bottom bottom",
        scrub: 1.2,
        onUpdate(self) {
          if (progressRef.current) progressRef.current.style.width = (self.progress * 100).toFixed(1) + "%";
          if (chapterRef.current) {
            const p = self.progress;
            if      (p < 0.02) { chapterRef.current.style.opacity = 0; }
            else if (p < 0.35) { chapterRef.current.textContent = "I — Approach";  chapterRef.current.style.opacity = 1; }
            else if (p < 0.60) { chapterRef.current.textContent = "II — Reveal";   chapterRef.current.style.opacity = 1; }
            else if (p < 0.82) { chapterRef.current.textContent = "III — Vision";  chapterRef.current.style.opacity = 1; }
            else               { chapterRef.current.textContent = "IV — Ascent";   chapterRef.current.style.opacity = 1; }
          }
        },
      },
    });

    tl.to(state, { camZ: 28, camY: 0, fogDensity: 0.010, ambientIntensity: 3.5, drift: 0.9, duration: 25, ease: "power2.inOut" }, 0);
    tl.to(textOpenRef.current, { opacity: 1, duration: 5 }, 2);
    tl.to(textOpenRef.current, { opacity: 0, duration: 5 }, 16);
    tl.to(hintRef.current,     { opacity: 0, duration: 3 }, 2);

    tl.to(state, { camZ: 14, camY: 4, fogDensity: 0.007, primaryIntensity: 5, orbOpacity: 1, coreOpacity: 0.5, ring1Opacity: 0.85, ring2Opacity: 0.5, flare1Op: 0.5, flare2Op: 0.25, duration: 25, ease: "power1.inOut" }, 25);
    tl.to(textMidRef.current, { opacity: 1, duration: 4 }, 30);
    tl.to(textMidRef.current, { opacity: 0, duration: 4 }, 44);

    tl.to(state, { camZ: 11, camY: 0, camRotY: 0.22, satOpacity: 1, primaryIntensity: 6.5, fogDensity: 0.006, flare1Op: 0.8, flare2Op: 0.5, duration: 25, ease: "none" }, 50);
    tl.to(textEndRef.current, { opacity: 1, duration: 4 }, 55);
    tl.to(textEndRef.current, { opacity: 0, duration: 4 }, 68);

    tl.to(state, { camZ: 3, camY: 0, camRotY: 0, fogDensity: 0.058, primaryIntensity: 12, ambientIntensity: 10, coreOpacity: 1, flare1Op: 1, flare2Op: 0.9, flare3Op: 0.6, exposure: 2.4, duration: 25, ease: "power4.in" }, 75);

    let mouseX = 0, mouseY = 0, camOffX = 0, camOffY = 0;
    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);

    const clock = new THREE.Clock();
    let rafId;
    function tick() {
      rafId = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      camera.position.z = state.camZ;
      camera.position.y = state.camY;
      scene.fog.density  = state.fogDensity;
      ambient.intensity  = state.ambientIntensity;
      primaryLight.intensity = state.primaryIntensity;
      renderer.toneMappingExposure = state.exposure;
      camOffX += (mouseX * 2.5 - camOffX) * 0.03;
      camOffY += (-mouseY * 1.8 - camOffY) * 0.03;
      camera.rotation.y = state.camRotY + camOffX * 0.014;
      camera.rotation.x = camOffY * 0.011;
      orbMat.opacity     = state.orbOpacity;
      coreMat.opacity    = state.coreOpacity;
      ring1.material.opacity = state.ring1Opacity;
      ring2.material.opacity = state.ring2Opacity;
      flare1.material.opacity = state.flare1Op;
      flare2.material.opacity = state.flare2Op;
      flare3.material.opacity = state.flare3Op;
      orb.scale.setScalar(1 + Math.sin(t * 1.4) * 0.03);
      core.scale.setScalar(0.9 + Math.sin(t * 2.2) * 0.09);
      ring1.rotation.z = t * 0.22;
      ring2.rotation.z = -t * 0.17;
      ring1.rotation.x = Math.PI * 0.42 + Math.sin(t * 0.4) * 0.08;
      primaryLight.position.x = Math.sin(t * 0.7) * 4;
      primaryLight.position.y = Math.cos(t * 0.5) * 3;
      flare1.lookAt(camera.position);
      flare2.lookAt(camera.position);
      flare3.lookAt(camera.position);
      flare1.scale.setScalar(1 + Math.sin(t * 1.9) * 0.1);
      flare2.scale.setScalar(1 + Math.sin(t * 0.9) * 0.07);
      satellites.forEach((s, i) => {
        const a = s.userData.angle + t * s.userData.speed;
        const r = s.userData.radius;
        s.position.x = Math.cos(a) * r;
        s.position.z = 10 + Math.sin(a) * 4;
        s.position.y = Math.sin(t * 0.8 + s.userData.phase) * 7;
        s.material.opacity = state.satOpacity * (0.5 + Math.sin(t * 1.5 + i) * 0.4);
        s.scale.setScalar(1 + Math.sin(t * 2 + s.userData.phase) * 0.25);
      });
      layerFar.rotation.y  = t * 0.004 * state.drift;
      layerMid.rotation.y  = t * 0.007 * state.drift;
      layerNear.rotation.y = t * 0.011 * state.drift;
      layerNear.rotation.x = Math.sin(t * 0.006) * 0.04;
      stars.rotation.y = t * 0.002;
      renderer.render(scene, camera);
    }
    tick();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      tl.scrollTrigger?.kill();
      tl.kill();
      renderer.dispose();
      document.head.removeChild(styleEl);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={containerRef} style={{ height: "350vh", position: "relative" }}>
      <div ref={stickyRef} style={{ position: "sticky", top: 0, width: "100%", height: "100vh", overflow: "hidden" }}>
        <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
        <div ref={progressRef} className="ch-progress" />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, rgba(10,10,18,0.72) 100%)" }} />
        <div ref={textOpenRef} className="ch-overlay-text" style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
          <p style={{ fontSize: "clamp(0.6rem,1.2vw,0.85rem)", letterSpacing: "0.35em", textTransform: "uppercase", color: "#00bfa6", marginBottom: "1.2rem", fontWeight: 600 }}>
            FAA Part 107 · Southern California
          </p>
          <h1 style={{ fontSize: "clamp(2.4rem,7vw,5.5rem)", fontWeight: 800, letterSpacing: "-0.02em", color: "#fff", lineHeight: 1.05, textShadow: "0 0 60px rgba(0,119,255,0.5), 0 0 120px rgba(0,119,255,0.25)" }}>
            Seraphic Sight
          </h1>
          <p style={{ marginTop: "1.2rem", fontSize: "clamp(0.75rem,1.5vw,1rem)", letterSpacing: "0.2em", color: "rgba(0,191,166,0.8)", textTransform: "uppercase" }}>
            Aerial Imaging &amp; Site Documentation
          </p>
        </div>
        <div ref={textMidRef} className="ch-overlay-text" style={{ bottom: "18%", left: "8%", maxWidth: "min(420px, 45vw)" }}>
          <h2 style={{ fontSize: "clamp(1.4rem,3.5vw,2.6rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.2, color: "#fff" }}>
            Sell listings<br /><span style={{ background: "linear-gradient(90deg,#0077FF,#00BFA6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>faster.</span>
          </h2>
          <p style={{ fontSize: "clamp(0.8rem,1.3vw,0.95rem)", color: "#8888A0", marginTop: "0.8rem", lineHeight: 1.7 }}>
            MLS-ready aerial photography, drone video &amp; 360° tours — delivered in 3–4 days.
          </p>
        </div>
        <div ref={textEndRef} className="ch-overlay-text" style={{ top: "22%", right: "8%", maxWidth: "min(380px, 42vw)", textAlign: "right" }}>
          <h2 style={{ fontSize: "clamp(1.2rem,3vw,2.2rem)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.3, color: "#fff" }}>
            Document every<br /><span style={{ background: "linear-gradient(90deg,#00BFA6,#0077FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>phase.</span>
          </h2>
          <p style={{ fontSize: "clamp(0.75rem,1.2vw,0.9rem)", color: "#8888A0", marginTop: "0.8rem", lineHeight: 1.7 }}>
            DroneDeploy workflows, orthomosaic mapping &amp; audit-ready progress docs.
          </p>
        </div>
        <div ref={chapterRef} style={{ position: "absolute", top: "1.8rem", left: "2rem", fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(0,191,166,0.7)", opacity: 0, transition: "opacity 0.4s", zIndex: 15 }} />
        <div ref={hintRef} style={{ position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)", textAlign: "center", color: "rgba(255,255,255,0.45)", fontSize: "0.62rem", letterSpacing: "0.25em", textTransform: "uppercase", zIndex: 15 }}>
          Scroll to explore
          <span style={{ display: "block", width: 1, height: 40, background: "linear-gradient(to bottom, transparent, rgba(0,119,255,0.6))", margin: "8px auto 0", animation: "ch-bounce 2.2s ease-in-out infinite" }} />
        </div>
      </div>
    </div>
  );
                    }
