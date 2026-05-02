import { readFileSync } from "node:fs";
import { codexPath } from "../lib/codex-root.js";
import type { GrailEntry } from "../types.js";

const GRAIL_JSONL = "_codex/data/grails.jsonl";

interface GrailCache {
  byId: Map<number, GrailEntry>;
  bySlug: Map<string, GrailEntry>;
  byName: Map<string, GrailEntry>;
}

let cache: GrailCache | null = null;

function loadGrails(): GrailCache {
  if (cache) return cache;

  const raw = readFileSync(codexPath(GRAIL_JSONL), "utf8");
  const byId = new Map<number, GrailEntry>();
  const bySlug = new Map<string, GrailEntry>();
  const byName = new Map<string, GrailEntry>();

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      continue;
    }
    if (typeof parsed !== "object" || parsed === null) continue;
    const e = parsed as GrailEntry;
    // `slug` and `name` are required per the GrailEntry type — fail loud at
    // load time if a row drifts. `id` is optional (older entries may lack it).
    if (typeof e.slug !== "string" || typeof e.name !== "string") {
      throw new Error(
        `grail entry missing required slug/name field: ${JSON.stringify(parsed)}`,
      );
    }
    if (typeof e.id === "number") byId.set(e.id, e);
    bySlug.set(e.slug.toLowerCase(), e);
    byName.set(e.name.toLowerCase(), e);
  }

  cache = { byId, bySlug, byName };
  return cache;
}

/**
 * Strip the `@g` ref prefix when present, leaving the canonical id or slug.
 *
 * Refs use unambiguous separators to avoid colliding with grail slugs that
 * begin with the letter `g` (gaia, gemini, greek). Without the strict shapes,
 * input `@gaia` would be stripped to `aia` and silently fail lookup.
 *
 *   `@g876`        → "876"  (numeric id form)
 *   `@g-black-hole`→ "black-hole" (slug form)
 *   `@g:black-hole`→ "black-hole" (slug form, colon separator)
 *   `@gaia`        → "@gaia" (UNCHANGED — falls through to name/slug lookup)
 *
 * See ~/vault/wiki/concepts/construct-surface-decision-tree.md §6.2 +
 * "ambiguous-ref-prefix" anti-pattern.
 */
function stripGrailRef(input: string): string {
  // numeric id form: @g<digits>$
  const idMatch = input.match(/^@g(\d+)$/);
  if (idMatch) return idMatch[1]!;
  // slug form: @g-<slug>$ or @g:<slug>$
  const slugMatch = input.match(/^@g[-:](.+)$/);
  if (slugMatch) return slugMatch[1]!;
  // Anything else passes through. `@gaia` reaches name/slug lookup as
  // "@gaia" → not found (correct — that's not a valid ref anyway).
  return input;
}

export function lookupGrail(idOrSlugOrName: string | number): GrailEntry | null {
  const c = loadGrails();
  if (typeof idOrSlugOrName === "number") {
    return c.byId.get(idOrSlugOrName) ?? null;
  }
  const trimmed = stripGrailRef(idOrSlugOrName.trim());
  const asInt = Number(trimmed);
  if (Number.isFinite(asInt) && c.byId.has(asInt)) return c.byId.get(asInt)!;
  return (
    c.bySlug.get(trimmed.toLowerCase()) ??
    c.byName.get(trimmed.toLowerCase()) ??
    null
  );
}

export function getGrailNames(): string[] {
  return Array.from(loadGrails().byName.keys());
}
