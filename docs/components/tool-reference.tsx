/**
 * ToolReference — agent-facing tool spec, mounted in the right rail
 * on /tools/* routes.
 *
 * The flip per operator: the visual codex browse is front-and-center
 * (main content); the agent tooling reference sits on the right.
 * Humans get the cathedral. Agents (and the developers wiring them)
 * get the spec.
 *
 * Per-tool data is hardcoded here — 8 tools, each spec is small. When
 * canon shifts, edit this file. Future: source from a single tool-specs
 * data file shared with the MCP server itself.
 */

import { useLocation } from "react-router";

type ToolSpec = {
  /** snake_case tool name. */
  name: string;
  /** One-line declarative purpose. */
  purpose: string;
  /** Compact input signature, e.g. `lookup_grail(query: string)`. */
  signature: string;
  /** Example call (JSON). */
  inputExample: string;
  /** Example response (JSON). */
  outputExample: string;
};

const SPECS: Record<string, ToolSpec> = {
  lookup_mibera: {
    name: "lookup_mibera",
    purpose: "One Mibera, full canon — IDs 1 through 10,000",
    signature: "lookup_mibera(id: integer)",
    inputExample: `{ "id": 1 }`,
    outputExample: `{
  "id": 1,
  "archetype": "Freetekno",
  "ancestor": "Greek",
  "sun_sign": "Cancer",
  "background": "Fyre Festival",
  "hair": "Afro",
  "glasses": "Red Sunglasses",
  ...
}`,
  },
  lookup_archetype: {
    name: "lookup_archetype",
    purpose: "One of four tribes — era, locations, figures, fashion",
    signature: "lookup_archetype(name: string)",
    inputExample: `{ "name": "Freetekno" }`,
    outputExample: `{
  "name": "Freetekno",
  "era": "1990s",
  "locations": ["UK", "France", "Czech Republic"],
  "figures": [...],
  "fashion": [...]
}`,
  },
  lookup_grail: {
    name: "lookup_grail",
    purpose: "1/1 grail by ID, slug, or name",
    signature: "lookup_grail(query: string)",
    inputExample: `{ "query": "moon" }`,
    outputExample: `{
  "id": 309,
  "name": "Moon",
  "type": "grail",
  "category": "luminary",
  "slug": "moon",
  "description": "Speaker cone necklace with lunar phase crown"
}`,
  },
  lookup_factor: {
    name: "lookup_factor",
    purpose: "Score-mibera factor ID ↔ codex lore",
    signature: "lookup_factor(factor_id: string)",
    inputExample: `{ "factor_id": "og.first-mint" }`,
    outputExample: `{
  "factor_id": "og.first-mint",
  "display_name": "First Mint",
  "dimension": "OG",
  "lore": "..."
}`,
  },
  lookup_zone: {
    name: "lookup_zone",
    purpose: "Zone by slug — essence, Lynch primitives, KANSEI tokens",
    signature: "lookup_zone(slug: string)",
    inputExample: `{ "slug": "stonehenge" }`,
    outputExample: `{
  "slug": "stonehenge",
  "name": "Stonehenge",
  "emoji": "🪨",
  "archetype": "Freetekno",
  "essence": "...",
  "lynch_primitives": { ... },
  "kansei": { ... }
}`,
  },
  list_archetypes: {
    name: "list_archetypes",
    purpose: "The four tribes — discovery surface",
    signature: "list_archetypes()",
    inputExample: `{}`,
    outputExample: `[
  { "name": "Freetekno",     "era": "1990s", ... },
  { "name": "Milady",        "era": "...",   ... },
  { "name": "Chicago/Detroit", "era": "...", ... },
  { "name": "Acidhouse",     "era": "...",   ... }
]`,
  },
  list_zones: {
    name: "list_zones",
    purpose: "Every canonical zone — discovery surface",
    signature: "list_zones()",
    inputExample: `{}`,
    outputExample: `[
  { "slug": "stonehenge",   "name": "...", "emoji": "🪨" },
  { "slug": "bear-cave",    "name": "...", "emoji": "🐻" },
  { "slug": "el-dorado",    "name": "...", "emoji": "🌅" },
  { "slug": "owsley-lab",   "name": "...", "emoji": "🧪" },
  { "slug": "the-warehouse","name": "...", "emoji": "🏭" }
]`,
  },
  validate_world_element: {
    name: "validate_world_element",
    purpose: "The keystone — canonical check, fuzzy match, gap log",
    signature: "validate_world_element(type: string, value: string)",
    inputExample: `{ "type": "archetype", "value": "Freetech" }`,
    outputExample: `{
  "canonical": false,
  "suggested": "Freetekno",
  "distance": 3
}`,
  },
};

