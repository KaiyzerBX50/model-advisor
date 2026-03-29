import React from "react";
import { ArrowUpDown, ChevronDown, ChevronUp, Trophy } from "lucide-react";
import { useTheme, t } from "../theme";
import { formatCost, formatCtx } from "../cost";
import type { ScoredModel } from "../types";
import { Badge, ProviderBadge, ScoreBar, LegacyBadge } from "./badges";

// --- Props ---

export interface ComparisonTableProps {
  models: ScoredModel[];
  sortCol: string;
  sortDir: "asc" | "desc";
  toggleSort: (col: string) => void;
  expandedModel: string | null;
  setExpandedModel: (id: string | null) => void;
}

// --- Sub-components ---

function SortHeader({ col, children, className = "", sortCol, sortDir, toggleSort }: {
  col: string; children: React.ReactNode; className?: string;
  sortCol: string; sortDir: "asc" | "desc"; toggleSort: (col: string) => void;
}) {
  const { dark } = useTheme();
  const cls = t(dark, "text-zinc-400 hover:text-white", "text-zinc-500 hover:text-zinc-900");
  return (
    <th className={"px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors select-none " + cls + " " + className}
      onClick={() => toggleSort(col)}>
      <span className="inline-flex items-center gap-1">
        {children}
        {sortCol !== col && <ArrowUpDown className="w-3 h-3 opacity-30" />}
        {sortCol === col && sortDir === "desc" && <ChevronDown className="w-3 h-3" />}
        {sortCol === col && sortDir !== "desc" && <ChevronUp className="w-3 h-3" />}
      </span>
    </th>
  );
}

function ModelRow({ model, index, isExpanded, onToggle }: {
  model: ScoredModel; index: number; isExpanded: boolean;
  onToggle: () => void;
}) {
  const { dark } = useTheme();
  const text = t(dark, "text-white", "text-zinc-900");
  const textBody = t(dark, "text-zinc-300", "text-zinc-700");
  const textFaint = t(dark, "text-zinc-500", "text-zinc-400");
  const tier = model.pricingTiers[0];

  const rowBorder = t(dark, "border-zinc-800/50 hover:bg-zinc-800/30", "border-zinc-100 hover:bg-zinc-50");
  const topHighlight = index === 0 ? t(dark, "bg-blue-500/5", "bg-blue-50/50") : "";

  return (
    <tr className={"border-b transition-colors cursor-pointer " + rowBorder + " " + topHighlight}
      onClick={onToggle}>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          {index === 0 && <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
          <span className={"text-sm font-medium " + (index === 0 ? text : textBody)}>{model.name}</span>
          {model.legacy && <LegacyBadge />}
        </div>
      </td>
      <td className="px-3 py-3"><ProviderBadge provider={model.provider} /></td>
      <td className="px-3 py-3 w-36"><ScoreBar score={model.score} /></td>
      <td className="px-3 py-3 text-sm font-mono text-emerald-500">{formatCost(tier.inputCost)}</td>
      <td className="px-3 py-3 text-sm font-mono text-emerald-500">{formatCost(tier.outputCost)}</td>
      <td className="px-3 py-3 text-sm font-mono text-blue-500">{formatCost(tier.cachedInputCost)}</td>
      <td className={"px-3 py-3 text-sm " + textBody}>{formatCtx(model.context)}</td>
      <td className={"px-3 py-3 text-sm " + textBody}>{formatCtx(model.maxOutput)}</td>
      <td className={"px-3 py-3 text-sm font-mono " + textBody}>{"$" + model.estimatedCost.toFixed(6)}</td>
      <td className="px-3 py-3">
        {isExpanded ? <ChevronUp className={"w-4 h-4 " + textFaint} /> : <ChevronDown className={"w-4 h-4 " + textFaint} />}
      </td>
    </tr>
  );
}

function ExpandedDetail({ model }: { model: ScoredModel }) {
  const { dark } = useTheme();
  const textFaint = t(dark, "text-zinc-500", "text-zinc-400");
  const textBody = t(dark, "text-zinc-300", "text-zinc-700");
  const bgCls = t(dark, "bg-zinc-800/20", "bg-zinc-50");
  const tier = model.pricingTiers[0];

  return (
    <tr className={bgCls}>
      <td colSpan={10} className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className={"text-xs mb-2 font-semibold uppercase " + textFaint}>Strengths</p>
            <div className="flex flex-wrap gap-1">{model.strengths.map((s) => <Badge key={s}>{s}</Badge>)}</div>
          </div>
          <div>
            <p className={"text-xs mb-2 font-semibold uppercase " + textFaint}>Best For</p>
            <div className="flex flex-wrap gap-1">{model.bestFor.map((b) => <Badge key={b}>{b}</Badge>)}</div>
          </div>
          <div>
            <p className={"text-xs mb-2 font-semibold uppercase " + textFaint}>Ideal Input</p>
            <p className={"text-sm " + textBody}>{model.idealInput}</p>
          </div>
          <div>
            <p className={"text-xs mb-2 font-semibold uppercase " + textFaint}>Ideal Output</p>
            <p className={"text-sm " + textBody}>{model.idealOutput}</p>
          </div>
          {tier.cacheWriteCost !== null && (
            <div>
              <p className={"text-xs mb-1 font-semibold uppercase " + textFaint}>Cache Write Cost</p>
              <span className="font-mono text-amber-500 text-sm">{formatCost(tier.cacheWriteCost)}/1M</span>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

// --- Main component ---

export function ComparisonTable({ models, sortCol, sortDir, toggleSort, expandedModel, setExpandedModel }: ComparisonTableProps) {
  const { dark } = useTheme();
  const textFaint = t(dark, "text-zinc-500", "text-zinc-400");
  const card = t(dark, "bg-zinc-900 border-zinc-800", "bg-white border-zinc-200 shadow-sm");
  const headBg = t(dark, "border-zinc-800 bg-zinc-900/80", "border-zinc-200 bg-zinc-50");
  const headText = t(dark, "text-zinc-400", "text-zinc-500");
  const sortProps = { sortCol, sortDir, toggleSort };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <ArrowUpDown className={"w-5 h-5 " + textFaint} /> Full Comparison
      </h2>
      <div className={"border rounded-xl overflow-hidden " + card}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={"border-b " + headBg}>
                <SortHeader col="name" {...sortProps}>Model</SortHeader>
                <th className={"px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider " + headText}>Provider</th>
                <SortHeader col="score" {...sortProps}>Score</SortHeader>
                <SortHeader col="input" {...sortProps}>Input/1M</SortHeader>
                <SortHeader col="output" {...sortProps}>Output/1M</SortHeader>
                <th className={"px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider " + headText}>Cached</th>
                <SortHeader col="context" {...sortProps}>Context</SortHeader>
                <th className={"px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider " + headText}>Max Out</th>
                <SortHeader col="cost" {...sortProps}>Est. Cost</SortHeader>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider w-8"></th>
              </tr>
            </thead>
            <tbody>
              {models.map((m, i) => [
                <ModelRow key={m.id} model={m} index={i} isExpanded={expandedModel === m.id}
                  onToggle={() => setExpandedModel(expandedModel === m.id ? null : m.id)} />,
                expandedModel === m.id ? <ExpandedDetail key={m.id + "-detail"} model={m} /> : null,
              ]).flat()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
