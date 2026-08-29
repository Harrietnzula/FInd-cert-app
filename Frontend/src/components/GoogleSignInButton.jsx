import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./GoogleSignInButton.css";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCRIPT_ID = "google-identity-services";

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    if (document.getElementById(SCRIPT_ID)) {
      document.getElementById(SCRIPT_ID).addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Sign-In"));
    document.body.appendChild(script);
  });
}

function GoogleSignInButton() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const buttonRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!CLIENT_ID) return; // not configured — component renders nothing below

    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !buttonRef.current) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: async (response) => {
            try {
              await loginWithGoogle(response.credential);
              navigate("/");
            } catch {
              setError("Google sign-in failed. Please try again.");
            }
          },
        });
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "filled_black",
          size: "large",
          shape: "pill",
          width: 280,
        });
      })
      .catch(() => setError("Couldn't load Google sign-in."));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!CLIENT_ID) return null;

  return (
    <div className="google-signin-wrap">
      <div className="auth-divider"><span>or</span></div>
      <div ref={buttonRef} className="google-signin-btn" />
      {error && <p className="auth-error">{error}</p>}
    </div>
  );
}

export default GoogleSignInButton;
