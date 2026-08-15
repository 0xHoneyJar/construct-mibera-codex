#!/usr/bin/env node
/**
 * micodex — MICODEX CLI (Mibera Codex navigation surface).
 *
 * The bucket-1 CLI half (per `~/vault/wiki/concepts/construct-surface-decision-tree.md`).
 * Subcommands mirror the MCP tool surface 1:1: lookup_X / list_X / validate_* /
 * search_codex become `micodex lookup X` / `micodex list X` /
 * `micodex validate <type> <value>` / `micodex search <intent>`.
 * Cross-transport parity is the integration contract — same vocabulary across
 * CLI and MCP, no synonym drift.
 *
 * Bin name is `micodex` to avoid collision with @openai/codex on user PATH.
 *
 * Output convention:
 *   - default: stdout = pretty JSON (2-space indent), stderr = log.
 *   - --field=<name>: stdout = raw text for string fields, compact JSON for
 *     non-string fields. Mirrors `jq -r` semantics; pipeable into shell.
 * Exit codes: 0 = success, 1 = not_found, 2 = usage error.
 */
import { readPackageVersion } from "../src/lib/codex-root.js";
import { lookupZone, listZones } from "../src/lookups/zone.js";
import {
  lookupArchetype,
  listArchetypes,
} from "../src/lookups/archetype.js";
import { lookupFactor } from "../src/lookups/factor.js";
import { lookupGrail } from "../src/lookups/grail.js";
import { lookupMibera } from "../src/lookups/mibera.js";
import { lookupMst, lookupShadow } from "../src/lookups/mst.js";
import {
  searchCodex,
  QmdNotInstalledError,
  QmdIndexMissingError,
  type SearchCollection,
  type SearchMode,
  type SearchHit,
} from "../src/lookups/search.js";
import { validateWorldElement } from "../src/validate.js";
import type { WorldElementType } from "../src/types.js";

// ────── argv parsing ──────

interface ParsedArgs {
  positional: string[];
  flags: Record<string, string | boolean>;
}

function parseArgs(argv: string[]): ParsedArgs {
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (const arg of argv) {
    if (arg.startsWith("--")) {
      const eq = arg.indexOf("=");
      if (eq >= 0) {
        flags[arg.slice(2, eq)] = arg.slice(eq + 1);
      } else {
        flags[arg.slice(2)] = true;
      }
    } else if (arg.startsWith("-") && arg.length > 1) {
      flags[arg.slice(1)] = true;
    } else {
      positional.push(arg);
    }
  }
  return { positional, flags };
}

// ────── output helpers ──────

function emit(value: unknown, field?: string): never {
  if (value === null || value === undefined) {
    process.stderr.write("error: not_found\n");
    process.exit(1);
  }
  if (field) {
    if (
      typeof value !== "object" ||
      value === null ||
      Array.isArray(value) ||
      !(field in value)
    ) {
      process.stderr.write(`error: field "${field}" not present in result\n`);
      process.exit(1);
    }
    const fv = (value as Record<string, unknown>)[field];
    if (fv === null || fv === undefined) {
      process.stderr.write(`error: field "${field}" is null\n`);
      process.exit(1);
    }
    if (typeof fv === "string") {
      process.stdout.write(fv + "\n");
    } else {
      process.stdout.write(JSON.stringify(fv) + "\n");
    }
    process.exit(0);
  }
  process.stdout.write(JSON.stringify(value, null, 2) + "\n");
  process.exit(0);
}

function fail(message: string, code: number = 2): never {
  process.stderr.write(`error: ${message}\n`);
  process.exit(code);
}

// ────── help text (--help is the schema) ──────

