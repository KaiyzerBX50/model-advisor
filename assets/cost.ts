import type { Model, PricingTier } from "./types";

export function computeCost(model: Model, inputTokens: number, outputTokens: number, cachedTokens: number): number {
  const tiers = model.pricingTiers;
  const uncachedInput = inputTokens - cachedTokens;
  let cost = 0;
  let consumed = 0;
  let remainingUncached = uncachedInput;
  let remainingCached = cachedTokens;

  for (const tier of tiers) {
    const tierCap = tier.upTo !== null ? tier.upTo - consumed : Infinity;
    const uncachedInTier = Math.min(remainingUncached, Math.max(0, tierCap));
    cost += (uncachedInTier / 1_000_000) * tier.inputCost;
    remainingUncached -= uncachedInTier;
    const cachedRate = tier.cachedInputCost ?? tier.inputCost;
    const cachedInTier = Math.min(remainingCached, Math.max(0, tierCap - uncachedInTier));
    cost += (cachedInTier / 1_000_000) * cachedRate;
    remainingCached -= cachedInTier;
    consumed += uncachedInTier + cachedInTier;
  }

  // Output priced at the tier matching total input volume
  const outputTier = tiers.find(t => t.upTo === null || inputTokens <= t.upTo) || tiers[tiers.length - 1];
  cost += (outputTokens / 1_000_000) * outputTier.outputCost;
  return cost;
}

export function formatCtx(n: number): string {
  return n >= 1000000 ? (n / 1000000).toFixed(0) + "M" : (n / 1000).toFixed(0) + "K";
}

export function formatCost(n: number | null): string {
  if (n === null) return "\u2014";
  return "$" + n.toFixed(n < 0.1 ? 3 : 2);
}

export interface CostLine {
  readonly label: string;
  readonly amount: number;
}

export function computeCostBreakdown(model: Model, inputTokens: number, outputTokens: number, cachedTokens: number): CostLine[] {
  const tiers = model.pricingTiers;
  if (tiers.length === 1) {
    return [{ label: "Total", amount: computeCost(model, inputTokens, outputTokens, cachedTokens) }];
  }
  const lines: CostLine[] = [];
  const uncachedInput = inputTokens - cachedTokens;
  let consumed = 0;
  let remainingUncached = uncachedInput;
  let remainingCached = cachedTokens;

  for (const tier of tiers) {
    const tierCap = tier.upTo !== null ? tier.upTo - consumed : Infinity;
    const uncachedInTier = Math.min(remainingUncached, Math.max(0, tierCap));
    const cachedRate = tier.cachedInputCost ?? tier.inputCost;
    const cachedInTier = Math.min(remainingCached, Math.max(0, tierCap - uncachedInTier));
    const tierCost = (uncachedInTier / 1_000_000) * tier.inputCost + (cachedInTier / 1_000_000) * cachedRate;
    if (tierCost > 0) {
      const label = tier.upTo !== null ? "Input \u2264" + formatCtx(tier.upTo) : "Input >" + formatCtx(tiers[tiers.length - 2]?.upTo ?? 0);
      lines.push({ label, amount: tierCost });
    }
    remainingUncached -= uncachedInTier;
    remainingCached -= cachedInTier;
    consumed += uncachedInTier + cachedInTier;
  }

  const outputTier = tiers.find(t => t.upTo === null || inputTokens <= t.upTo) || tiers[tiers.length - 1];
  lines.push({ label: "Output", amount: (outputTokens / 1_000_000) * outputTier.outputCost });
  return lines;
}
