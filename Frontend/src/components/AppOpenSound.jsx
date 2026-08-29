import { useEffect, useState } from "react";
import "./AppOpenSound.css";

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
  const secondOscillator = context.createOscillator();
  const secondGain = context.createGain();
  oscillator.type = "sine";
  secondOscillator.type = "sine";
  oscillator.frequency.setValueAtTime(783.99, context.currentTime);
  secondOscillator.frequency.setValueAtTime(1046.5, context.currentTime + 0.08);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  secondGain.gain.setValueAtTime(0.0001, context.currentTime + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.06, context.currentTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.22);
  secondGain.gain.exponentialRampToValueAtTime(0.045, context.currentTime + 0.095);
  secondGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.34);
  oscillator.connect(gain).connect(context.destination);
  secondOscillator.connect(secondGain).connect(context.destination);
  oscillator.start();
  secondOscillator.start(context.currentTime + 0.08);
  oscillator.stop(context.currentTime + 0.24);
  secondOscillator.stop(context.currentTime + 0.36);
  secondOscillator.addEventListener("ended", () => context.close());
  return true;
}

function AppOpenSound() {
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  useEffect(() => {
    if (!playDing()) setAutoplayBlocked(true);
  }, []);

  if (!autoplayBlocked) return null;

  return (
    <button
      className="app-sound-enable"
      onClick={() => {
        if (playDing()) setAutoplayBlocked(false);
      }}
      aria-label="Enable startup sound"
    >
      Enable sound
    </button>
  );
}

export default AppOpenSound;