const ROOT_HELP = `micodex — MICODEX CLI (Mibera Codex navigation surface)

Anti-hallucination lookup + intent search for Mibera lore: zones, archetypes,
factors, grails, miberas. Subcommands mirror the MCP tool surface 1:1 — same
vocabulary, three transports (CLI / MCP stdio / MCP HTTP).

Usage:
  micodex <command> [args] [flags]

Commands:
  lookup <noun> <query>    Look up a single entity (zone / archetype / factor / grail / mibera / mst / shadow)
  list <noun>              List canonical entities (zones / archetypes)
  validate <type> <value>  Validate a value against the canonical set (suggests closest)
  search <intent>          Intent-layer search — returns ranked refs for \`lookup\`

Global flags:
  --help, -h               Show this message
  --version, -v            Print version
  --field=<name>           Extract a single field from lookup results (raw output, pipeable)

Examples:
  micodex lookup grail black-hole --field=image
  micodex lookup grail @g876                       # accepts refs from search
  micodex lookup zone bear-cave
  micodex lookup archetype Freetekno
  micodex lookup factor nft:mibera
  micodex lookup mibera 4488
  micodex lookup mst 123                            # MST (Mibera Shadow Traits) per-token enrichment
  micodex lookup shadow 123                         # alias for mst — same data, @shadow<N> ref form
  micodex list zones
  micodex validate archetype Freetech
  micodex search "void motif" --collection=grails  # intent → ref envelope (JSON)
  micodex search "void motif" --refs | xargs -n1 micodex lookup grail

Doctrine: ~/vault/wiki/concepts/construct-surface-decision-tree.md
MCP equivalent: micodex-mcp (stdio) / micodex-mcp-http (Path B, Railway)`;

const LOOKUP_HELP = `micodex lookup — single-entity lookup

Usage:
  micodex lookup zone <slug>             Look up a festival zone (e.g. stonehenge, bear-cave)
  micodex lookup archetype <name>        Look up an archetype (Freetekno, Milady, Acidhouse, Chicago/Detroit)
  micodex lookup factor <factor-id>      Look up a score-mibera factor and return its codex lore
  micodex lookup grail <id|slug|name>    Look up a 1/1 grail (token ID, slug, or display name)
  micodex lookup mibera <token-id>       Look up a single Mibera by token ID (1-10000)
  micodex lookup mst <token-id>          Look up MST (Mibera Shadow Traits) per-token (sovereign metadata + sticker URLs)
  micodex lookup shadow <token-id>       Alias for mst — Shadow ≡ MST per shadow-traits.md (returns @shadow<N> ref form)

Flags:
  --field=<name>                       Extract a single field from the result (raw output)

Exits 1 if the entity is not found.`;

const LIST_HELP = `micodex list — enumerate canonical entities

Usage:
  micodex list zones                     List all canonical festival zones
  micodex list archetypes                List all 4 canonical archetypes`;

const SEARCH_HELP = `micodex search — intent-layer search (the §6 extension)

Usage:
  micodex search "<intent>" [flags]

Returns ranked candidate refs. Refs are stable: pass them straight into
\`micodex lookup\`. Default JSON envelope: {ref, type, name, score, ...}.
Empty result is valid data (returns [] and exits 0); not_found exits 1
only on lookup, never on search.

Flags:
  --collection=<name>      grails | core-lore | all (default: grails)
  --limit=<n>              Max results (default 10)
  --mode=<lex|vec|hybrid>  qmd backend mode (default hybrid: BM25 + vector + LLM rerank)
  --refs                   Output one ref per line (pipeable into xargs)
  --json                   (default) JSON array of {ref, type, name, score, ...}
  --min-score=<n>          Filter by minimum qmd score (0..1)

Backend: \`@tobilu/qmd\` peerDependency. Run \`pnpm micodex:index\` after install.
Doctrine: ~/vault/wiki/concepts/construct-surface-decision-tree.md §6`;

const VALIDATE_HELP = `micodex validate — check a value against the canonical set

Usage:
  micodex validate <type> <value> [--consumer-hint=<id>]

Types: zone, archetype, factor, grail, mibera

Returns {canonical: bool, suggested?: string, distance?: number, type}.
Unmatched but Mibera-relevant queries are appended to the coverage-gap log
for periodic curator review (per RFC #53 C6).`;

