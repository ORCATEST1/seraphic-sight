import React from "react";

const CITY_COSTS = {
  Madrid: { lodging: 90, transit: 21, food: 68, activities: 38 },
  Barcelona: { lodging: 106, transit: 22, food: 67, activities: 38 },
  Lisbon: { lodging: 73, transit: 29, food: 85, activities: 28 },
  Marrakech: { lodging: 57, transit: 13, food: 28, activities: 11 },
  Ibiza: { lodging: 214, transit: 61, food: 129, activities: 38 },
};

const ROUTES = {
  "Madrid + Barcelona": {
    cities: ["Madrid", "Barcelona"],
    intercity: 95,
    label: "Madrid → Barcelona",
    vibe: "Best for 1 week",
    note: "Football, nightlife, beach, and almost no wasted travel time.",
  },
  "Madrid + Barcelona + Lisbon": {
    cities: ["Madrid", "Barcelona", "Lisbon"],
    intercity: 275,
    label: "Madrid → Barcelona → Lisbon",
    vibe: "Best overall",
    note: "The default: three major cities, strong nightlife, and enough variety without rushing.",
  },
  "Madrid + Barcelona + Lisbon + Marrakech": {
    cities: ["Madrid", "Barcelona", "Lisbon", "Marrakech"],
    intercity: 430,
    label: "Madrid → Barcelona → Lisbon → Marrakech",
    vibe: "Best for 3 weeks",
    note: "Adds Morocco and a completely different leg while keeping the core Iberian trip.",
  },
  "Madrid + Barcelona + Ibiza + Lisbon": {
    cities: ["Madrid", "Barcelona", "Ibiza", "Lisbon"],
    intercity: 450,
    label: "Madrid → Barcelona → Ibiza → Lisbon",
    vibe: "Party route",
    note: "Nightlife-first option. Ibiza is the biggest budget jump in the model.",
  },
};

const STYLES = {
  Smart: { lodging: 0.75, transit: 0.70, food: 0.65, activities: 0.60, misc: 12, tagline: "More pregame, fewer bottle-service decisions." },
  Solid: { lodging: 0.90, transit: 0.80, food: 0.80, activities: 1.00, misc: 18, tagline: "Comfortable trip without pretending we're rich." },
  "Full Send": { lodging: 1.25, transit: 1.10, food: 1.15, activities: 2.20, misc: 30, tagline: "Better stays, bigger nights, less checking the bank app." },
};

const SOURCES = [
  {
    title: "2030 World Cup hosts",
    detail: "Spain, Portugal and Morocco host the main tournament; centenary matches are also planned in South America.",
    source: "FIFA",
    url: "https://www.fifa.com/en/tournaments/mens/worldcup/articles/world-cup-2030-hosts-qualified-bidding-spain-argentina-morocco-uruguay-portugal-paraguay",
  },
  {
    title: "Madrid traveler costs",
    detail: "2026 traveler-spending averages used for lodging, food, transportation and entertainment.",
    source: "Budget Your Trip",
    url: "https://www.budgetyourtrip.com/spain/madrid",
  },
  {
    title: "Barcelona traveler costs",
    detail: "2026 traveler-spending averages used for lodging, food, transportation and entertainment.",
    source: "Budget Your Trip",
    url: "https://www.budgetyourtrip.com/spain/barcelona",
  },
  {
    title: "Lisbon traveler costs",
    detail: "2026 traveler-spending averages used for lodging, food, transportation and entertainment.",
    source: "Budget Your Trip",
    url: "https://www.budgetyourtrip.com/portugal/lisbon",
  },
  {
    title: "Marrakech traveler costs",
    detail: "2026 traveler-spending averages used for lodging, food, transportation and entertainment.",
    source: "Budget Your Trip",
    url: "https://www.budgetyourtrip.com/morocco/marrakech",
  },
  {
    title: "Ibiza traveler costs",
    detail: "Used to show the real premium of adding a party-island leg.",
    source: "Budget Your Trip",
    url: "https://www.budgetyourtrip.com/spain/ibiza/trip-cost-2516479",
  },
  {
    title: "LAX → Europe airfare anchor",
    detail: "Current June round-trip fare history was used to set a conservative $1,300 planning target.",
    source: "Google Flights",
    url: "https://www.google.com/travel/flights/flights-from-los-angeles-to-madrid.html",
  },
  {
    title: "World Cup ticket history",
    detail: "Historical face-value pricing informs the $300/game planning placeholder; it is not a 2030 ticket quote.",
    source: "FIFA",
    url: "https://img.fifa.com/image/upload/ims6xizmb8oiptjn2eoh.pdf",
  },
];

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function averageRoute(routeKey) {
  const route = ROUTES[routeKey];
  const totals = route.cities.reduce(
    (acc, city) => {
      const c = CITY_COSTS[city];
      acc.lodging += c.lodging;
      acc.transit += c.transit;
      acc.food += c.food;
      acc.activities += c.activities;
      return acc;
    },
    { lodging: 0, transit: 0, food: 0, activities: 0 }
  );
  const n = route.cities.length;
  return {
    lodging: totals.lodging / n,
    transit: totals.transit / n,
    food: totals.food / n,
    activities: totals.activities / n,
  };
}

