import { useState, useMemo, useCallback } from "react";
import { Cpu, Sun, Moon, Download } from "lucide-react";
import { ThemeContext, t } from "./theme";
import { MODELS, TASKS, BUDGETS } from "./models";
import { scoreModel } from "./scoring";
import { computeCost, formatCost, formatCtx } from "./cost";
import type { ScoredModel } from "./types";
import { FilterPanel } from "./components/filter-panel";
import { TopRecommendation } from "./components/top-recommendation";
import { AlternativesGrid } from "./components/alternatives-grid";
import { ComparisonTable } from "./components/comparison-table";

// --- Markdown export helpers ---

function buildReportHeader(taskLabel: string, budgetLabel: string, speed: string, context: string, inputTokens: number, outputTokens: number, cachedTokens: number): string {
  return "# Model Advisor Report\n\n" +
    "**Generated:** " + new Date().toLocaleDateString() + "\n\n" +
    "## Selection Criteria\n" +
    "- **Task:** " + taskLabel + "\n- **Budget:** " + budgetLabel + "\n" +
    "- **Speed:** " + speed + "\n- **Context:** " + context + "\n" +
    "- **Tokens:** " + inputTokens.toLocaleString() + " input / " + outputTokens.toLocaleString() + " output / " + cachedTokens.toLocaleString() + " cached\n\n";
}

function buildPricingLine(top: ScoredModel): string {
  if (top.pricingTiers.length === 1) {
    const tier = top.pricingTiers[0];
    return "- **Pricing:** " + formatCost(tier.inputCost) + " input / " + formatCost(tier.outputCost) + " output per 1M tokens\n";
  }
  let line = "- **Pricing (tiered):**\n";
  for (const tier of top.pricingTiers) {
    const boundary = tier.upTo !== null ? " (\u2264" + formatCtx(tier.upTo) + ")" : " (>" + formatCtx(top.pricingTiers[top.pricingTiers.length - 2]?.upTo ?? 0) + ")";
    line += "  - " + boundary + ": " + formatCost(tier.inputCost) + " input / " + formatCost(tier.outputCost) + " output per 1M tokens\n";
  }
  return line;
}

function buildTopSection(top: ScoredModel): string {
  const legacySuffix = top.legacy ? " (Legacy)" : "";
  return "## Top Recommendation: " + top.name + legacySuffix + "\n\n" +
    "- **Provider:** " + top.provider + "\n- **Match Score:** " + top.score + "/100\n" +
    "- **Context Window:** " + formatCtx(top.context) + "\n" +
    "- **Max Output:** " + formatCtx(top.maxOutput) + "\n" +
    buildPricingLine(top) +
    "- **Estimated Cost:** $" + top.estimatedCost.toFixed(6) + " per request\n" +
    "- **Strengths:** " + top.strengths.join(", ") + "\n- **Best For:** " + top.bestFor.join(", ") + "\n" +
    "- **Ideal Input:** " + top.idealInput + "\n- **Ideal Output:** " + top.idealOutput + "\n\n";
}

function buildAltsSection(alts: ScoredModel[]): string {
  let md = "## Alternatives\n\n";
  alts.forEach((m, i) => {
    const tier = m.pricingTiers[0];
    md += "### " + (i + 1) + ". " + m.name + " (Score: " + m.score + "/100)\n";
    md += "- **Provider:** " + m.provider + " | **Pricing:** " + formatCost(tier.inputCost) + "/" + formatCost(tier.outputCost) + " per 1M | **Est. Cost:** $" + m.estimatedCost.toFixed(6) + "\n";
    md += "- **Strengths:** " + m.strengths.join(", ") + "\n\n";
  });
  return md;
}

function buildComparisonTable(scored: ScoredModel[]): string {
  let md = "## Full Comparison\n\n| Model | Provider | Score | Input/1M | Output/1M | Context | Max Out | Est. Cost |\n";
  md += "|-------|----------|-------|----------|-----------|---------|---------|----------|\n";
  scored.forEach((m) => {
    const tier = m.pricingTiers[0];
    const legacySuffix = m.legacy ? " (Legacy)" : "";
    md += "| " + m.name + legacySuffix + " | " + m.provider + " | " + m.score + " | " + formatCost(tier.inputCost) + " | " + formatCost(tier.outputCost) + " | " + formatCtx(m.context) + " | " + formatCtx(m.maxOutput) + " | $" + m.estimatedCost.toFixed(6) + " |\n";
  });
  md += "\n---\n*Prices as of March 2026. Verify at provider websites before committing.*\n";
  return md;
}

// --- State hook ---

function useAdvisorState() {
  const [dark, setDark] = useState(true);
  const [task, setTask] = useState("general");
  const [budget, setBudget] = useState("moderate");
  const [speed, setSpeed] = useState("any");
  const [context, setContext] = useState("any");
  const [inputTokens, setInputTokens] = useState(1000);
  const [outputTokens, setOutputTokens] = useState(500);
  const [cachedTokens, setCachedTokens] = useState(0);
  const [sortCol, setSortCol] = useState<string>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  return { dark, setDark, task, setTask, budget, setBudget, speed, setSpeed, context, setContext, inputTokens, setInputTokens, outputTokens, setOutputTokens, cachedTokens, setCachedTokens, sortCol, setSortCol, sortDir, setSortDir, expandedModel, setExpandedModel };
}

