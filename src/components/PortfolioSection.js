// PortfolioSection.js — Seraphic Sight v2
// High-tech portfolio: large interactive deliverable bubbles, Cloudinary media,
// video autoplay on hover, fullscreen lightbox, full mobile optimization.

import React, {
  useState, useRef, useEffect, useCallback, useMemo,
} from "react";

/* ─── Cloudinary helpers ──────────────────────────────────────────────────── */
const CLD    = "https://res.cloudinary.com/dpc1noikx";
const img    = (id, w = 900, h = 600) =>
  `${CLD}/image/upload/w_${w},h_${h},c_fill,f_auto,q_auto/${id}`;
const vThumb = (id, w = 900, h = 540) =>
  `${CLD}/video/upload/w_${w},h_${h},c_fill,f_jpg,so_2/${id}`;
const vSrc   = (id) =>
  `${CLD}/video/upload/f_mp4,q_auto:good,vc_h264/${id}`;

/* ─── Assets ──────────────────────────────────────────────────────────────── */
const PHOTOS = [
  { id: "DJI_0915_w53hst",   tags: ["Real Estate"] },
  { id: "DJI_0891_tgrszt",   tags: ["Real Estate"] },
  { id: "DJI_0876_imzqgc",   tags: ["Real Estate"] },
  { id: "DJI_0802_cdwyvj",   tags: ["Commercial"] },
  { id: "DJI_0730_enavrk",   tags: ["Commercial"] },
  { id: "DJI_0872_vddljb",   tags: ["Real Estate"] },
  { id: "DJI_0812_cb8yrn",   tags: ["Real Estate"] },
  { id: "Aerial_27_qw5yqr",  tags: ["Commercial"] },
  { id: "DJI_0327_it5brs",   tags: ["Construction"] },
  { id: "Aerial_18_njtmry",  tags: ["Commercial"] },
  { id: "Aerial_25_y6eahl",  tags: ["Commercial"] },
  { id: "DJI_0780_tdioap",   tags: ["Real Estate"] },
  { id: "DJI_0454_bkvuwb",   tags: ["Land"] },
  { id: "DJI_0888_go6uhb",   tags: ["Real Estate"] },
  { id: "DJI_0322_khfwqi",   tags: ["Construction"] },
  { id: "Showcase_nmenkd",   tags: ["Commercial"] },
  { id: "Showcase_2_pkjbvm", tags: ["Commercial"] },
  { id: "Showcase_3_n4gxow", tags: ["Commercial"] },
  { id: "DJI_0011_zmbnvw",   tags: ["Commercial"] },
  { id: "sola-florance-construction-aerial_oapibr", tags: ["Construction"] },
  { id: "AB3BA538-17AE-4CB0-9614-64DACF77AD60_qdj1dz", tags: ["Real Estate"] },
  { id: "4-DJI_0960_etujxs", tags: ["Land"] },
  { id: "3-DJI_0014_xn3a13", tags: ["Land"] },
  { id: "DJI_0377_xl7frm",   tags: ["Commercial"] },
  { id: "94-DJI_0259_e83rda",  tags: ["Construction"] },
  { id: "112-DJI_0287_vmrise", tags: ["Construction"] },
  { id: "DJI_0944_hlpmgh",   tags: ["Real Estate"] },
  { id: "DJI_0715_gh4zrp",   tags: ["Real Estate"] },
  { id: "DJI_0726_ffmdmr",   tags: ["Real Estate"] },
  { id: "DJI_0036-HDR_bxyo9o", tags: ["Commercial"] },
  { id: "DJI_0768_nvafya",   tags: ["Land"] },
  { id: "DJI_0841_tmdv2e",   tags: ["Commercial"] },
  { id: "DJI_0104_uzqlyr",   tags: ["Land"] },
  { id: "DJI_0002_xzpfp5",   tags: ["Commercial"] },
  { id: "map-snapshot_q3dk25", tags: ["Construction", "Land"] },
  { id: "dji_fly_20230107_163233_917_1673141677255_photo_m5emzx", tags: ["Land"] },
  { id: "DJI_0944_gho2t4",        tags: ["Real Estate"] },
  { id: "DJI_0147-Pano-2_ewomdl", tags: ["Commercial"] },
  { id: "5-DJI_0138-HDR_eroxlw",  tags: ["Commercial"] },
  { id: "DJI_0726_c1ezfe",        tags: ["Commercial"] },
  { id: "B8BF74C3-98E2-4C69-8958-D92124D1FE27_mlcue4", tags: ["Commercial"] },
  { id: "dji_fly_20230107_145206_631_1673132863018_photo_m5emzx", tags: ["Commercial"] },
];

