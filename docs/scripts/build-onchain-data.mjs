#!/usr/bin/env node
/**
 * build-onchain-data.mjs
 *
 * Stages _codex/data/contracts.json into docs/public/ so the
 * OnChainReference component can fetch it at runtime without runtime
 * dependencies on relative repo paths.
 *
 * Also stages a small stats summary (top archetype distribution from
 * _codex/data/stats.md) into docs/public/codex-stats.json for the
 * DataIndex component.
 *
 * Path resolution: __dirname-relative; portable across cwds.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const PUBLIC = path.join(__dirname, "..", "public");

console.log(`[build-onchain-data] resolved repo root: ${ROOT}`);

// Copy contracts.json to public/ so the component fetches it at runtime
const contractsRaw = await readFile(
  path.join(ROOT, "_codex", "data", "contracts.json"),
  "utf8"
);
await writeFile(
  path.join(PUBLIC, "contracts.json"),
  contractsRaw
);
const parsed = JSON.parse(contractsRaw);
console.log(
  `[build-onchain-data] ✔ contracts.json staged — ${parsed.contracts.length} contracts`
);

// Parse top distributions from stats.md for the data-index component
const statsRaw = await readFile(
  path.join(ROOT, "_codex", "data", "stats.md"),
  "utf8"
);

// Extract archetype distribution table (## 1. Archetype Distribution)
function extractTable(md, heading) {
  const re = new RegExp(`## \\d+\\. ${heading}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`);
  const m = md.match(re);
  if (!m) return [];
  const rows = [];
  for (const line of m[1].split("\n")) {
    const cells = line.match(/^\|\s*([^|]+?)\s*\|\s*([\d,]+)\s*\|\s*([\d.%]+)\s*\|$/);
    if (!cells) continue;
    if (cells[1].includes("---")) continue; // separator row
    if (cells[1] === heading.split(" ")[0]) continue; // header row
    rows.push({
      name: cells[1].trim(),
      count: parseInt(cells[2].replace(/,/g, ""), 10),
      pct: cells[3].trim(),
    });
  }
  return rows;
}

const archetypes = extractTable(statsRaw, "Archetype Distribution");
const ancestors = extractTable(statsRaw, "Ancestor Distribution").slice(0, 5);

const codexStats = {
  generatedAt: new Date().toISOString(),
  source: "_codex/data/stats.md",
  archetype_distribution: archetypes,
  top_ancestors: ancestors,
};

await writeFile(
  path.join(PUBLIC, "codex-stats.json"),
  JSON.stringify(codexStats, null, 2)
);
console.log(
  `[build-onchain-data] ✔ codex-stats.json staged — ${archetypes.length} archetypes, ${ancestors.length} top ancestors`
);
