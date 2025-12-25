import React from "react";
import WalletBar from "../wallet/components/Walletbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 20% 0%, rgba(70, 95, 190, 0.18), rgba(0,0,0,0) 55%), #070911",
        color: "white",
        padding: "18px 12px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "min(980px, 96vw)", display: "flex", flexDirection: "column", gap: 12 }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: 0.6 }}>
              CryptoFall <span style={{ opacity: 0.7 }}>Arena</span>
            </div>
            <div style={{ opacity: 0.65, fontSize: 12 }}>Base Sepolia now • mainnet later</div>
          </div>

          <WalletBar />
        </header>

        {children}
      </div>
    </div>
  );
}
