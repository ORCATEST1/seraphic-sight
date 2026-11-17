import React from "react";
import { Link } from "react-router-dom";
import "./ServiceAreaMap.css";

const AREAS = [
  { id:"la", name:"Los Angeles", region:"Los Angeles County", lat:34.0522,lng:-118.2437, cities:"Los Angeles · Long Beach · Pasadena · Pomona · Santa Clarita", description:"Property marketing and construction documentation throughout the Los Angeles area; access and travel confirmed per project." },
  { id:"oc", name:"Orange County", region:"Orange County", lat:33.7455,lng:-117.8677,cities:"Anaheim · Santa Ana · Irvine · Fullerton · Costa Mesa",description:"Real estate, commercial sites, and development photography across Orange County." },
  { id:"ie", name:"Inland Empire", region:"Riverside & San Bernardino", lat:34.0695,lng:-117.2898,cities:"Riverside · San Bernardino · Ontario · Rancho Cucamonga · Corona",description:"Construction progress, large parcels, and commercial-property imagery across the Inland Empire." },
  { id:"temecula",name:"Temecula",region:"Southwest Riverside",lat:33.4936,lng:-117.1484,cities:"Temecula · Murrieta · Menifee · Lake Elsinore",description:"Estate marketing, land, residential development, and project documentation in southwest Riverside County." },
  { id:"desert",name:"Palm Springs",region:"Coachella Valley",lat:33.8303,lng:-116.5453,cities:"Palm Springs · Palm Desert · La Quinta · Indio",description:"Architectural, resort, and desert-property aerial photography, subject to site conditions and flight approvals." },
  { id:"high",name:"High Desert",region:"High Desert",lat:34.5361,lng:-117.2928,cities:"Victorville · Hesperia · Apple Valley · Barstow",description:"Expansive land parcels, site documentation, and development photography." },
  { id:"sd",name:"San Diego",region:"San Diego County",lat:32.7157,lng:-117.1611,cities:"San Diego · Oceanside · Carlsbad · Escondido · Chula Vista",description:"Aerial property marketing, multifamily listings, and commercial-project documentation." },
  { id:"kern",name:"Bakersfield",region:"Southern Central Valley",lat:35.3733,lng:-119.0187,cities:"Bakersfield · Delano · Porterville · Visalia · Tulare",description:"Select southern Central Valley assignments by appointment; travel and timing quoted per project." }
];