const VIDEOS = [
  { id: "clip_joey_updated_bbfclp", tags: ["Cinematic", "Real Estate"] },
  { id: "joe_4_pjcua7",            tags: ["Cinematic", "Real Estate"] },
  { id: "clip1_nscwwy",            tags: ["Walkthrough"] },
  { id: "part_1_rzf7yo",           tags: ["Cinematic"] },
  { id: "Copy_of_V1_2_eshjoq",     tags: ["Cinematic", "Real Estate"] },
  { id: "Copy_of_V3_1_pohbmu",     tags: ["Cinematic"] },
  { id: "Copy_of_DJI_0719_rlyiv1", tags: ["Drone Clips"] },
  { id: "Copy_of_DJI_0896_wfhqwi", tags: ["Drone Clips"] },
  { id: "Copy_of_DJI_0939_pcc1dl", tags: ["Drone Clips"] },
  { id: "Copy_of_DJI_0839_reswlb", tags: ["Drone Clips"] },
  { id: "Copy_of_DJI_0787_jyxcdb", tags: ["Drone Clips", "Construction"] },
  { id: "Copy_of_DJI_0325_kmx2a4", tags: ["Drone Clips", "Real Estate"] },
  { id: "Copy_of_Aerial_20_qa6xjx", tags: ["Cinematic"] },
  { id: "V5_1_.00_01_30_08.Still005_nfgpnn", tags: ["Cinematic", "Walkthrough"] },
  // ── 720p loop renders — add IDs here once rendered and uploaded ──
  // { id: "YOUR_LOOP_ID", tags: ["Cinematic"] },
];

/* ─── Deliverable bubble config ───────────────────────────────────────────── */
const PHOTO_BUBBLES = [
  { label: "All",          icon: "",  color: "#00d4ff" },
  { label: "Real Estate",  icon: "", color: "#a78bfa" },
  { label: "Commercial",   icon: "", color: "#34d399" },
  { label: "Construction", icon: "", color: "#fb923c" },
  { label: "Land",         icon: "", color: "#fbbf24" },
];

const VIDEO_BUBBLES = [
  { label: "All",          icon: "",  color: "#00d4ff" },
  { label: "Cinematic",    icon: "", color: "#f472b6" },
  { label: "Walkthrough",  icon: "", color: "#a78bfa" },
  { label: "Drone Clips",  icon: "", color: "#34d399" },
];

