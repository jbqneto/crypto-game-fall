import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useImageLoader } from "../game/service/useImageLoader";
import type { GameStatus } from "../game/model/types";
import { GameCanvas } from "../game/components/GameCanvas";

const STORAGE_KEY = "cfa_single_config_v1";

type SingleConfig = {
  nickname: string;
  durationSec: number;
};

function loadConfig(): SingleConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { nickname: "player", durationSec: 45 };
    const parsed = JSON.parse(raw) as SingleConfig;
    return {
      nickname: (parsed.nickname || "player").slice(0, 16),
      durationSec: [30, 45, 60].includes(parsed.durationSec) ? parsed.durationSec : 45,
    };
  } catch {
    return { nickname: "player", durationSec: 45 };
  }
}

export default function SinglePlayer() {
  const nav = useNavigate();
  const { btc, bomb, ready } = useImageLoader();

  const cfg = loadConfig();

  const [nickname] = useState(cfg.nickname);
  const [durationSec] = useState(cfg.durationSec);

  const [status, setStatus] = useState<GameStatus>("RUNNING");
  const [score, setScore] = useState(0);
  const [timeLeftSec, setTimeLeftSec] = useState(durationSec);

  useEffect(() => {
    if (status !== "RUNNING") return;

    const startedAt = Date.now();

    const t = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const left = Math.max(0, durationSec - elapsed);
      setTimeLeftSec(left);
      if (left <= 0) window.clearInterval(t);
    }, 200);

    return () => window.clearInterval(t);
  }, [status, durationSec]);

  const restart = () => {
    setScore(0);
    setStatus("RUNNING");
  };

  const end = () => setStatus("ENDED");

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 20% 0%, rgba(70, 95, 190, 0.18), rgba(0,0,0,0) 55%), #070911",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        padding: "22px 10px",
      }}
    >
      <div style={{ width: "min(980px, 96vw)", display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => nav("/")}
            style={{
              cursor: "pointer",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(140,170,255,0.18)",
              background: "rgba(20,26,40,0.65)",
              color: "white",
              fontWeight: 900,
            }}
          >
            ← Home
          </button>

          <div style={{ fontWeight: 900, letterSpacing: 0.6 }}>
            Single Player <span style={{ opacity: 0.7 }}>({durationSec}s)</span>
          </div>
        </div>

        <div style={{ opacity: 0.7, fontSize: 12 }}>
          Assets: {ready ? "OK" : "loading..."}
        </div>
      </div>

      <div className="hud">
        <div className="hud-left">
          <div className="avatar" />
          <div className="nick">
            <span>Nickname</span>
            <span>{nickname}</span>
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

          {status === "ENDED" ? (
            <button className="btn" onClick={restart}>Play again</button>
          ) : (
            <button className="btn" onClick={() => setStatus("ENDED")}>Stop</button>
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
    </div>
  );
}
