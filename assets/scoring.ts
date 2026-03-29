import type { Model, Benchmarks } from "./types";

// --- Task-aligned benchmark weights ---

const TASK_WEIGHTS: Record<string, Partial<Record<keyof Benchmarks, number>>> = {
  coding:    { sweProVerified: 0.5, arenaCoding: 0.3, arenaOverall: 0.2 },
  reasoning: { mmluPro: 0.3, aime: 0.3, arenaOverall: 0.4 },
  general:   { arenaOverall: 0.5, sweProVerified: 0.2, mmluPro: 0.3 },
  longdocs:  { arenaOverall: 0.6, sweProVerified: 0.2, mmluPro: 0.2 },
  lowcost:   { arenaOverall: 0.5, sweProVerified: 0.25, mmluPro: 0.25 },
};

const BUDGET_RANGES: Record<string, [number, number]> = {
  tight:     [0, 1],
  moderate:  [1, 5],
  flexible:  [5, 15],
  unlimited: [0, Infinity],
};

// --- Sub-functions ---

function computeQualityScore(
  benchmarks: Benchmarks,
  weights: Partial<Record<keyof Benchmarks, number>>,
  allModels: readonly Model[],
): number {
  const dims = Object.keys(weights) as (keyof Benchmarks)[];
  // Collect min/max for normalization
  const ranges: Record<string, { min: number; max: number }> = {};
  for (const dim of dims) {
    const vals = allModels.map(m => m.benchmarks[dim]).filter((v): v is number => v !== null);
    if (vals.length === 0) continue;
    ranges[dim] = { min: Math.min(...vals), max: Math.max(...vals) };
  }
  // Weighted sum of normalized scores
  let totalWeight = 0;
  let totalScore = 0;
  for (const dim of dims) {
    const val = benchmarks[dim];
    const w = weights[dim] ?? 0;
    if (val === null || !ranges[dim]) continue;
    const { min, max } = ranges[dim];
    const normalized = max === min ? 0.5 : (val - min) / (max - min);
    totalScore += normalized * w;
    totalWeight += w;
  }
  if (totalWeight === 0) return 0;
  return (totalScore / totalWeight) * 50;  // Scale to 0-50
}

function computeBudgetScore(pricingTiers: Model["pricingTiers"], budgetId: string): number {
  const range = BUDGET_RANGES[budgetId];
  if (!range) return 10;
  const tier = pricingTiers[0];
  const blended = (tier.inputCost + tier.outputCost) / 2;
  if (budgetId === "unlimited") return 15;
  const [lo, hi] = range;
  if (blended < lo || blended > hi) return 0;
  const center = (lo + hi) / 2;
  const dist = Math.abs(blended - center) / (center - lo || 1);
  return Math.round(20 - dist * 10);
}

function computeSpeedScore(modelSpeed: string, requiredSpeed: string): number {
  if (requiredSpeed === "any") return 10;
  const speeds = ["fast", "medium", "slow"];
  const modelIdx = speeds.indexOf(modelSpeed);
  const reqIdx = speeds.indexOf(requiredSpeed);
  if (modelIdx <= reqIdx) return 15;
  if (modelIdx === reqIdx + 1) return 5;
  return 0;
}

function computeContextScore(modelContext: number, requiredSize: string): number {
  if (requiredSize === "any") return 10;
  if (requiredSize === "small") return modelContext < 200000 ? 15 : 5;
  if (requiredSize === "medium") {
    if (modelContext >= 200000 && modelContext <= 500000) return 15;
    return modelContext > 500000 ? 10 : 0;
  }
  // "large"
  if (modelContext > 500000) return 15;
  if (modelContext >= 200000) return 5;
  return 0;
}

// --- Main scoring function ---

export function scoreModel(
  model: Model,
  task: string,
  budget: string,
  speed: string,
  context: string,
  allModels: readonly Model[],
): number {
  const weights = TASK_WEIGHTS[task] ?? TASK_WEIGHTS.general;
  const quality = computeQualityScore(model.benchmarks, weights, allModels);
  const budgetFit = computeBudgetScore(model.pricingTiers, budget);
  const speedFit = computeSpeedScore(model.speed, speed);
  const contextFit = computeContextScore(model.context, context);
  return Math.max(0, Math.min(100, Math.round(quality + budgetFit + speedFit + contextFit)));
}
