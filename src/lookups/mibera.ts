import { readFileSync } from "node:fs";
import { codexPath } from "../lib/codex-root.js";
import type { MiberaEntry } from "../types.js";

const MIBERA_JSONL = "_codex/data/miberas.jsonl";

interface MiberaCache {
  byId: Map<number, MiberaEntry>;
}

let cache: MiberaCache | null = null;

function loadMiberas(): MiberaCache {
  if (cache) return cache;

  const raw = readFileSync(codexPath(MIBERA_JSONL), "utf8");
  const byId = new Map<number, MiberaEntry>();

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
    const e = parsed as MiberaEntry;
    if (typeof e.id === "number") byId.set(e.id, e);
  }

  cache = { byId };
  return cache;
}

export function lookupMibera(id: number): MiberaEntry | null {
  return loadMiberas().byId.get(id) ?? null;
}

export function getMiberaIds(): number[] {
  return Array.from(loadMiberas().byId.keys());
}

export function getMiberaCount(): number {
  return loadMiberas().byId.size;
}
