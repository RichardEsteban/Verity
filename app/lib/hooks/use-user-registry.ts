"use client";

import { useAccount, useReadContract } from "wagmi";
import { DRIP_MATCH_REGISTRY_ABI } from "../contracts/dripMatchRegistryAbi";
import { getContractAddress } from "../contracts/address";

export type UserRegistry = {
  subscriptions: string[];
};

export function useUserRegistry() {
  const { address, isConnected } = useAccount();
  const contractAddress = getContractAddress();

  const { data, error, isLoading, refetch } = useReadContract({
    address: contractAddress,
    abi: DRIP_MATCH_REGISTRY_ABI,
    functionName: "getSubscriptions",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(isConnected && address && contractAddress),
    },
  });

  const subscriptions = (data as string[] | undefined) ?? [];

  const registry: UserRegistry | undefined =
    isConnected && address && contractAddress
      ? { subscriptions }
      : undefined;

  return {
    registry,
    isLoading,
    isError: Boolean(error),
    mutate: refetch,
    refresh: refetch,
  };
}