/* ─── CSS ─────────────────────────────────────────────────────────────────── */
const PORTFOLIO_CSS = `
  /* ── Wrap ── */
  .ps-wrap {
    position: relative;
    background: #070b14;
    min-height: 100vh;
    overflow: hidden;
    padding: 0 0 100px;
  }

  /* ── Animated grid background ── */
  .ps-bg {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
    z-index: 0;
  }
  .ps-bg::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,212,255,0.07) 0%, transparent 70%);
  }

  /* ── Background video banner ── */
  .ps-hero-banner {
    position: relative;
    width: 100%;
    height: 360px;
    overflow: hidden;
    z-index: 1;
  }
  @media (max-width: 768px) {
    .ps-hero-banner { height: 240px; }
  }
  @media (max-width: 480px) {
    .ps-hero-banner { height: 200px; }
  }
  .ps-hero-banner video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.5;
    filter: saturate(1.3) brightness(0.75);
  }
  .ps-hero-banner::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(7,11,20,0.4) 0%,
      rgba(7,11,20,0.05) 40%,
      rgba(7,11,20,0.92) 100%
    );
    z-index: 2;
  }
  .ps-hero-title-wrap {
    position: absolute;
    bottom: 36px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    z-index: 3;
    width: 90%;
  }
  @media (max-width: 768px) {
    .ps-hero-title-wrap { bottom: 22px; }
  }
  .ps-hero-eyebrow {
    font-size: 10px;
    letter-spacing: 5px;
    text-transform: uppercase;
    color: #00d4ff;
    margin-bottom: 10px;
    font-family: 'Courier New', monospace;
    opacity: 0.85;
  }
  .ps-hero-h1 {
    font-size: clamp(26px, 5.5vw, 60px);
    font-weight: 800;
    color: #fff;
    line-height: 1.1;
    margin: 0;
    letter-spacing: -1.5px;
  }
  .ps-hero-h1 span { color: #00d4ff; }

  /* ── Content area ── */
  .ps-content {
    position: relative;
    z-index: 2;
    padding: 0 clamp(14px, 4vw, 64px);
  }

  /* ── Category tabs ── */
  .ps-tabs {
    display: flex;
    gap: 0;
    margin: 52px 0 0;
    border-bottom: 1px solid rgba(0,212,255,0.12);
    overflow-x: auto;
    scrollbar-width: none;
  }
  .ps-tabs::-webkit-scrollbar { display: none; }
  .ps-tab {
    position: relative;
    padding: 14px 28px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.25s;
    white-space: nowrap;
    flex-shrink: 0;
    font-family: inherit;
  }
  @media (max-width: 480px) {
    .ps-tab { padding: 12px 18px; font-size: 11px; letter-spacing: 1.5px; }
  }
  .ps-tab:hover { color: rgba(255,255,255,0.65); }
  .ps-tab[aria-selected="true"] { color: #00d4ff; }
  .ps-tab[aria-selected="true"]::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0; right: 0;
    height: 2px;
    background: #00d4ff;
    box-shadow: 0 0 14px rgba(0,212,255,0.7);
  }
  .ps-tab-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px; height: 18px;
    padding: 0 5px;
    border-radius: 10px;
    background: rgba(0,212,255,0.1);
    font-size: 10px;
    margin-left: 8px;
    color: #00d4ff;
    font-weight: 700;
  }

  /* ── Deliverable bubbles ── */
  .ps-bubbles-wrap {
    margin: 44px 0 0;
  }
  .ps-bubbles-label {
    font-size: 9px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: rgba(0,212,255,0.35);
    margin-bottom: 18px;
    font-family: 'Courier New', monospace;
  }
  .ps-bubbles {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  @media (max-width: 480px) {
    .ps-bubbles { gap: 8px; }
  }

  .ps-bubble {
    position: relative;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 12px 22px;
    border-radius: 100px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.025);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    cursor: pointer;
    transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    font-family: inherit;
  }
  @media (max-width: 480px) {
    .ps-bubble { padding: 10px 15px; gap: 7px; }
  }
  .ps-bubble:hover {
    background: rgba(255,255,255,0.06);
    border-color: rgba(255,255,255,0.2);
    transform: translateY(-2px);
  }
  .ps-bubble:active { transform: translateY(0) scale(0.97); }
  .ps-bubble.active {
    background: rgba(0,212,255,0.1);
    border-color: rgba(0,212,255,0.45);
    box-shadow: 0 0 22px rgba(0,212,255,0.12), inset 0 0 16px rgba(0,212,255,0.04);
  }

  .ps-bubble-icon {
    font-size: 16px;
    line-height: 1;
    flex-shrink: 0;
  }
  @media (max-width: 480px) { .ps-bubble-icon { font-size: 14px; } }

  .ps-bubble-label {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.3px;
    color: rgba(255,255,255,0.6);
    transition: color 0.2s;
    white-space: nowrap;
  }
  @media (max-width: 480px) { .ps-bubble-label { font-size: 11px; } }
  .ps-bubble.active .ps-bubble-label { color: #fff; }

  .ps-bubble-count {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 20px;
    background: rgba(0,212,255,0.12);
    color: rgba(0,212,255,0.8);
    font-family: 'Courier New', monospace;
    flex-shrink: 0;
    min-width: 20px;
    text-align: center;
  }
  .ps-bubble.active .ps-bubble-count {
    background: rgba(0,212,255,0.22);
    color: #00d4ff;
  }

  /* ── Divider ── */
  .ps-divider {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 40px 0 28px;
  }
  .ps-divider-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(0,212,255,0.25), transparent);
  }
  .ps-divider-dot {
    width: 4px; height: 4px;
    border-radius: 50%;
    background: #00d4ff;
    box-shadow: 0 0 8px #00d4ff;
    animation: ps-pulse 2.5s ease-in-out infinite;
    flex-shrink: 0;
  }
  @keyframes ps-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.65); }
  }
  .ps-divider-txt {
    font-size: 9px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: rgba(0,212,255,0.45);
    font-family: 'Courier New', monospace;
    white-space: nowrap;
  }

  /* ── Masonry grid ── */
  .ps-grid {
    columns: 3;
    column-gap: 12px;
  }
  @media (max-width: 1100px) { .ps-grid { columns: 2; } }
  @media (max-width: 580px)  { .ps-grid { columns: 1; } }

  /* ── Card ── */
  .ps-card {
    position: relative;
    break-inside: avoid;
    margin-bottom: 12px;
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    background: #111827;
    border: 1px solid rgba(255,255,255,0.05);
    transition:
      transform 0.28s cubic-bezier(0.4,0,0.2,1),
      box-shadow 0.28s cubic-bezier(0.4,0,0.2,1),
      border-color 0.28s;
    animation: ps-fadein 0.45s ease both;
    -webkit-tap-highlight-color: transparent;
    display: block;
  }
  @media (hover: hover) {
    .ps-card:hover {
      transform: translateY(-5px) scale(1.012);
      box-shadow:
        0 24px 64px rgba(0,0,0,0.55),
        0 0 0 1px rgba(0,212,255,0.12),
        0 0 40px rgba(0,212,255,0.06);
      border-color: rgba(0,212,255,0.3);
      z-index: 5;
    }
  }
  @keyframes ps-fadein {
    from { opacity: 0; transform: translateY(18px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .ps-card img,
  .ps-card video {
    display: block;
    width: 100%;
    height: auto;
    object-fit: cover;
  }

  /* ── Card overlay ── */
  .ps-card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(0,0,0,0.9) 0%,
      rgba(0,0,0,0.25) 45%,
      transparent 100%
    );
    opacity: 0;
    transition: opacity 0.25s;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 14px 16px;
  }
  .ps-card:hover .ps-card-overlay,
  .ps-card:focus .ps-card-overlay { opacity: 1; }

  /* Show overlay on touch devices always */
  @media (hover: none) {
    .ps-card-overlay {
      opacity: 1;
      background: linear-gradient(
        to top,
        rgba(0,0,0,0.7) 0%,
        transparent 50%
      );
    }
  }

  .ps-card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 5px;
  }
  .ps-card-tag {
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 20px;
    border: 1px solid rgba(0,212,255,0.45);
    color: #00d4ff;
    background: rgba(0,0,0,0.35);
    backdrop-filter: blur(4px);
  }
  .ps-card-title {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255,255,255,0.9);
    margin: 0;
    line-height: 1.3;
  }

  /* ── Play badge ── */
  .ps-play-badge {
    position: absolute;
    top: 10px; right: 10px;
    width: 34px; height: 34px;
    border-radius: 50%;
    background: rgba(0,0,0,0.55);
    border: 1px solid rgba(255,255,255,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    backdrop-filter: blur(6px);
  }
  .ps-card:hover .ps-play-badge {
    background: rgba(0,212,255,0.22);
    border-color: #00d4ff;
    box-shadow: 0 0 14px rgba(0,212,255,0.5);
  }
  .ps-play-badge svg { margin-left: 2px; }

  /* ── Lightbox ── */
  .ps-lb-overlay {
    position: fixed;
    inset: 0;
    background: rgba(4,6,12,0.97);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    touch-action: manipulation;
  }
  .ps-lb-close {
    position: absolute;
    top: 16px; right: 16px;
    width: 44px; height: 44px;
    border-radius: 50%;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.12);
    color: #fff;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    z-index: 10;
    font-family: inherit;
  }
  .ps-lb-close:hover { background: rgba(255,255,255,0.14); }
  .ps-lb-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 44px; height: 44px;
    border-radius: 50%;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.12);
    color: #fff;
    font-size: 22px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    z-index: 10;
    font-family: inherit;
  }
  .ps-lb-arrow:hover {
    background: rgba(0,212,255,0.18);
    border-color: rgba(0,212,255,0.5);
  }
  .ps-lb-arrow.prev { left: 16px; }
  .ps-lb-arrow.next { right: 16px; }
  @media (max-width: 640px) {
    .ps-lb-arrow.prev { left: 8px; }
    .ps-lb-arrow.next { right: 8px; }
    .ps-lb-arrow { width: 36px; height: 36px; font-size: 18px; }
  }

  .ps-lb-media {
    max-width: min(88vw, 1280px);
    max-height: 75vh;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 40px 100px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.06);
  }
  @media (max-width: 640px) {
    .ps-lb-media { max-width: 96vw; max-height: 65vh; border-radius: 6px; }
  }
  .ps-lb-media img,
  .ps-lb-media video {
    display: block;
    max-width: 100%;
    max-height: 75vh;
    width: auto; height: auto;
    object-fit: contain;
  }
  @media (max-width: 640px) {
    .ps-lb-media img,
    .ps-lb-media video { max-height: 65vh; }
  }

  .ps-lb-info {
    position: absolute;
    bottom: 88px;
    left: 50%; transform: translateX(-50%);
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 90vw;
  }
  @media (max-width: 640px) { .ps-lb-info { bottom: 76px; } }
  .ps-lb-tag {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 20px;
    border: 1px solid rgba(0,212,255,0.4);
    color: #00d4ff;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(4px);
  }
  .ps-lb-counter {
    position: absolute;
    bottom: 60px;
    left: 50%; transform: translateX(-50%);
    font-size: 10px;
    letter-spacing: 2.5px;
    color: rgba(255,255,255,0.3);
    font-family: 'Courier New', monospace;
    white-space: nowrap;
  }
  @media (max-width: 640px) { .ps-lb-counter { bottom: 50px; } }

  /* Thumbnail strip */
  .ps-lb-thumbs {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    display: flex;
    gap: 4px;
    padding: 10px 16px 12px;
    overflow-x: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(0,212,255,0.3) transparent;
    background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
    justify-content: center;
    -webkit-overflow-scrolling: touch;
  }
  .ps-lb-thumb {
    flex-shrink: 0;
    width: 54px; height: 38px;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    opacity: 0.4;
    border: 1px solid transparent;
    transition: all 0.18s;
  }
  .ps-lb-thumb.active {
    opacity: 1;
    border-color: #00d4ff;
    box-shadow: 0 0 10px rgba(0,212,255,0.5);
  }
  .ps-lb-thumb:hover { opacity: 0.7; }
  .ps-lb-thumb img { width: 100%; height: 100%; object-fit: cover; }

  /* ── Empty state ── */
  .ps-empty {
    text-align: center;
    padding: 100px 20px;
    color: rgba(255,255,255,0.2);
    font-size: 13px;
    letter-spacing: 1px;
    font-family: 'Courier New', monospace;
  }

  /* ── Scan line decoration ── */
  .ps-scanline {
    position: absolute;
    left: 0; right: 0;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(0,212,255,0.35), transparent);
    animation: ps-scan 12s linear infinite;
    pointer-events: none;
    z-index: 1;
    top: 0;
  }
  @keyframes ps-scan {
    from { top: 0; opacity: 0.8; }
    85%  { opacity: 0.8; }
    to   { top: 100%; opacity: 0; }
  }
`;

