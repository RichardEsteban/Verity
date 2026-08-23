import { arbitrum, arbitrumSepolia } from "wagmi/chains";

export type NetworkId = "arbitrum-sepolia" | "arbitrum";

export function getActiveNetwork(): NetworkId {
  return process.env.NEXT_PUBLIC_NETWORK === "arbitrum" ||
    process.env.NEXT_PUBLIC_NETWORK === "arbitrum-one"
    ? "arbitrum"
    : "arbitrum-sepolia";
}

export function getExplorerBaseUrl(network?: NetworkId): string {
  const net = network ?? getActiveNetwork();
  return net === "arbitrum"
    ? "https://arbiscan.io"
    : "https://sepolia.arbiscan.io";
}

export function getExplorerUrl(path: string, chainId?: number): string {
  const base =
    chainId === arbitrum.id
      ? getExplorerBaseUrl("arbitrum")
      : getExplorerBaseUrl("arbitrum-sepolia");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function ellipsify(str = "", len = 4): string {
  if (str.length <= len * 2) return str;
  return `${str.slice(0, len)}..${str.slice(-len)}`;
}