// ────── command handlers ──────

function handleLookup(rest: string[], flags: Record<string, string | boolean>): never {
  if (flags.help || flags.h) {
    process.stdout.write(LOOKUP_HELP + "\n");
    process.exit(0);
  }
  const [noun, query, ...extra] = rest;
  if (!noun) fail("missing noun. usage: micodex lookup <zone|archetype|factor|grail|mibera> <query>");
  if (extra.length > 0) fail(`unexpected positional argument(s): ${extra.join(" ")}`);
  const field = typeof flags.field === "string" ? flags.field : undefined;

  switch (noun) {
    case "zone":
      if (!query) fail("missing slug. usage: micodex lookup zone <slug>");
      emit(lookupZone(query), field);
      break;
    case "archetype":
      if (!query) fail("missing name. usage: micodex lookup archetype <name>");
      emit(lookupArchetype(query), field);
      break;
    case "factor":
      if (!query) fail("missing factor-id. usage: micodex lookup factor <factor-id>");
      emit(lookupFactor(query), field);
      break;
    case "grail":
      if (!query) fail("missing query. usage: micodex lookup grail <id|slug|name>");
      emit(lookupGrail(query), field);
      break;
    case "mibera": {
      if (!query) fail("missing token-id. usage: micodex lookup mibera <token-id>");
      const id = Number(query);
      if (!Number.isFinite(id) || !Number.isInteger(id) || id < 1 || id > 10000) {
        fail(`invalid token-id "${query}" — must be integer 1-10000`);
      }
      emit(lookupMibera(id), field);
      break;
    }
    case "mst": {
      if (!query) fail("missing token-id. usage: micodex lookup mst <token-id>");
      // accept @mst<N>, @shadow<N>, or bare numeric (Shadow ≡ MST per shadow-traits.md)
      const stripped = query.startsWith("@mst")
        ? query.slice(4)
        : query.startsWith("@shadow")
          ? query.slice(7)
          : query;
      const id = Number(stripped);
      if (!Number.isFinite(id) || !Number.isInteger(id) || id < 1) {
        fail(`invalid token-id "${query}" — must be a positive integer (or @mst<id> / @shadow<id> ref)`);
      }
      emit(lookupMst(id), field);
      break;
    }
    case "shadow": {
      // Shadow ≡ MST alias (per shadow-traits.md: "Mibera Shadow Traits" technically
      // MST, narratively Shadow). Same data, returns `@shadow<N>` ref form.
      if (!query) fail("missing token-id. usage: micodex lookup shadow <token-id>");
      const stripped = query.startsWith("@shadow")
        ? query.slice(7)
        : query.startsWith("@mst")
          ? query.slice(4)
          : query;
      const id = Number(stripped);
      if (!Number.isFinite(id) || !Number.isInteger(id) || id < 1) {
        fail(`invalid token-id "${query}" — must be a positive integer (or @shadow<id> / @mst<id> ref)`);
      }
      emit(lookupShadow(id), field);
      break;
    }
    default:
      fail(`unknown noun "${noun}". expected: zone, archetype, factor, grail, mibera, mst, shadow`);
  }
}

function handleList(rest: string[], flags: Record<string, string | boolean>): never {
  if (flags.help || flags.h) {
    process.stdout.write(LIST_HELP + "\n");
    process.exit(0);
  }
  const [noun, ...extra] = rest;
  if (!noun) fail("missing noun. usage: micodex list <zones|archetypes>");
  if (extra.length > 0) fail(`unexpected positional argument(s): ${extra.join(" ")}`);

  switch (noun) {
    case "zones":
      emit(listZones());
      break;
    case "archetypes":
      emit(listArchetypes());
      break;
    default:
      fail(`unknown noun "${noun}". expected: zones, archetypes`);
  }
}

