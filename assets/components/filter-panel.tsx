import React from "react";
import { Target, DollarSign, Zap, FileText, Calculator } from "lucide-react";
import { useTheme, t, themeClass } from "../theme";
import { TASKS, BUDGETS, SPEEDS, CONTEXTS } from "../models";
import type { Task, Budget } from "../types";

// --- Theme classes for filter buttons ---

const FILTER_THEMES = {
  task: {
    active: { dark: "bg-blue-500/15 text-blue-400 border border-blue-500/30", light: "bg-blue-50 text-blue-700 border border-blue-300" },
    inactive: { dark: "text-zinc-400", light: "text-zinc-500" },
  },
  budget: {
    active: { dark: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30", light: "bg-emerald-50 text-emerald-700 border border-emerald-300" },
    inactive: { dark: "text-zinc-400", light: "text-zinc-500" },
  },
  speed: {
    active: { dark: "bg-amber-500/15 text-amber-400 border border-amber-500/30", light: "bg-amber-50 text-amber-700 border border-amber-300" },
    inactive: { dark: "text-zinc-400", light: "text-zinc-500" },
  },
  context: {
    active: { dark: "bg-purple-500/15 text-purple-400 border border-purple-500/30", light: "bg-purple-50 text-purple-700 border border-purple-300" },
    inactive: { dark: "text-zinc-400", light: "text-zinc-500" },
  },
};

function filterBtnClass(dark: boolean, isActive: boolean, theme: typeof FILTER_THEMES.task, hoverBg: string): string {
  if (isActive) {
    return themeClass(dark, true, theme.active, theme.inactive);
  }
  return themeClass(dark, false, theme.active, theme.inactive) + " " + hoverBg + " border border-transparent";
}

// --- Token presets ---

const TOKEN_PRESETS = [
  { label: "Chat turn", i: 800, o: 400, c: 0 },
  { label: "Code gen", i: 2000, o: 1500, c: 0 },
  { label: "RAG query", i: 8000, o: 800, c: 4000 },
  { label: "Doc summary", i: 20000, o: 2000, c: 0 },
  { label: "Full codebase", i: 100000, o: 5000, c: 80000 },
];

// --- Sub-components ---

function TaskCard({ task, setTask, card, textBody, hoverBg }: {
  task: string; setTask: (t: string) => void;
  card: string; textBody: string; hoverBg: string;
}) {
  const { dark } = useTheme();
  return (
    <div className={"border rounded-xl p-4 transition-colors duration-300 " + card}>
      <label className={"flex items-center gap-2 text-sm font-semibold mb-3 " + textBody}>
        <Target className="w-4 h-4 text-blue-400" /> Task
      </label>
      <div className="space-y-1.5">
        {TASKS.map((tk) => {
          const Icon = tk.icon;
          return (
            <button key={tk.id} onClick={() => setTask(tk.id)}
              className={"w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all " + filterBtnClass(dark, task === tk.id, FILTER_THEMES.task, hoverBg)}>
              <Icon className="w-4 h-4 shrink-0" /> {tk.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BudgetCard({ budget, setBudget, card, textBody, hoverBg }: {
  budget: string; setBudget: (b: string) => void;
  card: string; textBody: string; hoverBg: string;
}) {
  const { dark } = useTheme();
  return (
    <div className={"border rounded-xl p-4 transition-colors duration-300 " + card}>
      <label className={"flex items-center gap-2 text-sm font-semibold mb-3 " + textBody}>
        <DollarSign className="w-4 h-4 text-emerald-400" /> Budget
      </label>
      <div className="space-y-1.5">
        {BUDGETS.map((b) => (
          <button key={b.id} onClick={() => setBudget(b.id)}
            className={"w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all " + filterBtnClass(dark, budget === b.id, FILTER_THEMES.budget, hoverBg)}>
            <span>{b.label}</span>
            <span className="text-xs opacity-60">{b.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SpeedContextCard({ speed, setSpeed, context, setContext, card, textBody, borderSub, hoverBg }: {
  speed: string; setSpeed: (s: string) => void;
  context: string; setContext: (c: string) => void;
  card: string; textBody: string; borderSub: string; hoverBg: string;
}) {
  const { dark } = useTheme();
  return (
    <div className={"border rounded-xl p-4 transition-colors duration-300 " + card}>
      <label className={"flex items-center gap-2 text-sm font-semibold mb-3 " + textBody}>
        <Zap className="w-4 h-4 text-amber-400" /> Speed
      </label>
      <div className="space-y-1.5">
        {SPEEDS.map((s) => (
          <button key={s.id} onClick={() => setSpeed(s.id)}
            className={"w-full px-3 py-2 rounded-lg text-sm text-left transition-all " + filterBtnClass(dark, speed === s.id, FILTER_THEMES.speed, hoverBg)}>
            {s.label}
          </button>
        ))}
      </div>
      <div className={"mt-4 pt-4 border-t " + borderSub}>
        <label className={"flex items-center gap-2 text-sm font-semibold mb-3 " + textBody}>
          <FileText className="w-4 h-4 text-purple-400" /> Context Size
        </label>
        <div className="space-y-1.5">
          {CONTEXTS.map((c) => (
            <button key={c.id} onClick={() => setContext(c.id)}
              className={"w-full px-3 py-2 rounded-lg text-sm text-left transition-all " + filterBtnClass(dark, context === c.id, FILTER_THEMES.context, hoverBg)}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TokenEstimator({ inputTokens, setInputTokens, outputTokens, setOutputTokens, cachedTokens, setCachedTokens, card, textBody, textFaint, borderSub, inputBg, text, presetBtn }: {
  inputTokens: number; setInputTokens: (n: number) => void;
  outputTokens: number; setOutputTokens: (n: number) => void;
  cachedTokens: number; setCachedTokens: (n: number) => void;
  card: string; textBody: string; textFaint: string; borderSub: string;
  inputBg: string; text: string; presetBtn: string;
}) {
  return (
    <div className={"border rounded-xl p-4 transition-colors duration-300 " + card}>
      <label className={"flex items-center gap-2 text-sm font-semibold mb-3 " + textBody}>
        <Calculator className="w-4 h-4 text-pink-400" /> Token Estimator
      </label>
      <div className="space-y-4">
        <div>
          <label className={"text-xs mb-1 block " + textFaint}>Input Tokens</label>
          <input type="number" value={inputTokens} onChange={(e) => setInputTokens(Math.max(0, +e.target.value))}
            className={"w-full rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500 transition-colors " + inputBg + " " + text} />
        </div>
        <div>
          <label className={"text-xs mb-1 block " + textFaint}>Output Tokens</label>
          <input type="number" value={outputTokens} onChange={(e) => setOutputTokens(Math.max(0, +e.target.value))}
            className={"w-full rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500 transition-colors " + inputBg + " " + text} />
        </div>
        <div>
          <label className={"text-xs mb-1 block " + textFaint}>Cached Input Tokens</label>
          <input type="number" value={cachedTokens} onChange={(e) => setCachedTokens(Math.max(0, +e.target.value))}
            className={"w-full rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500 transition-colors " + inputBg + " " + text} />
        </div>
        <div className={"pt-2 border-t " + borderSub}>
          <p className={"text-xs mb-2 " + textFaint}>Quick presets</p>
          <div className="flex flex-wrap gap-1.5">
            {TOKEN_PRESETS.map((p) => (
              <button key={p.label} onClick={() => { setInputTokens(p.i); setOutputTokens(p.o); setCachedTokens(p.c); }}
                className={"px-2 py-1 rounded-md text-xs transition-colors border " + presetBtn}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Props ---

export interface FilterPanelProps {
  task: string; setTask: (t: string) => void;
  budget: string; setBudget: (b: string) => void;
  speed: string; setSpeed: (s: string) => void;
  context: string; setContext: (c: string) => void;
  inputTokens: number; setInputTokens: (n: number) => void;
  outputTokens: number; setOutputTokens: (n: number) => void;
  cachedTokens: number; setCachedTokens: (n: number) => void;
}

// --- Main component ---

export function FilterPanel(props: FilterPanelProps) {
  const { dark } = useTheme();
  const card = t(dark, "bg-zinc-900 border-zinc-800", "bg-white border-zinc-200 shadow-sm");
  const textBody = t(dark, "text-zinc-300", "text-zinc-700");
  const textFaint = t(dark, "text-zinc-500", "text-zinc-400");
  const borderSub = t(dark, "border-zinc-800", "border-zinc-200");
  const inputBg = t(dark, "bg-zinc-800 border-zinc-700", "bg-zinc-100 border-zinc-300");
  const text = t(dark, "text-white", "text-zinc-900");
  const hoverBg = t(dark, "hover:bg-zinc-800 hover:text-zinc-200", "hover:bg-zinc-100 hover:text-zinc-900");
  const presetBtn = t(dark, "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border-zinc-700/50", "bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 border-zinc-200");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <TaskCard task={props.task} setTask={props.setTask} card={card} textBody={textBody} hoverBg={hoverBg} />
      <BudgetCard budget={props.budget} setBudget={props.setBudget} card={card} textBody={textBody} hoverBg={hoverBg} />
      <SpeedContextCard speed={props.speed} setSpeed={props.setSpeed} context={props.context} setContext={props.setContext} card={card} textBody={textBody} borderSub={borderSub} hoverBg={hoverBg} />
      <TokenEstimator inputTokens={props.inputTokens} setInputTokens={props.setInputTokens} outputTokens={props.outputTokens} setOutputTokens={props.setOutputTokens} cachedTokens={props.cachedTokens} setCachedTokens={props.setCachedTokens} card={card} textBody={textBody} textFaint={textFaint} borderSub={borderSub} inputBg={inputBg} text={text} presetBtn={presetBtn} />
    </div>
  );
}
