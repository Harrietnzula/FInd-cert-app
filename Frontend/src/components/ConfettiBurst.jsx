import { useEffect, useState } from "react";
import "./ConfettiBurst.css";

const COLORS = ["#8b5cf6", "#60a5fa", "#a78bfa", "#93c5fd", "#38bdf8"];

function ConfettiBurst({ trigger }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!trigger) return;

    const newPieces = Array.from({ length: 12 }, (_, i) => ({
      id: `${trigger}-${i}`,
      angle: (360 / 12) * i,
      color: COLORS[i % COLORS.length],
    }));

    setPieces(newPieces);

    const timeout = setTimeout(() => setPieces([]), 600);
    return () => clearTimeout(timeout);
  }, [trigger]);

  return (
    <div className="confetti-burst">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            "--angle": `${p.angle}deg`,
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
}

export default ConfettiBurst;