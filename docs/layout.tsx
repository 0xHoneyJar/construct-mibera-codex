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

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router";
import { Agentation } from "agentation";
import { SidebarSearch } from "./components/sidebar-search";
import { BlotterGrid } from "./components/blotter-grid";

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
type GrimoireMeta = { position: string; volLabel: string; size?: string };

// Tool pages all share the same bg-size (one book fills the icon).
// Default state overrides via DEFAULT_META.size below.
const PER_BOOK_SIZE = "700% auto";

// Percentages tuned to the actual numeral centers in /miberasets-row.jpg
// (1400×400). Increasing P moves the source-image LEFT relative to the
// icon, so visible content appears shifted LEFT — "scroll left" feel.
// Window math: 200px source slice centered on numeral C means
// P = (C - 100) / 12. Pixel-center estimates were ~30px too-low on
// initial pass; bumped each by ~3% so numerals sit centered in icon.
const GRIMOIRE_BY_PATH: Record<string, GrimoireMeta> = {
  "/tools/lookup_mibera":          { position: "6%",  volLabel: "vol i" },
  "/tools/lookup_archetype":       { position: "21%", volLabel: "vol ii" },
  "/tools/lookup_grail":           { position: "37%", volLabel: "vol iii" },
  "/tools/lookup_factor":          { position: "52%", volLabel: "vol iv" },
  "/tools/lookup_zone":            { position: "67%", volLabel: "vol v" },
  "/tools/list_archetypes":        { position: "82%", volLabel: "vol vi" },
  "/tools/list_zones":             { position: "82%", volLabel: "vol vi" },
  "/tools/validate_world_element": { position: "95%", volLabel: "vol vii" },
};

// Default state fills the icon height with the books-row image, showing
// ~2 books centered (around book IV). No letterbox — height fits, width
// overflows + crops via position-x. Distinct from per-book (700% = one
// book) but books are still readable, not a tiny strip.
const DEFAULT_META: GrimoireMeta = {
  position: "center",
  volLabel: "the codex",
  size: "auto 100%",
};

function GrimoireTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    const meta = GRIMOIRE_BY_PATH[pathname] ?? DEFAULT_META;
    const root = document.documentElement.style;
    root.setProperty("--codex-grimoire-position", meta.position);
    root.setProperty("--codex-grimoire-size", meta.size ?? PER_BOOK_SIZE);
    // CSS `content: var(...)` requires the value already be a quoted
    // <string> at the variable level — so we wrap in quotes here.
    root.setProperty("--codex-vol-label", `"${meta.volLabel}"`);
  }, [pathname]);
  return null;
}

/**
 * SidebarSearchMount — portals our parchment search trigger as the
 * LAST CHILD of `.vocs_Sidebar_logoWrapper` so it sits inside the
 * sticky header alongside the brand-mark, not in the scrollable nav
 * region. Mounted once and kept alive across navigations — earlier
 * pathname-keyed cleanup caused a header-flash on every page change.
 * A MutationObserver watches for the wrapper appearing if vocs hasn't
 * rendered the sidebar yet (initial paint or mobile-drawer toggle).
 */
function SidebarSearchMount() {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let observer: MutationObserver | null = null;

    function attach() {
      if (cancelled) return;
      const wrapper = document.querySelector(".vocs_Sidebar_logoWrapper");
      if (!wrapper) return false;
      // Reuse an existing mount if HMR or a previous render left one.
      let el = wrapper.querySelector<HTMLElement>(
        ":scope > .codex-sidebar-search-mount"
      );
      if (!el) {
        el = document.createElement("div");
        el.className = "codex-sidebar-search-mount";
        wrapper.appendChild(el);
      }
      setHost(el);
      return true;
    }

    if (!attach()) {
      // Wait for vocs to mount the sidebar — child of body or
      // descendant of an async-rendered route. Disconnect on attach.
      observer = new MutationObserver(() => {
        if (attach()) {
          observer?.disconnect();
          observer = null;
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      // Intentionally do NOT remove the host on cleanup — keeps the
      // mount alive across re-renders. Layout unmount is the only
      // teardown path, and at that point the whole DOM is going away.
    };
  }, []);

  return host ? createPortal(<SidebarSearch />, host) : null;
}

/**
 * BlotterGridMount — portals BlotterGrid into the FIRST slot of the
 * vocs right rail (`.vocs_DocsLayout_gutterRight`), above the existing
 * Outline. Vocs's AiCtaDropdown is hidden via global.css. Mounted ONCE
 * and kept alive across navigations; the BlotterGrid component itself
 * decides what to render based on `useLocation` (per-page neighborhood,
 * Discover fallback, or null on /codex). Earlier per-pathname mount/
 * unmount caused a right-rail flash on every page change.
 */
function BlotterGridMount() {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let observer: MutationObserver | null = null;

    function attach() {
      if (cancelled) return;
      const gutter = document.querySelector(".vocs_DocsLayout_gutterRight");
      if (!gutter) return false;
      let el = gutter.querySelector<HTMLElement>(
        ":scope > .codex-blotter-grid-mount"
      );
      if (!el) {
        el = document.createElement("div");
        el.className = "codex-blotter-grid-mount";
        gutter.insertAdjacentElement("afterbegin", el);
      }
      setHost(el);
      return true;
    }

    if (!attach()) {
      observer = new MutationObserver(() => {
        if (attach()) {
          observer?.disconnect();
          observer = null;
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, []);

  return host ? createPortal(<BlotterGrid />, host) : null;
}

type Props = { children: ReactNode };

export default function Layout({ children }: Props) {
  return (
    <>
      <GrimoireTracker />
      <SidebarSearchMount />
      <BlotterGridMount />
      {children}
      {import.meta.env.DEV ? <Agentation /> : null}
    </>
  );
}
