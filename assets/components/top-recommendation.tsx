import React from "react";
import { Trophy, Sparkles, MessageSquare, FileText } from "lucide-react";
import { useTheme, t } from "../theme";
import { formatCost, formatCtx, computeCostBreakdown } from "../cost";
import type { ScoredModel } from "../types";
import { Badge, ProviderBadge, TierBadge, ScoreBar, LegacyBadge } from "./badges";

// --- Props ---

export interface TopRecommendationProps {
  model: ScoredModel;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
}

// --- Sub-components ---

function ModelHero({ model, textMuted }: { model: ScoredModel; textMuted: string }) {
  return (
    <div className="lg:col-span-2 space-y-4">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: model.color + "20", border: "1px solid " + model.color + "40" }}>
          <Sparkles className="w-6 h-6" style={{ color: model.color }} />
        </div>
        <div>
          <h3 className="text-2xl font-bold">{model.name}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <ProviderBadge provider={model.provider} />
            {model.legacy && <LegacyBadge />}
            <TierBadge tier={model.tier} />
            <Badge variant="default">{formatCtx(model.context)} context</Badge>
            <Badge variant="default">{formatCtx(model.maxOutput)} max output</Badge>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={"text-sm " + textMuted}>Match Score</span>
        <div className="flex-1 max-w-xs"><ScoreBar score={model.score} /></div>
      </div>
      <ModelDetails model={model} />
    </div>
  );
}

function ModelDetails({ model }: { model: ScoredModel }) {
  const { dark } = useTheme();
  const textFaint = t(dark, "text-zinc-500", "text-zinc-400");
  const textBody = t(dark, "text-zinc-300", "text-zinc-700");
  const detailCard = t(dark, "bg-zinc-900/60 border-zinc-800/50", "bg-zinc-50 border-zinc-200");
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className={"rounded-lg p-3 border " + detailCard}>
        <p className={"text-xs mb-1 " + textFaint}>Best Use Cases</p>
        <div className="flex flex-wrap gap-1">{model.bestFor.map((b) => <Badge key={b}>{b}</Badge>)}</div>
      </div>
      <div className={"rounded-lg p-3 border " + detailCard}>
        <p className={"text-xs mb-1 " + textFaint}>Key Strengths</p>
        <div className="flex flex-wrap gap-1">{model.strengths.map((s) => <Badge key={s}>{s}</Badge>)}</div>
      </div>
      <div className={"rounded-lg p-3 border " + detailCard}>
        <p className={"text-xs mb-1.5 flex items-center gap-1 " + textFaint}><MessageSquare className="w-3 h-3" /> Ideal Input</p>
        <p className={"text-sm " + textBody}>{model.idealInput}</p>
      </div>
      <div className={"rounded-lg p-3 border " + detailCard}>
        <p className={"text-xs mb-1.5 flex items-center gap-1 " + textFaint}><FileText className="w-3 h-3" /> Ideal Output</p>
        <p className={"text-sm " + textBody}>{model.idealOutput}</p>
      </div>
    </div>
  );
}

function PricingTierRows({ tier, textFaint }: { tier: import("../types").PricingTier; textFaint: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm"><span className={textFaint}>Input</span><span className="font-mono text-emerald-500">{formatCost(tier.inputCost)}</span></div>
      <div className="flex justify-between text-sm"><span className={textFaint}>Output</span><span className="font-mono text-emerald-500">{formatCost(tier.outputCost)}</span></div>
      <div className="flex justify-between text-sm"><span className={textFaint}>Cached Input</span><span className="font-mono text-blue-500">{formatCost(tier.cachedInputCost)}</span></div>
      {tier.cacheWriteCost !== null && <div className="flex justify-between text-sm"><span className={textFaint}>Cache Write</span><span className="font-mono text-amber-500">{formatCost(tier.cacheWriteCost)}</span></div>}
    </div>
  );
}

function tierLabel(tier: import("../types").PricingTier, tiers: readonly import("../types").PricingTier[]): string {
  if (tier.upTo !== null) return "Standard (\u2264" + formatCtx(tier.upTo) + ")";
  const prev = tiers[tiers.length - 2];
  return "Long context (>" + formatCtx(prev?.upTo ?? 0) + ")";
}

