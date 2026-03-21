#!/usr/bin/env bun
/**
 * Model Advisor - Install Script
 * Deploys the Model Advisor page to your zo.space
 *
 * Usage:
 *   bun run scripts/install.ts [--path /model-advisor] [--public]
 *
 * Options:
 *   --path    Route path (default: /model-advisor)
 *   --public  Make the page publicly accessible (default: true)
 *   --help    Show this help message
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Model Advisor - Install to zo.space

Usage:
  bun run scripts/install.ts [options]

Options:
  --path <path>   Route path (default: /model-advisor)
  --public        Make page public (default: true)
  --private       Make page private (owner-only)
  --help          Show this help
`);
  process.exit(0);
}

const pathIdx = args.indexOf("--path");
const routePath = pathIdx !== -1 && args[pathIdx + 1] ? args[pathIdx + 1] : "/model-advisor";
const isPublic = !args.includes("--private");

const scriptDir = dirname(new URL(import.meta.url).pathname);
const assetPath = resolve(scriptDir, "../assets/model-advisor.tsx");

let code: string;
try {
  code = readFileSync(assetPath, "utf-8");
} catch {
  console.error("❌ Could not read assets/model-advisor.tsx");
  process.exit(1);
}

const token = process.env.ZO_CLIENT_IDENTITY_TOKEN;
if (!token) {
  console.error("❌ ZO_CLIENT_IDENTITY_TOKEN not found. Run this from within Zo Computer.");
  process.exit(1);
}

console.log(`🚀 Installing Model Advisor to ${routePath}...`);

const resp = await fetch("https://api.zo.computer/zo/ask", {
  method: "POST",
  headers: {
    authorization: token,
    "content-type": "application/json",
  },
  body: JSON.stringify({
    input: `Use the update_space_route tool to create a page route at path "${routePath}" with public=${isPublic}. Use the following code exactly as provided — do not modify it:\n\n\`\`\`tsx\n${code}\n\`\`\`\n\nAfter creating the route, confirm the URL where it's accessible.`,
    model_name: "anthropic:claude-opus-4-6",
  }),
});

if (!resp.ok) {
  console.error(`❌ API error: ${resp.status} ${resp.statusText}`);
  process.exit(1);
}

const result = await resp.json();
console.log("✅ Model Advisor installed successfully!");
console.log(`📍 Route: ${routePath}`);
console.log(`🔒 Visibility: ${isPublic ? "Public" : "Private"}`);
console.log(`\n${result.output || "Done."}`);