function calculate({ weeks, routeKey, styleKey, games }) {
  const days = weeks * 7;
  const nights = days;
  const route = ROUTES[routeKey];
  const avg = averageRoute(routeKey);
  const style = STYLES[styleKey];

  const inflation = Math.pow(1.03, 4);
  const worldCupLodgingPremium = 1.20;
  const airfare = 1300;
  const admin = 100;
  const ticketPerGame = 300;

  const lodging = avg.lodging * inflation * worldCupLodgingPremium * style.lodging * nights;
  const intercity = route.intercity * inflation;
  const localTransit = avg.transit * inflation * style.transit * days;
  const hard = airfare + lodging + intercity + localTransit + admin;

  const tickets = games * ticketPerGame;
  const food = avg.food * inflation * style.food * days;
  const activities = avg.activities * inflation * style.activities * days;
  const misc = style.misc * days;
  const flexibleBeforeBuffer = food + activities + misc;
  const contingency = (hard + tickets + flexibleBeforeBuffer) * 0.05;
  const soft = flexibleBeforeBuffer + contingency;
  const total = hard + tickets + soft;

  return {
    days, nights, airfare, lodging, intercity, localTransit, admin, hard,
    tickets, food, activities, misc, contingency, soft, total,
    commitment: hard + tickets,
  };
}

function Segmented({ value, values, onChange, format = v => v }) {
  return (
    <div className="wc-segmented">
      {values.map(v => (
        <button
          key={v}
          type="button"
          className={value === v ? "active" : ""}
          onClick={() => onChange(v)}
        >
          {format(v)}
        </button>
      ))}
    </div>
  );
}

function Stepper({ value, min, max, step = 1, onChange, suffix = "" }) {
  return (
    <div className="wc-stepper">
      <button type="button" onClick={() => onChange(Math.max(min, value - step))} aria-label="Decrease">−</button>
      <div><strong>{value}</strong><span>{suffix}</span></div>
      <button type="button" onClick={() => onChange(Math.min(max, value + step))} aria-label="Increase">+</button>
    </div>
  );
}

function CostRow({ label, value, type, note }) {
  return (
    <div className="wc-cost-row">
      <div>
        <div className="wc-cost-label">{label}</div>
        <div className={"wc-pill " + (type === "HARD" ? "hard" : type === "TICKET" ? "ticket" : "soft")}>{type}</div>
      </div>
      <div className="wc-cost-value">{currency.format(value)}</div>
      <div className="wc-cost-note">{note}</div>
    </div>
  );
}