function specForPath(pathname: string): ToolSpec | null {
  const match = pathname.match(/^\/tools\/([a-z_]+)\/?$/);
  if (!match) return null;
  return SPECS[match[1]] ?? null;
}

// Map each tool to its grimoire — for the catalog view shown when no
// specific tool is active. Mirrors the seven-volume taxonomy used in
// the sidebar.
const GRIMOIRE_BY_TOOL: Record<string, { vol: string; route: string }> = {
  lookup_mibera:          { vol: "Introducing Mibera",     route: "/tools/lookup_mibera" },
  lookup_archetype:       { vol: "Clearpill vs Ravepill",  route: "/tools/lookup_archetype" },
  lookup_grail:           { vol: "Mibera Maker · Vol I",   route: "/tools/lookup_grail" },
  lookup_factor:          { vol: "Network Mysticism",      route: "/tools/lookup_factor" },
  lookup_zone:            { vol: "Initiation Ritual",      route: "/tools/lookup_zone" },
  list_archetypes:        { vol: "Mibera Maker · Vol II",  route: "/tools/list_archetypes" },
  list_zones:             { vol: "Mibera Maker · Vol II",  route: "/tools/list_zones" },
  validate_world_element: { vol: "Mibera Maker · Vol III", route: "/tools/validate_world_element" },
};

const TOOL_ORDER = [
  "lookup_mibera",
  "lookup_archetype",
  "lookup_grail",
  "lookup_factor",
  "lookup_zone",
  "list_archetypes",
  "list_zones",
  "validate_world_element",
];

function ToolCatalog() {
  return (
    <div className="tool-reference">
      <header className="tool-reference__head">
        <div className="tool-reference__kind">For Agents</div>
        <p className="tool-reference__purpose">
          Eight read-only tools across the codex. Each tool grounds your agent in canonical Mibera lore.
        </p>
      </header>
      <ul className="tool-catalog" role="list">
        {TOOL_ORDER.map((toolName) => {
          const spec = SPECS[toolName];
          const meta = GRIMOIRE_BY_TOOL[toolName];
          if (!spec || !meta) return null;
          return (
            <li key={toolName}>
              <a href={meta.route} className="tool-catalog__item">
                <code className="tool-catalog__name">{spec.name}</code>
                <span className="tool-catalog__vol">{meta.vol}</span>
                <span className="tool-catalog__purpose">{spec.purpose}</span>
              </a>
            </li>
          );
        })}
      </ul>
      <footer className="tool-reference__foot">
        <a href="/for-agents" className="tool-reference__install">
          For Agents →
        </a>
      </footer>
    </div>
  );
}

export function ToolReference() {
  const { pathname } = useLocation();
  const cleanPath = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  const spec = specForPath(cleanPath);

  if (!spec) return <ToolCatalog />;

  return (
    <aside className="tool-reference" aria-label={`Tool reference: ${spec.name}`}>
      <header className="tool-reference__head">
        <div className="tool-reference__kind">For Agents</div>
        <code className="tool-reference__name">{spec.name}</code>
        <p className="tool-reference__purpose">{spec.purpose}</p>
      </header>

      <section className="tool-reference__section">
        <div className="tool-reference__section-label">Signature</div>
        <pre className="tool-reference__code"><code>{spec.signature}</code></pre>
      </section>

      <section className="tool-reference__section">
        <div className="tool-reference__section-label">Input</div>
        <pre className="tool-reference__code"><code>{spec.inputExample}</code></pre>
      </section>

      <section className="tool-reference__section">
        <div className="tool-reference__section-label">Output</div>
        <pre className="tool-reference__code"><code>{spec.outputExample}</code></pre>
      </section>

      <footer className="tool-reference__foot">
        <a href="/for-agents" className="tool-reference__install">
          For Agents →
        </a>
      </footer>
    </aside>
  );
}
