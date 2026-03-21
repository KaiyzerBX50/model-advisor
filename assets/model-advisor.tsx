import { useState, useMemo, useCallback, createContext, useContext } from "react";
import { Brain, Zap, DollarSign, FileText, Download, ChevronDown, ChevronUp, Sparkles, ArrowUpDown, Check, Info, Calculator, Trophy, Star, Target, MessageSquare, Code, BookOpen, Scale, Cpu, Sun, Moon } from "lucide-react";

const ThemeContext = createContext<{ dark: boolean }>({ dark: true });
function useTheme() { return useContext(ThemeContext); }

function t(dark: boolean, darkCls: string, lightCls: string) {
  return dark ? darkCls : lightCls;
}

const MODELS = [
  {
    id: "gpt54mini",
    name: "GPT-5.4 mini",
    provider: "OpenAI",
    context: 400000,
    inputCost: 0.75,
    outputCost: 4.50,
    cachedInputCost: 0.075,
    cacheWriteCost: null,
    speed: "fast",
    strengths: ["Fast inference", "Great cost-performance ratio", "Strong coding", "Computer use", "400K context"],
    bestFor: ["High-volume tasks", "Chatbots", "Code generation", "Balanced workloads", "Agentic subagents"],
    idealInput: "Structured prompts, concise instructions, JSON schemas, code snippets",
    idealOutput: "Quick responses, code completions, classifications, structured JSON",
    tier: "mid",
    color: "#10a37f",
  },
  {
    id: "gpt54",
    name: "GPT-5.4",
    provider: "OpenAI",
    context: 272000,
    inputCost: 2.50,
    outputCost: 10.00,
    cachedInputCost: 0.25,
    cacheWriteCost: null,
    speed: "medium",
    strengths: ["Flagship reasoning", "Computer use API", "Configurable reasoning effort", "Strong across all benchmarks", "Agentic workflows"],
    bestFor: ["General-purpose flagship", "Complex reasoning", "Long document analysis", "Professional tasks", "Multi-step workflows"],
    idealInput: "Detailed instructions, multi-turn conversations, documents up to 272K tokens, system prompts with reasoning effort config",
    idealOutput: "Thorough analysis, nuanced writing, structured reports, detailed explanations",
    tier: "premium",
    color: "#10a37f",
  },
  {
    id: "gpt53codex",
    name: "GPT-5.3 Codex",
    provider: "OpenAI",
    context: 400000,
    inputCost: 1.75,
    outputCost: 14.00,
    cachedInputCost: 0.175,
    cacheWriteCost: null,
    speed: "medium",
    strengths: ["Top-tier code generation", "Terminal-heavy workflows", "Codex agent integration", "400K context for large codebases"],
    bestFor: ["Software development", "Code review", "Debugging", "Codebase refactoring", "Agent-driven coding"],
    idealInput: "Code files, error logs, terminal output, repository context, diff patches",
    idealOutput: "Code implementations, bug fixes, refactored code, test suites, technical documentation",
    tier: "mid",
    color: "#10a37f",
  },
  {
    id: "opus46",
    name: "Opus 4.6",
    provider: "Anthropic",
    context: 1000000,
    inputCost: 5.00,
    outputCost: 25.00,
    cachedInputCost: 0.50,
    cacheWriteCost: 6.25,
    speed: "slow",
    strengths: ["Deepest reasoning", "1M token context", "Extended thinking", "Agent teams", "Highest accuracy on complex tasks"],
    bestFor: ["Premium reasoning", "Research & analysis", "Legal & scientific review", "Complex multi-step problems", "Large codebase comprehension"],
    idealInput: "Long documents, research papers, complex multi-part questions, extended thinking tasks, entire codebases",
    idealOutput: "Deep analysis, nuanced reasoning chains, comprehensive reports, research synthesis",
    tier: "premium",
    color: "#d97706",
  },
  {
    id: "sonnet45",
    name: "Sonnet 4.5",
    provider: "Anthropic",
    context: 200000,
    inputCost: 3.00,
    outputCost: 15.00,
    cachedInputCost: 0.30,
    cacheWriteCost: 3.75,
    speed: "medium",
    strengths: ["Excellent coding", "Precise instruction following", "Great balance of speed and quality", "Strong agentic performance"],
    bestFor: ["Coding assistants", "Balanced general tasks", "Content creation", "Long document processing", "Agent workflows"],
    idealInput: "Clear instructions, code context, structured prompts, few-shot examples",
    idealOutput: "Clean code, well-structured text, precise JSON, detailed but concise analysis",
    tier: "mid",
    color: "#d97706",
  },
  {
    id: "gemini3pro",
    name: "Gemini 3 Pro",
    provider: "Google",
    context: 200000,
    inputCost: 2.00,
    outputCost: 12.00,
    cachedInputCost: null,
    cacheWriteCost: null,
    speed: "medium",
    strengths: ["Next-gen flagship", "Strong benchmarks", "Multimodal (text, image, video, audio)", "Competitive pricing"],
    bestFor: ["Long document analysis", "Multimodal tasks", "Research", "Code generation", "General-purpose work"],
    idealInput: "Mixed media inputs, long documents, images with text, structured analysis requests",
    idealOutput: "Comprehensive analysis, multimodal responses, structured data extraction, detailed summaries",
    tier: "mid",
    color: "#4285f4",
  },
  {
    id: "kimik25",
    name: "Kimi K2.5",
    provider: "Moonshot AI",
    context: 262000,
    inputCost: 0.60,
    outputCost: 3.00,
    cachedInputCost: 0.10,
    cacheWriteCost: null,
    speed: "fast",
    strengths: ["Frontier-level coding benchmarks", "Extremely cost-effective", "Multimodal", "Strong agentic performance"],
    bestFor: ["Budget coding", "High-volume tasks", "Cost-sensitive production", "Agentic workflows", "Multimodal processing"],
    idealInput: "Code context, structured prompts, images, concise task descriptions",
    idealOutput: "Code implementations, structured responses, quick completions",
    tier: "budget",
    color: "#7c3aed",
  },
  {
    id: "minimax27",
    name: "MiniMax 2.7",
    provider: "MiniMax",
    context: 1000000,
    inputCost: 0.30,
    outputCost: 1.20,
    cachedInputCost: null,
    cacheWriteCost: null,
    speed: "fast",
    strengths: ["Ultra low cost", "1M token context", "GPT-4 class quality", "Self-improving architecture", "90% cheaper than Claude"],
    bestFor: ["High-volume production", "Budget-conscious apps", "Long context processing", "Chatbots", "Classification tasks"],
    idealInput: "Long documents, high-volume batch processing, simple to moderate complexity tasks",
    idealOutput: "Quick classifications, summaries, structured data, chat responses",
    tier: "budget",
    color: "#ec4899",
  },
];