export default function WorldCup2030() {
  const [groupSize, setGroupSize] = React.useState(6);
  const [weeks, setWeeks] = React.useState(2);
  const [routeKey, setRouteKey] = React.useState("Madrid + Barcelona + Lisbon");
  const [styleKey, setStyleKey] = React.useState("Solid");
  const [games, setGames] = React.useState(1);
  const [months, setMonths] = React.useState(44);
  const [mapCity, setMapCity] = React.useState("Madrid");

  React.useEffect(() => {
    document.title = "World Cup 2030 Boys Trip";
    const route = ROUTES[routeKey];
    if (!route.cities.includes(mapCity)) setMapCity(route.cities[0]);
  }, [routeKey, mapCity]);

  const result = React.useMemo(
    () => calculate({ weeks, routeKey, styleKey, games }),
    [weeks, routeKey, styleKey, games]
  );

  const scenario = [1, 2, 3].map(w => ({ weeks: w, ...calculate({ weeks: w, routeKey, styleKey, games }) }));
  const route = ROUTES[routeKey];
  const monthly = result.total / months;
  const groupTotal = result.total * groupSize;
  const slices = [
    { label: "Hard", value: result.hard, color: "#39a0ff" },
    { label: "Tickets", value: result.tickets, color: "#ffc857" },
    { label: "Flexible", value: result.soft, color: "#2fd6a2" },
  ];
  let cursor = 0;
  const gradient = slices.map(s => {
    const start = cursor;
    cursor += (s.value / result.total) * 100;
    return `${s.color} ${start}% ${cursor}%`;
  }).join(", ");

  const recommended = weeks === 1 ? "Madrid + Barcelona" : weeks === 2 ? "Madrid + Barcelona + Lisbon" : "Madrid + Barcelona + Lisbon + Marrakech";

  const share = async () => {
    const data = { title: "World Cup 2030 Boys Trip", text: `${weeks} weeks • ${route.label} • ${currency.format(result.total)}/person`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied.");
      }
    } catch (_) {}
  };

  const fullRouteUrl = "https://www.google.com/maps/dir/" + route.cities.map(c => encodeURIComponent(c)).join("/");

  return (
    <main className="wc30">
      <style>{`
        :root { color-scheme: dark; }
        .wc30 { min-height:100vh; background:
          radial-gradient(circle at 85% 8%, rgba(37,123,255,.23), transparent 30%),
          radial-gradient(circle at 10% 30%, rgba(47,214,162,.10), transparent 25%),
          #07101d; color:#f6f9ff; font-family:Inter,DM Sans,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; padding-bottom:80px; }
        .wc-shell { width:min(1120px, calc(100% - 28px)); margin:0 auto; }
        .wc-hero { padding:28px 0 18px; }
        .wc-topline { display:flex; justify-content:space-between; align-items:center; gap:16px; }
        .wc-kicker { color:#74b9ff; font-weight:800; font-size:12px; letter-spacing:.15em; text-transform:uppercase; }
        .wc-share { border:1px solid rgba(255,255,255,.16); background:rgba(255,255,255,.07); color:#fff; padding:10px 14px; border-radius:14px; font-weight:800; cursor:pointer; }
        .wc-title { margin:16px 0 10px; max-width:830px; font-size:clamp(38px,8vw,76px); line-height:.95; letter-spacing:-.055em; }
        .wc-title span { color:#4fa7ff; }
        .wc-sub { color:#aebbd0; font-size:clamp(15px,2.5vw,19px); line-height:1.55; max-width:760px; }
        .wc-chips { display:flex; gap:8px; overflow:auto; padding:16px 0 4px; scrollbar-width:none; }
        .wc-chips::-webkit-scrollbar { display:none; }
        .wc-chip { white-space:nowrap; padding:8px 11px; border-radius:999px; border:1px solid rgba(255,255,255,.10); color:#bdc9d9; font-size:12px; background:rgba(255,255,255,.035); }
        .wc-grid { display:grid; grid-template-columns:1.05fr .95fr; gap:18px; }
        .wc-card { background:linear-gradient(180deg,rgba(16,30,50,.94),rgba(10,22,38,.94)); border:1px solid rgba(255,255,255,.08); border-radius:24px; box-shadow:0 18px 55px rgba(0,0,0,.22); }
        .wc-card-pad { padding:20px; }
        .wc-section-title { font-size:18px; font-weight:900; letter-spacing:-.02em; margin-bottom:4px; }
        .wc-muted { color:#8595aa; font-size:13px; line-height:1.45; }
        .wc-control { margin-top:18px; }
        .wc-label { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:8px; color:#cbd6e5; font-weight:800; font-size:13px; }
        .wc-label small { color:#6f8097; font-weight:600; }
        .wc-segmented { display:grid; grid-auto-flow:column; grid-auto-columns:1fr; gap:6px; padding:5px; background:#07111f; border:1px solid rgba(255,255,255,.08); border-radius:14px; }
        .wc-segmented button { appearance:none; border:0; border-radius:10px; background:transparent; color:#8293aa; padding:10px 7px; font:inherit; font-size:13px; font-weight:900; cursor:pointer; }
        .wc-segmented button.active { color:#08111d; background:#63b4ff; box-shadow:0 4px 18px rgba(79,167,255,.2); }
        .wc-stepper { display:grid; grid-template-columns:48px 1fr 48px; align-items:center; border:1px solid rgba(255,255,255,.10); border-radius:14px; overflow:hidden; background:#07111f; }
        .wc-stepper button { height:48px; border:0; background:rgba(255,255,255,.04); color:#fff; font-size:24px; cursor:pointer; }
        .wc-stepper div { text-align:center; display:flex; justify-content:center; gap:5px; align-items:baseline; }
        .wc-stepper strong { font-size:18px; }
        .wc-stepper span { color:#708097; font-size:12px; }
        .wc-select { width:100%; padding:13px 42px 13px 13px; color:#f6f9ff; background:#07111f; border:1px solid rgba(255,255,255,.1); border-radius:14px; font:inherit; font-weight:750; }
        .wc-style-note { margin-top:7px; color:#718198; font-size:12px; }
        .wc-route-note { margin-top:10px; display:flex; gap:8px; align-items:flex-start; padding:11px 12px; border-radius:13px; background:rgba(79,167,255,.08); color:#aebbd0; font-size:12px; line-height:1.4; }
        .wc-route-note strong { color:#7fc0ff; }
        .wc-hero-number { padding:22px; position:sticky; top:14px; }
        .wc-total-label { color:#85a0bd; font-size:12px; font-weight:900; letter-spacing:.12em; text-transform:uppercase; }
        .wc-total { font-size:clamp(48px,10vw,78px); font-weight:950; letter-spacing:-.06em; line-height:1; margin:7px 0; }
        .wc-per { color:#6f8198; font-size:13px; }
        .wc-kpis { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:18px; }
        .wc-kpi { border-radius:16px; padding:14px; background:rgba(255,255,255,.045); border:1px solid rgba(255,255,255,.07); }
        .wc-kpi span { display:block; color:#7f8fa6; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; }
        .wc-kpi strong { display:block; font-size:22px; margin-top:4px; letter-spacing:-.03em; }
        .wc-kpi.blue strong { color:#70bcff; }
        .wc-kpi.green strong { color:#43ddb0; }
        .wc-donut-wrap { display:grid; grid-template-columns:118px 1fr; align-items:center; gap:18px; margin-top:20px; }
        .wc-donut { width:118px; aspect-ratio:1; border-radius:50%; display:grid; place-items:center; position:relative; }
        .wc-donut:after { content:""; width:72%; aspect-ratio:1; border-radius:50%; background:#0b1728; position:absolute; }
        .wc-donut-center { z-index:1; text-align:center; }
        .wc-donut-center strong { display:block; font-size:17px; }
        .wc-donut-center span { color:#71839a; font-size:10px; }
        .wc-legend { display:grid; gap:8px; }
        .wc-legend-row { display:grid; grid-template-columns:10px 1fr auto; gap:9px; align-items:center; color:#9cacbf; font-size:12px; }
        .wc-dot { width:9px; height:9px; border-radius:50%; }
        .wc-legend-row strong { color:#f3f7fb; }
        .wc-block { margin-top:18px; }
        .wc-block-head { display:flex; justify-content:space-between; align-items:end; margin-bottom:10px; gap:15px; }
        .wc-scenarios { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
        .wc-scenario { padding:16px; border-radius:18px; background:rgba(255,255,255,.035); border:1px solid rgba(255,255,255,.07); }
        .wc-scenario.current { border-color:rgba(79,167,255,.55); background:rgba(79,167,255,.09); }
        .wc-scenario .week { color:#8293aa; font-size:11px; font-weight:900; text-transform:uppercase; letter-spacing:.08em; }
        .wc-scenario .price { font-size:25px; font-weight:950; margin:4px 0 3px; letter-spacing:-.04em; }
        .wc-scenario .save { color:#738399; font-size:11px; }
        .wc-cost-list { overflow:hidden; }
        .wc-cost-row { display:grid; grid-template-columns:1fr auto; gap:3px 12px; padding:14px 0; border-bottom:1px solid rgba(255,255,255,.065); }
        .wc-cost-row:last-child { border-bottom:0; }
        .wc-cost-row > div:first-child { display:flex; align-items:center; flex-wrap:wrap; gap:7px; }
        .wc-cost-label { font-weight:850; font-size:14px; }
        .wc-cost-value { font-weight:950; font-size:15px; text-align:right; }
        .wc-cost-note { grid-column:1/-1; color:#6f8095; font-size:11px; }
        .wc-pill { font-size:9px; font-weight:950; letter-spacing:.08em; padding:4px 7px; border-radius:999px; }
        .wc-pill.hard { color:#69b7ff; background:rgba(57,160,255,.12); }
        .wc-pill.ticket { color:#ffd579; background:rgba(255,200,87,.12); }
        .wc-pill.soft { color:#56ddb4; background:rgba(47,214,162,.12); }
        .wc-map { overflow:hidden; }
        .wc-map-top { display:flex; gap:7px; padding:14px 14px 0; overflow:auto; scrollbar-width:none; }
        .wc-map-top::-webkit-scrollbar { display:none; }
        .wc-map-btn { white-space:nowrap; border:1px solid rgba(255,255,255,.09); background:#0b1727; color:#8697ad; border-radius:999px; padding:8px 11px; font:inherit; font-size:11px; font-weight:850; cursor:pointer; }
        .wc-map-btn.active { color:#06101d; background:#4fa7ff; }
        .wc-map iframe { width:100%; height:310px; border:0; margin-top:12px; filter:saturate(.9) contrast(1.03); }
        .wc-map-foot { display:flex; justify-content:space-between; align-items:center; padding:13px 15px 15px; gap:12px; }
        .wc-map-foot div { color:#8090a6; font-size:12px; }
        .wc-link { color:#79bdff; text-decoration:none; font-weight:900; font-size:12px; }
        .wc-truth { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .wc-truth-card { border-radius:18px; padding:17px; border:1px solid rgba(255,255,255,.07); }
        .wc-truth-card.hard { background:rgba(57,160,255,.07); }
        .wc-truth-card.soft { background:rgba(47,214,162,.07); }
        .wc-truth-card h3 { margin:0 0 8px; font-size:14px; }
        .wc-truth-card p { color:#8596ab; font-size:12px; line-height:1.55; margin:0; }
        .wc-source details { border-top:1px solid rgba(255,255,255,.07); padding:13px 0; }
        .wc-source summary { cursor:pointer; list-style:none; display:flex; justify-content:space-between; gap:10px; font-size:13px; font-weight:850; }
        .wc-source summary::-webkit-details-marker { display:none; }
        .wc-source p { color:#7f90a6; font-size:12px; line-height:1.55; margin:9px 0 7px; }
        .wc-source a { color:#77bcff; font-size:11px; font-weight:850; text-decoration:none; }
        .wc-footnote { margin-top:12px; color:#6c7d92; font-size:11px; line-height:1.55; }
        @media (max-width:760px) {
          .wc-shell { width:min(100% - 20px, 600px); }
          .wc-hero { padding-top:18px; }
          .wc-title { margin-top:14px; }
          .wc-grid { grid-template-columns:1fr; }
          .wc-hero-number { position:static; }
          .wc-scenarios { grid-template-columns:1fr; }
          .wc-scenario { display:grid; grid-template-columns:1fr auto; align-items:center; }
          .wc-scenario .save { grid-column:1/-1; }
          .wc-donut-wrap { grid-template-columns:104px 1fr; }
          .wc-donut { width:104px; }
          .wc-truth { grid-template-columns:1fr; }
          .wc-map iframe { height:250px; }
          .wc-card { border-radius:20px; }
          .wc-card-pad { padding:17px; }
          .wc-topline { align-items:flex-start; }
        }
      `}</style>

      <div className="wc-shell">
        <header className="wc-hero">
          <div className="wc-topline">
            <div className="wc-kicker">2030 • Spain / Portugal / Morocco</div>
            <button className="wc-share" onClick={share}>Share ↗</button>
          </div>
          <h1 className="wc-title">The <span>World Cup</span> boys trip.</h1>
          <p className="wc-sub">
            Pick the time, route, spending level and match count. The number updates instantly.
            The goal is the World Cup atmosphere first — actual match tickets are optional.
          </p>
          <div className="wc-chips">
            <div className="wc-chip">✈️ LAX departure model</div>
            <div className="wc-chip">⚽ 0–3 matches</div>
            <div className="wc-chip">🗓️ 1–3 weeks</div>
            <div className="wc-chip">👥 2–12 guys</div>
            <div className="wc-chip">📱 Built for phones</div>
          </div>
        </header>

        <section className="wc-grid">
          <div className="wc-card wc-card-pad">
            <div className="wc-section-title">Build the trip</div>
            <div className="wc-muted">Six choices. Everything else is automatic.</div>

            <div className="wc-control">
              <div className="wc-label"><span>Guys going</span><small>group total scales automatically</small></div>
              <Stepper value={groupSize} min={2} max={12} onChange={setGroupSize} suffix="guys" />
            </div>

            <div className="wc-control">
              <div className="wc-label"><span>Trip length</span><small>{weeks * 7} days</small></div>
              <Segmented value={weeks} values={[1,2,3]} onChange={setWeeks} format={v => `${v} wk`} />
            </div>

            <div className="wc-control">
              <div className="wc-label"><span>Route</span><small>{route.vibe}</small></div>
              <select className="wc-select" value={routeKey} onChange={e => setRouteKey(e.target.value)}>
                {Object.keys(ROUTES).map(key => <option key={key}>{key}</option>)}
              </select>
              <div className="wc-route-note">
                <span>💡</span>
                <div><strong>{routeKey === recommended ? "Good match for this trip length." : `For ${weeks} week${weeks > 1 ? "s" : ""}, I'd normally use ${recommended}.`}</strong> {route.note}</div>
              </div>
            </div>

            <div className="wc-control">
              <div className="wc-label"><span>Spending style</span><small>biggest control over soft costs</small></div>
              <Segmented value={styleKey} values={["Smart","Solid","Full Send"]} onChange={setStyleKey} />
              <div className="wc-style-note">{STYLES[styleKey].tagline}</div>
            </div>

            <div className="wc-control">
              <div className="wc-label"><span>World Cup games</span><small>per person</small></div>
              <Segmented value={games} values={[0,1,2,3]} onChange={setGames} format={v => v === 0 ? "None" : v} />
            </div>

            <div className="wc-control">
              <div className="wc-label"><span>Savings runway</span><small>monthly target</small></div>
              <Stepper value={months} min={12} max={48} step={2} onChange={setMonths} suffix="months" />
            </div>
          </div>

          <aside className="wc-card wc-hero-number">
            <div className="wc-total-label">All-in target</div>
            <div className="wc-total">{currency.format(result.total)}</div>
            <div className="wc-per">per person • {weeks * 7} days • {games} match{games === 1 ? "" : "es"}</div>

            <div className="wc-kpis">
              <div className="wc-kpi blue"><span>Must commit</span><strong>{currency.format(result.commitment)}</strong></div>
              <div className="wc-kpi green"><span>Flex money</span><strong>{currency.format(result.soft)}</strong></div>
              <div className="wc-kpi"><span>Group total</span><strong>{currency.format(groupTotal)}</strong></div>
              <div className="wc-kpi"><span>Save / month</span><strong>{currency.format(monthly)}</strong></div>
            </div>

            <div className="wc-donut-wrap">
              <div className="wc-donut" style={{ background:`conic-gradient(${gradient})` }}>
                <div className="wc-donut-center"><strong>{currency.format(result.total)}</strong><span>all in</span></div>
              </div>
              <div className="wc-legend">
                {slices.map(s => (
                  <div className="wc-legend-row" key={s.label}>
                    <div className="wc-dot" style={{background:s.color}} />
                    <span>{s.label}</span>
                    <strong>{currency.format(s.value)}</strong>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="wc-block">
          <div className="wc-block-head">
            <div>
              <div className="wc-section-title">1 vs 2 vs 3 weeks</div>
              <div className="wc-muted">Same route, style and match count so you can see what extra time really costs.</div>
            </div>
          </div>
          <div className="wc-scenarios">
            {scenario.map(s => (
              <button type="button" key={s.weeks} className={"wc-scenario " + (weeks === s.weeks ? "current" : "")} onClick={() => setWeeks(s.weeks)} style={{textAlign:"left",color:"inherit",font:"inherit",cursor:"pointer"}}>
                <div className="week">{s.weeks} week{s.weeks > 1 ? "s" : ""}</div>
                <div className="price">{currency.format(s.total)}</div>
                <div className="save">{currency.format(s.total / months)}/month over {months} months</div>
              </button>
            ))}
          </div>
        </section>

        <section className="wc-grid wc-block">
          <div className="wc-card wc-card-pad">
            <div className="wc-section-title">Where the money goes</div>
            <div className="wc-muted">Hard costs are the stuff that gets you there. Soft costs are where you can make the trip cheaper.</div>
            <div className="wc-cost-list">
              <CostRow label="International airfare" value={result.airfare} type="HARD" note="2030 planning target from current June LAX → Europe fare history." />
              <CostRow label="Lodging" value={result.lodging} type="HARD" note="City averages × inflation × World Cup lodging premium × spending style." />
              <CostRow label="Intercity travel" value={result.intercity} type="HARD" note="Train / short-haul flight allowance between route stops." />
              <CostRow label="Local transit" value={result.localTransit} type="HARD" note="Metro, rideshare and normal city movement." />
              <CostRow label="Insurance + eSIM" value={result.admin} type="HARD" note="Small fixed travel-admin allowance." />
              <CostRow label="World Cup tickets" value={result.tickets} type="TICKET" note="$300/game planning placeholder. Set games to zero if atmosphere > stadium seats." />
              <CostRow label="Food" value={result.food} type="SOFT" note="Scales heavily with Smart / Solid / Full Send." />
              <CostRow label="Activities + nightlife" value={result.activities} type="SOFT" note="This is intentionally the biggest flex lever." />
              <CostRow label="Misc. spending" value={result.misc} type="SOFT" note="Coffee, late-night food, random group decisions." />
              <CostRow label="5% cushion" value={result.contingency} type="SOFT" note="Protects the plan without pretending we can forecast 2030 exactly." />
            </div>
          </div>

          <div>
            <div className="wc-card wc-map">
              <div className="wc-map-top">
                {route.cities.map(city => (
                  <button type="button" key={city} className={"wc-map-btn " + (mapCity === city ? "active" : "")} onClick={() => setMapCity(city)}>{city}</button>
                ))}
              </div>
              <iframe title={`Map of ${mapCity}`} loading="lazy" src={`https://www.google.com/maps?q=${encodeURIComponent(mapCity)}&output=embed`} />
              <div className="wc-map-foot">
                <div>{route.label}</div>
                <a className="wc-link" href={fullRouteUrl} target="_blank" rel="noreferrer">Open full route ↗</a>
              </div>
            </div>

            <div className="wc-truth wc-block">
              <div className="wc-truth-card hard">
                <h3>🔒 Money that makes the trip happen</h3>
                <p><strong style={{color:"#8bc9ff"}}>{currency.format(result.commitment)}</strong> per person covers the hard travel costs plus the selected match tickets. This is the number the group should treat as the real commitment threshold.</p>
              </div>
              <div className="wc-truth-card soft">
                <h3>🎛️ Money you can control</h3>
                <p><strong style={{color:"#62e2bb"}}>{currency.format(result.soft)}</strong> is food, activities, nightlife, misc. and buffer. If someone's budget gets tight, cut here before killing the trip.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="wc-card wc-card-pad wc-block wc-source">
          <div className="wc-section-title">How these numbers were built</div>
          <div className="wc-muted">Everything is in this page so there is no second spreadsheet to reconcile.</div>
          <div className="wc-footnote">
            Base travel data is 2026. The model compounds it at 3% annually through 2030 and applies a 20% event premium to lodging only. Airfare is held at a conservative $1,300 planning target and match tickets at $300/game. Those are planning assumptions, not quoted 2030 prices.
          </div>
          <div style={{marginTop:10}}>
            {SOURCES.map((s, i) => (
              <details key={s.title} open={i === 0}>
                <summary><span>{s.title}</span><span style={{color:"#61738a"}}>＋</span></summary>
                <p>{s.detail}</p>
                <a href={s.url} target="_blank" rel="noreferrer">{s.source} ↗</a>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
