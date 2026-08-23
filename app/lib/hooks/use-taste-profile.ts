"use client";

import useSWR from "swr";
import { useAccount, useChainId } from "wagmi";
import { fetchNFTs } from "../nfts/fetchNFTs";
import { buildTasteProfile, type TasteProfile } from "../nfts/tasteProfile";

export function useTasteProfile() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const { data, error, isLoading, mutate } = useSWR(
    isConnected && address ? (["taste-profile", chainId, address] as const) : null,
    async ([, , owner]) => {
      const nfts = await fetchNFTs(owner);
      return buildTasteProfile(nfts);
    },
    { revalidateOnFocus: false }
  );

  return {
    tasteProfile: data as TasteProfile | undefined,
    isLoading,
    isError: Boolean(error),
    error,
    refresh: mutate,
  };
}
