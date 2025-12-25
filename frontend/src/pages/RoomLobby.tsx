import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAccount } from "wagmi";

import { useImageLoader } from "../game/service/useImageLoader";
import type { GameStatus, Player } from "../game/model/types";
import { GameCanvas } from "../game/components/GameCanvas";
import Leaderboard from "../game/components/leaderboard/Leaderboard";
import WinnerOverlay from "../game/components/WinnerOverlay";

/**
 * Multiplayer room phases (mocked)
 */
type RoomPhase = "LOBBY" | "IN_GAME" | "ENDED";

/**
 * Utility: shorten wallet address
 */
function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/**
 * Utility: generate deterministic fake addresses for mock players
 */
function mockAddress(seed: number): string {
  const hex = "0123456789abcdef";
  let addr = "0x";
  for (let i = 0; i < 40; i++) {
    addr += hex[(i * 7 + seed * 13) % 16];
  }
  return addr;
}

export default function RoomLobby() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { address } = useAccount();

  const { btc, bomb } = useImageLoader();

  // This screen is protected by RequireWallet, address should always exist
  const myAddress = address as string;

  const GAME_DURATION_SEC = 45;

  const [phase, setPhase] = useState<RoomPhase>("LOBBY");
  const [gameStatus, setGameStatus] = useState<GameStatus>("IDLE");
  const [timeLeftSec, setTimeLeftSec] = useState(GAME_DURATION_SEC);
  const [showWinner, setShowWinner] = useState(false);
  const [winnerOverlayId] = useState<number>(() => Math.random());

  /**
   * Players state (mocked)
   * First player is always the host (you)
   */
  const [players, setPlayers] = useState<Player[]>([
    {
      id: myAddress,
      nickname: "You",
      score: 0,
      isHost: true,
    },
  ]);

  const me = useMemo(
    () => players.find((p) => p.id === myAddress),
    [players, myAddress]
  );

  const isHost = !!me?.isHost;
  const slotsLabel = `${players.length}/4`;

  function computeMyRank(players: Player[], myAddress: string): number | null {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    const idx = sorted.findIndex((p) => p.id === myAddress);
    return idx === -1 ? null : idx + 1;
  }

  /**
   * Mock: automatically add players to the lobby
   */
  useEffect(() => {
    if (phase !== "LOBBY") return;

    const interval = window.setInterval(() => {
      setPlayers((prev) => {
        if (prev.length >= 4) return prev;

        const index = prev.length + 1;

        return [
          ...prev,
          {
            id: mockAddress(index),
            nickname: `Player ${index}`,
            score: 0,
            isHost: false,
          },
        ];
      });
    }, 1200);

    return () => window.clearInterval(interval);
  }, [phase]);

  /**
   * Game countdown timer
   */
  useEffect(() => {
    if (phase !== "IN_GAME") return;

    const startedAt = Date.now();

    const interval = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, GAME_DURATION_SEC - elapsed);
      setTimeLeftSec(remaining);

      if (remaining <= 0) {
        window.clearInterval(interval);
        setPhase("ENDED");
        setGameStatus("ENDED");
      }
    }, 200);

    return () => window.clearInterval(interval);
  }, [phase]);

  /**
   * Mock: simulate other players scoring while game is running
   */
  useEffect(() => {
    if (phase !== "IN_GAME") return;

    const interval = window.setInterval(() => {
      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id === myAddress) return p;

          const delta = Math.random() < 0.75 ? 10 : -15;
          return {
            ...p,
            score: Math.max(0, p.score + delta),
          };
        })
      );
    }, 650);

    return () => window.clearInterval(interval);
  }, [phase, myAddress]);

  useEffect(() => {
    if (phase !== "ENDED") return;

    const rank = computeMyRank(players, myAddress);
    if (rank === 1) {
      const timeoutId = window.setTimeout(() => setShowWinner(true), 500);
      return () => window.clearTimeout(timeoutId);
    }
  }, [phase, players, myAddress]);

  /**
   * Host-only: start the game
   */
  function startGame() {
    setPhase("IN_GAME");
    setGameStatus("RUNNING");
  }

  /**
   * Stop game (mock)
   */
  function exitGame() {
    setPhase("ENDED");
    setGameStatus("ENDED");
  }

  /**
   * Update local player score (called by GameCanvas)
   */
  function handleMyScoreDelta(delta: number) {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === myAddress
          ? { ...p, score: Math.max(0, p.score + delta) }
          : p
      )
    );
  }

  /**
   * Copy room link to clipboard
   */
  function copyRoomLink() {
    navigator.clipboard?.writeText(window.location.href);
  }

  const canStartGame = phase === "LOBBY" && isHost && players.length === 4;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Top bar */}
      <div
        style={{
          width: "min(980px, 96vw)",
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => navigate("/")}
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

          <div style={{ fontWeight: 900 }}>
            Room <span style={{ opacity: 0.7 }}>{roomId}</span>
          </div>

          <div style={{ opacity: 0.7, fontSize: 12 }}>
            {shortAddress(myAddress)} • {slotsLabel}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={copyRoomLink}
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
            Copy link
          </button>

          {phase === "LOBBY" ? (
            <button
              disabled={!canStartGame}
              onClick={startGame}
              style={{
                cursor: canStartGame ? "pointer" : "not-allowed",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(140,170,255,0.18)",
                background: canStartGame
                  ? "rgba(70, 95, 190, 0.9)"
                  : "rgba(70, 95, 190, 0.35)",
                color: "white",
                fontWeight: 900,
              }}
            >
              Start
            </button>
          ) : (
            <button
              onClick={exitGame}
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
              Exit
            </button>
          )}
        </div>
      </div>

      {/* HUD (same visual language as single player) */}
      <div className="hud">
        <div className="hud-left">
          <div className="avatar" />
          <div className="nick">
            <span>Wallet</span>
            <span>{shortAddress(myAddress)}</span>
          </div>
        </div>

        <div className="hud-center">
          <div className="pill">
            <label>Time</label>
            <strong>{phase === "IN_GAME" ? timeLeftSec : "—"}</strong>
          </div>
        </div>

        <div className="hud-right">
          <div className="stat">
            <label>Your score</label>
            <strong>{me?.score ?? 0}</strong>
          </div>
          <div className="stat">
            <label>Players</label>
            <strong>{slotsLabel}</strong>
          </div>
        </div>
      </div>

      {/* Main area: game + leaderboard */}
      <div
        className="room-grid"
        style={{
          width: "min(980px, 96vw)",
          display: "grid",
          gridTemplateColumns: "1fr minmax(220px, 280px)",
          gap: 12,
        }}
      >
        {/* Left side */}
        <div>
          {phase === "LOBBY" ? (
            <div
              style={{
                borderRadius: 18,
                padding: 14,
                background: "rgba(20,26,40,0.72)",
                border: "1px solid rgba(110,140,255,0.18)",
              }}
            >
              <div style={{ fontWeight: 900 }}>Waiting for players…</div>
              <div style={{ opacity: 0.7, fontSize: 12, marginTop: 6 }}>
                Host can start when room is full (4/4).
              </div>
            </div>
          ) : (
            <GameCanvas
              status={gameStatus}
              durationSec={GAME_DURATION_SEC}
              timeLeftSec={timeLeftSec}
              nickname="You"
              score={me?.score ?? 0}
              onScoreDelta={handleMyScoreDelta}
              onEnd={() => {
                setPhase("ENDED");
                setGameStatus("ENDED");
              }}
              btcImg={btc}
              bombImg={bomb}
            />
          )}
        </div>

        {/* Leaderboard */}
        <Leaderboard players={players} myAddress={myAddress} />
      </div>

      <WinnerOverlay id={winnerOverlayId} open={showWinner} onClose={() => setShowWinner(false)} />

      {/* Responsive fallback */}
      <style>{`
        @media (max-width: 760px) {
          .room-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