function useScoredModels(task: string, budget: string, speed: string, context: string, inputTokens: number, outputTokens: number, cachedTokens: number, sortCol: string, sortDir: "asc" | "desc") {
  return useMemo(() => {
    return MODELS.map((m) => ({
      ...m,
      score: scoreModel(m, task, budget, speed, context, MODELS),
      estimatedCost: computeCost(m, inputTokens, outputTokens, cachedTokens),
    })).sort((a, b) => {
      const dir = sortDir === "desc" ? -1 : 1;
      if (sortCol === "score") return (a.score - b.score) * dir;
      if (sortCol === "name") return a.name.localeCompare(b.name) * dir;
      if (sortCol === "input") return (a.pricingTiers[0].inputCost - b.pricingTiers[0].inputCost) * dir;
      if (sortCol === "output") return (a.pricingTiers[0].outputCost - b.pricingTiers[0].outputCost) * dir;
      if (sortCol === "context") return (a.context - b.context) * dir;
      if (sortCol === "cost") return (a.estimatedCost - b.estimatedCost) * dir;
      return 0;
    }) as ScoredModel[];
  }, [task, budget, speed, context, inputTokens, outputTokens, cachedTokens, sortCol, sortDir]);
}

// --- Header ---

function Header({ dark, setDark, onExport }: { dark: boolean; setDark: (d: boolean) => void; onExport: () => void }) {
  const textFaint = t(dark, "text-zinc-500", "text-zinc-400");
  const headerBg = t(dark, "bg-zinc-950/80 border-zinc-800/80", "bg-white/90 border-zinc-200");
  const themeBtnCls = t(dark, "bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-amber-400", "bg-white border-zinc-200 hover:bg-zinc-50 text-indigo-600 shadow-sm");
  const exportBtnCls = t(dark, "bg-zinc-800 hover:bg-zinc-700 border-zinc-700", "bg-white hover:bg-zinc-50 border-zinc-200 shadow-sm");
  return (
    <div className={"border-b backdrop-blur-sm sticky top-0 z-40 " + headerBg + " transition-colors duration-300"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Model Advisor</h1>
            <p className={"text-xs " + textFaint}>AI model selection & cost estimator — March 2026 pricing</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDark(!dark)} className={"p-2.5 rounded-lg border transition-all duration-300 " + themeBtnCls}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}>
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={onExport} className={"flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition-colors " + exportBtnCls}>
            <Download className="w-4 h-4" /> Export MD
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main component ---

export default function ModelAdvisor() {
  const s = useAdvisorState();
  const scored = useScoredModels(s.task, s.budget, s.speed, s.context, s.inputTokens, s.outputTokens, s.cachedTokens, s.sortCol, s.sortDir);
  const top = scored[0];
  const alts = scored.slice(1, 4);

  const toggleSort = useCallback((col: string) => {
    if (s.sortCol === col) s.setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { s.setSortCol(col); s.setSortDir("desc"); }
  }, [s.sortCol]);

  const exportMarkdown = useCallback(() => {
    const taskLabel = TASKS.find((tk) => tk.id === s.task)?.label || s.task;
    const budgetLabel = BUDGETS.find((b) => b.id === s.budget)?.label || s.budget;
    const md = buildReportHeader(taskLabel, budgetLabel, s.speed, s.context, s.inputTokens, s.outputTokens, s.cachedTokens)
      + buildTopSection(top) + buildAltsSection(alts) + buildComparisonTable(scored);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "model-advisor-report.md"; a.click();
    URL.revokeObjectURL(url);
  }, [scored, top, alts, s.task, s.budget, s.speed, s.context, s.inputTokens, s.outputTokens, s.cachedTokens]);

  const bg = t(s.dark, "bg-zinc-950", "bg-zinc-50");
  const text = t(s.dark, "text-white", "text-zinc-900");
  const textDim = t(s.dark, "text-zinc-600", "text-zinc-400");
  const borderSub = t(s.dark, "border-zinc-800", "border-zinc-200");

  return (
    <ThemeContext.Provider value={{ dark: s.dark }}>
      <div className={"min-h-screen " + bg + " " + text + " transition-colors duration-300"}>
        <Header dark={s.dark} setDark={s.setDark} onExport={exportMarkdown} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          <FilterPanel task={s.task} setTask={s.setTask} budget={s.budget} setBudget={s.setBudget} speed={s.speed} setSpeed={s.setSpeed} context={s.context} setContext={s.setContext} inputTokens={s.inputTokens} setInputTokens={s.setInputTokens} outputTokens={s.outputTokens} setOutputTokens={s.setOutputTokens} cachedTokens={s.cachedTokens} setCachedTokens={s.setCachedTokens} />
          <TopRecommendation model={top} inputTokens={s.inputTokens} outputTokens={s.outputTokens} cachedTokens={s.cachedTokens} />
          <AlternativesGrid models={alts} />
          <ComparisonTable models={scored} sortCol={s.sortCol} sortDir={s.sortDir} toggleSort={toggleSort} expandedModel={s.expandedModel} setExpandedModel={s.setExpandedModel} />
          <div className={"text-center py-6 border-t " + borderSub}>
            <p className={"text-xs " + textDim}>Prices as of March 2026. Verify at provider websites before committing.</p>
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
