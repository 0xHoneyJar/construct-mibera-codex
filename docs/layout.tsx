/**
 * Vocs consumer Layout — wraps every page.
 *
 * Two responsibilities:
 *   1. Inject Agentation (dev-only visual feedback toolbar).
 *   2. Track the current route and set the --codex-grimoire-position
 *      CSS variable so the sidebar brand-mark icon slides through the
 *      books-row image to indicate which grimoire is being viewed.
 *
 * The miberasets-row image is 1400x400 with seven books across. At
 * background-size: 700% auto in a square viewport, each book occupies
 * one icon-width with center stops at 0%, 16.67%, 33.33%, 50%, 66.67%,
 * 83.33%, 100%. Validate reuses book #1 (the keystone, same as the
 * GrimoireShelf mapping on /).
 */

import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router";
import { Agentation } from "agentation";

// Tool → grimoire mapping. All 8 tools fall under the 7 books; vol II
// holds both list tools (it's the discovery-surface book), vol III holds
// validate (the keystone-check). No keystone variant — every tool has
// a book.
//   1 INTRODUCING MIBERA           → lookup_mibera
//   2 CLEARPILL VS RAVEPILL        → lookup_archetype
//   3 MIBERAMAKER DESIGN DOC (I)   → lookup_grail
//   4 NETWORK SPIRITUALITY         → lookup_factor
//   5 MIBERA INITIATION RITUAL     → lookup_zone
//   6 MIBERAMAKER DESIGN DOC (II)  → list_archetypes, list_zones
//   7 MIBERAMAKER DESIGN DOC (III) → validate_world_element
type GrimoireMeta = { position: string; volLabel: string };

const GRIMOIRE_BY_PATH: Record<string, GrimoireMeta> = {
  "/tools/lookup_mibera":          { position: "0%",     volLabel: "vol i" },
  "/tools/lookup_archetype":       { position: "16.67%", volLabel: "vol ii" },
  "/tools/lookup_grail":           { position: "33.33%", volLabel: "vol iii" },
  "/tools/lookup_factor":          { position: "50%",    volLabel: "vol iv" },
  "/tools/lookup_zone":            { position: "66.67%", volLabel: "vol v" },
  "/tools/list_archetypes":        { position: "83.33%", volLabel: "vol vi" },
  "/tools/list_zones":             { position: "83.33%", volLabel: "vol vi" },
  "/tools/validate_world_element": { position: "100%",   volLabel: "vol vii" },
};

const DEFAULT_META: GrimoireMeta = { position: "50%", volLabel: "the codex" };

function GrimoireTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    const meta = GRIMOIRE_BY_PATH[pathname] ?? DEFAULT_META;
    const root = document.documentElement.style;
    root.setProperty("--codex-grimoire-position", meta.position);
    // CSS `content: var(...)` requires the value already be a quoted
    // <string> at the variable level — so we wrap in quotes here.
    root.setProperty("--codex-vol-label", `"${meta.volLabel}"`);
  }, [pathname]);
  return null;
}

type Props = { children: ReactNode };

export default function Layout({ children }: Props) {
  return (
    <>
      <GrimoireTracker />
      {children}
      {import.meta.env.DEV ? <Agentation /> : null}
    </>
  );
}
