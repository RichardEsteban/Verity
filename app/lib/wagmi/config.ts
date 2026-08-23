"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { arbitrum, arbitrumSepolia } from "wagmi/chains";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

const sepoliaRpc =
  process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL ??
  "https://sepolia-rollup.arbitrum.io/rpc";

const mainnetRpc =
  process.env.NEXT_PUBLIC_ARBITRUM_MAINNET_RPC_URL ??
  "https://arb1.arbitrum.io/rpc";

const isSepolia =
  process.env.NEXT_PUBLIC_NETWORK !== "arbitrum" &&
  process.env.NEXT_PUBLIC_NETWORK !== "arbitrum-one";

export const defaultChain = isSepolia ? arbitrumSepolia : arbitrum;

export const wagmiConfig = getDefaultConfig({
  appName: "DRiP Match",
  projectId: walletConnectProjectId || "00000000000000000000000000000000",
  chains: [arbitrumSepolia, arbitrum],
  ssr: true,
  transports: {
    [arbitrumSepolia.id]: http(sepoliaRpc),
    [arbitrum.id]: http(mainnetRpc),
  },
});
