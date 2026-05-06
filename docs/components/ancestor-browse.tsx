/**
 * AncestorBrowse — II. The Framework / Ancestors grimoire browse.
 *
 * 33 canonical ancestor cultures rendered as cards. Mirrors
 * ArchetypeBrowse's structural register: name + period (ancient and
 * modern) + locations as a tag list. No images — ancestors don't have
 * canonical artwork yet; typography + parchment vocabulary carries the
 * visual weight.
 *
 * Data source: /ancestors-browse.json (built from core-lore/ancestors/*.md
 * by docs/scripts/build-ancestors-index.mjs at dev/build time).
 *
 * Per Flatline IMP-008 (cycle-024 SDD review, score 790): cards are
 * non-clickable and informational in MVP. The wrapping ul carries
 * role="list" and each article carries role="listitem" + aria-label so
 * screen readers communicate the card semantics correctly.
 */

import { useEffect, useState } from "react";

type Ancestor = {
  slug: string;
  name: string;
  period_ancient: string | null;
  period_modern: string | null;
  locations: string[];
};

type Index = {
  generatedAt: string;
  count: number;
  ancestors: Ancestor[];
};

let cachedIndex: Index | null = null;
let cachedPromise: Promise<Index | null> | null = null;

async function loadIndex(): Promise<Index | null> {
  if (cachedIndex) return cachedIndex;
  if (!cachedPromise) {
    cachedPromise = fetch("/ancestors-browse.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((idx: Index | null) => {
        cachedIndex = idx;
        return idx;
      })
      .catch(() => null);
  }
  return cachedPromise;
}

export function AncestorBrowse() {
  const [index, setIndex] = useState<Index | null>(cachedIndex);

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

  if (!index) {
    return (
      <div className="ancestor-browse ancestor-browse--loading" aria-busy="true">
        Loading the 33 ancestors…
      </div>
    );
  }

  return (
    <ul className="ancestor-browse" role="list" aria-label="33 canonical ancestor cultures">
      {index.ancestors.map((a) => (
        <li key={a.slug} role="listitem">
          <article
            className="ancestor-card"
            aria-label={`${a.name} ancestor culture${a.period_ancient ? `, ancient period ${a.period_ancient}` : ""}`}
          >
            <header className="ancestor-card__head">
              <h3 className="ancestor-card__name">{a.name}</h3>
            </header>
            {(a.period_ancient || a.period_modern) ? (
              <section className="ancestor-card__section">
                <div className="ancestor-card__section-label">Period</div>
                <div className="ancestor-card__period">
                  {a.period_ancient ? <div>Ancient: {a.period_ancient}</div> : null}
                  {a.period_modern ? <div>Modern: {a.period_modern}</div> : null}
                </div>
              </section>
            ) : null}
            {a.locations.length > 0 ? (
              <section className="ancestor-card__section">
                <div className="ancestor-card__section-label">Locations</div>
                <p className="ancestor-card__locations">{a.locations.join(" · ")}</p>
              </section>
            ) : null}
          </article>
        </li>
      ))}
    </ul>
  );
}
