---
name: model-advisor
description: >
  AI Model Advisor — helps users choose the best AI model based on task type, budget, speed,
  and context size. Shows top recommendation, alternatives, best use cases, ideal input/output
  styles, token cost estimator, sortable comparison table, dark/light mode, and markdown export.
  Covers GPT-5.4 mini, GPT-5.4, GPT-5.3 Codex, Opus 4.6, Sonnet 4.5, Gemini 3 Pro, Kimi K2.5,
  and MiniMax 2.7 with March 2026 pricing.
compatibility: Created for Zo Computer (zo.space)
metadata:
  author: dagawdnyc.zo.computer
  version: "1.0.0"
  license: MIT
  live_demo: https://dagawdnyc.zo.space/model-advisor
---

## Installation

Run the install script to deploy Model Advisor to your zo.space:

```bash
bun run Skills/model-advisor/scripts/install.ts
```

### Options

| Flag | Default | Description |
|------|---------|-------------|
| `--path <path>` | `/model-advisor` | Route path on your zo.space |
| `--private` | (public) | Make the page owner-only |
| `--help` | | Show help |

### Manual Install

If you prefer, ask Zo:

> "Install the model-advisor skill to my space"

Zo will read `assets/model-advisor.tsx` and deploy it as a page route.

## Features

- **Task Selector** — Coding, Premium Reasoning, Balanced General Use, Long Documents, Low Cost
- **Budget Selector** — Tight, Moderate, Flexible, Unlimited
- **Speed Selector** — Any, Fast Only, Medium+
- **Context Size Selector** — Any, < 200K, 200K–500K, 500K+
- **Token Cost Estimator** — Input/output/cached token inputs with quick presets
- **Top Recommendation** — Best match with score, pricing, strengths, use cases, ideal I/O
- **Alternatives** — Runner-up models with score bars and badges
- **Full Comparison Table** — All 8 models, sortable by any column, expandable detail rows
- **Dark/Light Mode** — Toggle in header with smooth transitions
- **Export to Markdown** — Download a full report with all selections and comparisons

## Models Covered

| Model | Provider | Context | Tier |
|-------|----------|---------|------|
| GPT-5.4 mini | OpenAI | 400K | Mid |
| GPT-5.4 | OpenAI | 272K | Premium |
| GPT-5.3 Codex | OpenAI | 400K | Mid |
| Opus 4.6 | Anthropic | 1M | Premium |
| Sonnet 4.5 | Anthropic | 200K | Mid |
| Gemini 3 Pro | Google | 200K | Mid |
| Kimi K2.5 | Moonshot AI | 262K | Budget |
| MiniMax 2.7 | MiniMax | 1M | Budget |

## Customizing

The model data lives in the `MODELS` array inside `assets/model-advisor.tsx`. To add or update models, edit that file and re-run the install script.
