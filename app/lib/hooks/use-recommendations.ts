"use client";

import { useMemo } from "react";
import {
  resolveCreatorsFromPortfolio,
  CREATOR_CATALOG,
} from "../creators/catalog";
import {
  rankCreatorsForUser,
  type RecommendedCreator,
} from "../recommendations/score-creators";
import { useUserRegistry } from "./use-user-registry";

/**
 * Wires on-chain portfolio (UserRegistry.subscriptions) to off-chain creator index,
 * then runs content-based ranking — aligned with Superteam "lookalike / algorithms":
 * https://superteam.fun/build/ideas/data-driven-drip-recommendations
 */
export function useRecommendations() {
  const { registry, isLoading, mutate, isError } = useUserRegistry();

  const subscriptions = registry?.subscriptions ?? [];

  const subscribedCreators = useMemo(
    () => resolveCreatorsFromPortfolio(registry?.subscriptions ?? []),
    [registry]
  );

  const recommendedCreators: RecommendedCreator[] = useMemo(
    () => rankCreatorsForUser(subscribedCreators, { limit: 6 }),
    [subscribedCreators]
  );

  const isPersonalized = subscribedCreators.length > 0;

  return {
    registry,
    subscriptions,
    catalog: CREATOR_CATALOG,
    subscribedCreators,
    recommendedCreators,
    isPersonalized,
    isLoading,
    isError,
    mutate,
  };
}
