import type { Creator } from "../../components/creator-card";
import { CREATOR_CATALOG } from "../creators/catalog";

export type RecommendedCreator = Creator & {
  score: number;
  matchReason: string;
};

type TagWeights = Map<string, number>;

/** Aggregate tag weights from the user's on-chain subscription portfolio. */
function buildUserTagProfile(subscribed: Creator[]): TagWeights {
  const weights = new Map<string, number>();
  for (const creator of subscribed) {
    for (const tag of creator.tags) {
      const key = tag.toUpperCase();
      weights.set(key, (weights.get(key) ?? 0) + 1);
    }
  }
  return weights;
}

/** Content-based score: overlap between creator tags and user profile (lookalike-lite). */
function scoreCreator(
  creator: Creator,
  profile: TagWeights,
  subscribedIds: Set<string>
): number {
  if (subscribedIds.has(creator.id)) return -1;
  let score = 0;
  for (const tag of creator.tags) {
    score += profile.get(tag.toUpperCase()) ?? 0;
  }
  return score;
}

function explainMatch(creator: Creator, profile: TagWeights): string {
  const shared = creator.tags
    .map((t) => t.toUpperCase())
    .filter((t) => (profile.get(t) ?? 0) > 0);
  if (shared.length === 0) {
    return "Trending in the Solana / DRiP ecosystem";
  }
  if (shared.length === 1) {
    return `Because you follow creators tagged ${shared[0]}`;
  }
  return `Matches your taste in ${shared.slice(0, 3).join(", ")}`;
}

/** Cold start when portfolio is empty — diverse editorial picks. */
function coldStartRecommendations(limit: number): RecommendedCreator[] {
  const picks = [
    CREATOR_CATALOG.find((c) => c.id === "solana"),
    CREATOR_CATALOG.find((c) => c.id === "madlads"),
    CREATOR_CATALOG.find((c) => c.id === "JupiterExchange"),
    CREATOR_CATALOG.find((c) => c.id === "SuperteamDAO"),
    CREATOR_CATALOG.find((c) => c.id === "toly"),
    CREATOR_CATALOG.find((c) => c.id === "tensor_hq"),
  ].filter((c): c is Creator => c !== undefined);

  return picks.slice(0, limit).map((creator, i) => ({
    ...creator,
    score: picks.length - i,
    matchReason: "Popular with new collectors — subscribe to personalize",
  }));
}

/**
 * Rank creators the user has not subscribed to, using tag overlap
 * (content-based filtering, similar to Spotify genre vectors).
 */
export function rankCreatorsForUser(
  subscribed: Creator[],
  options: { limit?: number } = {}
): RecommendedCreator[] {
  const limit = options.limit ?? 6;
  const subscribedIds = new Set(subscribed.map((c) => c.id));

  if (subscribed.length === 0) {
    return coldStartRecommendations(limit);
  }

  const profile = buildUserTagProfile(subscribed);
  const ranked = CREATOR_CATALOG.map((creator) => {
    const score = scoreCreator(creator, profile, subscribedIds);
    return {
      ...creator,
      score,
      matchReason: explainMatch(creator, profile),
    };
  })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (ranked.length > 0) return ranked;

  return coldStartRecommendations(limit).filter(
    (c) => !subscribedIds.has(c.id)
  );
}
