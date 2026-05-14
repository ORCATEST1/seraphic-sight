// SpatialShowroom.js — Seraphic Sight Interactive 3D Showroom
// A browser-based walkthrough exhibit. Three.js + pointer-lock navigation.
// Rooms: Lobby → Property Marketing → Construction → Portfolio → Contact

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// ─── ROOM LAYOUT ────────────────────────────────────────────────────────────
// Each room is a box in world space. Corridors connect them.
// Player walks along Z axis, rooms branch left/right.
const ROOMS = [
  {
    id: "lobby",
    label: "LOBBY",
    floor: "1F",
    pos: [0, 0, 0],
    size: [20, 6, 24],
    color: 0x050810,
    accent: 0x0077FF,
    panels: [
      { type: "logo",  pos: [0, 3, -11.5], text: "SERAPHIC SIGHT",  sub: "FAA Part 107 · Southern California" },
      { type: "stat",  pos: [-8, 2, 0],    label: "300+", sub: "Projects" },
      { type: "stat",  pos: [-8, 2, 6],    label: "5.0★", sub: "Rating" },
      { type: "stat",  pos: [-8, 2, -6],   label: "7",    sub: "Regions" },
      { type: "nav",   pos: [0, 1.5, 10],  text: "→  ENTER",        room: "property" },
    ],
  },
  {
    id: "property",
    label: "PROPERTY MARKETING",
    floor: "1F",
    pos: [0, 0, 30],
    size: [22, 6, 26],
    color: 0x04060F,
    accent: 0x0077FF,
    panels: [
      { type: "title", pos: [0, 3.5, -12.5], text: "Property Marketing", sub: "MLS-ready aerials in 3–4 days" },
      { type: "video", pos: [-10, 2.5, 0],    label: "Aerial Photography", videoId: "prop-aerial" },
      { type: "video", pos: [10, 2.5, 0],     label: "Drone Video",         videoId: "prop-video" },
      { type: "card",  pos: [0, 2, 8],        label: "From $249", sub: "MLS Package" },
      { type: "nav",   pos: [-9, 1.5, 12],    text: "↑  CONSTRUCTION",     room: "construction" },
      { type: "nav",   pos: [9, 1.5, 12],     text: "↑  PORTFOLIO",         room: "portfolio" },
    ],
  },
  {
    id: "construction",
    label: "CONSTRUCTION & DEVELOPMENT",
    floor: "1F",
    pos: [-28, 0, 46],
    size: [22, 6, 26],
    color: 0x040A08,
    accent: 0x00BFA6,
    panels: [
      { type: "title", pos: [0, 3.5, -12.5], text: "Construction Docs", sub: "DroneDeploy · GeoTIFF · BIM 360" },
      { type: "video", pos: [-9, 2.5, 0],     label: "Progress Mapping",   videoId: "con-map" },
      { type: "card",  pos: [8, 2.5, 0],      label: "DroneDeploy",        sub: "Automated Workflows" },
      { type: "card",  pos: [8, 2.5, 6],      label: "Orthomosaic",        sub: "GeoTIFF Deliverables" },
      { type: "nav",   pos: [0, 1.5, 12],     text: "→  CONTACT",          room: "contact" },
    ],
  },
  {
    id: "portfolio",
    label: "PORTFOLIO",
    floor: "B1F",
    pos: [28, 0, 46],
    size: [24, 6, 28],
    color: 0x060508,
    accent: 0x8833FF,
    panels: [
      { type: "title", pos: [0, 3.5, -13.5], text: "Portfolio",     sub: "Aerial · Video · Mapping" },
      { type: "grid",  pos: [0, 2.5, 0],     label: "Recent Work" },
      { type: "nav",   pos: [0, 1.5, 13],    text: "→  CONTACT",   room: "contact" },
    ],
  },
  {
    id: "contact",
    label: "CONTACT",
    floor: "1F",
    pos: [0, 0, 72],
    size: [18, 6, 20],
    color: 0x050810,
    accent: 0x0077FF,
    panels: [
      { type: "title",   pos: [0, 3.5, -9.5],  text: "Get a Quote",     sub: "APN · Address · Deliverables" },
      { type: "contact", pos: [0, 2.5, 0] },
    ],
  },
];