const TASKS = [
  { id: "coding", label: "Coding & Development", icon: Code },
  { id: "reasoning", label: "Premium Reasoning", icon: Brain },
  { id: "general", label: "Balanced General Use", icon: Scale },
  { id: "longdocs", label: "Long Document Processing", icon: BookOpen },
  { id: "lowcost", label: "Low Cost / High Volume", icon: DollarSign },
];

const BUDGETS = [
  { id: "tight", label: "Tight", desc: "< $1/M blended" },
  { id: "moderate", label: "Moderate", desc: "$1–$5/M blended" },
  { id: "flexible", label: "Flexible", desc: "$5–$15/M blended" },
  { id: "unlimited", label: "Unlimited", desc: "Best quality, any cost" },
];

const SPEEDS = [
  { id: "any", label: "Any Speed" },
  { id: "fast", label: "Fast Only" },
  { id: "medium", label: "Medium+" },
];

const CONTEXTS = [
  { id: "any", label: "Any Size" },
  { id: "small", label: "< 200K" },
  { id: "medium", label: "200K–500K" },
  { id: "large", label: "500K+" },
];

function scoreModel(model: typeof MODELS[0], task: string, budget: string, speed: string, context: string) {
  let score = 50;
  const taskMap: Record<string, string[]> = {
    coding: ["gpt53codex", "sonnet45", "kimik25", "gpt54mini", "gpt54"],
    reasoning: ["opus46", "gpt54", "sonnet45", "gemini3pro", "gpt53codex"],
    lowcost: ["minimax27", "kimik25", "gpt54mini", "gemini3pro", "sonnet45"],
    longdocs: ["opus46", "minimax27", "gpt54", "sonnet45", "gemini3pro"],
    general: ["gpt54mini", "sonnet45", "gpt54", "gemini3pro", "kimik25"],
  };
  const ranked = taskMap[task] || taskMap.general;
  const idx = ranked.indexOf(model.id);
  if (idx === 0) score += 40;
  else if (idx === 1) score += 32;
  else if (idx === 2) score += 24;
  else if (idx === 3) score += 16;
  else if (idx === 4) score += 8;

  const blended = (model.inputCost + model.outputCost) / 2;
  if (budget === "tight") {
    if (blended < 1) score += 20;
    else if (blended < 3) score += 5;
    else score -= 15;
  } else if (budget === "moderate") {
    if (blended >= 1 && blended <= 5) score += 15;
    else if (blended < 1) score += 10;
    else score -= 10;
  } else if (budget === "flexible") {
    if (blended >= 3 && blended <= 15) score += 15;
    else if (blended < 3) score += 5;
    else score -= 5;
  }

  if (speed === "fast" && model.speed !== "fast") score -= 20;
  if (speed === "medium" && model.speed === "slow") score -= 10;
  if (model.speed === "fast") score += 5;

  if (context === "small" && model.context < 200000) score += 5;
  if (context === "medium" && model.context >= 200000 && model.context <= 500000) score += 10;
  if (context === "large" && model.context > 500000) score += 15;
  if (context === "large" && model.context <= 200000) score -= 10;

  return Math.max(0, Math.min(100, score));
}