function PricingCard({ model }: { model: ScoredModel }) {
  const { dark } = useTheme();
  const card = t(dark, "bg-zinc-900 border-zinc-800", "bg-white border-zinc-200 shadow-sm");
  const textBody = t(dark, "text-zinc-300", "text-zinc-700");
  const textFaint = t(dark, "text-zinc-500", "text-zinc-400");
  const multiTier = model.pricingTiers.length > 1;
  return (
    <div className={"border rounded-xl p-4 space-y-3 " + card}>
      <h4 className={"text-sm font-semibold " + textBody}>Pricing (per 1M tokens)</h4>
      {!multiTier && <PricingTierRows tier={model.pricingTiers[0]} textFaint={textFaint} />}
      {multiTier && model.pricingTiers.map((tier, i) => (
        <div key={i} className="space-y-2">
          <p className={"text-xs font-medium " + textBody}>{tierLabel(tier, model.pricingTiers)}</p>
          <PricingTierRows tier={tier} textFaint={textFaint} />
        </div>
      ))}
    </div>
  );
}

function CostCard({ model, inputTokens, outputTokens, cachedTokens }: {
  model: ScoredModel; inputTokens: number; outputTokens: number; cachedTokens: number;
}) {
  const { dark } = useTheme();
  const card = t(dark, "bg-zinc-900 border-zinc-800", "bg-white border-zinc-200 shadow-sm");
  const textBody = t(dark, "text-zinc-300", "text-zinc-700");
  const textFaint = t(dark, "text-zinc-500", "text-zinc-400");
  const borderSub = t(dark, "border-zinc-800", "border-zinc-200");
  const lines = computeCostBreakdown(model, inputTokens, outputTokens, cachedTokens);
  const showBreakdown = lines.length > 1;
  return (
    <div className={"border rounded-xl p-4 " + card}>
      <h4 className={"text-sm font-semibold mb-2 " + textBody}>Estimated Cost</h4>
      <p className="text-3xl font-bold font-mono text-emerald-500">{"$" + model.estimatedCost.toFixed(6)}</p>
      <p className={"text-xs mt-1 " + textFaint}>
        per request ({inputTokens.toLocaleString()} in / {outputTokens.toLocaleString()} out
        {cachedTokens > 0 ? " / " + cachedTokens.toLocaleString() + " cached" : ""})
      </p>
      {showBreakdown && (
        <div className={"mt-2 pt-2 border-t space-y-1 " + borderSub}>
          {lines.map((l) => <div key={l.label} className="flex justify-between text-xs"><span className={textFaint}>{l.label}</span><span className={"font-mono " + textBody}>{"$" + l.amount.toFixed(6)}</span></div>)}
        </div>
      )}
      <div className={"mt-3 pt-3 border-t space-y-1 " + borderSub}>
        <div className="flex justify-between text-xs"><span className={textFaint}>1K requests</span><span className={"font-mono " + textBody}>{"$" + (model.estimatedCost * 1000).toFixed(4)}</span></div>
        <div className="flex justify-between text-xs"><span className={textFaint}>10K requests</span><span className={"font-mono " + textBody}>{"$" + (model.estimatedCost * 10000).toFixed(2)}</span></div>
        <div className="flex justify-between text-xs"><span className={textFaint}>100K requests</span><span className={"font-mono " + textBody}>{"$" + (model.estimatedCost * 100000).toFixed(2)}</span></div>
      </div>
    </div>
  );
}

// --- Main component ---

export function TopRecommendation({ model, inputTokens, outputTokens, cachedTokens }: TopRecommendationProps) {
  const { dark } = useTheme();
  const textMuted = t(dark, "text-zinc-400", "text-zinc-500");
  const outerCls = t(dark,
    "bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 border-zinc-800",
    "bg-gradient-to-r from-blue-50 via-purple-50/50 to-pink-50/50 border-zinc-200 shadow-sm",
  );
  const decorCls = t(dark,
    "bg-gradient-to-bl from-blue-500/10 to-transparent",
    "bg-gradient-to-bl from-blue-100/40 to-transparent",
  );

  return (
    <div className={"rounded-2xl p-6 relative overflow-hidden border transition-colors duration-300 " + outerCls}>
      <div className={"absolute top-0 right-0 w-64 h-64 rounded-bl-full pointer-events-none " + decorCls} />
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold">Top Recommendation</h2>
          <Badge variant="amber">Best Match</Badge>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ModelHero model={model} textMuted={textMuted} />
          <div className="space-y-3">
            <PricingCard model={model} />
            <CostCard model={model} inputTokens={inputTokens} outputTokens={outputTokens} cachedTokens={cachedTokens} />
          </div>
        </div>
      </div>
    </div>
  );
}
