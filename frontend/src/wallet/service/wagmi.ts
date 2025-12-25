import { createConfig, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";

const network = import.meta.env.VITE_NETWORK as "base" | "baseSepolia";
const wcProjectId = import.meta.env.VITE_WC_PROJECT_ID as string;

export const CHAIN = network === "base" ? base : baseSepolia;

export const wagmiConfig = createConfig({
  chains: [CHAIN],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    coinbaseWallet({
      appName: "CryptoFall Arena",
    }),
    walletConnect({
      projectId: wcProjectId,
      showQrModal: true
    }),
  ],
  transports: {
    8453: http(), // Base mainnet
    84532: http(), // Base Sepolia
  },
});
