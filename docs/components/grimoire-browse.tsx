/**
 * GrimoireBrowse — main-content cathedral grid scoped to one grimoire.
 *
 * On a grimoire's tool page (e.g. /tools/lookup_grail = Mibera Maker · Vol I),
 * the main content area is the browse surface for that grimoire's items.
 * This component renders all 43 grails grouped by canonical category
 * with their canonical artwork as card faces — the same visual register
 * as /codex but scoped to a single grimoire.
 *
 * V1 scope: grail browse only (since vault-index covers grails). Other
 * grimoires (archetypes, zones, factors) extend later when vault-index
 * gains those entry types.
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

type Props = {
  /** What the grimoire holds. V1: "grail" only. */
  type?: "grail";
};

export function GrimoireBrowse({ type = "grail" }: Props) {
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
    const items = Object.values(index.entries).filter(
      (e) => e.type === type && e.docsRoute && e.slug !== "README"
    );

    const byCat = new Map<string, VaultEntry[]>();
    for (const item of items) {
      const cat = item.category ?? "other";
      const list = byCat.get(cat) ?? [];
      list.push(item);
      byCat.set(cat, list);
    }
    for (const list of byCat.values()) {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }
    return [...byCat.entries()].sort(
      ([a], [b]) => categoryOrder(a) - categoryOrder(b)
    );
  }, [index, type]);

  if (!groups) {
    return <div className="grimoire-browse grimoire-browse--loading" />;
  }

  return (
    <div className="grimoire-browse">
      {groups.map(([category, entries]) => (
        <section key={category} className="grimoire-browse__category">
          <h2 className="grimoire-browse__cat-label">
            <span className="grimoire-browse__cat-name">{category}</span>
            <span className="grimoire-browse__cat-count" aria-hidden>
              {entries.length}
            </span>
          </h2>
          <ul className="grimoire-browse__grid" role="list">
            {entries.map((entry) => (
              <li key={entry.path}>
                <a
                  href={entry.docsRoute}
                  className="grimoire-browse__card"
                  data-category={category}
                >
                  <img
                    src={`${ASSET_BASE}/${entry.slug}.webp`}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="grimoire-browse__card-img"
                  />
                  <span className="grimoire-browse__card-title">
                    {entry.title}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
