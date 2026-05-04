/**
 * SidebarSearch — parchment search trigger mounted under the brand-mark.
 *
 * Reuses vocs's existing DesktopSearch dialog by clicking the (visually
 * hidden) top-nav button programmatically. We don't fork the dialog —
 * vocs ships the keyboard handler, the index, the Algolia/local-search
 * wiring; we only relocate the trigger. The top-nav button stays in DOM
 * (clip-hidden via global.css) so .click() still routes through vocs's
 * own handler.
 */

export function SidebarSearch() {
  function open(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const btn = document.querySelector<HTMLButtonElement>(
      ".vocs_DesktopSearch_search, .vocs_MobileSearch_searchButton"
    );
    if (btn) {
      btn.click();
      return;
    }
    // Fallback: dispatch ⌘K — vocs registers a global keydown listener
    // that opens the search dialog regardless of focus.
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        metaKey: true,
        ctrlKey: true,
        bubbles: true,
      })
    );
  }

  return (
    <button
      type="button"
      className="codex-sidebar-search"
      onClick={open}
      aria-label="Search the codex"
    >
      <span className="codex-sidebar-search__label">Search…</span>
      <span className="codex-sidebar-search__kbd" aria-hidden>⌘K</span>
    </button>
  );
}
