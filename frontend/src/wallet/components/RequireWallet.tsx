import React, { useEffect } from "react";
import { useConnection } from "wagmi";
import { useLocation, useNavigate } from "react-router-dom";

export default function RequireWallet({ children }: { children: React.ReactNode }) {
  const { isConnected } = useConnection();
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (!isConnected) {
      nav("/", { replace: true, state: { from: loc.pathname } });
    }
  }, [isConnected, nav, loc.pathname]);

  if (!isConnected) return null; // evita flicker
  return <>{children}</>;
}
