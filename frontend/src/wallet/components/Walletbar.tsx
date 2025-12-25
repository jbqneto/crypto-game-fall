import { useState } from "react";
import { useDisconnect, useChainId, useSwitchChain, useConnection } from "wagmi";

import ConnectWalletModal from "./ConnectWalletModal";
import { CHAIN } from "../service/wagmi";

function shortAddr(a?: string) {
  if (!a) return "";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export default function WalletBar() {
  const [open, setOpen] = useState(false);

  const { address, isConnected } = useConnection();
  const { disconnect } = useDisconnect();

  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const wrongChain = isConnected && chainId !== CHAIN.id;

  if (!isConnected) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          style={{
            cursor: "pointer",
            padding: "10px 12px",
            borderRadius: 14,
            border: "1px solid rgba(140,170,255,0.20)",
            background: "rgba(45, 60, 110, 0.75)",
            color: "white",
            fontWeight: 900,
          }}
        >
          Connect Wallet
        </button>

        <ConnectWalletModal open={open} onClose={() => setOpen(false)} />
      </>
    );
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <div
        style={{
          padding: "10px 12px",
          borderRadius: 14,
          border: "1px solid rgba(140,170,255,0.16)",
          background: "rgba(20,26,40,0.65)",
          fontWeight: 900,
          fontSize: 12,
        }}
      >
        {shortAddr(address)}
      </div>

      {wrongChain ? (
        <button
          onClick={() => switchChain({ chainId: CHAIN.id })}
          style={{
            cursor: "pointer",
            padding: "10px 12px",
            borderRadius: 14,
            border: "1px solid rgba(255,140,140,0.25)",
            background: "rgba(90, 20, 20, 0.55)",
            color: "white",
            fontWeight: 900,
            fontSize: 12,
          }}
        >
          Switch to {CHAIN.name}
        </button>
      ) : (
        <div style={{ opacity: 0.7, fontSize: 12 }}>{CHAIN.name}</div>
      )}

      <button
        onClick={() => disconnect()}
        style={{
          cursor: "pointer",
          padding: "10px 12px",
          borderRadius: 14,
          border: "1px solid rgba(140,170,255,0.16)",
          background: "rgba(10,12,22,0.45)",
          color: "white",
          fontWeight: 900,
          fontSize: 12,
        }}
      >
        Disconnect
      </button>
    </div>
  );
}