function formatCtx(n: number) {
  return n >= 1000000 ? (n / 1000000).toFixed(0) + "M" : (n / 1000).toFixed(0) + "K";
}

function formatCost(n: number | null) {
  if (n === null) return "\u2014";
  return "$" + n.toFixed(n < 0.1 ? 3 : 2);
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: string }) {
  const { dark } = useTheme();
  const colors: Record<string, string> = dark ? {
    default: "bg-zinc-700/60 text-zinc-300",
    green: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    blue: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
    amber: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
    purple: "bg-purple-500/15 text-purple-400 border border-purple-500/20",
    pink: "bg-pink-500/15 text-pink-400 border border-pink-500/20",
  } : {
    default: "bg-zinc-200/80 text-zinc-600",
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    blue: "bg-blue-50 text-blue-700 border border-blue-200",
    amber: "bg-amber-50 text-amber-700 border border-amber-200",
    purple: "bg-purple-50 text-purple-700 border border-purple-200",
    pink: "bg-pink-50 text-pink-700 border border-pink-200",
  };
  return <span className={"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium " + (colors[variant] || colors.default)}>{children}</span>;
}

function ProviderBadge({ provider }: { provider: string }) {
  const map: Record<string, string> = { OpenAI: "green", Anthropic: "amber", Google: "blue", "Moonshot AI": "purple", MiniMax: "pink" };
  return <Badge variant={map[provider] || "default"}>{provider}</Badge>;
}

function TierBadge({ tier }: { tier: string }) {
  const map: Record<string, { label: string; variant: string }> = {
    budget: { label: "Budget", variant: "green" },
    mid: { label: "Mid-Tier", variant: "blue" },
    premium: { label: "Premium", variant: "amber" },
  };
  const t = map[tier] || map.mid;
  return <Badge variant={t.variant}>{t.label}</Badge>;
}

function ScoreBar({ score }: { score: number }) {
  const { dark } = useTheme();
  const color = score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-blue-500" : score >= 40 ? "bg-amber-500" : "bg-zinc-500";
  return (
    <div className="flex items-center gap-2 w-full">
      <div className={"flex-1 rounded-full h-2 overflow-hidden " + (dark ? "bg-zinc-800" : "bg-zinc-200")}>
        <div className={"h-full rounded-full transition-all duration-500 " + color} style={{ width: score + "%" }} />
      </div>
      <span className={"text-xs font-mono w-8 text-right " + (dark ? "text-zinc-400" : "text-zinc-500")}>{score}</span>
    </div>
  );
}

