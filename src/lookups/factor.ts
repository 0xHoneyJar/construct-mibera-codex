import { codexPath } from "../lib/codex-root.js";
import {
  readMarkdown,
  splitH3Sections,
} from "../lib/markdown-parser.js";
import type { Archetype, Dimension, FactorLore } from "../types.js";

const FACTOR_LORE_PATH = "core-lore/factor-lore.md";

interface FactorCache {
  byId: Map<string, FactorLore>;
}

let cache: FactorCache | null = null;

function loadFactors(): FactorCache {
  if (cache) return cache;

  const md = readMarkdown(codexPath(FACTOR_LORE_PATH));
  const sections = splitH3Sections(md);

  const byId = new Map<string, FactorLore>();
  for (const sec of sections) {
    const id = sec.heading.trim();
    if (!id.includes(":")) continue;

    const dimMatch = sec.body.match(/-\s*\*\*dimension\*\*:\s*`([^`]+)`/i);
    const archMatch = sec.body.match(/-\s*\*\*archetype\*\*:\s*([^\n]+)/i);
    const statusMatch = sec.body.match(/-\s*\*\*status\*\*:\s*([^\n]+)/i);
    const nameMatch = sec.body.match(/-\s*\*\*display_name\*\*:\s*([^\n]+)/i);
    const loreMatch = sec.body.match(
      /-\s*\*\*lore\*\*:\s*([\s\S]+?)(?=\n-\s*\*\*|$)/i,
    );

    const dim = (dimMatch?.[1] ?? "onchain").trim() as Dimension;
    const archRaw = (archMatch?.[1] ?? "All").replace(/[*_`]/g, "").trim();
    const status = (statusMatch?.[1] ?? "live").replace(/[*_`]/g, "").trim() as
      | "live"
      | "historic"
      | "merged";
    const displayName = (nameMatch?.[1] ?? id).replace(/[*_`]/g, "").trim();
    const lore = (loreMatch?.[1] ?? "").trim();

    byId.set(id, {
      factor_id: id,
      display_name: displayName,
      dimension: dim,
      archetype: archRaw === "All" ? "All" : (archRaw as Archetype),
      lore,
      codex_anchor: `core-lore/factor-lore.md#${id.replace(":", "")}`,
      status,
    });
  }

  cache = { byId };
  return cache;
}

export function lookupFactor(factorId: string): FactorLore | null {
  return loadFactors().byId.get(factorId) ?? null;
}

export function getFactorIds(): string[] {
  return Array.from(loadFactors().byId.keys());
}

export function listLiveFactors(): FactorLore[] {
  return Array.from(loadFactors().byId.values()).filter(
    (f) => f.status === "live",
  );
}
