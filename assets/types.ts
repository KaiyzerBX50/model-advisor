import type { ComponentType } from "react";

export interface PricingTier {
  readonly upTo: number | null;
  readonly inputCost: number;
  readonly outputCost: number;
  readonly cachedInputCost: number | null;
  readonly cacheWriteCost: number | null;
}

export interface Benchmarks {
  readonly sweProVerified: number | null;
  readonly arenaOverall: number | null;
  readonly arenaCoding: number | null;
  readonly mmluPro: number | null;
  readonly aime: number | null;
}

export interface Model {
  readonly id: string;
  readonly name: string;
  readonly provider: string;
  readonly context: number;
  readonly maxOutput: number;
  readonly pricingTiers: readonly PricingTier[];
  readonly speed: "fast" | "medium" | "slow";
  readonly strengths: readonly string[];
  readonly bestFor: readonly string[];
  readonly idealInput: string;
  readonly idealOutput: string;
  readonly tier: "budget" | "mid" | "premium";
  readonly color: string;
  readonly benchmarks: Benchmarks;
  readonly legacy?: boolean;
  readonly reasoningEffort?: readonly string[];
}

export interface ScoredModel extends Model {
  readonly score: number;
  readonly estimatedCost: number;
}

export interface Task {
  readonly id: string;
  readonly label: string;
  readonly icon: ComponentType<{ className?: string }>;
}

export interface Budget {
  readonly id: string;
  readonly label: string;
  readonly desc: string;
}
