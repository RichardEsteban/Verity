import type { Creator } from "../../components/creator-card";

/**
 * Indexed creator / collectible metadata for recommendations.
 *
 * On-chain, `subscribe_creator` only stores `creator_id` strings in UserRegistry.
 * This catalog is the off-chain index (production: DRiP Haus API, Helius, or
 * on-chain CreatorProfile accounts keyed by the same ids).
 *
 * @see https://superteam.fun/build/ideas/data-driven-drip-recommendations
 */
export const CREATOR_CATALOG: Creator[] = [
  {
    id: "solana",
    name: "Solana Foundation",
    avatar: "https://unavatar.io/twitter/solana",
    bio: "The official account for the Solana Foundation. Empowering the decentralized future.",
    tags: ["ECOSYSTEM", "FOUNDATION", "EDUCATION"],
  },
  {
    id: "toly",
    name: "Anatoly Yakovenko",
    avatar: "https://unavatar.io/twitter/aeyakovenko",
    bio: "Founder of Solana. Built a decentralized clock before it was cool.",
    tags: ["BUILDER", "FOUNDER", "TECH"],
  },
  {
    id: "rajgokal",
    name: "Raj Gokal",
    avatar: "https://unavatar.io/twitter/rajgokal",
    bio: "Co-founder of Solana. Bringing the next billion people to crypto.",
    tags: ["ADOPTION", "FOUNDER", "COMMUNITY"],
  },
  {
    id: "SuperteamDAO",
    name: "Superteam",
    avatar: "https://unavatar.io/twitter/SuperteamDAO",
    bio: "The cooperative of the best builders in the Solana ecosystem.",
    tags: ["COMMUNITY", "DAO", "GRANTS"],
  },
  {
    id: "JupiterExchange",
    name: "Jupiter",
    avatar: "https://unavatar.io/twitter/JupiterExchange",
    bio: "The best swap aggregator in crypto. JUP is the way.",
    tags: ["DEFI", "PROTOCOL", "TRADING"],
  },
  {
    id: "HeliusLabs",
    name: "Helius",
    avatar: "https://unavatar.io/twitter/heliuslabs",
    bio: "Powering the Solana network with the best APIs and infrastructure.",
    tags: ["INFRA", "DEVTOOLS", "BUILDER"],
  },
  {
    id: "madlads",
    name: "Mad Lads",
    avatar: "https://unavatar.io/twitter/madlads",
    bio: "Backpack's flagship NFT community on Solana.",
    tags: ["NFT", "COMMUNITY", "COLLECTIBLES"],
  },
  {
    id: "tensor_hq",
    name: "Tensor",
    avatar: "https://unavatar.io/twitter/tensor_hq",
    bio: "NFT trading marketplace built for Solana power users.",
    tags: ["NFT", "TRADING", "MARKETPLACE"],
  },
];

export function getCreatorById(id: string): Creator | undefined {
  return CREATOR_CATALOG.find((c) => c.id === id);
}

export function resolveCreatorsFromPortfolio(
  subscriptionIds: readonly string[]
): Creator[] {
  return subscriptionIds
    .map((id) => getCreatorById(id))
    .filter((c): c is Creator => c !== undefined);
}
