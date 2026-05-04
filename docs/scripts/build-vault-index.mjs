#!/usr/bin/env node
/**
 * build-vault-index.mjs
 *
 * Walks the codex md vault and emits docs/public/vault-index.json — a
 * static index of navigable entries with their markdown-link
 * neighborhoods. Consumed at runtime by <BlotterGrid /> to render the
 * right-rail grid-native nav per the lorekeeper's pattern.
 *
 * V1 scope: grails (44) + core-lore (120) + mibera-sets (13) +
 * fractures (12) + birthdays (12) + browse (9) ≈ 210 entries. Traits
 * (1349) deferred — too granular for navigation; would 5x the index
 * with mostly leaf nodes that don't surface as docs routes.
 *
 * Wired via package.json `prebuild` + `predev` so the index is always
 * fresh when vocs builds or HMR boots.
 */

import { readdir, readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const DOCS_PUBLIC = path.resolve(__dirname, "..", "public");

const SCOPES = [
  { dir: "grails",      type: "grail",    recursive: false },
  { dir: "core-lore",   type: "lore",     recursive: true  },
  { dir: "mibera-sets", type: "set",      recursive: true  },
  { dir: "fractures",   type: "fracture", recursive: false },
  { dir: "birthdays",   type: "era",      recursive: false },
  { dir: "browse",      type: "browse",   recursive: false },
];

async function walkDir(absDir, recursive) {
  const out = [];
  async function walk(d) {
    let ents;
    try {
      ents = await readdir(d, { withFileTypes: true });
    } catch {
      return; // dir may not exist
    }
    for (const ent of ents) {
      if (ent.name.startsWith(".") || ent.name === "node_modules") continue;
      const full = path.join(d, ent.name);
      if (ent.isDirectory()) {
        if (recursive) await walk(full);
      } else if (ent.isFile() && ent.name.endsWith(".md")) {
        out.push(full);
      }
    }
  }
  await walk(absDir);
  return out;
}

/**
 * Minimal frontmatter parser. Handles plain `key: value` and
 * `key: "quoted"`. Skips multi-line / list values (not used in
 * grails/core-lore for V1).
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

/**
 * Resolve every `[text](path.md)` style link in `body` to a vault-relative
 * path (POSIX). Skips http(s) links + non-md targets.
 */
function extractOutlinks(body, fromPath) {
  const re = /\[(?:[^\]]+)\]\(([^)\s#]+\.md)(?:#[^)]+)?\)/g;
  const fromDir = path.posix.dirname(fromPath);
  const set = new Set();
  for (const m of body.matchAll(re)) {
    const rel = m[1];
    if (/^https?:/i.test(rel)) continue;
    const resolved = path.posix.normalize(path.posix.join(fromDir, rel));
    if (resolved === fromPath) continue; // self-ref
    set.add(resolved);
  }
  return [...set];
}

function deriveTitle(fm, body, slug) {
  if (fm.name) return fm.name;
  if (fm.title) return fm.title;
  const h1 = body.match(/^\s*#\s+(.+?)\s*$/m);
  if (h1) {
    // strip inline links + bold/italic
    return h1[1]
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\*\*?(.+?)\*\*?/g, "$1");
  }
  return slug;
}

function deriveExcerpt(body) {
  const cleaned = body
    .replace(/^#\s+.+$/m, "")
    .replace(/!\[.*?\]\([^)]*\)/g, "")
    .replace(/^\s*>\s.*$/gm, "")
    .replace(/^##\s+.+$/gm, "");
  const para = cleaned
    .split(/\n\n+/)
    .map((p) => p.trim())
    .find((p) => p.length > 30 && !/^[#*\-`]/.test(p));
  if (!para) return "";
  const flat = para.replace(/\s+/g, " ");
  return flat.length > 220 ? flat.slice(0, 220).trim() + "…" : flat;
}

const DOCS_PAGES = path.resolve(__dirname, "..", "pages");

/**
 * Map vault path → live docs route. Only entries with a matching MDX
 * wrapper render as cards on the docs site. V1: grails only. Gated on
 * the MDX existing on disk so /grails/README and other un-wrapped md
 * files don't ghost into the byDocsRoute map.
 */
function deriveDocsRoute(vaultPath) {
  const grail = vaultPath.match(/^grails\/([^/]+)\.md$/);
  if (grail && grail[1] !== "README") {
    const mdx = path.join(DOCS_PAGES, "grails", `${grail[1]}.mdx`);
    if (existsSync(mdx)) return `/grails/${grail[1]}`;
  }
  return undefined;
}

async function main() {
  const entries = {};
  const byDocsRoute = {};
  const byCategory = {};

  for (const scope of SCOPES) {
    const absDir = path.join(ROOT, scope.dir);
    const files = await walkDir(absDir, scope.recursive);
    for (const abs of files) {
      const rel = path.posix.relative(ROOT, abs).replace(/\\/g, "/");
      const src = await readFile(abs, "utf8");
      const { fm, body } = parseFrontmatter(src);
      const slug = path.basename(rel, ".md");
      const title = deriveTitle(fm, body, slug);
      const excerpt = deriveExcerpt(body);
      const outlinks = extractOutlinks(body, rel);
      const docsRoute = deriveDocsRoute(rel);
      // category: explicit frontmatter, else first sub-dir for nested scopes
      const subdir = rel.split("/").slice(1, -1)[0];
      const category = fm.category || (scope.recursive ? subdir : undefined);

      const entry = {
        path: rel,
        slug,
        title,
        type: fm.type || scope.type,
        category,
        docsRoute,
        excerpt,
        outlinks,
        backlinks: [],
      };
      entries[rel] = entry;
      if (docsRoute) byDocsRoute[docsRoute] = rel;
      if (category) {
        byCategory[category] ??= [];
        byCategory[category].push(rel);
      }
    }
  }

  // Invert outlinks → backlinks
  for (const [from, entry] of Object.entries(entries)) {
    for (const to of entry.outlinks) {
      const target = entries[to];
      if (target) target.backlinks.push(from);
    }
  }

  // Sort backlinks for stable output
  for (const e of Object.values(entries)) {
    e.backlinks = [...new Set(e.backlinks)].sort();
    e.outlinks = [...new Set(e.outlinks)].sort();
  }

  const index = {
    generatedAt: new Date().toISOString(),
    entryCount: Object.keys(entries).length,
    entries,
    byDocsRoute,
    byCategory,
  };

  await mkdir(DOCS_PUBLIC, { recursive: true });
  const outPath = path.join(DOCS_PUBLIC, "vault-index.json");
  await writeFile(outPath, JSON.stringify(index), "utf8");

  const { size } = await stat(outPath);
  const kb = (size / 1024).toFixed(1);
  const docsRouted = Object.keys(byDocsRoute).length;
  const cats = Object.keys(byCategory).length;
  console.log(`✔ vault-index.json — ${index.entryCount} entries · ${kb} KB`);
  console.log(`  ${docsRouted} docs-routed · ${cats} categories`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
