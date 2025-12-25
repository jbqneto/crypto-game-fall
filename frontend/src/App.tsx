import { useEffect, useMemo, useState } from "react";
import "./game/css/hud.css";
import { useImageLoader } from "./game/service/useImageLoader";
import type { GameStatus } from "./game/model/types";
import { GameCanvas } from "./game/components/GameCanvas";

export default function App() {
  const { btc, bomb, ready } = useImageLoader();

  const [nickname, setNickname] = useState("player");
  const [status, setStatus] = useState<GameStatus>("IDLE");
  const [score, setScore] = useState(0);

  const durationSec = 45;

  const [timeLeftSec, setTimeLeftSec] = useState(durationSec);

  // timer regressivo
  useEffect(() => {
    if (status !== "RUNNING") return;

    const startedAt = Date.now();

    const t = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const left = Math.max(0, durationSec - elapsed);
      setTimeLeftSec(left);

      if (left <= 0) {
        window.clearInterval(t);
      }
    }, 200);

    return () => window.clearInterval(t);
  }, [status, durationSec]);

  const start = () => {
    setScore(0);
    setStatus("RUNNING");
  };

  const restart = () => {
    setScore(0);
    setTimeLeftSec(durationSec);
    setStatus("RUNNING");
  };

  const end = () => setStatus("ENDED");

  const canStart = useMemo(() => nickname.trim().length >= 2, [nickname]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 20% 0%, rgba(70, 95, 190, 0.18), rgba(0,0,0,0) 55%), #070911",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        padding: "22px 10px",
      }}
    >
      <div
  style={{
    width: "min(980px, 96vw)",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
  }}
>
  <div style={{ display: "flex", gap: 10, alignItems: "center", flex: "1 1 220px" }}>
    <div style={{ fontWeight: 900, letterSpacing: 0.6 }}>
      CryptoFall <span style={{ opacity: 0.7 }}>Arena</span>
    </div>
    <div style={{ opacity: 0.65, fontSize: 12 }}>local-only • canvas • rAF</div>
  </div>

  <div style={{ display: "flex", gap: 8, alignItems: "center", flex: "1 1 260px", justifyContent: "flex-end" }}>
    <input
      value={nickname}
      onChange={(e) => setNickname(e.target.value)}
      placeholder="Nickname"
      maxLength={16}
      style={{
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(140,170,255,0.18)",
        outline: "none",
        background: "rgba(20,26,40,0.65)",
        color: "white",
        width: "min(220px, 100%)",
        flex: "1 1 160px",
      }}
    />

      {status !== "RUNNING" ? (
        <button className="btn" onClick={start} disabled={!canStart} style={{ flex: "0 0 auto" }}>
          Start
        </button>
      ) : (
        <button className="btn" onClick={() => setStatus("ENDED")} style={{ flex: "0 0 auto" }}>
          Stop
        </button>
      )}
    </div>
  </div>

      <div className="hud">
        <div className="hud-left">
          <div className="avatar" />
          <div className="nick">
            <span>Nickname</span>
            <span>{nickname || "player"}</span>
          </div>
        </div>

        <div className="hud-center">
          <div className="pill">
            <label>Time</label>
            <strong>{timeLeftSec}</strong>
          </div>
        </div>

        <div className="hud-right">
          <div className="stat">
            <label>Score</label>
            <strong>{score}</strong>
          </div>

          {status === "ENDED" && (
            <button className="btn" onClick={restart}>
              Play again
            </button>
          )}
        </div>
      </div>

      <GameCanvas
        status={status}
        durationSec={durationSec}
        timeLeftSec={timeLeftSec}
        nickname={nickname}
        score={score}
        onScoreDelta={(delta) => setScore((s) => Math.max(0, s + delta))}
        onEnd={end}
        btcImg={btc}
        bombImg={bomb}
      />

      <div style={{ width: "min(980px, 96vw)", opacity: 0.7, fontSize: 12, lineHeight: 1.45 }}>
        <div>Regras: BTC +10 • Bomb -15 (overlay vermelho). Item que encosta no chão sem clique desaparece.</div>
        <div>
          Assets: {ready ? "OK" : "loading..."} (se falhar, o jogo usa placeholders).
        </div>
      </div>
    </div>
  );
}
