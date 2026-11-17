import React from "react";

// Optional anti-bot challenge. Do not activate without a matching public
// REACT_APP_TURNSTILE_SITE_KEY and server CONTACT_REQUIRE_TURNSTILE=true.
// A site key is public; TURNSTILE_SECRET_KEY must remain server-only.
export default function TurnstileField({ onToken }) {
  const siteKey = process.env.REACT_APP_TURNSTILE_SITE_KEY;
  const containerRef = React.useRef(null);
  const onTokenRef = React.useRef(onToken);
  onTokenRef.current = onToken;
  const [loadError, setLoadError] = React.useState(false);

  React.useEffect(() => {
    if (!siteKey) return undefined;
    let active = true;
    let widgetId;
    let script;
    let poll;
    const render = () => {
      if (!active || !window.turnstile || !containerRef.current || widgetId !== undefined) return;
      try {
        widgetId = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: token => { if (active) onTokenRef.current(token); },
          "expired-callback": () => { if (active) onTokenRef.current(""); },
          "error-callback": () => { if (active) { onTokenRef.current(""); setLoadError(true); } },
        });
      } catch { if (active) setLoadError(true); }
    };
    if (window.turnstile) {
      render();
    } else {
      script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = render;
      script.onerror = () => { if (active) setLoadError(true); };
      document.head.appendChild(script);
    }
    return () => {
      active = false;
      if (widgetId !== undefined && window.turnstile) {
        try { window.turnstile.remove(widgetId); } catch {}
      }
      if (poll) clearTimeout(poll);
      if (script) script.remove();
    };
  }, [siteKey]);

  if (!siteKey) return null;
  return <div aria-label="Human verification" style={{ minHeight: 70 }}>
    <div ref={containerRef}/>
    {loadError && <p role="alert" style={{ color: "#FF8888", fontSize: 13 }}>
      Verification is unavailable. Please reload this page or email us directly.
    </p>}
  </div>;
}
