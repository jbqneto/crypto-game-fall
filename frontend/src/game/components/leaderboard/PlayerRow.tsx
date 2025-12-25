import type { Player } from "../../model/types";


type Props = {
  player: Player;
  rank: number;
  isMe: boolean;
  shortAddress: (address: string) => string;
};

export default function PlayerRow({ player, rank, isMe, shortAddress }: Props) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px",
        borderRadius: 14,
        border: "1px solid rgba(140,170,255,0.14)",
        background: isMe ? "rgba(70,95,190,0.22)" : "rgba(10,12,22,0.45)",
      }}
    >
      <div>
        <div style={{ fontWeight: 900, fontSize: 13 }}>
          #{rank} {player.nickname} {player.isHost ? "★" : ""}
        </div>
        <div style={{ opacity: 0.7, fontSize: 11 }}>{shortAddress(player.id)}</div>
      </div>

      <div style={{ fontWeight: 900 }}>{player.score}</div>
    </div>
  );
}