// ─── PANEL GEOMETRY HELPERS ─────────────────────────────────────────────────
function makeTextCanvas(line1, line2, w = 512, h = 256, accent = "#0077FF") {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "rgba(5,8,16,0.0)";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = accent;
  ctx.font = "bold 52px 'Arial', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(line1, w / 2, h * 0.48);
  if (line2) {
    ctx.fillStyle = "rgba(180,180,200,0.75)";
    ctx.font = "26px 'Arial', sans-serif";
    ctx.fillText(line2, w / 2, h * 0.72);
  }
  return c;
}

// ─── MINIMAP ────────────────────────────────────────────────────────────────
function Minimap({ playerPos, currentRoom }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const W = 160, H = 160;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "rgba(5,8,16,0.85)";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(0,119,255,0.3)";
    ctx.strokeRect(0, 0, W, H);

    const scale = 1.4;
    const cx = W / 2, cy = H / 2;
    const ox = -playerPos[0] * scale + cx;
    const oy = -playerPos[2] * scale + cy;

    ROOMS.forEach(room => {
      const rx = room.pos[0] * scale + ox - (room.size[0] / 2) * scale;
      const ry = room.pos[2] * scale + oy - (room.size[2] / 2) * scale;
      const rw = room.size[0] * scale, rh = room.size[2] * scale;
      ctx.fillStyle = room.id === currentRoom
        ? "rgba(0,119,255,0.25)"
        : "rgba(255,255,255,0.04)";
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeStyle = room.id === currentRoom
        ? "rgba(0,119,255,0.8)"
        : "rgba(255,255,255,0.12)";
      ctx.strokeRect(rx, ry, rw, rh);
      ctx.fillStyle = "rgba(120,130,180,0.7)";
      ctx.font = "7px monospace";
      ctx.textAlign = "center";
      ctx.fillText(room.label.split(" ")[0], rx + rw / 2, ry + rh / 2 + 3);
    });

    // Player dot
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#0077FF";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0,119,255,0.4)";
    ctx.stroke();
  }, [playerPos, currentRoom]);

  return (
    <canvas ref={canvasRef} width={160} height={160} style={{
      position: "fixed", bottom: 24, left: 24, zIndex: 100,
      borderRadius: 8, border: "1px solid rgba(0,119,255,0.25)",
      boxShadow: "0 0 20px rgba(0,119,255,0.15)",
    }} />
  );
}

