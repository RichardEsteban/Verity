import type { Address } from "viem";

export function getContractAddress(): Address | undefined {
  const raw = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!raw || !raw.startsWith("0x")) return undefined;
  return raw as Address;
}