function handleSearch(rest: string[], flags: Record<string, string | boolean>): never {
  if (flags.help || flags.h) {
    process.stdout.write(SEARCH_HELP + "\n");
    process.exit(0);
  }
  const intent = rest.join(" ").trim();
  if (!intent) fail('missing intent. usage: micodex search "<intent>" [--collection=...]');

  const collection = (typeof flags.collection === "string" ? flags.collection : "grails") as SearchCollection;
  if (!["grails", "core-lore", "all"].includes(collection)) {
    fail(`unknown collection "${collection}". expected: grails, core-lore, all`);
  }
  const mode = (typeof flags.mode === "string" ? flags.mode : "hybrid") as SearchMode;
  if (!["lex", "vec", "hybrid"].includes(mode)) {
    fail(`unknown mode "${mode}". expected: lex, vec, hybrid`);
  }
  const limitRaw = flags.limit;
  const limit = typeof limitRaw === "string" ? Number(limitRaw) : 10;
  if (!Number.isFinite(limit) || limit < 1 || limit > 100) {
    fail(`invalid limit "${String(limitRaw)}" — must be integer 1..100`);
  }
  const minScoreRaw = flags["min-score"];
  const minScore =
    typeof minScoreRaw === "string" ? Number(minScoreRaw) : undefined;
  if (minScore !== undefined && (!Number.isFinite(minScore) || minScore < 0 || minScore > 1)) {
    fail(`invalid min-score "${String(minScoreRaw)}" — must be 0..1`);
  }

  let hits: SearchHit[];
  try {
    hits = searchCodex({ intent, collection, mode, limit, minScore });
  } catch (e) {
    if (e instanceof QmdNotInstalledError || e instanceof QmdIndexMissingError) {
      process.stderr.write(`error: ${e.message}\n`);
      process.exit(1);
    }
    throw e;
  }

  if (flags.refs) {
    // Pipeable: one ref per line, no JSON. Empty result = no output, exit 0.
    for (const h of hits) {
      process.stdout.write(h.ref + "\n");
    }
    process.exit(0);
  }

  // Default: JSON envelope. Empty array is valid data — exit 0.
  process.stdout.write(JSON.stringify(hits, null, 2) + "\n");
  process.exit(0);
}

function handleValidate(rest: string[], flags: Record<string, string | boolean>): never {
  if (flags.help || flags.h) {
    process.stdout.write(VALIDATE_HELP + "\n");
    process.exit(0);
  }
  const [type, ...valueParts] = rest;
  if (!type) fail("missing type. usage: micodex validate <type> <value>");
  const value = valueParts.join(" ");
  if (!value) fail("missing value. usage: micodex validate <type> <value>");

  const validTypes: WorldElementType[] = ["zone", "archetype", "factor", "grail", "mibera"];
  if (!validTypes.includes(type as WorldElementType)) {
    fail(`unknown type "${type}". expected: ${validTypes.join(", ")}`);
  }
  const consumerHint =
    typeof flags["consumer-hint"] === "string" ? (flags["consumer-hint"] as string) : undefined;
  emit(validateWorldElement(type as WorldElementType, value, consumerHint));
}

// ────── main ──────

function main(): never {
  const { positional, flags } = parseArgs(process.argv.slice(2));

  if (flags.version || flags.v) {
    process.stdout.write(readPackageVersion() + "\n");
    process.exit(0);
  }
  // Show ROOT_HELP only when no verb is given. Sub-help (`micodex search --help`)
  // is delegated to the verb's handler, which prints its own help text.
  if (positional.length === 0) {
    process.stdout.write(ROOT_HELP + "\n");
    process.exit(0);
  }

  const [verb, ...rest] = positional;
  switch (verb) {
    case "lookup":
      handleLookup(rest, flags);
      break;
    case "list":
      handleList(rest, flags);
      break;
    case "validate":
      handleValidate(rest, flags);
      break;
    case "search":
      handleSearch(rest, flags);
      break;
    default:
      fail(`unknown command "${verb}". expected: lookup, list, validate, search. try \`codex --help\``);
  }
}

main();
