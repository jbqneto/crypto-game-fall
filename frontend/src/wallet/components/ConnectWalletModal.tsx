import { useMemo } from "react";
import { useConnect, type Connector } from "wagmi";

type Props = {
  open: boolean;
  onClose: () => void;
};

function connectorLabel(c: Connector) {
  const name = (c.name || "").toLowerCase();

  if (name.includes("walletconnect")) return "WalletConnect";
  if (name.includes("coinbase")) return "Coinbase Wallet";
  if (name.includes("injected")) return "Browser Wallet (MetaMask/Rabby)";
  return c.name;
}

function connectorHint(c: Connector) {
  const name = (c.name || "").toLowerCase();
  if (name.includes("walletconnect")) return "QR / Mobile wallets";
  if (name.includes("coinbase")) return "Good mobile + extension";
  if (name.includes("injected")) return "MetaMask, Rabby, Brave Wallet…";
  return "";
}

function connectorIcon(c: Connector) {
  const name = (c.name || "").toLowerCase();
  if (name.includes("walletconnect")) return "🔗";
  if (name.includes("coinbase")) return "🟦";
  if (name.includes("injected")) return "🦊";
  return "👛";
}

export default function ConnectWalletModal({ open, onClose }: Props) {
  const { connectors, connect, isPending } = useConnect();

  // filtra e ordena do jeito que você quer
  const filtered = useMemo(() => {
    const allowed = connectors.filter((c) => {
      const n = (c.name || "").toLowerCase();
      return n.includes("injected") || n.includes("coinbase") || n.includes("walletconnect");
    });

    const score = (c: Connector) => {
      const n = (c.name || "").toLowerCase();
      if (n.includes("injected")) return 1;
      if (n.includes("coinbase")) return 2;
      if (n.includes("walletconnect")) return 3;
      return 99;
    };

    return allowed.sort((a, b) => score(a) - score(b));
  }, [connectors]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        zIndex: 50,
      }}
    >
      <div
        style={{
          width: "min(560px, 96vw)",
          borderRadius: 18,
          background: "rgba(20, 26, 40, 0.92)",
          border: "1px solid rgba(110, 140, 255, 0.18)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "14px 14px 10px", display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>Connect Wallet</div>
            <div style={{ opacity: 0.7, fontSize: 12 }}>EVM only • Base network</div>
          </div>

          <button
            onClick={onClose}
            style={{
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
        </div>

        <div style={{ padding: 14, display: "grid", gap: 10 }}>
          {filtered.map((c) => {
            const disabled = false;
            const active = true;

            return (
              <button
                key={c.id}
                disabled={disabled}
                onClick={() => connect({ connector: c })}
                style={{
                  cursor: disabled ? "not-allowed" : "pointer",
                  width: "100%",
                  textAlign: "left",
                  padding: 14,
                  borderRadius: 16,
                  border: "1px solid rgba(140,170,255,0.18)",
                  background: active ? "rgba(70, 95, 190, 0.35)" : "rgba(10,12,22,0.45)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  opacity: disabled ? 0.6 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 14,
                      display: "grid",
                      placeItems: "center",
                      background: "rgba(35, 44, 70, 0.65)",
                      border: "1px solid rgba(140,170,255,0.14)",
                      fontSize: 18,
                    }}
                  >
                    {connectorIcon(c)}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <div style={{ fontWeight: 900 }}>{connectorLabel(c)}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>{connectorHint(c)}</div>
                  </div>
                </div>

                <div style={{ fontSize: 12, opacity: 0.75 }}>
                  {active ? "Connecting..." : c.ready ? "→" : "Unavailable"}
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ padding: "0 14px 14px", fontSize: 12, opacity: 0.65, lineHeight: 1.45 }}>
          Se você estiver no mobile, WalletConnect costuma ser a melhor experiência.
        </div>
      </div>
    </div>
  );
}