// ─── ONBOARDING ──────────────────────────────────────────────────────────────
function Onboarding({ onStart }) {
  const [phase, setPhase] = useState("hello"); // hello → mode → loading → ready
  const [mode, setMode] = useState(null);
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (phase === "hello") {
      const t = setTimeout(() => setPhase("mode"), 1800);
      return () => clearTimeout(t);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "loading") {
      let p = 0;
      const iv = setInterval(() => {
        p += Math.random() * 6 + 2;
        if (p >= 100) { p = 100; clearInterval(iv); setTimeout(() => setPhase("ready"), 400); }
        setProgress(Math.min(100, p));
      }, 60);
      return () => clearInterval(iv);
    }
  }, [phase]);

  const handleStart = () => {
    setFadeOut(true);
    setTimeout(onStart, 700);
  };

  const base = {
    position: "fixed", inset: 0, zIndex: 1000,
    background: "radial-gradient(ellipse 80% 80% at 50% 50%, #08101E 0%, #020408 100%)",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    fontFamily: "'Arial', sans-serif",
    transition: "opacity 0.7s",
    opacity: fadeOut ? 0 : 1,
    pointerEvents: fadeOut ? "none" : "all",
  };

  if (phase === "hello") return (
    <div style={base}>
      <div style={{ fontSize: "clamp(3rem,10vw,7rem)", fontWeight: 900, letterSpacing: "0.25em",
        color: "#fff", textTransform: "uppercase",
        animation: "ssHello 0.8s cubic-bezier(.2,.8,.3,1) both",
      }}>
        HELLO
      </div>
      <style>{`@keyframes ssHello { from { opacity:0; transform:scale(0.85) } to { opacity:1; transform:scale(1) } }`}</style>
    </div>
  );

  if (phase === "mode") return (
    <div style={base}>
      <p style={{ color: "rgba(0,191,166,0.7)", fontSize: "0.7rem", letterSpacing: "0.35em",
        textTransform: "uppercase", marginBottom: 32 }}>SELECT NAVIGATION MODE</p>
      <div style={{ display: "flex", gap: 20 }}>
        {[
          { id: "normal", label: "NORMAL", sub: "WASD + Mouse", desc: "Full keyboard control" },
          { id: "easy",   label: "EASY",   sub: "Scroll + Click", desc: "Guided tour mode" },
        ].map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setPhase("loading"); }}
            style={{
              background: mode === m.id ? "rgba(0,119,255,0.2)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${mode === m.id ? "rgba(0,119,255,0.6)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 12, padding: "28px 40px", cursor: "pointer",
              color: "#fff", textAlign: "center", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,119,255,0.5)"; e.currentTarget.style.background = "rgba(0,119,255,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
          >
            <div style={{ fontSize: "1.4rem", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 6 }}>{m.label}</div>
            <div style={{ fontSize: "0.72rem", color: "#0077FF", letterSpacing: "0.15em", marginBottom: 8 }}>{m.sub}</div>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)" }}>{m.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );

  if (phase === "loading") return (
    <div style={base}>
      <p style={{ color: "rgba(0,191,166,0.7)", fontSize: "0.65rem", letterSpacing: "0.4em",
        textTransform: "uppercase", marginBottom: 24 }}>INITIALIZING SHOWROOM</p>
      <div style={{ width: 280, height: 2, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${progress}%`, height: "100%",
          background: "linear-gradient(90deg, #0077FF, #00BFA6)",
          boxShadow: "0 0 12px rgba(0,191,166,0.6)",
          transition: "width 0.08s linear" }} />
      </div>
      <p style={{ marginTop: 16, color: "rgba(255,255,255,0.25)", fontSize: "0.6rem",
        fontFamily: "monospace", letterSpacing: "0.2em" }}>{Math.floor(progress)}%</p>
    </div>
  );

  if (phase === "ready") return (
    <div style={base}>
      <p style={{ color: "rgba(0,191,166,0.7)", fontSize: "0.65rem", letterSpacing: "0.4em",
        textTransform: "uppercase", marginBottom: 20 }}>SERAPHIC SIGHT · SHOWROOM</p>
      <h1 style={{ fontSize: "clamp(1.8rem,5vw,3.5rem)", fontWeight: 900, color: "#fff",
        letterSpacing: "-0.02em", marginBottom: 12 }}>Welcome.</h1>
      <p style={{ color: "rgba(180,180,200,0.6)", fontSize: "0.85rem", marginBottom: 40,
        textAlign: "center", maxWidth: 380, lineHeight: 1.7 }}>
        Walk through our aerial imaging showroom. Explore services, watch demo footage, and find your zone.
      </p>
      <div style={{ display: "flex", gap: 12, color: "rgba(255,255,255,0.3)", fontSize: "0.62rem",
        letterSpacing: "0.2em", marginBottom: 40, textTransform: "uppercase" }}>
        <span>WASD Move</span><span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
        <span>Mouse Look</span><span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
        <span>Click Hotspots</span>
      </div>
      <button onClick={handleStart} style={{
        background: "linear-gradient(135deg, #0077FF, #00BFA6)",
        border: "none", borderRadius: 8, padding: "16px 48px",
        color: "#fff", fontSize: "0.85rem", fontWeight: 700,
        letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer",
        boxShadow: "0 0 30px rgba(0,119,255,0.4)",
      }}>ENTER SHOWROOM</button>
    </div>
  );

  return null;
}

// ─── HUD OVERLAY ─────────────────────────────────────────────────────────────
function HUD({ currentRoom, floorLabel, compass, helpVisible, setHelpVisible }) {
  const room = ROOMS.find(r => r.id === currentRoom);
  return (
    <>
      {/* Floor label */}
      <div style={{
        position: "fixed", top: 24, right: 24, zIndex: 100,
        fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.3em",
        color: "rgba(0,191,166,0.6)", textAlign: "right", pointerEvents: "none",
      }}>
        <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#fff", letterSpacing: "0.1em" }}>{floorLabel}</div>
        <div style={{ marginTop: 2 }}>{room?.label || ""}</div>
      </div>

      {/* Compass */}
      <div style={{
        position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
        zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        pointerEvents: "none",
      }}>
        <div style={{ fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: "0.25em",
          color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>
          {Math.round(((compass % 360) + 360) % 360)}° &nbsp;
          {compass < 45 || compass > 315 ? "N" : compass < 135 ? "E" : compass < 225 ? "S" : "W"}
        </div>
        <div style={{
          width: 120, height: 2, background: "rgba(255,255,255,0.06)",
          position: "relative", borderRadius: 2,
        }}>
          <div style={{
            position: "absolute", left: "50%", top: -3,
            width: 2, height: 8, background: "#0077FF",
            transform: "translateX(-50%)", borderRadius: 1,
          }} />
        </div>
      </div>

      {/* Crosshair */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 100, pointerEvents: "none",
      }}>
        <svg width="20" height="20" viewBox="0 0 20 20">
          <line x1="10" y1="2" x2="10" y2="8" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
          <line x1="10" y1="12" x2="10" y2="18" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
          <line x1="2" y1="10" x2="8" y2="10" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
          <line x1="12" y1="10" x2="18" y2="10" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
          <circle cx="10" cy="10" r="1.5" fill="rgba(255,255,255,0.5)"/>
        </svg>
      </div>

      {/* Right vertical menu */}
      <div style={{
        position: "fixed", right: 0, top: "50%", transform: "translateY(-50%)",
        zIndex: 100, display: "flex", flexDirection: "column", gap: 0,
      }}>
        {[
          { label: "SHARE", icon: "↗" },
          { label: "SOUND", icon: "♪" },
          { label: "INFO",  icon: "i", onClick: () => setHelpVisible(v => !v) },
        ].map((item) => (
          <button key={item.label}
            onClick={item.onClick}
            style={{
              background: "rgba(200,0,0,0.75)", border: "none",
              color: "#fff", writingMode: "vertical-rl",
              padding: "14px 8px", fontSize: "0.55rem",
              letterSpacing: "0.2em", textTransform: "uppercase",
              cursor: "pointer", fontFamily: "monospace",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}>
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      {/* Info panel */}
      {helpVisible && (
        <div style={{
          position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
          zIndex: 200, background: "rgba(5,8,16,0.92)",
          border: "1px solid rgba(0,119,255,0.2)", borderRadius: 12,
          padding: "20px 32px", textAlign: "center",
          color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", lineHeight: 1.8,
          backdropFilter: "blur(10px)",
        }}>
          <div style={{ fontWeight: 700, color: "#fff", marginBottom: 8 }}>HOW TO NAVIGATE</div>
          WASD to move · Mouse to look · Click glowing panels · ESC to unlock cursor
          <br/>
          <button onClick={() => setHelpVisible(false)}
            style={{ marginTop: 12, background: "none", border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.5)", borderRadius: 6, padding: "4px 16px",
              cursor: "pointer", fontSize: "0.65rem" }}>CLOSE</button>
        </div>
      )}
    </>
  );
}

// ─── MAIN SHOWROOM ────────────────────────────────────────────────────────────
export default function SpatialShowroom() {
  const mountRef    = useRef(null);
  const [ready, setReady]       = useState(false);
  const [started, setStarted]   = useState(false);
  const [playerPos, setPlayerPos] = useState([0, 1.7, 0]);
  const [currentRoom, setCurrentRoom] = useState("lobby");
  const [floorLabel, setFloorLabel]   = useState("1F");
  const [compass, setCompass]         = useState(0);
  const [helpVisible, setHelpVisible] = useState(false);

  useEffect(() => {
    if (!started) return;
    const container = mountRef.current;
    if (!container) return;

    // ── Renderer ─────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85;
    container.appendChild(renderer.domElement);

    // ── Scene ─────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020408);
    scene.fog = new THREE.FogExp2(0x020408, 0.028);

    // ── Camera (first-person) ─────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 120);
    camera.position.set(0, 1.7, 10);

    // ── Build rooms ───────────────────────────────────────────────
    const panelMeshes = []; // for raycasting hotspots

    ROOMS.forEach(room => {
      const [rx, ry, rz] = room.pos;
      const [rw, rh, rd] = room.size;
      const accentHex = "#" + room.accent.toString(16).padStart(6, "0");

      // Floor
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(rw, rd),
        new THREE.MeshStandardMaterial({
          color: 0x080C14,
          roughness: 0.9, metalness: 0.1,
        })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(rx, ry, rz);
      floor.receiveShadow = true;
      scene.add(floor);

      // Grid lines on floor
      const gridHelper = new THREE.GridHelper(Math.max(rw, rd), 10,
        new THREE.Color(room.accent).multiplyScalar(0.12),
        new THREE.Color(room.accent).multiplyScalar(0.06)
      );
      gridHelper.position.set(rx, ry + 0.01, rz);
      scene.add(gridHelper);

      // Ceiling
      const ceil = new THREE.Mesh(
        new THREE.PlaneGeometry(rw, rd),
        new THREE.MeshStandardMaterial({ color: 0x030508, roughness: 1 })
      );
      ceil.rotation.x = Math.PI / 2;
      ceil.position.set(rx, ry + rh, rz);
      scene.add(ceil);

      // Walls (4 sides)
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x060A12, roughness: 0.95 });
      [
        { pos: [rx, ry + rh / 2, rz - rd / 2], rot: [0, 0, 0],          size: [rw, rh] }, // back
        { pos: [rx, ry + rh / 2, rz + rd / 2], rot: [0, Math.PI, 0],    size: [rw, rh] }, // front
        { pos: [rx - rw / 2, ry + rh / 2, rz], rot: [0, Math.PI / 2, 0], size: [rd, rh] }, // left
        { pos: [rx + rw / 2, ry + rh / 2, rz], rot: [0, -Math.PI / 2, 0], size: [rd, rh] }, // right
      ].forEach(w => {
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(...w.size), wallMat.clone());
        mesh.position.set(...w.pos);
        mesh.rotation.set(...w.rot);
        mesh.receiveShadow = true;
        scene.add(mesh);
      });

      // Accent strip at base of back wall
      const strip = new THREE.Mesh(
        new THREE.PlaneGeometry(rw - 2, 0.06),
        new THREE.MeshBasicMaterial({ color: room.accent })
      );
      strip.position.set(rx, ry + 0.03, rz - rd / 2 + 0.02);
      strip.rotation.x = -Math.PI / 2;
      scene.add(strip);

      // Room light
      const pt = new THREE.PointLight(room.accent, 0.6, 22);
      pt.position.set(rx, ry + rh - 0.5, rz);
      scene.add(pt);

      const amb = new THREE.AmbientLight(0x101828, 0.8);
      scene.add(amb);

      // ── Panels ────────────────────────────────────────────────
      room.panels.forEach(panel => {
        const [px, py, pz] = panel.pos;
        const worldPos = new THREE.Vector3(rx + px, ry + py, rz + pz);

        if (panel.type === "logo") {
          const cvs = makeTextCanvas(panel.text, panel.sub, 512, 192, accentHex);
          const tex = new THREE.CanvasTexture(cvs);
          const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(6, 2.3),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true })
          );
          mesh.position.copy(worldPos);
          scene.add(mesh);
        }

        if (panel.type === "title") {
          const cvs = makeTextCanvas(panel.text, panel.sub, 512, 180, accentHex);
          const tex = new THREE.CanvasTexture(cvs);
          const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(5.5, 2),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true })
          );
          mesh.position.copy(worldPos);
          scene.add(mesh);
        }

        if (panel.type === "stat") {
          const cvs = makeTextCanvas(panel.label, panel.sub, 256, 200, accentHex);
          const tex = new THREE.CanvasTexture(cvs);
          const frame = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 2.5, 0.04),
            new THREE.MeshStandardMaterial({
              color: 0x080C18, roughness: 0.8,
              emissive: new THREE.Color(room.accent).multiplyScalar(0.04),
            })
          );
          frame.position.copy(worldPos);
          scene.add(frame);
          const panel3d = new THREE.Mesh(
            new THREE.PlaneGeometry(2.2, 2.2),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true })
          );
          panel3d.position.copy(worldPos);
          panel3d.position.z += 0.03;
          scene.add(panel3d);
          // glowing edge
          const edgeMat = new THREE.MeshBasicMaterial({ color: room.accent, wireframe: false });
          const edge = new THREE.Mesh(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.55, 2.55, 0.04)), edgeMat);
          edge.position.copy(worldPos);
          scene.add(edge);
        }

        if (panel.type === "video" || panel.type === "card") {
          // Video/image panel — glowing dark frame with label
          const cvs = makeTextCanvas(panel.label, panel.sub || "SERAPHIC SIGHT", 512, 288, accentHex);
          const tex = new THREE.CanvasTexture(cvs);
          const frame = new THREE.Mesh(
            new THREE.BoxGeometry(4.5, 3, 0.06),
            new THREE.MeshStandardMaterial({
              color: 0x060A14,
              emissive: new THREE.Color(room.accent).multiplyScalar(0.06),
              roughness: 0.7,
            })
          );
          frame.position.copy(worldPos);
          frame.rotation.y = panel.pos[0] < 0 ? Math.PI / 2 : (panel.pos[0] > 5 ? -Math.PI / 2 : 0);
          frame.userData = { type: "hotspot", label: panel.label, room: panel.room };
          frame.castShadow = true;
          scene.add(frame);
          panelMeshes.push(frame);
          const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(4.1, 2.6),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true })
          );
          screen.position.copy(worldPos);
          screen.rotation.copy(frame.rotation);
          screen.position.x += frame.rotation.y === Math.PI / 2 ? 0.04 : 0;
          screen.position.x += frame.rotation.y === -Math.PI / 2 ? -0.04 : 0;
          screen.position.z += frame.rotation.y === 0 ? 0.04 : 0;
          scene.add(screen);
        }

        if (panel.type === "nav") {
          // Navigation arrow panel
          const cvs = makeTextCanvas(panel.text, "CLICK TO ENTER", 384, 140, accentHex);
          const tex = new THREE.CanvasTexture(cvs);
          const navMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(4, 1.4),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true })
          );
          navMesh.position.copy(worldPos);
          navMesh.userData = { type: "nav", room: panel.room };
          scene.add(navMesh);
          panelMeshes.push(navMesh);

          // Glow floor arrow
          const arrowGeo = new THREE.PlaneGeometry(0.4, 1.2);
          const arrowMat = new THREE.MeshBasicMaterial({
            color: room.accent, transparent: true, opacity: 0.5,
          });
          const arrow = new THREE.Mesh(arrowGeo, arrowMat);
          arrow.rotation.x = -Math.PI / 2;
          arrow.position.set(worldPos.x, ry + 0.02, worldPos.z + 1);
          scene.add(arrow);
        }
      });
    });

    // ── Player movement ───────────────────────────────────────────
    const keys = {};
    const SPEED = 0.08;
    const euler = new THREE.Euler(0, 0, 0, "YXZ");
    let isPointerLocked = false;

    const onKeyDown = e => { keys[e.code] = true; };
    const onKeyUp   = e => { keys[e.code] = false; };
    const onMouseMove = e => {
      if (!isPointerLocked) return;
      euler.setFromQuaternion(camera.quaternion);
      euler.y -= e.movementX * 0.002;
      euler.x -= e.movementY * 0.002;
      euler.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, euler.x));
      camera.quaternion.setFromEuler(euler);
    };
    const onPointerLockChange = () => {
      isPointerLocked = document.pointerLockElement === renderer.domElement;
    };
    const onClick = () => {
      if (!isPointerLocked) {
        renderer.domElement.requestPointerLock();
        return;
      }
      // Raycast hotspots
      raycaster.setFromCamera(center, camera);
      const hits = raycaster.intersectObjects(panelMeshes);
      if (hits.length > 0) {
        const data = hits[0].object.userData;
        if (data.room) {
          const target = ROOMS.find(r => r.id === data.room);
          if (target) {
            camera.position.set(target.pos[0], 1.7, target.pos[2] + target.size[2] / 2 - 2);
          }
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("pointerlockchange", onPointerLockChange);
    renderer.domElement.addEventListener("click", onClick);

    const raycaster = new THREE.Raycaster();
    const center    = new THREE.Vector2(0, 0);
    const direction = new THREE.Vector3();
    const right     = new THREE.Vector3();

    // ── Collision bounds (AABB per room) ─────────────────────────
    const roomBounds = ROOMS.map(r => ({
      id: r.id,
      floor: r.floor,
      minX: r.pos[0] - r.size[0] / 2 + 0.5,
      maxX: r.pos[0] + r.size[0] / 2 - 0.5,
      minZ: r.pos[2] - r.size[2] / 2 + 0.5,
      maxZ: r.pos[2] + r.size[2] / 2 - 0.5,
    }));

    // ── Animate ───────────────────────────────────────────────────
    let rafId;
    const tick = () => {
      rafId = requestAnimationFrame(tick);

      // WASD movement
      camera.getWorldDirection(direction);
      direction.y = 0; direction.normalize();
      right.crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();

      const vel = new THREE.Vector3();
      if (keys["KeyW"] || keys["ArrowUp"])    vel.add(direction);
      if (keys["KeyS"] || keys["ArrowDown"])  vel.sub(direction);
      if (keys["KeyA"] || keys["ArrowLeft"])  vel.sub(right);
      if (keys["KeyD"] || keys["ArrowRight"]) vel.add(right);

      if (vel.length() > 0) {
        vel.normalize().multiplyScalar(SPEED);
        const next = camera.position.clone().add(vel);
        // Soft bounds — let player move freely, just clamp to world AABB
        const worldMin = -35, worldMax = 35, worldMinZ = -5, worldMaxZ = 85;
        next.x = Math.max(worldMin, Math.min(worldMax, next.x));
        next.z = Math.max(worldMinZ, Math.min(worldMaxZ, next.z));
        camera.position.copy(next);
        camera.position.y = 1.7;
      }

      // Detect current room
      const cp = camera.position;
      const inRoom = roomBounds.find(b =>
        cp.x >= b.minX && cp.x <= b.maxX && cp.z >= b.minZ && cp.z <= b.maxZ
      );
      if (inRoom && inRoom.id !== currentRoom) {
        setCurrentRoom(inRoom.id);
        setFloorLabel(inRoom.floor);
      }
      setPlayerPos([Math.round(cp.x * 10) / 10, cp.y, Math.round(cp.z * 10) / 10]);
      setCompass(Math.round(THREE.MathUtils.radToDeg(-euler.y)));

      // Panel glow pulse
      const t = performance.now() / 1000;
      panelMeshes.forEach((m, i) => {
        if (m.material.emissive) {
          const base = ROOMS.find(r =>
            r.panels.some(p => {
              const wx = r.pos[0] + p.pos[0];
              const wz = r.pos[2] + p.pos[2];
              return Math.abs(m.position.x - wx) < 0.5 && Math.abs(m.position.z - wz) < 0.5;
            })
          );
          const ac = base ? new THREE.Color(base.accent) : new THREE.Color(0x0077FF);
          const pulse = 0.04 + 0.025 * Math.sin(t * 1.8 + i * 0.7);
          m.material.emissive.copy(ac).multiplyScalar(pulse);
        }
      });

      renderer.render(scene, camera);
    };
    tick();

    // ── Resize ────────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      renderer.domElement.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      if (document.pointerLockElement) document.exitPointerLock();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [started]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#020408" }}>
      {!started && <Onboarding onStart={() => setStarted(true)} />}
      <div ref={mountRef} style={{ width: "100%", height: "100%", display: started ? "block" : "none" }} />
      {started && (
        <>
          <Minimap playerPos={playerPos} currentRoom={currentRoom} />
          <HUD
            currentRoom={currentRoom}
            floorLabel={floorLabel}
            compass={compass}
            helpVisible={helpVisible}
            setHelpVisible={setHelpVisible}
          />
        </>
      )}
    </div>
  );
}
