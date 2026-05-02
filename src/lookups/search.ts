import { spawnSync } from "node:child_process";
import { basename } from "node:path";
import { lookupGrail } from "./grail.js";
import type { GrailEntry } from "../types.js";

/**
 * Intent-layer search — the §6 extension to bucket 1.
 *
 * Shells out to `qmd query` for hybrid (BM25 + vector + LLM rerank) search,
 * reshapes the result into the codex ref envelope. QMD is a peerDependency:
 * fail loud with a clear install hint when the binary is absent.
 *
 * Refs are stable: `@g<id>` for grails uses the same id `codex lookup grail`
 * accepts. Pipeable: `codex search "void" --refs | xargs -n1 codex lookup grail`.
 *
 * Doctrine: ~/vault/wiki/concepts/construct-surface-decision-tree.md §6
 */

export type SearchMode = "lex" | "vec" | "hybrid";
export type SearchCollection = "grails" | "core-lore" | "all";

export interface SearchHit {
  ref: string;
  type: string;
  name: string;
  score: number;
  collection: string;
  file: string;
  snippet?: string;
  // Grail-specific enrichment (when type === "grail"):
  id?: number;
  slug?: string;
  image?: string;
  category?: string;
  description?: string;
}

interface QmdHit {
  docid: string;
  score: number;
  file: string;
  line?: number;
  title: string;
  context?: string;
  snippet?: string;
}

export interface SearchOptions {
  intent: string;
  collection?: SearchCollection;
  limit?: number;
  mode?: SearchMode;
  minScore?: number;
}

const COLLECTION_NAMES: Record<SearchCollection, string[]> = {
  grails: ["codex-grails"],
  "core-lore": ["codex-core-lore"],
  all: ["codex-grails", "codex-core-lore"],
};

export class QmdNotInstalledError extends Error {
  constructor() {
    super(
      [
        "qmd binary not found in PATH.",
        "@tobilu/qmd is a peerDependency of construct-mibera-codex.",
        "Install:  npm install -g @tobilu/qmd",
        "Then run: pnpm codex:index    (or scripts/build-codex-index.sh)",
        "See ~/vault/wiki/concepts/construct-surface-decision-tree.md §6.3",
      ].join("\n"),
    );
    this.name = "QmdNotInstalledError";
  }
}

export class QmdIndexMissingError extends Error {
  constructor(collection: string) {
    super(
      [
        `qmd collection "${collection}" not found.`,
        "Run: scripts/build-codex-index.sh",
        "Or:  pnpm codex:index",
      ].join("\n"),
    );
    this.name = "QmdIndexMissingError";
  }
}

function runQmd(args: string[]): { stdout: string; stderr: string; code: number } {
  const res = spawnSync("qmd", args, {
    encoding: "utf8",
    timeout: 30_000,
  });
  if (res.error && (res.error as NodeJS.ErrnoException).code === "ENOENT") {
    throw new QmdNotInstalledError();
  }
  if (res.error) throw res.error;
  return {
    stdout: res.stdout ?? "",
    stderr: res.stderr ?? "",
    code: res.status ?? 0,
  };
}

function modeToVerb(mode: SearchMode): "search" | "vsearch" | "query" {
  if (mode === "lex") return "search";
  if (mode === "vec") return "vsearch";
  return "query"; // hybrid (default) — RRF + LLM rerank across typed sub-queries
}

function fileToSlug(file: string): string {
  // "qmd://codex-grails/black-hole.md" → "black-hole"
  // "grails/black-hole.md"             → "black-hole"
  return basename(file, ".md").toLowerCase();
}

function collectionOf(file: string): string {
  // qmd emits paths like "qmd://codex-grails/black-hole.md".
  // Returns "codex-grails" or "" if not a qmd:// path.
  const m = file.match(/^qmd:\/\/([^/]+)\//);
  return m ? m[1]! : "";
}

function enrichGrail(hit: QmdHit): SearchHit | null {
  const slug = fileToSlug(hit.file);
  const grail: GrailEntry | null = lookupGrail(slug);
  if (!grail) return null;
  return {
    ref: typeof grail.id === "number" ? `@g${grail.id}` : `@g-${grail.slug}`,
    type: "grail",
    name: grail.name,
    score: hit.score,
    collection: "codex-grails",
    file: hit.file,
    snippet: hit.snippet,
    id: typeof grail.id === "number" ? grail.id : undefined,
    slug: grail.slug,
    image: grail.image,
    category: grail.category,
    description: grail.description,
  };
}

function asGenericHit(hit: QmdHit, collectionName: string, type: string): SearchHit {
  // V1.5 will add proper ref schemes for zone/archetype/factor. For now the
  // generic hit returns a path-based ref that the agent can pass to
  // `codex lookup` only after the V1.5 polish. We still emit the raw qmd
  // result so the search verb is useful for narrative-text discovery.
  return {
    ref: `@?-${fileToSlug(hit.file)}`,
    type,
    name: hit.title,
    score: hit.score,
    collection: collectionName,
    file: hit.file,
    snippet: hit.snippet,
  };
}

function inferTypeForCoreLore(file: string): string {
  // file paths under core-lore/: archetypes.md, factor-lore.md,
  // festival-zones-vocabulary.md, philosophy.md, ancestors/<slug>.md, ...
  const lower = file.toLowerCase();
  if (lower.includes("archetype")) return "archetype";
  if (lower.includes("factor")) return "factor";
  if (lower.includes("zone")) return "zone";
  if (lower.includes("ancestor")) return "ancestor";
  if (lower.includes("tarot")) return "tarot";
  return "lore";
}

export function searchCodex(opts: SearchOptions): SearchHit[] {
  const collection = opts.collection ?? "grails";
  const mode = opts.mode ?? "hybrid";
  const limit = opts.limit ?? 10;
  const verb = modeToVerb(mode);

  const collections = COLLECTION_NAMES[collection];
  const args = [verb, opts.intent, "--json", "-n", String(limit)];
  for (const c of collections) {
    args.push("-c", c);
  }
  if (typeof opts.minScore === "number") {
    args.push("--min-score", String(opts.minScore));
  }

  const { stdout, stderr, code } = runQmd(args);
  if (code !== 0) {
    // qmd writes "collection not found" / "no embeddings" errors to stderr.
    if (/collection.*not found/i.test(stderr) || /no.*embedd/i.test(stderr)) {
      throw new QmdIndexMissingError(collections.join(","));
    }
    throw new Error(`qmd ${verb} exited ${code}: ${stderr.trim() || "unknown error"}`);
  }

  // qmd may print an informational line on stderr; --json keeps stdout clean.
  let parsed: QmdHit[];
  try {
    parsed = JSON.parse(stdout);
  } catch (e) {
    // Empty stdout on zero matches is valid; treat as [].
    if (!stdout.trim()) return [];
    throw new Error(`qmd output not parseable as JSON: ${(e as Error).message}`);
  }

  const hits: SearchHit[] = [];
  for (const raw of parsed) {
    const col = collectionOf(raw.file);
    if (col === "codex-grails") {
      const enriched = enrichGrail(raw);
      if (enriched) hits.push(enriched);
      continue;
    }
    if (col === "codex-core-lore") {
      hits.push(asGenericHit(raw, "codex-core-lore", inferTypeForCoreLore(raw.file)));
      continue;
    }
    // Unknown collection — pass through so the result is still useful.
    hits.push(asGenericHit(raw, col || collections[0] || "unknown", "lore"));
  }
  return hits;
}