/* ─── Lightbox ────────────────────────────────────────────────────────────── */
function Lightbox({ items, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx);
  const videoRef      = useRef(null);
  const thumbsRef     = useRef(null);
  const item          = items[idx];
  const isVideo       = item.type === "video";

  const prev = useCallback(
    () => setIdx(i => (i - 1 + items.length) % items.length),
    [items.length],
  );
  const next = useCallback(
    () => setIdx(i => (i + 1) % items.length),
    [items.length],
  );

  /* keyboard nav */
  useEffect(() => {
    const h = (e) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape")     onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [prev, next, onClose]);

  /* auto-play video */
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [idx]);

  /* scroll active thumb into view */
  useEffect(() => {
    if (thumbsRef.current) {
      const active = thumbsRef.current.querySelector(".ps-lb-thumb.active");
      active?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [idx]);

  /* lock body scroll */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  /* shareable deep link — keep ?item= in sync with the open media */
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("item", item.id);
    window.history.replaceState({}, "", url);
  }, [item.id]);
  useEffect(() => () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("item");
    window.history.replaceState({}, "", url);
  }, []);

  return (
    <div className="ps-lb-overlay" onClick={onClose}>
      <button className="ps-lb-close" onClick={onClose} aria-label="Close">✕</button>
      <button
        className="ps-lb-arrow prev"
        onClick={e => { e.stopPropagation(); prev(); }}
        aria-label="Previous"
      >‹</button>
      <button
        className="ps-lb-arrow next"
        onClick={e => { e.stopPropagation(); next(); }}
        aria-label="Next"
      >›</button>

      <div className="ps-lb-media" onClick={e => e.stopPropagation()}>
        {isVideo ? (
          <video ref={videoRef} controls autoPlay playsInline>
            <source src={vSrc(item.id)} type="video/mp4" />
          </video>
        ) : (
          <img src={img(item.id, 1600, 1066)} alt="" loading="lazy" />
        )}
      </div>

      <div className="ps-lb-info">
        {item.tags.map(t => <span key={t} className="ps-lb-tag">{t}</span>)}
      </div>

      <div className="ps-lb-counter">
        {String(idx + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
      </div>

      <div className="ps-lb-thumbs" ref={thumbsRef} onClick={e => e.stopPropagation()}>
        {items.map((it, i) => (
          <div
            key={i}
            className={`ps-lb-thumb${i === idx ? " active" : ""}`}
            onClick={() => setIdx(i)}
          >
            <img
              src={it.type === "video" ? vThumb(it.id, 120, 80) : img(it.id, 120, 80)}
              alt=""
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Video card ──────────────────────────────────────────────────────────── */
function VideoCard({ item, onClick }) {
  const vidRef   = useRef(null);
  const [hov, setHov] = useState(false);

  const enter = () => {
    setHov(true);
    vidRef.current?.play().catch(() => {});
  };
  const leave = () => {
    setHov(false);
    if (vidRef.current) {
      vidRef.current.pause();
      vidRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className="ps-card"
      onMouseEnter={enter}
      onMouseLeave={leave}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onClick()}
    >
      <img
        src={vThumb(item.id)}
        alt=""
        loading="lazy"
        style={{ display: hov ? "none" : "block" }}
        onError={e => { const card = e.target.closest(".ps-card"); if(card) card.style.display="none"; }}
      />
      <video
        ref={vidRef}
        muted
        loop
        playsInline
        preload="none"
        style={{ display: hov ? "block" : "none" }}
        src={vSrc(item.id)}
      />
      <div className="ps-play-badge" aria-hidden="true">
        <svg width="10" height="13" viewBox="0 0 10 13" fill="white">
          <path d="M0 0.5L10 6.5L0 12.5V0.5Z" />
        </svg>
      </div>
      <div className="ps-card-overlay">
        <div className="ps-card-tags">
          {item.tags.map(t => <span key={t} className="ps-card-tag">{t}</span>)}
        </div>
        <p className="ps-card-title">Drone Video</p>
      </div>
    </div>
  );
}

/* ─── Photo card ──────────────────────────────────────────────────────────── */
function PhotoCard({ item, onClick }) {
  return (
    <div
      className="ps-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onClick()}
    >
      <img
        src={img(item.id)}
        alt=""
        loading="lazy"
        onError={e => { const card = e.target.closest(".ps-card"); if(card) card.style.display="none"; }}
      />
      <div className="ps-card-overlay">
        <div className="ps-card-tags">
          {item.tags.map(t => <span key={t} className="ps-card-tag">{t}</span>)}
        </div>
        <p className="ps-card-title">Aerial Photography</p>
      </div>
    </div>
  );
}

/* ─── Deliverable bubble ──────────────────────────────────────────────────── */
function Bubble({ config, count, active, onClick }) {
  return (
    <button
      className={`ps-bubble${active ? " active" : ""}`}
      onClick={onClick}
      style={active ? {
        borderColor: `${config.color}70`,
        boxShadow: `0 0 28px ${config.color}18, inset 0 0 20px ${config.color}07`,
      } : {}}
      aria-pressed={active}
    >
      <span className="ps-bubble-icon" role="img" aria-hidden="true">
        {config.icon}
      </span>
      <span className="ps-bubble-label">{config.label}</span>
      {count != null && (
        <span
          className="ps-bubble-count"
          style={active ? { background: `${config.color}30`, color: config.color } : {}}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/* ─── Main component ──────────────────────────────────────────────────────── */
export default function PortfolioSection() {
  const [cat,    setCat]    = useState("photo"); // "photo" | "video"
  const [filter, setFilter] = useState("All");
  const [lbState, setLbState] = useState(null); // { items, idx }
  const bgVideoRef = useRef(null);

  /* inject CSS once on mount */
  useEffect(() => {
    const id = "ps-v2-styles";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id;
      el.textContent = PORTFOLIO_CSS;
      document.head.appendChild(el);
    }
    return () => document.getElementById("ps-v2-styles")?.remove();
  }, []);

  /* attempt bg video autoplay */
  useEffect(() => {
    bgVideoRef.current?.play().catch(() => {});
  }, []);

  /* deep-linking: /portfolio?item=<cloudinary-id> opens that item directly —
     lets you text/email a client a link straight to a relevant job */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get("item");
    if (!itemId) return;
    const pIdx = PHOTOS.findIndex(x => x.id === itemId);
    if (pIdx >= 0) {
      setCat("photo"); setFilter("All");
      setLbState({ items: PHOTOS.map(x => ({ ...x, type: "photo" })), idx: pIdx });
      return;
    }
    const vIdx = VIDEOS.findIndex(x => x.id === itemId);
    if (vIdx >= 0) {
      setCat("video"); setFilter("All");
      setLbState({ items: VIDEOS.map(x => ({ ...x, type: "video" })), idx: vIdx });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* current data */
  const isPhoto  = cat === "photo";
  const rawItems = useMemo(
    () => (isPhoto ? PHOTOS : VIDEOS).map(x => ({ ...x, type: isPhoto ? "photo" : "video" })),
    [isPhoto],
  );
  const bubbles  = isPhoto ? PHOTO_BUBBLES : VIDEO_BUBBLES;

  /* per-tag counts */
  const counts = useMemo(() => {
    const m = { All: rawItems.length };
    rawItems.forEach(it => it.tags.forEach(t => { m[t] = (m[t] || 0) + 1; }));
    return m;
  }, [rawItems]);

  const filtered = useMemo(
    () => filter === "All" ? rawItems : rawItems.filter(it => it.tags.includes(filter)),
    [rawItems, filter],
  );

  /* switch category → reset filter */
  const switchCat = (c) => { setCat(c); setFilter("All"); };

  /* lightbox */
  const openLb  = useCallback((items, idx) => setLbState({ items, idx }), []);
  const closeLb = useCallback(() => setLbState(null), []);

  const divLabel = `${filtered.length} ${isPhoto ? "photos" : "videos"} · ${filter}`;

  return (
    <div className="ps-wrap">
      <div className="ps-bg" aria-hidden="true" />
      <div className="ps-scanline" aria-hidden="true" />

      {/* ── Hero video banner ── */}
      <div className="ps-hero-banner">
        {/*
          Background loop — once your 720p renders are uploaded to Cloudinary,
          swap "Copy_of_DJI_0939_pcc1dl" for your rendered video's public ID.
        */}
        <video
          ref={bgVideoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={vSrc("Copy_of_DJI_0939_pcc1dl")} type="video/mp4" />
        </video>
        <div className="ps-hero-title-wrap">
          <div className="ps-hero-eyebrow">Seraphic Sight · Portfolio</div>
          <h1 className="ps-hero-h1">
            Aerial <span>Precision</span>,<br />
            Cinematic <span>Vision</span>
          </h1>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="ps-content">

        {/* Category tabs */}
        <div className="ps-tabs" role="tablist" aria-label="Portfolio category">
          {[
            { id: "photo", label: "Aerial Photography", count: PHOTOS.length },
            { id: "video", label: "Drone Video",        count: VIDEOS.length },
          ].map(t => (
            <button
              key={t.id}
              role="tab"
              aria-selected={cat === t.id}
              className={`ps-tab${cat === t.id ? " active" : ""}`}
              onClick={() => switchCat(t.id)}
            >
              {t.label}
              <span className="ps-tab-count">{t.count}</span>
            </button>
          ))}
        </div>

        {/* Deliverable bubbles */}
        <div className="ps-bubbles-wrap">
          <div className="ps-bubbles-label">{"// filter by deliverable type"}</div>
          <div className="ps-bubbles" role="group" aria-label="Filter by deliverable type">
            {bubbles.map(b => (
              <Bubble
                key={b.label}
                config={b}
                count={counts[b.label] ?? 0}
                active={filter === b.label}
                onClick={() => setFilter(b.label)}
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="ps-divider" aria-hidden="true">
          <div className="ps-divider-line" />
          <div className="ps-divider-dot" />
          <div className="ps-divider-txt">{divLabel}</div>
          <div className="ps-divider-dot" />
          <div className="ps-divider-line" />
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="ps-empty">{"// No items match this filter yet."}</div>
        ) : (
          <div className="ps-grid" key={`${cat}::${filter}`}>
            {filtered.map((item, i) =>
              item.type === "video" ? (
                <VideoCard
                  key={item.id}
                  item={item}
                  onClick={() => openLb(filtered, i)}
                />
              ) : (
                <PhotoCard
                  key={item.id}
                  item={item}
                  onClick={() => openLb(filtered, i)}
                />
              )
            )}
          </div>
        )}

      </div>{/* /ps-content */}

      {/* Lightbox */}
      {lbState && (
        <Lightbox
          items={lbState.items}
          startIdx={lbState.idx}
          onClose={closeLb}
        />
      )}
    </div>
  );
}
