#!/usr/bin/env tsx
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { searchCodex } from "../src/lookups/search.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const grailsPath = join(__dirname, "..", "_codex", "data", "grails.jsonl");

interface GrailRow { id: number; name: string; slug: string; category: string; }

const lines = readFileSync(grailsPath, "utf8").trim().split("\n");
const grails: GrailRow[] = lines.map((l) => JSON.parse(l));

const cases: Array<Record<string, unknown>> = [];
const gaps: Array<{ name: string; expected: string; actual: string; score: number }> = [];

for (const g of grails) {
  const intent = g.name;
  const expectedRef = `@g${g.id}`;
  let actualRef: string | null = null;
  let actualScore = 0;
  try {
    const hits = searchCodex({ intent, collection: "grails", limit: 5 });
    if (hits.length > 0) {
      actualRef = hits[0].ref;
      actualScore = hits[0].score;
    }
  } catch (e) {
    process.stderr.write(`forge: error searching "${intent}": ${(e as Error).message}\n`);
    continue;
  }

  const isGap = actualRef !== expectedRef;
  if (isGap) {
    gaps.push({ name: g.name, expected: expectedRef, actual: actualRef ?? "<none>", score: actualScore });
  }

  const minScore = Math.max(0, Math.floor((actualScore - 0.1) * 10) / 10);
  cases.push({
    intent,
    expected_top_ref: actualRef,
    min_score: minScore,
    collection: "grails",
    category: "canonical",
    keeper_source: `STAMETS forge canonical (id=${g.id} ${g.category})`,
    ...(isGap ? { _forge_gap: { operator_expected: expectedRef, substrate_returned: actualRef } } : {}),
  });
  process.stderr.write(`. ${g.name} → ${actualRef ?? "∅"} @${actualScore}${isGap ? " GAP" : ""}\n`);
}

for (const c of cases) {
  process.stdout.write(JSON.stringify(c) + "\n");
}

process.stderr.write(`\nforge-canonical: ${cases.length} cases · ${gaps.length} gaps\n`);
if (gaps.length > 0) {
  process.stderr.write("gaps (operator-expected ≠ substrate-returned):\n");
  for (const g of gaps) {
    process.stderr.write(`  ${g.name.padEnd(20)} expected ${g.expected.padEnd(8)} got ${g.actual.padEnd(8)} @ ${g.score}\n`);
  }
}
