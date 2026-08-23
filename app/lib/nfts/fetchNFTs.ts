export type NftAsset = {
  contractAddress: string;
  tokenId: string;
  name: string;
  collectionName: string;
  imageUrl?: string;
};

type AlchemyNft = {
  contract?: { address?: string; name?: string };
  tokenId?: string;
  name?: string;
  image?: { cachedUrl?: string; originalUrl?: string };
  collection?: { name?: string };
  raw?: { metadata?: { name?: string; image?: string } };
};

type AlchemyResponse = {
  ownedNfts?: AlchemyNft[];
  pageKey?: string;
};

function getAlchemyNetwork(): string {
  const network = process.env.NEXT_PUBLIC_NETWORK;
  return network === "arbitrum" || network === "arbitrum-one"
    ? "arb-mainnet"
    : "arb-sepolia";
}

export async function fetchNFTs(ownerAddress: string): Promise<NftAsset[]> {
  const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_ALCHEMY_API_KEY is not configured");
  }

  const network = getAlchemyNetwork();
  const baseUrl = `https://${network}.g.alchemy.com/nft/v3/${apiKey}`;
  const assets: NftAsset[] = [];
  let pageKey: string | undefined;

  do {
    const params = new URLSearchParams({
      owner: ownerAddress,
      withMetadata: "true",
      pageSize: "100",
    });
    if (pageKey) params.set("pageKey", pageKey);

    const res = await fetch(`${baseUrl}/getNFTsForOwner?${params}`);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Alchemy NFT API error (${res.status}): ${text}`);
    }

    const json = (await res.json()) as AlchemyResponse;
    for (const nft of json.ownedNfts ?? []) {
      const contractAddress = nft.contract?.address ?? "";
      const tokenId = nft.tokenId ?? "";
      if (!contractAddress || !tokenId) continue;

      assets.push({
        contractAddress,
        tokenId,
        name:
          nft.name ??
          nft.raw?.metadata?.name ??
          `${nft.collection?.name ?? "NFT"} #${tokenId}`,
        collectionName:
          nft.collection?.name ?? nft.contract?.name ?? "Unknown collection",
        imageUrl:
          nft.image?.cachedUrl ??
          nft.image?.originalUrl ??
          nft.raw?.metadata?.image,
      });
    }
    pageKey = json.pageKey;
  } while (pageKey);

  return assets;
}
