/**
 * BlotterGrid — right-rail grid-native navigation per the lorekeeper.
 *
 * Replaces vocs's AiCtaDropdown. On any docs page that maps to a vault
 * entry (V1: grail pages), renders a bounded grid of square cards
 * naming the navigable neighborhood. Cards = other entries the reader
 * can travel to from here. Click navigates.
 *
 * Neighborhood resolution (V1):
 *   1. Same-category siblings  — e.g. all 11 other Zodiac grails when
 *      viewing /grails/cancer. The lorekeeper's primary grouping.
 *   2. Outlinks                — md links FROM this page TO another
 *      vault entry that itself has a docs route.
 *   3. Backlinks               — md links pointing TO this page.
 *
 * Filtered to entries with a live docs route (V1: grails only). On
 * non-grail pages with no current-path mapping, the grid is silent.
 *
 * Reads /vault-index.json (built by docs/scripts/build-vault-index.mjs
 * via prebuild). Cached module-globally so we fetch once per session.
 */

import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";

type VaultEntry = {
  path: string;
  slug: string;
  title: string;
  type: string;
  category?: string;
  docsRoute?: string;
  excerpt?: string;
  outlinks: string[];
  backlinks: string[];
};

type VaultIndex = {
  generatedAt: string;
  entryCount: number;
  entries: Record<string, VaultEntry>;
  byDocsRoute: Record<string, string>;
  byCategory: Record<string, string[]>;
};

const TYPE_GLYPH: Record<string, string> = {
  grail: "✦",
  lore: "❋",
  set: "□",
  fracture: "▽",
  era: "⌖",
  browse: "❘❘",
};

const CARD_CAP = 12;

// Order codex categories by canonical taxonomy when sorting all-grails
// browse views — so visitors see Element/Luminary/Concept first, then
// Zodiac/Planet/Ancestor/etc. Mirrors CodexCanvas's CATEGORY_ORDER.
const CATEGORY_ORDER = [
  "zodiac",
  "element",
  "luminary",
  "concept",
  "planet",
  "ancestor",
  "primordial",
  "special",
  "community",
  "completionist",
];

function categoryOrder(cat: string | undefined): number {
  if (!cat) return 999;
  const idx = CATEGORY_ORDER.indexOf(cat);
  return idx === -1 ? 998 : idx;
}

// Per-route browse surfaces. When a grimoire's tool page is the current
// route, the right rail surfaces the canonical contents of that grimoire
// instead of a generic discover sample. Keeps navigation context-aware
// — clicking "Mibera Maker · Vol I" lands on /tools/lookup_grail and
// the rail becomes the 44-grail browse surface.
const FULL_GRAIL_BROWSE_ROUTES = new Set<string>([
  "/tools/lookup_grail",
]);

let cachedIndex: VaultIndex | null = null;
let cachedPromise: Promise<VaultIndex | null> | null = null;

async function loadIndex(): Promise<VaultIndex | null> {
  if (cachedIndex) return cachedIndex;
  if (!cachedPromise) {
    cachedPromise = fetch("/vault-index.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((idx: VaultIndex | null) => {
        cachedIndex = idx;
        return idx;
      })
      .catch(() => null);
  }
  return cachedPromise;
}

