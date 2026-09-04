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
            <path d="M17 10v19.5a5.5 5.5 0 1 1-2-4.2V10h2Z" fill="currentColor" />
            <path d="M17 10h13v4H17zM30 12v15.5a5.5 5.5 0 1 1-2-4.2V12h2Z" fill="currentColor" />
          </svg>
        </div>
        <h1 className="splash-wordmark">
          Riffs
        </h1>
        <p className="splash-tagline">Find your next live moment</p>
      </div>
    </div>
  );
}

export default Splash;