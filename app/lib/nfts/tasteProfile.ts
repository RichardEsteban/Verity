import type { NftAsset } from "./fetchNFTs";

export type TasteCategory = {
  id: string;
  label: string;
  score: number;
};

export type TasteProfile = {
  totalNfts: number;
  categories: TasteCategory[];
  topCollections: { name: string; count: number }[];
  sampleHoldings: NftAsset[];
};

/** Keyword → category for DRiP / Solana / Web3 taste mapping */
const CATEGORY_RULES: { id: string; label: string; keywords: string[] }[] = [
  { id: "art", label: "Digital Art", keywords: ["art", "pixel", "pfp", "avatar", "generative"] },
  { id: "gaming", label: "Gaming", keywords: ["game", "gaming", "quest", "rpg", "play"] },
  { id: "music", label: "Music", keywords: ["music", "audio", "beat", "sound"] },
  { id: "defi", label: "DeFi", keywords: ["defi", "swap", "dex", "yield", "liquidity", "jupiter"] },
  { id: "infra", label: "Infrastructure", keywords: ["helius", "rpc", "validator", "infra", "node"] },
  { id: "collectibles", label: "Collectibles", keywords: ["collectible", "edition", "drop", "drip", "cNFT"] },
  { id: "sports", label: "Sports", keywords: ["sport", "ball", "team", "league"] },
];

function normalize(text: string): string {
  return text.toLowerCase();
}

function scoreTextAgainstCategories(text: string): Map<string, number> {
  const normalized = normalize(text);
  const scores = new Map<string, number>();

  for (const rule of CATEGORY_RULES) {
    let hits = 0;
    for (const kw of rule.keywords) {
      if (normalized.includes(kw)) hits++;
    }
    if (hits > 0) {
      scores.set(rule.id, (scores.get(rule.id) ?? 0) + hits);
    }
  }

  return scores;
}

/** Build a taste profile from wallet NFT holdings (display-only; not used in rankCreatorsForUser). */
export function buildTasteProfile(nfts: NftAsset[]): TasteProfile {
  const categoryTotals = new Map<string, number>();
  const collectionCounts = new Map<string, number>();

  for (const nft of nfts) {
    const blob = `${nft.name} ${nft.collectionName}`;
    const hits = scoreTextAgainstCategories(blob);
    for (const [id, score] of hits) {
      categoryTotals.set(id, (categoryTotals.get(id) ?? 0) + score);
    }
    const coll = nft.collectionName || "Unknown";
    collectionCounts.set(coll, (collectionCounts.get(coll) ?? 0) + 1);
  }

  const categories: TasteCategory[] = CATEGORY_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    score: categoryTotals.get(rule.id) ?? 0,
  }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score);

  const topCollections = [...collectionCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalNfts: nfts.length,
    categories,
    topCollections,
    sampleHoldings: nfts.slice(0, 6),
  };
}

/** Content-based match score between a category profile and a target tag set (0–100 scale). */
export function matchScore(
  profile: TasteProfile,
  targetTags: string[]
): number {
  if (profile.categories.length === 0 || targetTags.length === 0) return 0;

  const tagSet = new Set(targetTags.map((t) => normalize(t)));
  let overlap = 0;
  for (const cat of profile.categories) {
    const rule = CATEGORY_RULES.find((r) => r.id === cat.id);
    if (!rule) continue;
    for (const kw of rule.keywords) {
      if ([...tagSet].some((t) => t.includes(kw) || kw.includes(t))) {
        overlap += cat.score;
        break;
      }
    }
  }

  const maxPossible = profile.categories.reduce((s, c) => s + c.score, 0);
  if (maxPossible === 0) return 0;
  return Math.min(100, Math.round((overlap / maxPossible) * 100));
}
