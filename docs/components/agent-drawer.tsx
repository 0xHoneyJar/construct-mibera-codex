/**
 * AgentDrawer — slide-out right panel for agent tooling.
 *
 * The flip per operator: page is the visual codex (full width). The
 * agent-facing tooling lives in a drawer that slides out from the
 * right edge. A "Mibera tab" peeks from the right edge and toggles
 * the drawer.
 *
 * State is local to the drawer. Single instance mounted at body level
 * by Layout. The drawer's contents adapt to the current pathname via
 * the inner ToolReference component (which reads useLocation itself).
 *
 * UX:
 *   - default: drawer translated offscreen; only the Mibera tab is
 *     visible peeking from the right edge
 *   - click tab: drawer slides in over the right portion of the page
 *   - click tab again (or backdrop): drawer slides out
 *   - drawer never blocks scroll on the page beneath
 */

import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { ToolReference } from "./tool-reference";

export function AgentDrawer() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Auto-close when navigating between routes — feels natural and
  // prevents stale open state when the visitor moves to a page
  // where the drawer's contents would change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // ESC closes — standard drawer convention.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={`agent-tab${open ? " agent-tab--open" : ""}`}
        aria-label={open ? "Close agent reference" : "Open agent reference"}
        aria-expanded={open}
        aria-controls="agent-drawer"
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className="agent-tab__avatar"
          aria-hidden
          // The peek avatar shows the books-row slice — same source as
          // the sidebar logo, so the tab visually echoes the codex
          // brand-mark from anywhere on the page. Slice scrolls per
          // route via the same --codex-grimoire-position vars Layout
          // already maintains.
        />
        <span className="agent-tab__label">For Agents</span>
        <span className="agent-tab__chevron" aria-hidden>
          {open ? "›" : "‹"}
        </span>
      </button>

      <aside
        id="agent-drawer"
        className={`agent-drawer${open ? " agent-drawer--open" : ""}`}
        aria-hidden={!open}
        aria-label="Agent tool reference"
      >
        <ToolReference />
      </aside>
    </>
  );
}
