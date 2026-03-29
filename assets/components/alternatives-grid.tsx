import React from "react";
import { Star } from "lucide-react";
import { useTheme, t } from "../theme";
import { formatCost, formatCtx } from "../cost";
import type { ScoredModel } from "../types";
import { Badge, ProviderBadge, ScoreBar, LegacyBadge } from "./badges";

// --- Props ---

export interface AlternativesGridProps {
  models: ScoredModel[];
}

// --- Main component ---

export function AlternativesGrid({ models }: AlternativesGridProps) {
  const { dark } = useTheme();
  const textFaint = t(dark, "text-zinc-500", "text-zinc-400");
  const textDim = t(dark, "text-zinc-600", "text-zinc-400");
  const textBody = t(dark, "text-zinc-300", "text-zinc-700");
  const card = t(dark, "bg-zinc-900 border-zinc-800", "bg-white border-zinc-200 shadow-sm");
  const hoverBorder = t(dark, "hover:border-zinc-700", "hover:border-zinc-300");

  return (
    <div>
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Star className={"w-5 h-5 " + textFaint} /> Alternatives
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {models.map((m, i) => (
          <div key={m.id} className={"border rounded-xl p-4 transition-colors " + card + " " + hoverBorder}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={"text-xs font-mono " + textDim}>#{i + 2}</span>
                <h3 className="font-semibold text-sm">{m.name}</h3>
                {m.legacy && <LegacyBadge />}
              </div>
              <ProviderBadge provider={m.provider} />
            </div>
            <ScoreBar score={m.score} />
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div><span className={textFaint}>Input</span><span className="font-mono text-emerald-500 ml-1">{formatCost(m.pricingTiers[0].inputCost)}</span></div>
              <div><span className={textFaint}>Output</span><span className="font-mono text-emerald-500 ml-1">{formatCost(m.pricingTiers[0].outputCost)}</span></div>
              <div><span className={textFaint}>Context</span><span className={"ml-1 " + textBody}>{formatCtx(m.context)}</span></div>
              <div><span className={textFaint}>Max Out</span><span className={"ml-1 " + textBody}>{formatCtx(m.maxOutput)}</span></div>
              <div><span className={textFaint}>Est.</span><span className={"font-mono ml-1 " + textBody}>{"$" + m.estimatedCost.toFixed(6)}</span></div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">{m.bestFor.slice(0, 3).map((b) => <Badge key={b}>{b}</Badge>)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
