#!/usr/bin/env node
/**
 * build-miberas-browse.mjs
 *
 * Generates docs/public/miberas-browse.json — a compact index of all
 * 10,000 miberas with just enough data for the Introducing Mibera
 * grimoire's browse grid: { id, archetype, ancestor, swag_rank, image }.
 *
 * Source: _codex/data/miberas.jsonl + _codex/data/mibera-image-urls.json
 * Output: ~800KB JSON (vs 6.4MB raw JSONL).
 *
 * Wired via package.json predev/prebuild so the index is fresh.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const OUT = path.resolve(__dirname, "..", "public", "miberas-browse.json");

const JSONL = path.join(ROOT, "_codex", "data", "miberas.jsonl");
const URLS = path.join(ROOT, "_codex", "data", "mibera-image-urls.json");

const [jsonlText, urlsText] = await Promise.all([
  readFile(JSONL, "utf8"),
  readFile(URLS, "utf8"),
]);

const imagesById = JSON.parse(urlsText);

const miberas = [];
for (const line of jsonlText.split("\n")) {
  if (!line.trim()) continue;
  let entry;
  try {
    entry = JSON.parse(line);
  } catch {
    continue;
  }
  if (entry.type !== "mibera") continue;
  miberas.push({
    id: entry.id,
    archetype: entry.archetype,
    ancestor: entry.ancestor,
    swag_rank: entry.swag_rank,
    image: imagesById[String(entry.id)] ?? null,
  });
}

miberas.sort((a, b) => a.id - b.id);

await writeFile(
  OUT,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      count: miberas.length,
      miberas,
    },
    null,
    0
  )
);

const sizeBytes = (await readFile(OUT)).length;
console.log(
  `✔ miberas-browse.json — ${miberas.length} miberas · ${(sizeBytes / 1024).toFixed(1)} KB`
);