export function BlotterGrid() {
  const { pathname } = useLocation();
  const [index, setIndex] = useState<VaultIndex | null>(cachedIndex);

  useEffect(() => {
    if (!index) {
      let cancelled = false;
      loadIndex().then((idx) => {
        if (!cancelled) setIndex(idx);
      });
      return () => {
        cancelled = true;
      };
    }
  }, [index]);

  // normalize trailing slash so /grails/cancer/ and /grails/cancer collapse
  const cleanPath = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  // Routes that render full-width browse components and don't need the
  // right rail. Tool routes already hide the rail via global.css's
  // html[data-route="tool"] block; this set covers non-tool full-width
  // pages (cathedral + grimoire-page browses introduced in cycle-024
  // + the / reading guide where the body sections ARE the browse surface).
  const railHidden =
    cleanPath === "/" ||
    cleanPath === "/codex" ||
    cleanPath === "/framework/ancestors";

  const view = useMemo<{ heading: string; entries: VaultEntry[] } | null>(() => {
    if (railHidden) return null;
    if (!index) return null;

    // ── Grimoire tool routes: surface that grimoire's contents ─────
    // /tools/lookup_grail ⇒ all 44 grails sorted by codex taxonomy.
    // The blotter becomes the navigation surface for the grimoire —
    // browsing happens through the rail, not through the sidebar.
    if (FULL_GRAIL_BROWSE_ROUTES.has(cleanPath)) {
      const grails = Object.values(index.entries)
        .filter((e) => e.type === "grail" && e.docsRoute && e.slug !== "README")
        .sort((a, b) => {
          const ca = a.category ?? "";
          const cb = b.category ?? "";
          if (ca !== cb) return categoryOrder(ca) - categoryOrder(cb);
          return a.title.localeCompare(b.title);
        });
      if (grails.length > 0) return { heading: "Browse Grails", entries: grails };
    }

    const currentPath = index.byDocsRoute[cleanPath];

    if (currentPath) {
      // ── On a vault-mapped page: per-page neighborhood ──────────────
      const current = index.entries[currentPath];
      if (!current) return null;
      const candidates = new Map<string, VaultEntry>();

      // 1. Same-category siblings — the lorekeeper's grouping
      if (current.category && index.byCategory[current.category]) {
        for (const p of index.byCategory[current.category]) {
          if (p === currentPath) continue;
          const e = index.entries[p];
          if (e?.docsRoute) candidates.set(p, e);
        }
      }
      // 2. Outlinks (this page → others)
      for (const p of current.outlinks) {
        if (candidates.has(p)) continue;
        const e = index.entries[p];
        if (e?.docsRoute) candidates.set(p, e);
      }
      // 3. Backlinks (others → this page)
      for (const p of current.backlinks) {
        if (candidates.has(p)) continue;
        const e = index.entries[p];
        if (e?.docsRoute) candidates.set(p, e);
      }
      const entries = [...candidates.values()].slice(0, CARD_CAP);
      if (entries.length > 0) return { heading: "Browse Neighbors", entries };
      // Empty neighborhood (e.g. solo-category grails like satoshi-as-hermes)
      // falls through to Discover so the rail still has a navigation surface.
    }

    // ── Off-vault page (home, install, tools, …): Discover fallback ──
    // One representative grail per category, sorted by category then
    // slug. Fills remaining slots with more grails if categories run
    // out. Reads as a contact sheet of the codex's variety.
    const seenCats = new Set<string>();
    const out: VaultEntry[] = [];
    const allDocsRouted = Object.keys(index.byDocsRoute).sort();
    for (const docsRoute of allDocsRouted) {
      if (out.length >= CARD_CAP) break;
      const path = index.byDocsRoute[docsRoute];
      const e = index.entries[path];
      if (!e || e.type !== "grail") continue;
      if (e.category && seenCats.has(e.category)) continue;
      if (e.category) seenCats.add(e.category);
      out.push(e);
    }
    // Top up to CARD_CAP if we haven't filled yet
    if (out.length < CARD_CAP) {
      const have = new Set(out.map((e) => e.path));
      for (const docsRoute of allDocsRouted) {
        if (out.length >= CARD_CAP) break;
        const path = index.byDocsRoute[docsRoute];
        if (have.has(path)) continue;
        const e = index.entries[path];
        if (!e || e.type !== "grail") continue;
        out.push(e);
      }
    }
    if (out.length === 0) return null;
    return { heading: "Browse the Codex", entries: out };
  }, [index, cleanPath]);

  // /codex hides the rail entirely — no skeleton, no content.
  if (railHidden) return null;

  // Index hasn't loaded yet OR loaded but no neighborhood/discover applies.
  // Render a skeleton with the same shape so the right-rail slot doesn't
  // pop in after first paint. Layout stays stable; once the fetch resolves
  // and view computes, the cards swap in without reflow.
  if (!view) {
    return (
      <nav
        className="codex-blotter-grid codex-blotter-grid--skeleton"
        aria-label="Vault navigation"
        aria-busy="true"
      >
        <h2 className="codex-blotter-grid__heading">Browse the Codex</h2>
        <ul className="codex-blotter-grid__cards" role="list">
          {Array.from({ length: CARD_CAP }).map((_, i) => (
            <li key={i}>
              <span
                className="codex-blotter-card codex-blotter-card--skeleton"
                aria-hidden
              />
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <nav className="codex-blotter-grid" aria-label="Vault navigation">
      <h2 className="codex-blotter-grid__heading">{view.heading}</h2>
      <ul className="codex-blotter-grid__cards" role="list">
        {view.entries.map((entry) => (
          <li key={entry.path}>
            <a
              href={entry.docsRoute}
              className="codex-blotter-card"
              data-type={entry.type}
            >
              {entry.type === "grail" ? (
                <img
                  src={`https://assets.0xhoneyjar.xyz/Mibera/grails/${entry.slug}.webp`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="codex-blotter-card__img"
                />
              ) : (
                <span className="codex-blotter-card__glyph" aria-hidden>
                  {TYPE_GLYPH[entry.type] ?? "·"}
                </span>
              )}
              <span className="codex-blotter-card__title">{entry.title}</span>
              {entry.category ? (
                <span className="codex-blotter-card__cat">
                  {entry.category}
                </span>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
