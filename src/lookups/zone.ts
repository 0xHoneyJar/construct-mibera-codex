import { codexPath } from "../lib/codex-root.js";
import {
  readMarkdown,
  splitH2Sections,
  parseFirstMarkdownTable,
  stripBackticks,
  stripMarkdownLinks,
} from "../lib/markdown-parser.js";
import type { Archetype, ZoneFull, ZoneSummary } from "../types.js";

const ZONES_PATH = "core-lore/festival-zones-vocabulary.md";

const ZONE_EMOJI: Record<string, string> = {
  stonehenge: "🪨",
  "bear-cave": "🐻",
  "el-dorado": "💎",
  "owsley-lab": "🧪",
  "the-warehouse": "🏭",
};

interface ZoneCache {
  summaries: ZoneSummary[];
  fullByslug: Map<string, ZoneFull>;
}

let cache: ZoneCache | null = null;

function loadZones(): ZoneCache {
  if (cache) return cache;

  const md = readMarkdown(codexPath(ZONES_PATH));
  const sections = splitH2Sections(md);

  const indexSection = sections.find(
    (s) => s.heading.toLowerCase() === "zone index",
  );
  const summaries: ZoneSummary[] = [];
  if (indexSection) {
    for (const row of parseFirstMarkdownTable(indexSection.body)) {
      const slug = stripBackticks(row["slug"] ?? "");
      const name = row["zone"] ?? "";
      const archetypeRaw = stripMarkdownLinks(row["archetype"] ?? "")
        .replace(/[*_]/g, "")
        .trim();
      const archetype: Archetype | "All" =
        archetypeRaw === "" || archetypeRaw === "All"
          ? "All"
          : (archetypeRaw as Archetype);
      if (!slug || !name) continue;
      summaries.push({
        slug,
        name,
        emoji: ZONE_EMOJI[slug],
        archetype,
      });
    }
  }

  const fullByslug = new Map<string, ZoneFull>();
  for (const summary of summaries) {
    const heading = summary.slug;
    const section =
      sections.find((s) => s.heading.toLowerCase() === heading.toLowerCase()) ??
      sections.find(
        (s) => s.heading.toLowerCase() === summary.name.toLowerCase(),
      );
    if (!section) continue;

    const lynchSection = extractSubsection(section.body, "Lynch Primitives");
    const kanseiSection = extractSubsection(section.body, "KANSEI Tokens");
    const lynch = lynchSection
      ? tableAsRecord(lynchSection, "element", "vocabulary")
      : undefined;
    const kansei = kanseiSection
      ? tableAsRecord(kanseiSection, "token", "value")
      : undefined;
    const essence = extractEssence(section.body);
    const era = extractMetaLine(section.body, "Era resonance");

    fullByslug.set(summary.slug, {
      ...summary,
      essence,
      era_resonance: era,
      lynch_primitives: lynch,
      kansei_tokens: kansei,
      raw_section: section.body.trim(),
    });
  }

  cache = { summaries, fullByslug };
  return cache;
}

function extractSubsection(body: string, heading: string): string | null {
  const re = new RegExp(`### ${heading}([\\s\\S]*?)(?=\\n### |\\n## |$)`, "i");
  const m = body.match(re);
  return m ? m[1] : null;
}

function tableAsRecord(
  body: string,
  keyCol: string,
  valCol: string,
): Record<string, string> {
  const rows = parseFirstMarkdownTable(body);
  const out: Record<string, string> = {};
  for (const row of rows) {
    const key = (row[keyCol] ?? "").replace(/[*_`]/g, "").trim();
    const val = (row[valCol] ?? "").replace(/[*_`]/g, "").trim();
    if (key) out[key] = val;
  }
  return out;
}

function extractEssence(body: string): string {
  const m = body.match(/\*\*Essence:\*\*\s*([^\n]+)/);
  return m ? m[1].trim() : "";
}

function extractMetaLine(body: string, label: string): string | undefined {
  const re = new RegExp(`\\*\\*${label}:\\*\\*\\s*([^\\n]+)`, "i");
  const m = body.match(re);
  return m ? m[1].trim() : undefined;
}

export function lookupZone(slug: string): ZoneFull | null {
  const { fullByslug } = loadZones();
  return fullByslug.get(slug.toLowerCase()) ?? null;
}

export function listZones(): ZoneSummary[] {
  return loadZones().summaries.slice();
}

export function getZoneSlugs(): string[] {
  return loadZones().summaries.map((z) => z.slug);
}

export function getZoneNames(): string[] {
  return loadZones().summaries.map((z) => z.name);
}
