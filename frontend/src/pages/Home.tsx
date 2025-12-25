import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConnection } from "wagmi";

type SingleConfig = {
  nickname: string;
  durationSec: number;
};

const STORAGE_KEY = "cfa_single_config_v1";

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

function saveConfig(cfg: SingleConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
}

export default function Home() {
  const nav = useNavigate();
  const initial = useMemo(() => loadConfig(), []);

  const [nickname, setNickname] = useState(initial.nickname);
  const [durationSec, setDurationSec] = useState(initial.durationSec);
  const { isConnected } = useConnection();

  const canStart = nickname.trim().length >= 2 && isConnected;

  const startSingle = () => {
    const cfg = { nickname: nickname.trim(), durationSec };
    saveConfig(cfg);
    nav("/single");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 20% 0%, rgba(70, 95, 190, 0.18), rgba(0,0,0,0) 55%), #070911",
        color: "white",
        padding: "24px 12px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "min(980px, 96vw)", display: "flex", flexDirection: "column", gap: 14 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div style={{ opacity: 0.7, fontSize: 12 }}>v0.1</div>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 12,
          }}
        >
          {/* SINGLE */}
          <div
            style={{
              borderRadius: 18,
              padding: 14,
              background: "rgba(20, 26, 40, 0.72)",
              border: "1px solid rgba(110, 140, 255, 0.18)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
              <div style={{ fontWeight: 900, fontSize: 16 }}>Single Player</div>
              <div style={{ opacity: 0.7, fontSize: 12 }}>play now</div>
            </div>

            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontSize: 12, opacity: 0.75 }}>Nickname</label>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={16}
                placeholder="player"
                style={{
                  padding: "12px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(140,170,255,0.18)",
                  outline: "none",
                  background: "rgba(10,12,22,0.55)",
                  color: "white",
                }}
              />

              <label style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>Duration</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[30, 45, 60].map((s) => (
                  <button
                    key={s}
                    onClick={() => setDurationSec(s)}
                    style={{
                      cursor: "pointer",
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid rgba(140,170,255,0.18)",
                      background: durationSec === s ? "rgba(45, 60, 110, 0.85)" : "rgba(10,12,22,0.55)",
                      color: "white",
                      fontWeight: 800,
                      flex: "1 0 70px",
                    }}
                  >
                    {s}s
                  </button>
                ))}
              </div>

              <button
                onClick={startSingle}
                disabled={!canStart}
                style={{
                  marginTop: 8,
                  cursor: canStart ? "pointer" : "not-allowed",
                  padding: "12px 12px",
                  borderRadius: 14,
                  border: "1px solid rgba(140,170,255,0.22)",
                  background: canStart ? "rgba(70, 95, 190, 0.9)" : "rgba(70, 95, 190, 0.35)",
                  color: "white",
                  fontWeight: 900,
                }}
              >
                Start
              </button>

              <div style={{ opacity: 0.65, fontSize: 12, lineHeight: 1.45 }}>
                Click BTC (+10). Click Bomb (-15 + red overlay). Everything local.
              </div>
            </div>
          </div>

          {/* MULTI (placeholder) */}
          <div
            style={{
              borderRadius: 18,
              padding: 14,
              background: "rgba(20, 26, 40, 0.45)",
              border: "1px dashed rgba(110, 140, 255, 0.20)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
              <div style={{ fontWeight: 900, fontSize: 16 }}>Multiplayer</div>
              <div style={{ opacity: 0.7, fontSize: 12 }}>coming soon</div>
            </div>

            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                disabled
                style={{
                  padding: "12px 12px",
                  borderRadius: 14,
                  border: "1px solid rgba(140,170,255,0.18)",
                  background: "rgba(10,12,22,0.45)",
                  color: "rgba(255,255,255,0.55)",
                  fontWeight: 900,
                }}
              >
                Connect wallet (Base)
              </button>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  disabled
                  style={{
                    flex: 1,
                    padding: "12px 12px",
                    borderRadius: 14,
                    border: "1px solid rgba(140,170,255,0.18)",
                    background: "rgba(10,12,22,0.45)",
                    color: "rgba(255,255,255,0.55)",
                    fontWeight: 900,
                  }}
                >
                  Create room
                </button>

                <button
                  disabled
                  style={{
                    flex: 1,
                    padding: "12px 12px",
                    borderRadius: 14,
                    border: "1px solid rgba(140,170,255,0.18)",
                    background: "rgba(10,12,22,0.45)",
                    color: "rgba(255,255,255,0.55)",
                    fontWeight: 900,
                  }}
                >
                  Join room
                </button>
              </div>

              <div style={{ opacity: 0.65, fontSize: 12, lineHeight: 1.45 }}>
                Depois você pluga backend + rooms reais + wallet login. UI já vai estar pronta.
              </div>
            </div>
          </div>
        </div>

        <footer style={{ opacity: 0.65, fontSize: 12 }}>
          Dica: no single player você valida animação, hitbox e UX sem travar no multiplayer.
        </footer>
      </div>
    </div>
  );
}
