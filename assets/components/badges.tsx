import React from "react";
import { useTheme, scoreColor, t } from "../theme";

// --- Badge ---

const DARK_COLORS: Record<string, string> = {
  default: "bg-zinc-700/60 text-zinc-300",
  green: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  blue: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  amber: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
  purple: "bg-purple-500/15 text-purple-400 border border-purple-500/20",
  pink: "bg-pink-500/15 text-pink-400 border border-pink-500/20",
};

const LIGHT_COLORS: Record<string, string> = {
  default: "bg-zinc-200/80 text-zinc-600",
  green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  blue: "bg-blue-50 text-blue-700 border border-blue-200",
  amber: "bg-amber-50 text-amber-700 border border-amber-200",
  purple: "bg-purple-50 text-purple-700 border border-purple-200",
  pink: "bg-pink-50 text-pink-700 border border-pink-200",
};

export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: string;
}) {
  const { dark } = useTheme();
  const colors = dark ? DARK_COLORS : LIGHT_COLORS;
  const cls = colors[variant] || colors.default;
  return (
    <span
      className={
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium " +
        cls
      }
    >
      {children}
    </span>
  );
}

// --- ProviderBadge ---

const PROVIDER_VARIANT: Record<string, string> = {
  OpenAI: "green",
  Anthropic: "amber",
  Google: "blue",
  "Moonshot AI": "purple",
  "Zhipu AI": "blue",
  xAI: "pink",
  Alibaba: "purple",
  MiniMax: "pink",
};

export function ProviderBadge({ provider }: { provider: string }) {
  return <Badge variant={PROVIDER_VARIANT[provider] || "default"}>{provider}</Badge>;
}

// --- TierBadge ---

const TIER_MAP: Record<string, { label: string; variant: string }> = {
  budget: { label: "Budget", variant: "green" },
  mid: { label: "Mid-Tier", variant: "blue" },
  premium: { label: "Premium", variant: "amber" },
};

export function TierBadge({ tier }: { tier: string }) {
  const entry = TIER_MAP[tier] || TIER_MAP.mid;
  return <Badge variant={entry.variant}>{entry.label}</Badge>;
}

// --- ScoreBar ---

export function LegacyBadge() {
  return <Badge variant="default">Legacy</Badge>;
}

// --- ScoreBar ---

export function ScoreBar({ score }: { score: number }) {
  const { dark } = useTheme();
  const color = scoreColor(score);
  return (
    <div className="flex items-center gap-2 w-full">
      <div
        className={
          "flex-1 rounded-full h-2 overflow-hidden " +
          t(dark, "bg-zinc-800", "bg-zinc-200")
        }
      >
        <div
          className={"h-full rounded-full transition-all duration-500 " + color}
          style={{ width: score + "%" }}
        />
      </div>
      <span
        className={
          "text-xs font-mono w-8 text-right " +
          t(dark, "text-zinc-400", "text-zinc-500")
        }
      >
        {score}
      </span>
    </div>
  );
}
