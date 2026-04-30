import { codexPath } from "../lib/codex-root.js";
import {
  readMarkdown,
  splitH2Sections,
  parseFirstMarkdownTable,
  stripMarkdownLinks,
} from "../lib/markdown-parser.js";
import type { Archetype, ArchetypeFull, ArchetypeSummary } from "../types.js";

const ARCHETYPES_PATH = "core-lore/archetypes.md";

const CANONICAL_NAMES: Archetype[] = [
  "Freetekno",
  "Milady",
  "Acidhouse",
  "Chicago/Detroit",
];

interface ArchetypeCache {
  summaries: ArchetypeSummary[];
  fullByName: Map<string, ArchetypeFull>;
}

let cache: ArchetypeCache | null = null;

function loadArchetypes(): ArchetypeCache {
  if (cache) return cache;

  const md = readMarkdown(codexPath(ARCHETYPES_PATH));
  const sections = splitH2Sections(md);

  const overview = sections.find(
    (s) => s.heading.toLowerCase() === "overview",
  );
  const indexRows = overview ? parseFirstMarkdownTable(overview.body) : [];
  const indexBySig = new Map<string, ArchetypeSummary>();
  for (const row of indexRows) {
    const rawName = (row["archetype"] ?? "").replace(/\*\*/g, "").trim();
    if (!rawName) continue;
    const name = normalizeArchetypeAlias(rawName);
    if (!name) continue;
    const zodiac = (row["zodiac signs"] ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const season = row["season"] ?? "";
    const era = row["era"] ?? "";
    indexBySig.set(name.toLowerCase(), {
      name,
      era,
      zodiac_signs: zodiac,
      season,
    });
  }

  const fullByName = new Map<string, ArchetypeFull>();
  for (const canonical of CANONICAL_NAMES) {
    const matchingHeading = sections.find(
      (s) => normalizeHeading(s.heading) === normalizeHeading(canonical),
    );
    if (!matchingHeading) continue;

    const summary = indexBySig.get(canonical.toLowerCase()) ?? {
      name: canonical,
      era: extractMetaLine(matchingHeading.body, "Time Period") ?? "",
      zodiac_signs:
        extractMetaLine(matchingHeading.body, "Zodiac Signs")?.split(",").map(
          (s) => s.trim().replace(/\([^)]+\)/, "").trim(),
        ) ?? [],
      season: extractSeason(matchingHeading.body),
    };

    const locations = parseCSVMeta(matchingHeading.body, "Locations");
    const figures = extractBulletNames(matchingHeading.body, "Key Figures");
    const events = extractBulletNames(matchingHeading.body, "Key Events");
    const drugs = extractDrugConnections(matchingHeading.body);
    const ancestors = extractBulletNames(
      matchingHeading.body,
      "Ancestor Connections",
    );
    const fashion = parseCSVMeta(matchingHeading.body, "Fashion");

    fullByName.set(canonical.toLowerCase(), {
      ...summary,
      locations,
      figures,
      events,
      drugs,
      ancestor_connections: ancestors,
      fashion,
      raw_section: matchingHeading.body.trim(),
    });
  }

  const summaries = CANONICAL_NAMES.map(
    (n) =>
      indexBySig.get(n.toLowerCase()) ??
      ({ name: n, era: "", zodiac_signs: [], season: "" } as ArchetypeSummary),
  );

  cache = { summaries, fullByName };
  return cache;
}

function normalizeHeading(s: string): string {
  return s.toLowerCase().replace(/\//g, "-").trim();
}

function extractMetaLine(body: string, label: string): string | undefined {
  const re = new RegExp(`\\*\\*${label}:\\*\\*\\s*([^\\n]+)`, "i");
  const m = body.match(re);
  return m ? m[1].trim() : undefined;
}

function extractSeason(body: string): string {
  const m = body.match(/\(([^)]*Summer|Winter|Spring|Fall|Autumn[^)]*)\)/i);
  return m ? m[1].trim() : "";
}

function parseCSVMeta(body: string, label: string): string[] {
  const line = extractMetaLine(body, label);
  if (!line) return [];
  return line
    .split(",")
    .map((s) => stripMarkdownLinks(s).replace(/[*_`]/g, "").trim())
    .filter(Boolean);
}

function extractBulletNames(body: string, sectionHeading: string): string[] {
  const re = new RegExp(
    `\\*\\*${sectionHeading}:\\*\\*([\\s\\S]*?)(?=\\n###|\\n\\*\\*|$)`,
    "i",
  );
  const m = body.match(re);
  if (!m) return [];
  return m[1]
    .split("\n")
    .filter((l) => l.trim().startsWith("-"))
    .map((l) => l.replace(/^[-*]\s*/, "").trim())
    .map((l) => l.replace(/^\*\*([^*]+)\*\*.*$/, "$1").trim())
    .filter(Boolean);
}

function extractDrugConnections(body: string): {
  modern: string[];
  ancient: string[];
} {
  const drugSec = body.match(
    /### Drug Connections\s*([\s\S]*?)(?=\n### |\n## |$)/,
  );
  if (!drugSec) return { modern: [], ancient: [] };
  const rows = parseFirstMarkdownTable(drugSec[1]);
  const first = rows[0] ?? {};
  return {
    modern: (first["modern"] ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    ancient: (first["ancient"] ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

export function lookupArchetype(name: string): ArchetypeFull | null {
  const { fullByName } = loadArchetypes();
  const canon = canonicalize(name);
  if (!canon) return null;
  return fullByName.get(canon.toLowerCase()) ?? null;
}

export function listArchetypes(): ArchetypeSummary[] {
  return loadArchetypes().summaries.slice();
}

export function getArchetypeNames(): string[] {
  return CANONICAL_NAMES.slice();
}

function canonicalize(input: string): Archetype | null {
  return normalizeArchetypeAlias(input.trim());
}

function normalizeArchetypeAlias(input: string): Archetype | null {
  const lower = input.toLowerCase().trim();
  for (const n of CANONICAL_NAMES) {
    if (n.toLowerCase() === lower) return n;
  }
  if (
    lower === "chicago detroit" ||
    lower === "chicago/detroit" ||
    lower === "chicago" ||
    lower === "detroit"
  )
    return "Chicago/Detroit";
  return null;
}