let leafletPromise;
function loadLeaflet(){
  if(typeof window==="undefined") return Promise.reject(new Error("Map is browser only"));
  if(window.L) return Promise.resolve(window.L);
  if(leafletPromise) return leafletPromise;
  leafletPromise=new Promise((resolve,reject)=>{
    if(!document.querySelector('[data-ss-leaflet-css]')){
      const css=document.createElement("link");
      css.rel="stylesheet";
      css.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      css.integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoT6sBRCmZ9gIyw=";
      css.crossOrigin="";
      css.dataset.ssLeafletCss="true";
      document.head.appendChild(css);
    }
    const script=document.createElement("script");
    script.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin="";
    script.async=true;
    script.onload=()=>window.L?resolve(window.L):reject(new Error("Map library unavailable"));
    script.onerror=()=>reject(new Error("Map library unavailable"));
    document.head.appendChild(script);
  }).catch(err=>{leafletPromise=null;throw err});
  return leafletPromise;
}
const markerHTML='<span class="ss-map-dot" aria-hidden="true"></span>';
export default function ServiceAreaMap(){
  const [selected,setSelected]=React.useState("la");
  const [mapReady,setMapReady]=React.useState(false);
  const [mapFailed,setMapFailed]=React.useState(false);
  const container=React.useRef(null);
  const mapRef=React.useRef(null);
  const markersRef=React.useRef({});
  const active=AREAS.find(a=>a.id===selected)||AREAS[0];

  React.useEffect(()=>{
    let cancelled=false;
    loadLeaflet().then(L=>{
      if(cancelled||!container.current)return;
      const map=L.map(container.current,{scrollWheelZoom:false,zoomControl:true,attributionControl:true});
      mapRef.current=map;
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",{
        maxZoom:17,
        attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>'
      }).addTo(map);
      const bounds=L.latLngBounds([]);
      AREAS.forEach(area=>{
        const marker=L.marker([area.lat,area.lng],{
          icon:L.divIcon({className:"ss-location-pin",html:markerHTML,iconSize:[28,28],iconAnchor:[14,14]}),
          title:area.region,
          alt:area.region,
          keyboard:true
        }).addTo(map);
        marker.on("click",()=>setSelected(area.id));
        markersRef.current[area.id]=marker;
        bounds.extend([area.lat,area.lng]);
      });
      map.fitBounds(bounds.pad(.2),{animate:false,maxZoom:8});
      L.control.scale({imperial:true,metric:false}).addTo(map);
      setMapReady(true);
    }).catch(()=>{if(!cancelled)setMapFailed(true)});
    return ()=>{cancelled=true;if(mapRef.current){mapRef.current.remove();mapRef.current=null;markersRef.current={}}};
  },[]);
  React.useEffect(()=>{
    const map=mapRef.current;
    if(!map)return;
    Object.entries(markersRef.current).forEach(([id,marker])=>{
      const el=marker.getElement();
      if(el)el.classList.toggle("ss-location-pin-active",id===selected);
    });
  },[selected,mapReady]);

  return <main className="ss-service-area">
    <header className="ss-area-intro">
      <p className="ss-eyebrow">SERVICE AREA / SOUTHERN CALIFORNIA</p>
      <h1>On site. Across<br/>the region.</h1>
      <div className="ss-area-lede"><p>From Los Angeles and San Diego to the desert and southern Central Valley, we travel to the places your project needs us. Explore common service areas below.</p><Link to="/contact?type=construction" className="ss-link-arrow">DISCUSS A LOCATION <span aria-hidden="true">↗</span></Link></div>
    </header>
    <section className="ss-map-section" aria-label="Interactive regional service map">
      <div className="ss-map-column">
        <div className="ss-map-top"><span>SELECT A REGION</span><span>MAP / CALIFORNIA</span></div>
        <div className="ss-map-canvas-shell">
          <div ref={container} className="ss-map-canvas" role="region" aria-label="Interactive map with clickable service-region locations"/>
          {!mapReady&&!mapFailed&&<div className="ss-map-notice" role="status">Loading regional map…</div>}
          {mapFailed&&<div className="ss-map-notice" role="status">Map tiles are unavailable. Select a region from the list to see coverage details.</div>}
        </div>
        <p className="ss-map-disclaimer">Markers represent service hubs, not guaranteed flight zones or fixed travel boundaries. Availability depends on airspace, site access, weather, and project scope.</p>
      </div>
      <div className="ss-map-aside">
        <div className="ss-region-list" aria-label="Choose coverage region">
          {AREAS.map((a,i)=><button key={a.id} type="button" className={"ss-region-tab"+(selected===a.id?" is-selected":"")} aria-pressed={selected===a.id} onClick={()=>{setSelected(a.id);mapRef.current?.flyTo([a.lat,a.lng],Math.max(mapRef.current.getZoom(),8),{duration:.5});}}><span className="ss-region-index">{String(i+1).padStart(2,"0")}</span><span>{a.region}</span><span aria-hidden="true">↗</span></button>)}
        </div>
        <div className="ss-region-detail" aria-live="polite">
          <p className="ss-eyebrow">REGION IN FOCUS</p>
          <h2>{active.region}</h2>
          <p className="ss-region-cities">{active.cities}</p>
          <p>{active.description}</p>
          <Link to="/contact" className="ss-link-arrow">REQUEST COVERAGE CONFIRMATION <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </section>
    <section className="ss-travel-note"><div><p className="ss-eyebrow">PLANNING A SHOOT</p><h2>Travel is part<br/>of the scope.</h2></div><div><p>Our published travel rate is <strong>$0.70 per mile</strong>. For shorter jobs (under 50 miles), mileage is calculated round-trip; for trips of 50 miles or more, mileage is calculated one-way. We confirm the final fee and scheduling before you commit.</p><p>Outside the highlighted hubs? Send the address or APN and we'll confirm whether the site is within our working range.</p><Link to="/contact" className="ss-link-arrow">REQUEST A QUOTE <span aria-hidden="true">↗</span></Link></div></section>
  </main>;
}
