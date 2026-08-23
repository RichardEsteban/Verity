"use client";

import { useCallback, useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { DRIP_MATCH_REGISTRY_ABI } from "../contracts/dripMatchRegistryAbi";
import { getContractAddress } from "../contracts/address";

export function useRegistryActions() {
  const { address } = useAccount();
  const contractAddress = getContractAddress();
  const publicClient = usePublicClient();
  const [pendingCreatorId, setPendingCreatorId] = useState<string | null>(
    null
  );
  const [isSending, setIsSending] = useState(false);

  const { writeContractAsync } = useWriteContract();

  const runTx = useCallback(
    async (
      creatorId: string,
      functionName: "subscribeCreator" | "unsubscribeCreator"
    ) => {
      if (!contractAddress || !address) {
        throw new Error("Wallet not connected or contract not configured");
      }
      if (!publicClient) {
        throw new Error("RPC client not ready");
      }
      setPendingCreatorId(creatorId);
      setIsSending(true);
      try {
        const hash = await writeContractAsync({
          address: contractAddress,
          abi: DRIP_MATCH_REGISTRY_ABI,
          functionName,
          args: [creatorId],
        });
        await publicClient.waitForTransactionReceipt({ hash });
        return hash;
      } finally {
        setPendingCreatorId(null);
        setIsSending(false);
      }
    },
    [address, contractAddress, publicClient, writeContractAsync]
  );

  const subscribe = useCallback(
    (creatorId: string) => runTx(creatorId, "subscribeCreator"),
    [runTx]
  );

  const unsubscribe = useCallback(
    (creatorId: string) => runTx(creatorId, "unsubscribeCreator"),
    [runTx]
  );

  return {
    subscribe,
    unsubscribe,
    isSending,
    pendingCreatorId,
  };
}
