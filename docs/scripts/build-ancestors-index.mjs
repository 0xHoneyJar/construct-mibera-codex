#!/usr/bin/env node
/**
 * build-ancestors-index.mjs
 *
 * Generates docs/public/ancestors-browse.json — a compact index of the 33
 * canonical ancestor cultures from core-lore/ancestors/{slug}.md.
 *
 * Output schema:
 *   { generatedAt, count: 33, ancestors: Ancestor[] }
 *
 * Validation behavior (per Flatline SKP-005, severity 760, cycle-024
 * sprint review):
 *   - Missing required field (slug, name) → HARD FAIL: log error, exit 1
 *   - Final count !== 33 → HARD FAIL: log error, exit 1
 *   - Missing optional field (period_*, locations) → soft warn, render "—"
 *
 * Why strict: silent partial coverage would let a malformed source file
 * silently reduce the rendered card grid below 33 while the build still
 * passed, undermining the Sprint 2 deliverable.
 *
 * Path resolution (per Flatline SKP-001 cwd-portability):
 *   __dirname-relative resolution. Works whether invoked from docs/ via
 *   pnpm or from repo root.
 *
 * Wired via package.json build-indexes step (chains after vault-index +
 * miberas-browse).
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const ANCESTORS_DIR = path.join(ROOT, "core-lore", "ancestors");
const OUT = path.join(__dirname, "..", "public", "ancestors-browse.json");

const EXPECTED_COUNT = 33;

console.log(`[build-ancestors] resolved repo root: ${ROOT}`);

/**
 * Minimal frontmatter parser — same shape as build-vault-index.mjs.
 * Handles plain `key: value` and `key: "quoted"`. Returns { fm, body }.
 */
function parseFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { fm: {}, body: src };
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([\w][\w-]*)\s*:\s*(.*)$/);
    if (!kv) continue;
    let val = kv[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (val.length === 0) continue;
    fm[kv[1]] = val;
  }
  return { fm, body: m[2] };
}

const errors = [];
const warnings = [];

const files = (await readdir(ANCESTORS_DIR)).filter(
  (f) => f.endsWith(".md") && f !== "README.md"
);

console.log(`[build-ancestors] scanning ${files.length} ancestor files`);

const ancestors = [];

for (const filename of files) {
  const slug = filename.replace(/\.md$/, "");
  const filepath = path.join(ANCESTORS_DIR, filename);
  const src = await readFile(filepath, "utf8");
  const { fm } = parseFrontmatter(src);

  // HARD FAIL on missing required fields
  if (!fm.name) {
    errors.push(`${filename}: missing required field 'name'`);
    continue;
  }

  // Soft warn on missing optional fields
  if (!fm.period_ancient && !fm.period_modern) {
    warnings.push(`${slug}: no period fields (period_ancient or period_modern)`);
  }
  if (!fm.locations) {
    warnings.push(`${slug}: missing optional field 'locations'`);
  }

  ancestors.push({
    slug,
    name: fm.name,
    period_ancient: fm.period_ancient ?? null,
    period_modern: fm.period_modern ?? null,
    locations: fm.locations
      ? fm.locations.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
  });
}

ancestors.sort((a, b) => a.name.localeCompare(b.name));

// HARD FAIL on errors
if (errors.length > 0) {
  console.error(
    `[build-ancestors] ✘ ${errors.length} hard error(s) — required fields missing:`
  );
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}

// HARD FAIL on count mismatch
if (ancestors.length !== EXPECTED_COUNT) {
  console.error(
    `[build-ancestors] ✘ expected ${EXPECTED_COUNT} ancestors, got ${ancestors.length}`
  );
  console.error(
    `  if the canon truly changed, update EXPECTED_COUNT in build-ancestors-index.mjs`
  );
  process.exit(1);
}

// Soft warnings (non-blocking)
if (warnings.length > 0) {
  console.warn(`[build-ancestors] ⚠ ${warnings.length} optional-field warning(s):`);
  for (const w of warnings) console.warn(`  ${w}`);
}

await writeFile(
  OUT,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      count: ancestors.length,
      ancestors,
    },
    null,
    2
  )
);

const sizeBytes = (await readFile(OUT)).length;
console.log(
  `[build-ancestors] ✔ ancestors-browse.json — ${ancestors.length} ancestors · ${(sizeBytes / 1024).toFixed(1)} KB`
);
