/**
 * MiberaBrowse — Introducing Mibera grimoire browse.
 *
 * 10,000 miberas as a paginated grid. The compact index at
 * /miberas-browse.json holds { id, archetype, ancestor, swag_rank,
 * image } for every mibera; the component fetches once and renders
 * a windowed slice (default 60). "Load more" reveals the next batch.
 *
 * Filter chips above the grid scope by archetype. The visible-count
 * label is live so the visitor always knows how deep they are.
 *
 * Data lives in a static JSON because the codex MCP doesn't ship
 * a list_miberas tool (10k entries would be unwieldy in a single
 * call). This index is the human-facing browse surface; agents
 * still call lookup_mibera(id) for canonical detail.
 */

import { useEffect, useMemo, useState } from "react";

type MiberaSummary = {
  id: number;
  archetype: string;
  ancestor: string;
  swag_rank: string;
  image: string | null;
};

type Index = {
  generatedAt: string;
  count: number;
  miberas: MiberaSummary[];
};

const PAGE_SIZE = 60;

const ARCHETYPES = ["All", "Freetekno", "Milady", "Chicago/Detroit", "Acidhouse"] as const;

let cachedIndex: Index | null = null;
let cachedPromise: Promise<Index | null> | null = null;

async function loadIndex(): Promise<Index | null> {
  if (cachedIndex) return cachedIndex;
  if (!cachedPromise) {
    cachedPromise = fetch("/miberas-browse.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((idx: Index | null) => {
        cachedIndex = idx;
        return idx;
      })
      .catch(() => null);
  }
  return cachedPromise;
}

export function MiberaBrowse() {
  const [index, setIndex] = useState<Index | null>(cachedIndex);
  const [archetype, setArchetype] = useState<(typeof ARCHETYPES)[number]>("All");
  const [visible, setVisible] = useState(PAGE_SIZE);

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

  // Reset pagination when filter changes
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [archetype]);

  const filtered = useMemo(() => {
    if (!index) return [];
    if (archetype === "All") return index.miberas;
    return index.miberas.filter((m) => m.archetype === archetype);
  }, [index, archetype]);

  if (!index) {
    return (
      <div className="mibera-browse mibera-browse--loading" aria-busy="true">
        Loading the ten thousand…
      </div>
    );
  }

  const slice = filtered.slice(0, visible);
  const remaining = Math.max(0, filtered.length - visible);

  return (
    <div className="mibera-browse">
      <div className="mibera-browse__controls">
        <div className="mibera-browse__filter" role="group" aria-label="Filter by archetype">
          {ARCHETYPES.map((a) => (
            <button
              key={a}
              type="button"
              className={`mibera-browse__chip${a === archetype ? " mibera-browse__chip--active" : ""}`}
              onClick={() => setArchetype(a)}
              aria-pressed={a === archetype}
            >
              {a}
            </button>
          ))}
        </div>
        <div className="mibera-browse__count" aria-live="polite">
          {slice.length} of {filtered.length.toLocaleString()}
          {archetype !== "All" ? ` · ${archetype}` : ""}
        </div>
      </div>

      <ul className="mibera-browse__grid" role="list">
        {slice.map((m) => (
          <li key={m.id}>
            <article className="mibera-card" data-archetype={m.archetype}>
              {m.image ? (
                <img
                  src={m.image}
                  alt={`Mibera #${m.id}`}
                  loading="lazy"
                  decoding="async"
                  className="mibera-card__img"
                />
              ) : (
                <div className="mibera-card__img mibera-card__img--missing" aria-hidden />
              )}
              <div className="mibera-card__meta">
                <span className="mibera-card__id">#{m.id}</span>
                <span className="mibera-card__rank">{m.swag_rank}</span>
              </div>
              <div className="mibera-card__archetype">{m.archetype}</div>
            </article>
          </li>
        ))}
      </ul>

      {remaining > 0 ? (
        <div className="mibera-browse__more">
          <button
            type="button"
            className="mibera-browse__more-btn"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
          >
            Load {Math.min(PAGE_SIZE, remaining)} more · {remaining.toLocaleString()} remaining
          </button>
        </div>
      ) : null}
    </div>
  );
}
