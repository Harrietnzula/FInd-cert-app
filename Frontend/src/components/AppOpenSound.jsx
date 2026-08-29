import { useEffect } from "react";

function playDing() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return false;
  const context = new AudioContext();
  if (context.state === "suspended") {
    context.close();
    return false;
  }
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(659.25, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(987.77, context.currentTime + 0.16);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.28);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.3);
  oscillator.addEventListener("ended", () => context.close());
  return true;
}

function AppOpenSound() {
  useEffect(() => {
    let played = false;
    const playOnce = () => {
      if (played) return;
      if (playDing()) {
        played = true;
        window.removeEventListener("pointerdown", playOnce);
        window.removeEventListener("keydown", playOnce);
      }
    };
    playOnce();
    window.addEventListener("pointerdown", playOnce);
    window.addEventListener("keydown", playOnce);
    return () => {
      window.removeEventListener("pointerdown", playOnce);
      window.removeEventListener("keydown", playOnce);
    };
  }, []);

  return null;
}

export default AppOpenSound;