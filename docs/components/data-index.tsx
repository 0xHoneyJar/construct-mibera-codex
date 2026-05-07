/**
 * DataIndex — X. Data & Research surface.
 *
 * Reference layout: knowledge graph link + JSONL exports list +
 * archetype/ancestor stats summary + scope/gaps/timeline links.
 *
 * Stats sourced from /codex-stats.json (built from _codex/data/stats.md
 * by build-onchain-data.mjs). Other sections link out to the canonical
 * GitHub-hosted source files — no inline rendering of large JSON.
 */

import { useEffect, useState } from "react";

type Distribution = {
  name: string;
  count: number;
  pct: string;
};

type CodexStats = {
  generatedAt: string;
  source: string;
  archetype_distribution: Distribution[];
  top_ancestors: Distribution[];
};

const REPO_BASE =
  "https://github.com/0xHoneyJar/construct-mibera-codex/blob/main";

type Export = {
  label: string;
  path: string;
  count: string;
  format: string;
};

const EXPORTS: Export[] = [
  { label: "All Miberas",   path: "_codex/data/miberas.jsonl",  count: "10,000", format: "JSONL" },
  { label: "All Grails",    path: "_codex/data/grails.jsonl",   count: "43",     format: "JSONL" },
  { label: "MiParcels",     path: "_codex/data/parcels.jsonl",  count: "10,000", format: "JSONL" },
  { label: "Knowledge Graph", path: "_codex/data/graph.json",   count: "11,475 nodes · 192K edges", format: "JSON" },
  { label: "Mibera Image URLs", path: "_codex/data/mibera-image-urls.json", count: "10,000", format: "JSON map" },
  { label: "Contract Registry", path: "_codex/data/contracts.json", count: "11", format: "JSON" },
];

type ScopeFile = { label: string; path: string; gloss: string };

const SCOPE_FILES: ScopeFile[] = [
  { label: "Scope",    path: "_codex/data/scope.json",    gloss: "What this codex tracks and doesn't" },
  { label: "Gaps",     path: "_codex/data/gaps.json",     gloss: "Documented unknowns with resolution paths" },
  { label: "Timeline", path: "_codex/data/timeline.json", gloss: "Key ecosystem events" },
  { label: "Stats",    path: "_codex/data/stats.md",      gloss: "Auto-generated distribution dashboard" },
];

let cachedStats: CodexStats | null = null;
let cachedPromise: Promise<CodexStats | null> | null = null;

async function loadStats(): Promise<CodexStats | null> {
  if (cachedStats) return cachedStats;
  if (!cachedPromise) {
    cachedPromise = fetch("/codex-stats.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: CodexStats | null) => {
        cachedStats = d;
        return d;
      })
      .catch(() => null);
  }
  return cachedPromise;
}

export function DataIndex() {
  const [stats, setStats] = useState<CodexStats | null>(cachedStats);

  useEffect(() => {
    if (!stats) {
      let cancelled = false;
      loadStats().then((s) => {
        if (!cancelled) setStats(s);
      });
      return () => {
        cancelled = true;
      };
    }
  }, [stats]);

  return (
    <div className="data-index">
      <section className="data-index__section">
        <h2 className="data-index__heading">Distribution Snapshot</h2>
        {stats ? (
          <div className="data-index__stats-row">
            <div className="data-index__stats-block">
              <div className="data-index__section-label">Archetype</div>
              <ul className="data-index__stats-list" role="list">
                {stats.archetype_distribution.map((d) => (
                  <li key={d.name}>
                    <span className="data-index__stats-name">{d.name}</span>
                    <span className="data-index__stats-pct">{d.pct}</span>
                    <span className="data-index__stats-count">
                      {d.count.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="data-index__stats-block">
              <div className="data-index__section-label">Top Ancestors</div>
              <ul className="data-index__stats-list" role="list">
                {stats.top_ancestors.map((d) => (
                  <li key={d.name}>
                    <span className="data-index__stats-name">{d.name}</span>
                    <span className="data-index__stats-pct">{d.pct}</span>
                    <span className="data-index__stats-count">
                      {d.count.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="data-index__loading" aria-busy="true">
            Loading stats…
          </p>
        )}
        <p className="data-index__source">
          Source: <a href={`${REPO_BASE}/_codex/data/stats.md`} target="_blank" rel="noopener noreferrer">_codex/data/stats.md</a>
        </p>
      </section>

      <section className="data-index__section">
        <h2 className="data-index__heading">Exports & Datasets</h2>
        <table className="data-index__table">
          <thead>
            <tr>
              <th>File</th>
              <th>Format</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {EXPORTS.map((e) => (
              <tr key={e.path}>
                <td>
                  <a href={`${REPO_BASE}/${e.path}`} target="_blank" rel="noopener noreferrer">
                    {e.label}
                  </a>
                  <div className="data-index__path">{e.path}</div>
                </td>
                <td>{e.format}</td>
                <td className="data-index__count">{e.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="data-index__section">
        <h2 className="data-index__heading">Scope, Gaps, Timeline</h2>
        <ul className="data-index__scope-list" role="list">
          {SCOPE_FILES.map((s) => (
            <li key={s.path}>
              <a href={`${REPO_BASE}/${s.path}`} target="_blank" rel="noopener noreferrer">
                {s.label}
              </a>
              <span className="data-index__scope-gloss"> — {s.gloss}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
