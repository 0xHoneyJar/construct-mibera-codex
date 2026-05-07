/**
 * CodexFlow — the overview diagram.
 *
 * One claim: three surfaces, one substrate. The construct repo is the
 * source of truth; the MCP is the read-only window for agents; this
 * site is the read-only window for humans. Same canon, three forms.
 *
 * Structural-first per ALEXANDER (no chroma, no animation, hairlines
 * and Imperial type carry the load — same vocabulary as install-card
 * and grimoire-shelf). Pure HTML so it scales + reflows on mobile.
 */

export type CodexFlowProps = {
  /** Optional aria-label override. */
  ariaLabel?: string;
};

export function CodexFlow({ ariaLabel }: CodexFlowProps) {
  return (
    <figure
      className="codex-flow"
      role="figure"
      aria-label={ariaLabel ?? "the codex: one substrate, three surfaces"}
    >
      <div className="codex-flow__substrate">
        <div className="codex-flow__substrate-label">Canonical Lore</div>
        <div className="codex-flow__substrate-items">
          5 grimoires · 43 grails · 4 archetypes · 5 zones · 10 000 miberas
        </div>
      </div>

      <div className="codex-flow__stem" aria-hidden>
        <span className="codex-flow__stem-line" />
        <span className="codex-flow__stem-label">One Substrate</span>
        <span className="codex-flow__stem-line" />
      </div>

      <div className="codex-flow__surfaces">
        <a
          href="https://github.com/0xHoneyJar/construct-mibera-codex"
          className="codex-flow__surface"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="codex-flow__surface-kind">Repo</div>
          <div className="codex-flow__surface-name">construct-mibera-codex</div>
          <div className="codex-flow__surface-role">source of truth</div>
        </a>

        <a href="/for-agents" className="codex-flow__surface codex-flow__surface--center">
          <div className="codex-flow__surface-kind">MCP</div>
          <div className="codex-flow__surface-name">mcp.0xhoneyjar.xyz/codex/mcp</div>
          <div className="codex-flow__surface-role">agents read it here</div>
        </a>

        <a href="/codex" className="codex-flow__surface">
          <div className="codex-flow__surface-kind">Site</div>
          <div className="codex-flow__surface-name">codex.0xhoneyjar.xyz</div>
          <div className="codex-flow__surface-role">you are here</div>
        </a>
      </div>
    </figure>
  );
}
