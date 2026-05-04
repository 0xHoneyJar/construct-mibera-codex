/**
 * CodexCanvas — full-viewport grid view of the codex.
 *
 * The cathedral. Where BlotterGrid in the right rail is the trail (a
 * peephole at 12 cards), CodexCanvas is the substrate-mirror Gumi's
 * design points at: every navigable entry as a tactile cell, grouped
 * by category, with the actual Mibera artwork as the card face.
 *
 * V1.5 scope: 43 docs-routed grails. Lore + sets + fractures don't
 * yet have MDX wrappers, so they're omitted (would render as un-
 * navigable cells). Categories sorted by the codex's own taxonomy
 * (zodiac → element → luminary → concept → planet → ancestor → …).
 *
 * Reads /vault-index.json (shared with BlotterGrid). Mounted from
 * docs/pages/codex.mdx.
 */

import { useEffect, useMemo, useState } from "react";

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

// Order categories by the codex's own taxonomy logic — load-bearing
// signals first (zodiac/element/luminary as core grails), then
// textural and modifier categories. Anything not listed falls to the
// end alphabetical.
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

const ASSET_BASE = "https://assets.0xhoneyjar.xyz/Mibera/grails";

export function CodexCanvas() {
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

  const groups = useMemo(() => {
    if (!index) return null;
    const grails = Object.values(index.entries).filter(
      (e) => e.type === "grail" && e.docsRoute && e.slug !== "README"
    );

    const byCat = new Map<string, VaultEntry[]>();
    for (const g of grails) {
      const cat = g.category ?? "other";
      const list = byCat.get(cat) ?? [];
      list.push(g);
      byCat.set(cat, list);
    }
    for (const list of byCat.values()) {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }
    return [...byCat.entries()].sort(
      ([a], [b]) => categoryOrder(a) - categoryOrder(b)
    );
  }, [index]);

  if (!groups) {
    return <div className="codex-canvas codex-canvas--loading" />;
  }

  return (
    <div className="codex-canvas">
      {groups.map(([category, entries]) => (
        <section key={category} className="codex-canvas__category">
          <h2 className="codex-canvas__cat-label">
            <span className="codex-canvas__cat-name">{category}</span>
            <span className="codex-canvas__cat-count" aria-hidden>
              {entries.length}
            </span>
          </h2>
          <ul className="codex-canvas__grid" role="list">
            {entries.map((entry) => (
              <li key={entry.path}>
                <a
                  href={entry.docsRoute}
                  className="codex-canvas__card"
                  data-category={category}
                >
                  <img
                    src={`${ASSET_BASE}/${entry.slug}.webp`}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="codex-canvas__card-img"
                  />
                  <span className="codex-canvas__card-title">{entry.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
