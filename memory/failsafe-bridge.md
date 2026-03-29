# Research Memory

## 2026-03-29 (Initial Pass)

- Repository is a lightweight Zo Computer skill with one main UI file and one installer script.
- Catalog and scoring are hard-coded in `assets/model-advisor.tsx`; no source provenance exists in-repo yet.
- Current external signals worth using for future remediation are Arena Overall, Arena Code, Scale SWE Atlas, Scale MCP Atlas, and Scale Professional Reasoning.
- Highest-priority catalog drift observed during research: `Sonnet 4.5` is stale relative to visible `Claude Sonnet 4.6` leaderboard placement.

## 2026-03-29 (Deep Dive — Secondary Pass)

### Factual Corrections to Current Catalog
- GPT-5.4 context is 1.05M (not 272K as cataloged). Output cost is $15.00/M (not $10.00). Long-context pricing kicks in above 272K input.
- MiniMax M2.7 context is ~200K (204,800), not 1M as cataloged. Strengths description "1M token context" is incorrect.
- Kimi K2.5 context is 256K (not 262K as cataloged). Minor discrepancy.
- Gemini 3 Pro was deprecated/shut down on March 9, 2026. Must be replaced with Gemini 3.1 Pro Preview.
- Sonnet 4.5 is now a legacy model. Sonnet 4.6 (released Feb 17, 2026) is the successor with 1M context at the same price.

### Models Missing from Catalog
- **Claude Sonnet 4.6**: $3/$15, 1M context, fast, SWE-bench Verified 79.6%, OSWorld 72.5%. Replaces Sonnet 4.5.
- **Gemini 3.1 Pro Preview**: $2/$12, 1M context, multimodal (audio/video), three-tier thinking. Replaces Gemini 3 Pro.
- **Gemini 3 Flash Preview**: $0.50/$3.00, 1M context, 218 tok/sec, SWE-bench 78%. Budget agentic powerhouse.
- **Grok 4.20**: $2/$6, 2M context (largest), HumanEval 94.1%, SWE-bench 78.4%, 4-agent multi-agent system.
- **GLM-5**: $1/$3.20, 200K context, 744B params MIT license, AIME 92.7%, SWE-bench 77.8%.
- **Claude Haiku 4.5**: $1/$5, 200K, fastest Claude, budget tier.
- **GPT-5.4 nano**: $0.20/$1.25, 400K, fastest OpenAI, classification/routing tier.

### Key Architecture Insights
- GPT-5.4 absorbed the Codex line — no separate GPT-5.4 Codex model exists.
- "Opus 4.6 Thinking" and "K2.5 Instant" are mode variants, not separate models.
- SWE-bench Verified is contaminated; SWE-bench Pro is the credible coding benchmark now.
- All three major providers (OpenAI, Anthropic, Google) publish model selection guides recommending multi-model routing.
- No industry-standard benchmark weighting exists; task-aligned weighting is most credible for a recommendation tool.
- Reasoning effort (OpenAI: none/low/medium/high/xhigh; Anthropic: low/medium/high/max) is a material cost/quality dimension not modeled in the current advisor.
- Long-context pricing tiers (GPT-5.4 at 272K boundary, Gemini at 200K boundary) affect cost estimation.
- Strategic cost optimization (caching + batching + routing) cuts LLM costs 60-80% per provider documentation.

### Additional Models Researched (Follow-up)
- **Qwen 3.5** (Alibaba, released Feb 16, 2026): Hybrid Gated DeltaNet + MoE, 397B/17B active. $0.40/$2.40 (Plus), $0.10/$0.40 (Flash). 262K native / 1M extended. Natively multimodal (text+image+video, no separate VL). 201 languages. Apache 2.0. AIME 91.3%, SWE-bench ~76-78%, IFBench 76.5% (best), MultiChallenge 67.6% (best). Strong catalog candidate.
- **GLM-5.1** (Zhipu AI, released Mar 27, 2026): Post-training coding upgrade to GLM-5, same 744B/40B architecture. No separate API pricing — subscription-gated via Coding Plan. Self-reported 94.6% of Opus 4.6 coding performance. Not a distinct catalog entry; GLM-5 covers the family.
