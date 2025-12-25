import { useEffect, useState } from "react";

type Props = {
  id: number;
  open: boolean;
  onClose?: () => void;
};

type ConfettiPiece = {
  id: string;
  leftPct: number;
  delayMs: number;
  durationMs: number;
  sizePx: number;
  rotationDeg: number;
};

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function WinnerOverlay({ id, open, onClose }: Props) {
  const [visible, setVisible] = useState(false);

  const createConfetties = (count: number) => {
    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < count; i++) {
      pieces.push({
        id: `${i}-${id.toString(16).slice(2)}`,
        leftPct: rand(5, 95),
        delayMs: Math.floor(rand(0, 500)),
        durationMs: Math.floor(rand(1200, 1800)),
        sizePx: Math.floor(rand(6, 12)),
        rotationDeg: Math.floor(rand(0, 360)),
      });
    }

    return pieces;
  }

  const confetti = createConfetties(24);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }

    setVisible(true);

    const t = window.setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, 2400);

    return () => window.clearTimeout(t);
  }, [open, onClose]);

  if (!open || !visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 80,
        display: "grid",
        placeItems: "center",
        padding: 12,
      }}
    >
      <div
        style={{
          width: "min(640px, 96vw)",
          borderRadius: 22,
          border: "1px solid rgba(110, 140, 255, 0.20)",
          background: "rgba(20, 26, 40, 0.92)",
          boxShadow: "0 20px 70px rgba(0,0,0,0.65)",
          padding: 18,
          position: "relative",
          overflow: "hidden",
          animation: "cfaWinnerPop 420ms ease-out",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: 0.4 }}>
          Congratulations! 🏆
        </div>
        <div style={{ opacity: 0.75, fontSize: 12, marginTop: 6, lineHeight: 1.4 }}>
          You finished in 1st place. That was clean.
        </div>

        <div
          style={{
            marginTop: 12,
            display: "inline-flex",
            gap: 10,
            alignItems: "center",
            padding: "10px 12px",
            borderRadius: 14,
            border: "1px solid rgba(140,170,255,0.14)",
            background: "rgba(10,12,22,0.45)",
            fontWeight: 900,
            fontSize: 12,
          }}
        >
          <span style={{ opacity: 0.7 }}>Reward:</span>
          <span>+ bragging rights</span>
        </div>

        {/* Confetti */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {confetti.map((p) => (
            <div
              key={p.id}
              style={{
                position: "absolute",
                top: -20,
                left: `${p.leftPct}%`,
                width: p.sizePx,
                height: p.sizePx * 1.4,
                borderRadius: 6,
                background: "rgba(140,170,255,0.85)",
                transform: `rotate(${p.rotationDeg}deg)`,
                animation: `cfaConfettiFall ${p.durationMs}ms ease-in forwards`,
                animationDelay: `${p.delayMs}ms`,
                filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.35))",
                opacity: 0.95,
              }}
            />
          ))}
        </div>

        <button
          onClick={onClose}
          style={{
            position: "absolute",
            right: 12,
            top: 12,
            cursor: "pointer",
            padding: "8px 10px",
            borderRadius: 12,
            border: "1px solid rgba(140,170,255,0.16)",
            background: "rgba(10,12,22,0.45)",
            color: "white",
            fontWeight: 900,
          }}
        >
          ✕
        </button>

        <style>{`
          @keyframes cfaWinnerPop {
            0% { transform: translateY(8px) scale(0.98); opacity: 0; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
          }

          @keyframes cfaConfettiFall {
            0% { transform: translateY(0) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            100% { transform: translateY(520px) rotate(520deg); opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}
