#!/usr/bin/env node
/**
 * codex — Mibera Codex CLI.
 *
 * The bucket-1 CLI half (per `~/vault/wiki/concepts/construct-surface-decision-tree.md`).
 * Subcommands mirror the 8 MCP tools verbatim: lookup_X / list_X / validate_*
 * become `codex lookup X` / `codex list X` / `codex validate <type> <value>`.
 * Cross-construct legibility is the integration contract — same vocabulary
 * across CLI and MCP, no synonym drift.
 *
 * Output convention: stdout = JSON (pretty unless --field), stderr = log.
 * Exit codes: 0 = success, 1 = not_found, 2 = usage error.
 *
 * --field=<name> extracts a single field from object lookups; for string
 * fields, raw text is written (pipeable into shell). For non-string fields,
 * JSON-stringified output. Mirrors `jq -r` semantics.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { lookupZone, listZones } from "../src/lookups/zone.js";
import {
  lookupArchetype,
  listArchetypes,
} from "../src/lookups/archetype.js";
import { lookupFactor } from "../src/lookups/factor.js";
import { lookupGrail } from "../src/lookups/grail.js";
import { lookupMibera } from "../src/lookups/mibera.js";
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

// ────── version ──────

function getVersion(): string {
  // Walk up from the binary's directory looking for package.json. Handles
  // both production (`dist/bin/codex.js` → ../../package.json) and dev via
  // tsx (`bin/codex.ts` → ../package.json).
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 5; i++) {
    try {
      const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8")) as {
        version?: string;
      };
      if (pkg.version) return pkg.version;
    } catch {
      // not here; walk up
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return "unknown";
}

// ────── help text (--help is the schema) ──────

const ROOT_HELP = `codex — Mibera Codex CLI

Anti-hallucination lookup for Mibera lore: zones, archetypes, factors, grails,
miberas. Subcommands mirror the codex-mcp tool surface 1:1 — same vocabulary,
two transports.

Usage:
  codex <command> [args] [flags]

Commands:
  lookup <noun> <query>    Look up a single entity (zone / archetype / factor / grail / mibera)
  list <noun>              List canonical entities (zones / archetypes)
  validate <type> <value>  Validate a value against the canonical set (suggests closest)

Global flags:
  --help, -h               Show this message
  --version, -v            Print version
  --field=<name>           Extract a single field from lookup results (raw output, pipeable)

Examples:
  codex lookup grail black-hole --field=image
  codex lookup zone bear-cave
  codex lookup archetype Freetekno
  codex lookup factor nft:mibera
  codex lookup mibera 4488
  codex list zones
  codex validate archetype Freetech

Doctrine: ~/vault/wiki/concepts/construct-surface-decision-tree.md
MCP equivalent: codex-mcp (same tool surface, same data, agent-native transport)`;

const LOOKUP_HELP = `codex lookup — single-entity lookup

Usage:
  codex lookup zone <slug>             Look up a festival zone (e.g. stonehenge, bear-cave)
  codex lookup archetype <name>        Look up an archetype (Freetekno, Milady, Acidhouse, Chicago/Detroit)
  codex lookup factor <factor-id>      Look up a score-mibera factor and return its codex lore
  codex lookup grail <id|slug|name>    Look up a 1/1 grail (token ID, slug, or display name)
  codex lookup mibera <token-id>       Look up a single Mibera by token ID (1-10000)

Flags:
  --field=<name>                       Extract a single field from the result (raw output)

Exits 1 if the entity is not found.`;

const LIST_HELP = `codex list — enumerate canonical entities

Usage:
  codex list zones                     List all canonical festival zones
  codex list archetypes                List all 4 canonical archetypes`;

const VALIDATE_HELP = `codex validate — check a value against the canonical set

Usage:
  codex validate <type> <value> [--consumer-hint=<id>]

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
  if (!noun) fail("missing noun. usage: codex lookup <zone|archetype|factor|grail|mibera> <query>");
  if (extra.length > 0) fail(`unexpected positional argument(s): ${extra.join(" ")}`);
  const field = typeof flags.field === "string" ? flags.field : undefined;

  switch (noun) {
    case "zone":
      if (!query) fail("missing slug. usage: codex lookup zone <slug>");
      emit(lookupZone(query), field);
      break;
    case "archetype":
      if (!query) fail("missing name. usage: codex lookup archetype <name>");
      emit(lookupArchetype(query), field);
      break;
    case "factor":
      if (!query) fail("missing factor-id. usage: codex lookup factor <factor-id>");
      emit(lookupFactor(query), field);
      break;
    case "grail":
      if (!query) fail("missing query. usage: codex lookup grail <id|slug|name>");
      emit(lookupGrail(query), field);
      break;
    case "mibera": {
      if (!query) fail("missing token-id. usage: codex lookup mibera <token-id>");
      const id = Number(query);
      if (!Number.isFinite(id) || !Number.isInteger(id) || id < 1 || id > 10000) {
        fail(`invalid token-id "${query}" — must be integer 1-10000`);
      }
      emit(lookupMibera(id), field);
      break;
    }
    default:
      fail(`unknown noun "${noun}". expected: zone, archetype, factor, grail, mibera`);
  }
}

function handleList(rest: string[], flags: Record<string, string | boolean>): never {
  if (flags.help || flags.h) {
    process.stdout.write(LIST_HELP + "\n");
    process.exit(0);
  }
  const [noun, ...extra] = rest;
  if (!noun) fail("missing noun. usage: codex list <zones|archetypes>");
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

function handleValidate(rest: string[], flags: Record<string, string | boolean>): never {
  if (flags.help || flags.h) {
    process.stdout.write(VALIDATE_HELP + "\n");
    process.exit(0);
  }
  const [type, ...valueParts] = rest;
  if (!type) fail("missing type. usage: codex validate <type> <value>");
  const value = valueParts.join(" ");
  if (!value) fail("missing value. usage: codex validate <type> <value>");

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
    process.stdout.write(getVersion() + "\n");
    process.exit(0);
  }
  if (flags.help || flags.h || positional.length === 0) {
    process.stdout.write(ROOT_HELP + "\n");
    process.exit(positional.length === 0 ? 0 : 0);
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
    default:
      fail(`unknown command "${verb}". expected: lookup, list, validate. try \`codex --help\``);
  }
}

main();
