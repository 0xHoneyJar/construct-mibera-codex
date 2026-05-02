import { spawnSync } from "node:child_process";
import { basename } from "node:path";
import { z } from "zod";
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

/**
 * QMD --json output shape (stable across qmd 2.x).
 * Validated at the subprocess boundary so schema drift fails loud, not silently
 * with undefined refs (anti-hallucination invariant — see Bridgebuilder F2).
 */
const QmdHitSchema = z
  .object({
    docid: z.string(),
    score: z.number(),
    file: z.string(),
    line: z.number().optional(),
    title: z.string(),
    context: z.string().optional(),
    snippet: z.string().optional(),
  })
  .passthrough();

const QmdResultsSchema = z.array(QmdHitSchema);

type QmdHit = z.infer<typeof QmdHitSchema>;

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

export class QmdOutputDriftError extends Error {
  constructor(detail: string) {
    super(
      [
        "qmd --json output did not match the expected QmdHit shape.",
        "This indicates qmd version drift; the codex search backend contract changed.",
        `Detail: ${detail}`,
        "Run `qmd --version` and report at construct-mibera-codex#issues.",
      ].join("\n"),
    );
    this.name = "QmdOutputDriftError";
  }
}

function runQmd(
  args: string[],
  timeoutMs: number,
): { stdout: string; stderr: string; code: number } {
  const res = spawnSync("qmd", args, {
    encoding: "utf8",
    timeout: timeoutMs,
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
  // qmd path shape: qmd://codex-core-lore/<subpath>. Match by directory prefix
  // (most specific first) — `lower.includes()` was order-sensitive and would
  // misclassify e.g. `core-lore/ancestors/zone-keeper.md` as zone (Bridgebuilder F4).
  const m = file.match(/^qmd:\/\/[^/]+\/(.+)$/);
  const path = (m ? m[1]! : file).toLowerCase();
  if (path.startsWith("ancestors/")) return "ancestor";
  if (path.startsWith("tarot-cards/")) return "tarot";
  if (path.startsWith("archetypes")) return "archetype";
  if (path.startsWith("factor-lore")) return "factor";
  if (path.startsWith("festival-zones")) return "zone";
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

  // hybrid mode includes LLM rerank — cold start can take 30-90s when qmd
  // loads node-llama-cpp + the rerank model for the first time. lex/vec
  // skip rerank and stay fast (Bridgebuilder F5).
  const timeoutMs = mode === "hybrid" ? 90_000 : 30_000;
  const { stdout, stderr, code } = runQmd(args, timeoutMs);
  if (code !== 0) {
    // qmd writes "collection not found" / "no embeddings" errors to stderr.
    if (/collection.*not found/i.test(stderr) || /no.*embedd/i.test(stderr)) {
      throw new QmdIndexMissingError(collections.join(","));
    }
    throw new Error(`qmd ${verb} exited ${code}: ${stderr.trim() || "unknown error"}`);
  }

  // qmd emits progress/warning lines on stderr while exiting 0. Forward only
  // genuine warnings so operators see real problems (Bridgebuilder F8) without
  // polluting --refs/--json output with progress noise (Expanding query/Reranking).
  if (stderr.trim() && process.env.NODE_ENV !== "test") {
    const warnings = stderr
      .split("\n")
      .filter((line) => /warn|deprecat|error|slow query|out of memory/i.test(line));
    if (warnings.length > 0) {
      process.stderr.write(`[qmd] ${warnings.join("\n[qmd] ")}\n`);
    }
  }

  // Empty stdout on zero matches is valid; treat as [].
  if (!stdout.trim()) return [];

  let raw: unknown;
  try {
    raw = JSON.parse(stdout);
  } catch (e) {
    throw new QmdOutputDriftError(`JSON.parse failed: ${(e as Error).message}`);
  }
  // Validate at the subprocess boundary — schema drift becomes a typed error,
  // not undefined-ref runtime crashes inside the loop (Bridgebuilder F2).
  const validated = QmdResultsSchema.safeParse(raw);
  if (!validated.success) {
    throw new QmdOutputDriftError(validated.error.message.slice(0, 240));
  }
  const parsed: QmdHit[] = validated.data;

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