export default function ModelAdvisor() {
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

  const scored = useMemo(() => {
    return MODELS.map((m) => ({
      ...m,
      score: scoreModel(m, task, budget, speed, context),
      estimatedCost: ((inputTokens - cachedTokens) / 1_000_000) * m.inputCost +
        (outputTokens / 1_000_000) * m.outputCost +
        (m.cachedInputCost !== null ? (cachedTokens / 1_000_000) * m.cachedInputCost : (cachedTokens / 1_000_000) * m.inputCost),
    })).sort((a, b) => {
      const dir = sortDir === "desc" ? -1 : 1;
      if (sortCol === "score") return (a.score - b.score) * dir;
      if (sortCol === "name") return a.name.localeCompare(b.name) * dir;
      if (sortCol === "input") return (a.inputCost - b.inputCost) * dir;
      if (sortCol === "output") return (a.outputCost - b.outputCost) * dir;
      if (sortCol === "context") return (a.context - b.context) * dir;
      if (sortCol === "cost") return (a.estimatedCost - b.estimatedCost) * dir;
      return 0;
    });
  }, [task, budget, speed, context, inputTokens, outputTokens, cachedTokens, sortCol, sortDir]);

  const top = scored[0];
  const alts = scored.slice(1, 4);

  const toggleSort = useCallback((col: string) => {
    if (sortCol === col) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortCol(col); setSortDir("desc"); }
  }, [sortCol]);

  const exportMarkdown = useCallback(() => {
    const taskLabel = TASKS.find((t) => t.id === task)?.label || task;
    const budgetLabel = BUDGETS.find((b) => b.id === budget)?.label || budget;
    let md = "# Model Advisor Report\n\n";
    md += "**Generated:** " + new Date().toLocaleDateString() + "\n\n";
    md += "## Selection Criteria\n";
    md += "- **Task:** " + taskLabel + "\n";
    md += "- **Budget:** " + budgetLabel + "\n";
    md += "- **Speed:** " + speed + "\n";
    md += "- **Context:** " + context + "\n";
    md += "- **Tokens:** " + inputTokens.toLocaleString() + " input / " + outputTokens.toLocaleString() + " output / " + cachedTokens.toLocaleString() + " cached\n\n";
    md += "## Top Recommendation: " + top.name + "\n\n";
    md += "- **Provider:** " + top.provider + "\n";
    md += "- **Match Score:** " + top.score + "/100\n";
    md += "- **Context Window:** " + formatCtx(top.context) + "\n";
    md += "- **Pricing:** " + formatCost(top.inputCost) + " input / " + formatCost(top.outputCost) + " output per 1M tokens\n";
    md += "- **Estimated Cost:** $" + top.estimatedCost.toFixed(6) + " per request\n";
    md += "- **Strengths:** " + top.strengths.join(", ") + "\n";
    md += "- **Best For:** " + top.bestFor.join(", ") + "\n";
    md += "- **Ideal Input:** " + top.idealInput + "\n";
    md += "- **Ideal Output:** " + top.idealOutput + "\n\n";
    md += "## Alternatives\n\n";
    alts.forEach((m, i) => {
      md += "### " + (i + 1) + ". " + m.name + " (Score: " + m.score + "/100)\n";
      md += "- **Provider:** " + m.provider + " | **Pricing:** " + formatCost(m.inputCost) + "/" + formatCost(m.outputCost) + " per 1M | **Est. Cost:** $" + m.estimatedCost.toFixed(6) + "\n";
      md += "- **Strengths:** " + m.strengths.join(", ") + "\n\n";
    });
    md += "## Full Comparison\n\n";
    md += "| Model | Provider | Score | Input/1M | Output/1M | Context | Est. Cost |\n";
    md += "|-------|----------|-------|----------|-----------|---------|----------|\n";
    scored.forEach((m) => {
      md += "| " + m.name + " | " + m.provider + " | " + m.score + " | " + formatCost(m.inputCost) + " | " + formatCost(m.outputCost) + " | " + formatCtx(m.context) + " | $" + m.estimatedCost.toFixed(6) + " |\n";
    });
    md += "\n---\n*Prices as of March 2026. Verify at provider websites before committing.*\n";
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "model-advisor-report.md";
    a.click();
    URL.revokeObjectURL(url);
  }, [scored, top, alts, task, budget, speed, context, inputTokens, outputTokens, cachedTokens]);

  const SortHeader = ({ col, children, className = "" }: { col: string; children: React.ReactNode; className?: string }) => (
    <th className={"px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors select-none " + (dark ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-zinc-900") + " " + className} onClick={() => toggleSort(col)}>
      <span className="inline-flex items-center gap-1">{children}
        {sortCol === col ? (sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
      </span>
    </th>
  );

  const bg = dark ? "bg-zinc-950" : "bg-zinc-50";
  const text = dark ? "text-white" : "text-zinc-900";
  const textMuted = dark ? "text-zinc-400" : "text-zinc-500";
  const textFaint = dark ? "text-zinc-500" : "text-zinc-400";
  const textDim = dark ? "text-zinc-600" : "text-zinc-400";
  const textBody = dark ? "text-zinc-300" : "text-zinc-700";
  const card = dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-sm";
  const headerBg = dark ? "bg-zinc-950/80 border-zinc-800/80" : "bg-white/90 border-zinc-200";
  const inputBg = dark ? "bg-zinc-800 border-zinc-700" : "bg-zinc-100 border-zinc-300";
  const hoverBg = dark ? "hover:bg-zinc-800 hover:text-zinc-200" : "hover:bg-zinc-100 hover:text-zinc-900";
  const borderSub = dark ? "border-zinc-800" : "border-zinc-200";
  const presetBtn = dark ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border-zinc-700/50" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 border-zinc-200";

  const activeTask = (id: string) => task === id
    ? (dark ? "bg-blue-500/15 text-blue-400 border border-blue-500/30" : "bg-blue-50 text-blue-700 border border-blue-300")
    : (dark ? "text-zinc-400" : "text-zinc-500") + " " + hoverBg + " border border-transparent";
  const activeBudget = (id: string) => budget === id
    ? (dark ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border border-emerald-300")
    : (dark ? "text-zinc-400" : "text-zinc-500") + " " + hoverBg + " border border-transparent";
  const activeSpeed = (id: string) => speed === id
    ? (dark ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" : "bg-amber-50 text-amber-700 border border-amber-300")
    : (dark ? "text-zinc-400" : "text-zinc-500") + " " + hoverBg + " border border-transparent";
  const activeCtx = (id: string) => context === id
    ? (dark ? "bg-purple-500/15 text-purple-400 border border-purple-500/30" : "bg-purple-50 text-purple-700 border border-purple-300")
    : (dark ? "text-zinc-400" : "text-zinc-500") + " " + hoverBg + " border border-transparent";

  return (
    <ThemeContext.Provider value={{ dark }}>
      <div className={"min-h-screen " + bg + " " + text + " transition-colors duration-300"}>
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
              <button onClick={() => setDark(!dark)} className={"p-2.5 rounded-lg border transition-all duration-300 " + (dark ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-amber-400" : "bg-white border-zinc-200 hover:bg-zinc-50 text-indigo-600 shadow-sm")} title={dark ? "Switch to light mode" : "Switch to dark mode"}>
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={exportMarkdown} className={"flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition-colors " + (dark ? "bg-zinc-800 hover:bg-zinc-700 border-zinc-700" : "bg-white hover:bg-zinc-50 border-zinc-200 shadow-sm")}>
                <Download className="w-4 h-4" /> Export MD
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className={"border rounded-xl p-4 transition-colors duration-300 " + card}>
              <label className={"flex items-center gap-2 text-sm font-semibold mb-3 " + textBody}><Target className="w-4 h-4 text-blue-400" /> Task</label>
              <div className="space-y-1.5">
                {TASKS.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button key={t.id} onClick={() => setTask(t.id)} className={"w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all " + activeTask(t.id)}>
                      <Icon className="w-4 h-4 shrink-0" /> {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={"border rounded-xl p-4 transition-colors duration-300 " + card}>
              <label className={"flex items-center gap-2 text-sm font-semibold mb-3 " + textBody}><DollarSign className="w-4 h-4 text-emerald-400" /> Budget</label>
              <div className="space-y-1.5">
                {BUDGETS.map((b) => (
                  <button key={b.id} onClick={() => setBudget(b.id)} className={"w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all " + activeBudget(b.id)}>
                    <span>{b.label}</span>
                    <span className="text-xs opacity-60">{b.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={"border rounded-xl p-4 transition-colors duration-300 " + card}>
              <label className={"flex items-center gap-2 text-sm font-semibold mb-3 " + textBody}><Zap className="w-4 h-4 text-amber-400" /> Speed</label>
              <div className="space-y-1.5">
                {SPEEDS.map((s) => (
                  <button key={s.id} onClick={() => setSpeed(s.id)} className={"w-full px-3 py-2 rounded-lg text-sm text-left transition-all " + activeSpeed(s.id)}>
                    {s.label}
                  </button>
                ))}
              </div>
              <div className={"mt-4 pt-4 border-t " + borderSub}>
                <label className={"flex items-center gap-2 text-sm font-semibold mb-3 " + textBody}><FileText className="w-4 h-4 text-purple-400" /> Context Size</label>
                <div className="space-y-1.5">
                  {CONTEXTS.map((c) => (
                    <button key={c.id} onClick={() => setContext(c.id)} className={"w-full px-3 py-2 rounded-lg text-sm text-left transition-all " + activeCtx(c.id)}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={"border rounded-xl p-4 transition-colors duration-300 " + card}>
              <label className={"flex items-center gap-2 text-sm font-semibold mb-3 " + textBody}><Calculator className="w-4 h-4 text-pink-400" /> Token Estimator</label>
              <div className="space-y-4">
                <div>
                  <label className={"text-xs mb-1 block " + textFaint}>Input Tokens</label>
                  <input type="number" value={inputTokens} onChange={(e) => setInputTokens(Math.max(0, +e.target.value))} className={"w-full rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500 transition-colors " + inputBg + " " + text} />
                </div>
                <div>
                  <label className={"text-xs mb-1 block " + textFaint}>Output Tokens</label>
                  <input type="number" value={outputTokens} onChange={(e) => setOutputTokens(Math.max(0, +e.target.value))} className={"w-full rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500 transition-colors " + inputBg + " " + text} />
                </div>
                <div>
                  <label className={"text-xs mb-1 block " + textFaint}>Cached Input Tokens</label>
                  <input type="number" value={cachedTokens} onChange={(e) => setCachedTokens(Math.max(0, +e.target.value))} className={"w-full rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500 transition-colors " + inputBg + " " + text} />
                </div>
                <div className={"pt-2 border-t " + borderSub}>
                  <p className={"text-xs mb-2 " + textFaint}>Quick presets</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "Chat turn", i: 800, o: 400, c: 0 },
                      { label: "Code gen", i: 2000, o: 1500, c: 0 },
                      { label: "RAG query", i: 8000, o: 800, c: 4000 },
                      { label: "Doc summary", i: 20000, o: 2000, c: 0 },
                      { label: "Full codebase", i: 100000, o: 5000, c: 80000 },
                    ].map((p) => (
                      <button key={p.label} onClick={() => { setInputTokens(p.i); setOutputTokens(p.o); setCachedTokens(p.c); }}
                        className={"px-2 py-1 rounded-md text-xs transition-colors border " + presetBtn}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={"rounded-2xl p-6 relative overflow-hidden border transition-colors duration-300 " + (dark ? "bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 border-zinc-800" : "bg-gradient-to-r from-blue-50 via-purple-50/50 to-pink-50/50 border-zinc-200 shadow-sm")}>
            <div className={"absolute top-0 right-0 w-64 h-64 rounded-bl-full pointer-events-none " + (dark ? "bg-gradient-to-bl from-blue-500/10 to-transparent" : "bg-gradient-to-bl from-blue-100/40 to-transparent")} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold">Top Recommendation</h2>
                <Badge variant="amber">Best Match</Badge>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: top.color + "20", border: "1px solid " + top.color + "40" }}>
                      <Sparkles className="w-6 h-6" style={{ color: top.color }} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{top.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <ProviderBadge provider={top.provider} />
                        <TierBadge tier={top.tier} />
                        <Badge variant="default">{formatCtx(top.context)} context</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={"text-sm " + textMuted}>Match Score</span>
                    <div className="flex-1 max-w-xs"><ScoreBar score={top.score} /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className={"rounded-lg p-3 border " + (dark ? "bg-zinc-900/60 border-zinc-800/50" : "bg-zinc-50 border-zinc-200")}>
                      <p className={"text-xs mb-1 " + textFaint}>Best Use Cases</p>
                      <div className="flex flex-wrap gap-1">{top.bestFor.map((b) => <Badge key={b}>{b}</Badge>)}</div>
                    </div>
                    <div className={"rounded-lg p-3 border " + (dark ? "bg-zinc-900/60 border-zinc-800/50" : "bg-zinc-50 border-zinc-200")}>
                      <p className={"text-xs mb-1 " + textFaint}>Key Strengths</p>
                      <div className="flex flex-wrap gap-1">{top.strengths.map((s) => <Badge key={s}>{s}</Badge>)}</div>
                    </div>
                    <div className={"rounded-lg p-3 border " + (dark ? "bg-zinc-900/60 border-zinc-800/50" : "bg-zinc-50 border-zinc-200")}>
                      <p className={"text-xs mb-1.5 flex items-center gap-1 " + textFaint}><MessageSquare className="w-3 h-3" /> Ideal Input</p>
                      <p className={"text-sm " + textBody}>{top.idealInput}</p>
                    </div>
                    <div className={"rounded-lg p-3 border " + (dark ? "bg-zinc-900/60 border-zinc-800/50" : "bg-zinc-50 border-zinc-200")}>
                      <p className={"text-xs mb-1.5 flex items-center gap-1 " + textFaint}><FileText className="w-3 h-3" /> Ideal Output</p>
                      <p className={"text-sm " + textBody}>{top.idealOutput}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className={"border rounded-xl p-4 space-y-3 " + card}>
                    <h4 className={"text-sm font-semibold " + textBody}>Pricing (per 1M tokens)</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span className={textFaint}>Input</span><span className="font-mono text-emerald-500">{formatCost(top.inputCost)}</span></div>
                      <div className="flex justify-between text-sm"><span className={textFaint}>Output</span><span className="font-mono text-emerald-500">{formatCost(top.outputCost)}</span></div>
                      <div className="flex justify-between text-sm"><span className={textFaint}>Cached Input</span><span className="font-mono text-blue-500">{formatCost(top.cachedInputCost)}</span></div>
                      {top.cacheWriteCost !== null && <div className="flex justify-between text-sm"><span className={textFaint}>Cache Write</span><span className="font-mono text-amber-500">{formatCost(top.cacheWriteCost)}</span></div>}
                    </div>
                  </div>
                  <div className={"border rounded-xl p-4 " + card}>
                    <h4 className={"text-sm font-semibold mb-2 " + textBody}>Estimated Cost</h4>
                    <p className="text-3xl font-bold font-mono text-emerald-500">{"$" + top.estimatedCost.toFixed(6)}</p>
                    <p className={"text-xs mt-1 " + textFaint}>per request ({inputTokens.toLocaleString()} in / {outputTokens.toLocaleString()} out{cachedTokens > 0 ? " / " + cachedTokens.toLocaleString() + " cached" : ""})</p>
                    <div className={"mt-3 pt-3 border-t space-y-1 " + borderSub}>
                      <div className="flex justify-between text-xs"><span className={textFaint}>1K requests</span><span className={"font-mono " + textBody}>{"$" + (top.estimatedCost * 1000).toFixed(4)}</span></div>
                      <div className="flex justify-between text-xs"><span className={textFaint}>10K requests</span><span className={"font-mono " + textBody}>{"$" + (top.estimatedCost * 10000).toFixed(2)}</span></div>
                      <div className="flex justify-between text-xs"><span className={textFaint}>100K requests</span><span className={"font-mono " + textBody}>{"$" + (top.estimatedCost * 100000).toFixed(2)}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Star className={"w-5 h-5 " + textFaint} /> Alternatives</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {alts.map((m, i) => (
                <div key={m.id} className={"border rounded-xl p-4 transition-colors " + card + " " + (dark ? "hover:border-zinc-700" : "hover:border-zinc-300")}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={"text-xs font-mono " + textDim}>#{i + 2}</span>
                      <h3 className="font-semibold text-sm">{m.name}</h3>
                    </div>
                    <ProviderBadge provider={m.provider} />
                  </div>
                  <ScoreBar score={m.score} />
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div><span className={textFaint}>Input</span><span className="font-mono text-emerald-500 ml-1">{formatCost(m.inputCost)}</span></div>
                    <div><span className={textFaint}>Output</span><span className="font-mono text-emerald-500 ml-1">{formatCost(m.outputCost)}</span></div>
                    <div><span className={textFaint}>Context</span><span className={"ml-1 " + textBody}>{formatCtx(m.context)}</span></div>
                    <div><span className={textFaint}>Est.</span><span className={"font-mono ml-1 " + textBody}>{"$" + m.estimatedCost.toFixed(6)}</span></div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">{m.bestFor.slice(0, 3).map((b) => <Badge key={b}>{b}</Badge>)}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><ArrowUpDown className={"w-5 h-5 " + textFaint} /> Full Comparison</h2>
            <div className={"border rounded-xl overflow-hidden " + card}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={"border-b " + (dark ? "border-zinc-800 bg-zinc-900/80" : "border-zinc-200 bg-zinc-50")}>
                      <SortHeader col="name">Model</SortHeader>
                      <th className={"px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider " + (dark ? "text-zinc-400" : "text-zinc-500")}>Provider</th>
                      <SortHeader col="score">Score</SortHeader>
                      <SortHeader col="input">Input/1M</SortHeader>
                      <SortHeader col="output">Output/1M</SortHeader>
                      <th className={"px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider " + (dark ? "text-zinc-400" : "text-zinc-500")}>Cached</th>
                      <SortHeader col="context">Context</SortHeader>
                      <SortHeader col="cost">Est. Cost</SortHeader>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {scored.map((m, i) => [
                      <tr key={m.id} className={"border-b transition-colors cursor-pointer " + (dark ? "border-zinc-800/50 hover:bg-zinc-800/30" : "border-zinc-100 hover:bg-zinc-50") + " " + (i === 0 ? (dark ? "bg-blue-500/5" : "bg-blue-50/50") : "")} onClick={() => setExpandedModel(expandedModel === m.id ? null : m.id)}>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            {i === 0 && <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                            <span className={"text-sm font-medium " + (i === 0 ? text : textBody)}>{m.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3"><ProviderBadge provider={m.provider} /></td>
                        <td className="px-3 py-3 w-36"><ScoreBar score={m.score} /></td>
                        <td className="px-3 py-3 text-sm font-mono text-emerald-500">{formatCost(m.inputCost)}</td>
                        <td className="px-3 py-3 text-sm font-mono text-emerald-500">{formatCost(m.outputCost)}</td>
                        <td className="px-3 py-3 text-sm font-mono text-blue-500">{formatCost(m.cachedInputCost)}</td>
                        <td className={"px-3 py-3 text-sm " + textBody}>{formatCtx(m.context)}</td>
                        <td className={"px-3 py-3 text-sm font-mono " + textBody}>{"$" + m.estimatedCost.toFixed(6)}</td>
                        <td className="px-3 py-3">{expandedModel === m.id ? <ChevronUp className={"w-4 h-4 " + textFaint} /> : <ChevronDown className={"w-4 h-4 " + textFaint} />}</td>
                      </tr>,
                      expandedModel === m.id ? (
                        <tr key={m.id + "-detail"} className={dark ? "bg-zinc-800/20" : "bg-zinc-50"}>
                          <td colSpan={9} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div>
                                <p className={"text-xs mb-2 font-semibold uppercase " + textFaint}>Strengths</p>
                                <div className="flex flex-wrap gap-1">{m.strengths.map((s) => <Badge key={s}>{s}</Badge>)}</div>
                              </div>
                              <div>
                                <p className={"text-xs mb-2 font-semibold uppercase " + textFaint}>Best For</p>
                                <div className="flex flex-wrap gap-1">{m.bestFor.map((b) => <Badge key={b}>{b}</Badge>)}</div>
                              </div>
                              <div>
                                <p className={"text-xs mb-2 font-semibold uppercase " + textFaint}>Ideal Input</p>
                                <p className={"text-sm " + textBody}>{m.idealInput}</p>
                              </div>
                              <div>
                                <p className={"text-xs mb-2 font-semibold uppercase " + textFaint}>Ideal Output</p>
                                <p className={"text-sm " + textBody}>{m.idealOutput}</p>
                              </div>
                              {m.cacheWriteCost !== null && (
                                <div>
                                  <p className={"text-xs mb-1 font-semibold uppercase " + textFaint}>Cache Write Cost</p>
                                  <span className="font-mono text-amber-500 text-sm">{formatCost(m.cacheWriteCost)}/1M</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : null,
                    ]).flat()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className={"text-center py-6 border-t " + borderSub}>
            <p className={"text-xs " + textDim}>Prices as of March 2026. Verify at provider websites before committing.</p>
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
