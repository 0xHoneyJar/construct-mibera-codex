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

  const view = useMemo<{ heading: string; entries: VaultEntry[] } | null>(() => {
    if (!index) return null;
    // normalize trailing slash so /grails/cancer/ and /grails/cancer collapse
    const cleanPath = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
    // /codex IS the cathedral — the right-rail trail would be redundant.
    if (cleanPath === "/codex") return null;
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
      if (entries.length > 0) return { heading: "Neighborhood", entries };
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
    return { heading: "Discover", entries: out };
  }, [index, pathname]);

  if (!view) return null;

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
              <span className="codex-blotter-card__glyph" aria-hidden>
                {TYPE_GLYPH[entry.type] ?? "·"}
              </span>
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
