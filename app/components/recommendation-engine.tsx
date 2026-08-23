"use client";

import { CreatorCard } from "./creator-card";
import { useRecommendations } from "../lib/hooks/use-recommendations";

export function RecommendationEngine() {
  const {
    subscriptions,
    recommendedCreators,
    subscribedCreators,
    isPersonalized,
    isLoading,
    mutate,
  } = useRecommendations();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recommended for You</h2>
          <p className="text-sm text-muted">
            {isPersonalized
              ? "Ranked from your on-chain subscriptions using shared tags (content-based matching)."
              : "Subscribe to a few creators to personalize — we rank by tags like Spotify genres."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommendedCreators.map((creator) => (
            <div key={creator.id} className="space-y-2">
              <p className="text-xs font-medium text-primary px-1">
                {creator.matchReason}
              </p>
              <CreatorCard
                creator={creator}
                isSubscribed={false}
                onUpdate={mutate}
              />
            </div>
          ))}
        </div>
      </section>

      {subscribedCreators.length > 0 && (
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Your Portfolio</h2>
            <p className="text-sm text-muted">
              Loaded from your on-chain registry ({subscriptions.length} subscribed)
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subscribedCreators.map((creator) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                isSubscribed
                onUpdate={mutate}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
