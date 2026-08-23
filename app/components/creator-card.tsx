"use client";

import { useRegistryActions } from "../lib/hooks/use-registry-actions";
import { toast } from "sonner";
import { parseTransactionError } from "../lib/errors";
import { getExplorerUrl } from "../lib/explorer";
import { useChainId } from "wagmi";
import { motion } from "framer-motion";

export type Creator = {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  tags: string[];
};

export function CreatorCard({
  creator,
  isSubscribed,
  onUpdate,
}: {
  creator: Creator;
  isSubscribed: boolean;
  onUpdate?: () => void;
}) {
  const { subscribe, unsubscribe, isSending, pendingCreatorId } =
    useRegistryActions();
  const chainId = useChainId();
  const isThisPending = isSending && pendingCreatorId === creator.id;

  const handleToggleSubscribe = async () => {
    try {
      const hash = isSubscribed
        ? await unsubscribe(creator.id)
        : await subscribe(creator.id);

      toast.success(isSubscribed ? "Unsubscribed!" : "Subscribed!", {
        description: (
          <a
            href={getExplorerUrl(`/tx/${hash}`, chainId)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View transaction
          </a>
        ),
      });
      await onUpdate?.();
    } catch (err) {
      console.error("Action failed:", err);
      toast.error(parseTransactionError(err));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg"
    >
      <div className="flex items-start gap-4">
        <img
          src={creator.avatar}
          alt={creator.name}
          className="h-16 w-16 rounded-full border-2 border-background object-cover shadow-sm group-hover:border-primary/30"
        />
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">{creator.name}</h3>
            <span className="text-xs font-medium text-muted">@{creator.id}</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {creator.bio}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {creator.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground"
          >
            {tag}
          </span>
        ))}
      </div>

      <button
        onClick={handleToggleSubscribe}
        disabled={isThisPending}
        className={`mt-6 w-full rounded-xl px-4 py-2.5 text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50 ${
          isSubscribed
            ? "border border-border bg-transparent text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            : "bg-primary text-primary-foreground shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] hover:bg-primary/90"
        }`}
      >
        {isThisPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </span>
        ) : isSubscribed ? (
          "Unsubscribe"
        ) : (
          "Subscribe"
        )}
      </button>
    </motion.div>
  );
}
