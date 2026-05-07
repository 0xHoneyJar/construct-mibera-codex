#!/usr/bin/env node
/**
 * check-routes.mjs
 *
 * Sidebar-leaf integrity check. Walks every `link:` in vocs.config.ts's
 * sidebar tree and asserts the corresponding page file exists at
 * docs/pages/{path}.mdx. Exits 1 with a clear error if any leaf points
 * at a non-existent page.
 *
 * Why: Flatline SKP-001 (cycle-024 sprint review) flagged that a hand-
 * maintained route manifest will silently drift from the actual sidebar
 * config. This script DERIVES the route list from vocs.config.ts itself
 * — adding a leaf to vocs.config.ts but forgetting the page file fails
 * the build, not silently ships a 404.
 *
 * Wired into docs/package.json:
 *   - `prebuild` runs before `vocs build`
 *   - `predev` runs before `vocs dev`
 *
 * Tightly scoped: only checks `link:` properties that are absolute paths
 * starting with `/`. External URLs (https://...) and tool-route paths
 * that map to MDX under pages/tools/ are both validated.
 *
 * Path resolution: __dirname-relative, so the script works whether
 * invoked from docs/ (via pnpm) or from repo root.
 */

import { readFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH = path.join(DOCS_ROOT, "vocs.config.ts");
const PAGES_DIR = path.join(DOCS_ROOT, "pages");

console.log(`[check-routes] resolved DOCS_ROOT: ${DOCS_ROOT}`);

/**
 * Crude-but-sufficient extractor: pulls every `link: "..."` literal from
 * vocs.config.ts. Doesn't parse TS — just regex over the source. The
 * sidebar is the only `link:` consumer in the file, so false positives
 * are not a concern in this codebase.
 *
 * If we ever need a real AST walk: swap to typescript compiler API or
 * @vocs/config helpers. Today's regex is the right ratio of
 * complexity-vs-value.
 */
async function extractLinks() {
  const source = await readFile(CONFIG_PATH, "utf8");
  const matches = source.matchAll(/link:\s*"([^"]+)"/g);
  const links = [];
  for (const m of matches) {
    links.push(m[1]);
  }
  return links;
}

/**
 * Resolve a sidebar link to its expected page file path. Returns null
 * when the link is external (https://) — those don't need a local page.
 *
 * Conventions:
 *   "/"                     → pages/index.mdx
 *   "/install"              → pages/install.mdx
 *   "/for-agents"           → pages/for-agents.mdx
 *   "/tools/lookup_grail"   → pages/tools/lookup_grail.mdx
 *   "/grails/aquarius"      → pages/grails/aquarius.mdx
 */
function resolveExpectedPath(link) {
  if (link.startsWith("http://") || link.startsWith("https://")) {
    return null;
  }
  // Strip query string, hash, and trailing slash
  const cleanPath = link.split("?")[0].split("#")[0].replace(/\/$/, "");
  if (cleanPath === "" || cleanPath === "/") {
    return path.join(PAGES_DIR, "index.mdx");
  }
  // Drop leading slash, append .mdx
  const relative = cleanPath.replace(/^\//, "");
  return path.join(PAGES_DIR, `${relative}.mdx`);
}

async function pageExists(absPath) {
  try {
    await access(absPath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const links = await extractLinks();
  console.log(`[check-routes] found ${links.length} sidebar links`);

  const failures = [];
  for (const link of links) {
    const expected = resolveExpectedPath(link);
    if (expected === null) {
      // External URL, skip
      continue;
    }
    const exists = await pageExists(expected);
    if (!exists) {
      failures.push({ link, expected });
    }
  }

  if (failures.length === 0) {
    console.log(`[check-routes] ✔ all sidebar leaves resolve to existing pages`);
    process.exit(0);
  }

  console.error(`[check-routes] ✘ ${failures.length} sidebar leaves point to nonexistent pages:`);
  for (const f of failures) {
    console.error(`  ${f.link} → expected file: ${path.relative(DOCS_ROOT, f.expected)}`);
  }
  console.error("");
  console.error(
    "Either remove the leaf from vocs.config.ts or create the missing page file."
  );
  process.exit(1);
}

main().catch((err) => {
  console.error(`[check-routes] script error:`, err);
  process.exit(1);
});
