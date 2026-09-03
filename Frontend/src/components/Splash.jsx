import { useEffect, useState } from "react";
import "./Splash.css";

function Splash({ onFinish }) {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadingOut(true), 1800);

    const removeTimer = setTimeout(() => onFinish(), 2450);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onFinish]);

  return (
    <div className={`splash ${fadingOut ? "splash-fade-out" : ""}`}>
      <div className="splash-spotlight splash-spotlight-left" aria-hidden="true" />
      <div className="splash-spotlight splash-spotlight-right" aria-hidden="true" />
      <div className="splash-stars" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="splash-content">
        <div className="splash-icon-shell">
          <span className="splash-icon-ring splash-icon-ring-one" aria-hidden="true" />
          <span className="splash-icon-ring splash-icon-ring-two" aria-hidden="true" />
          <svg
            className="splash-icon"
            width="64"
            height="64"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 20C6 20 12 14 20 14C28 14 34 20 34 20" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            <path d="M6 20C6 20 12 26 20 26C28 26 34 20 34 20" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            <ellipse cx="20" cy="20" rx="6" ry="14" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            <ellipse cx="20" cy="20" rx="14" ry="6" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            <circle cx="15" cy="14" r="1.3" fill="currentColor" />
            <circle cx="24" cy="12" r="1" fill="currentColor" />
          </svg>
        </div>
        <h1 className="splash-wordmark">
          Find<span>Cert</span>
        </h1>
        <p className="splash-tagline">Find your next live moment</p>
      </div>
    </div>
  );
}

export default Splash;