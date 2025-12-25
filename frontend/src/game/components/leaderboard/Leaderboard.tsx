import { useMemo } from "react";
import type { Player } from "../../model/types";
import PlayerRow from "./PlayerRow";

type Props = {
  players: Player[];
  myAddress: string;
};

function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function Leaderboard({ players, myAddress }: Props) {
  const sorted = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score);
  }, [players]);

  return (
    <div
      style={{
        borderRadius: 18,
        padding: 12,
        background: "rgba(20,26,40,0.72)",
        border: "1px solid rgba(110,140,255,0.18)",
        height: "fit-content",
      }}
    >
      <div style={{ fontWeight: 900 }}>Leaderboard</div>

      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map((p, index) => (
          <PlayerRow
            key={p.id}
            player={p}
            rank={index + 1}
            isMe={p.id === myAddress}
            shortAddress={shortAddress}
          />
        ))}
      </div>
    </div>
  );
}

export type { Player };
