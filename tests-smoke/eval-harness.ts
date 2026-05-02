#!/usr/bin/env tsx
/**
 * eval-harness.ts — OSTROM contract for MICODEX intent-layer eval.
 *
 * Reads JSONL corpus, runs each case against searchCodex, aggregates by
 * category, prints report with failure-layer hints (per session-09a §2.8
 * dual-layer-leak: each failure may be substrate / interface / inherent).
 *
 * Pass criteria (per spec §4.3):
 *   - if expected_top_ref is non-null:
 *       actual_top.ref === expected AND actual_top.score >= min_score
 *   - if expected_top_ref is null:
 *       hits.length === 0
 *
 * Exit codes:
 *   0 — pass-rate >= GATE (default 0.85, override via EVAL_GATE)
 *   1 — pass-rate <  GATE (any failure suppresses 0 unless gate met)
 *   2 — harness error (qmd missing, corpus malformed, IO)
 *
 * Usage:
 *   pnpm exec tsx tests-smoke/eval-harness.ts tests-smoke/eval-corpus.jsonl
 *   EVAL_GATE=0.90 pnpm exec tsx tests-smoke/eval-harness.ts tests-smoke/eval-corpus.jsonl
 */
import { readFileSync } from "node:fs";
import { searchCodex } from "../src/lookups/search.js";
import type { SearchHit, SearchCollection } from "../src/lookups/search.js";

interface EvalCase {
  intent: string;
  expected_top_ref: string | null;
  min_score: number;
  collection?: SearchCollection;
  category: string;
  keeper_source: string;
  deferred?: boolean;
  _forge_gap?: { operator_expected: string; substrate_returned: string | null };
}

interface CaseResult {
  case: EvalCase;
  pass: boolean;
  reason?: string;
  actual?: SearchHit | "empty";
}

const GATE = parseFloat(process.env.EVAL_GATE ?? "0.85");

function runCase(c: EvalCase): CaseResult {
  let hits: SearchHit[];
  try {
    hits = searchCodex({
      intent: c.intent,
      collection: c.collection ?? "grails",
      limit: 5,
    });
  } catch (e) {
    return { case: c, pass: false, reason: `harness/qmd error: ${(e as Error).message}` };
  }

  if (c.expected_top_ref === null) {
    if (hits.length === 0) return { case: c, pass: true, actual: "empty" };
    return {
      case: c,
      pass: false,
      reason: `expected empty, got ${hits.length} hit(s) top=${hits[0].ref}@${hits[0].score}`,
      actual: hits[0],
    };
  }

  const top = hits[0];
  if (!top) {
    return { case: c, pass: false, reason: "no hits returned", actual: "empty" };
  }
  if (top.ref !== c.expected_top_ref) {
    return {
      case: c,
      pass: false,
      reason: `wrong ref: got ${top.ref}, want ${c.expected_top_ref}`,
      actual: top,
    };
  }
  if (top.score < c.min_score) {
    return {
      case: c,
      pass: false,
      reason: `score below floor: ${top.score} < ${c.min_score}`,
      actual: top,
    };
  }
  return { case: c, pass: true, actual: top };
}

function failureLayerHint(r: CaseResult): string {
  // Per OSTROM §2.8 dual-layer-leak: each failure may live in
  // substrate / interface / inherent. Hint based on shape; final
  // classification is human (KEEPER/STAMETS/OSTROM iterate).
  if (!r.reason) return "";
  if (r.reason.startsWith("harness/qmd")) return "INFRASTRUCTURE";
  if (r.reason.startsWith("expected empty, got")) return "SUBSTRATE (false positive)";
  if (r.reason.startsWith("wrong ref")) return "INTERFACE-or-SUBSTRATE (intent maps to neighbor; check grail md)";
  if (r.reason.startsWith("no hits") && r.case.expected_top_ref) return "SUBSTRATE (false negative)";
  if (r.reason.startsWith("score below floor")) return "THRESHOLD (substrate hit, confidence under floor)";
  return "UNCLASSIFIED";
}

const corpusPath = process.argv[2];
if (!corpusPath) {
  process.stderr.write("usage: eval-harness.ts <corpus.jsonl>\n");
  process.exit(2);
}

let corpus: EvalCase[];
try {
  corpus = readFileSync(corpusPath, "utf8")
    .trim()
    .split("\n")
    .filter((l) => l.length > 0 && !l.startsWith("//"))
    .map((l) => JSON.parse(l) as EvalCase);
} catch (e) {
  process.stderr.write(`harness error: cannot read corpus ${corpusPath}: ${(e as Error).message}\n`);
  process.exit(2);
}

if (corpus.length === 0) {
  process.stderr.write("harness error: corpus is empty\n");
  process.exit(2);
}

const results: CaseResult[] = [];
const startMs = Date.now();
for (const c of corpus) {
  const r = runCase(c);
  results.push(r);
  process.stderr.write(r.pass ? "." : "F");
}
process.stderr.write("\n\n");

const elapsed = ((Date.now() - startMs) / 1000).toFixed(1);

// Aggregate by category
const byCat = new Map<string, { pass: number; total: number; deferred: number }>();
for (const r of results) {
  const cat = r.case.category;
  const bucket = byCat.get(cat) ?? { pass: 0, total: 0, deferred: 0 };
  if (r.case.deferred) {
    bucket.deferred += 1;
  } else {
    bucket.total += 1;
    if (r.pass) bucket.pass += 1;
  }
  byCat.set(cat, bucket);
}

const totalPass = results.filter((r) => r.pass && !r.case.deferred).length;
const totalEval = results.filter((r) => !r.case.deferred).length;
const passRate = totalEval > 0 ? totalPass / totalEval : 0;

console.log(`MICODEX EVAL CORPUS REPORT (${corpus.length} cases · ${elapsed}s)`);
console.log("");
const cats = Array.from(byCat.entries()).sort();
for (const [cat, b] of cats) {
  const sym = b.pass === b.total ? "✓" : "✗";
  const pct = b.total > 0 ? ((b.pass / b.total) * 100).toFixed(0) : "—";
  const def = b.deferred > 0 ? ` (+${b.deferred} deferred)` : "";
  console.log(`  ${sym} ${cat.padEnd(20)} [${b.pass}/${b.total}] ${pct}%${def}`);
}
console.log("");
console.log(`OVERALL: ${totalPass}/${totalEval} = ${(passRate * 100).toFixed(1)}%`);
console.log(`GATE:    ≥${(GATE * 100).toFixed(0)}% — ${passRate >= GATE ? "PASS" : "FAIL"}`);

const failures = results.filter((r) => !r.pass && !r.case.deferred);
if (failures.length > 0) {
  console.log("");
  console.log(`FAILURES (${failures.length}):`);
  for (const r of failures) {
    const hint = failureLayerHint(r);
    console.log(`  [${r.case.category}] "${r.case.intent}"`);
    console.log(`    expected: ${r.case.expected_top_ref ?? "<empty>"} (min_score=${r.case.min_score})`);
    console.log(`    reason:   ${r.reason}`);
    console.log(`    layer:    ${hint}`);
    console.log(`    source:   ${r.case.keeper_source}`);
  }
}

process.exit(passRate >= GATE ? 0 : 1);
