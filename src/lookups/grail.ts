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
    const e = parsed as GrailEntry & { slug?: string };
    if (typeof e.id === "number") byId.set(e.id, e);
    if (typeof e.slug === "string") bySlug.set(e.slug.toLowerCase(), e);
    if (typeof e.name === "string") byName.set(e.name.toLowerCase(), e);
  }

  cache = { byId, bySlug, byName };
  return cache;
}

export function lookupGrail(idOrSlugOrName: string | number): GrailEntry | null {
  const c = loadGrails();
  if (typeof idOrSlugOrName === "number") {
    return c.byId.get(idOrSlugOrName) ?? null;
  }
  const trimmed = idOrSlugOrName.trim();
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
