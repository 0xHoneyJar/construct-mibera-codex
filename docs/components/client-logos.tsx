/**
 * ClientLogos — compact wall of supported MCP clients.
 *
 * Replaces the 8-card config grid with a single row of logos. The
 * visitor reads "yes this works with my client" at a glance. Clicking
 * a logo lands on that vendor's MCP install docs — they handle the
 * config; we just point the way. Names reveal on hover so first paint
 * is austere (KEEPER).
 *
 * Two clients ship one-click deeplinks (Cursor, VS Code). Those are
 * surfaced as inline buttons after the wall — real convenience that
 * earns the visual weight.
 */

type Client = {
  name: string;
  logo: string;     // filename under /logos/
  docsUrl: string;  // vendor MCP install docs
};

const CLIENTS: Client[] = [
  { name: "Claude Desktop", logo: "anthropic.svg",       docsUrl: "https://docs.claude.com/en/docs/claude-code/mcp" },
  { name: "Claude Code",    logo: "claude.svg",          docsUrl: "https://docs.claude.com/en/docs/claude-code/mcp" },
  { name: "Cursor",         logo: "cursor.svg",          docsUrl: "https://docs.cursor.com/context/model-context-protocol" },
  { name: "Codex CLI",      logo: "openai.svg",          docsUrl: "https://github.com/openai/codex" },
  { name: "Cline",          logo: "visualstudiocode.svg",docsUrl: "https://docs.cline.bot/mcp/configuring-mcp-servers" },
  { name: "Windsurf",       logo: "windsurf.svg",        docsUrl: "https://docs.codeium.com/windsurf/mcp" },
  { name: "ChatGPT",        logo: "openai.svg",          docsUrl: "https://platform.openai.com/docs/mcp" },
  { name: "VS Code",        logo: "vscodium.svg",        docsUrl: "https://code.visualstudio.com/docs/copilot/chat/mcp-servers" },
];

export function ClientLogos() {
  return (
    <ul className="client-logos" role="list" aria-label="Supported MCP clients">
      {CLIENTS.map((c) => (
        <li key={c.name} className="client-logos__item">
          <a
            href={c.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="client-logos__link"
          >
            <img
              src={`/logos/${c.logo}`}
              alt={c.name}
              width={28}
              height={28}
              loading="lazy"
              className="client-logos__logo"
            />
            <span className="client-logos__name">{c.name}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * QuickInstall — one-click install buttons for clients that support
 * MCP deeplinks. Just two for now — Cursor and VS Code. Surfaces them
 * separately because they collapse "open client → settings → MCP →
 * paste URL" into a single click.
 */
export function QuickInstall() {
  return (
    <div className="quick-install">
      <a
        href="cursor://anysphere.cursor-deeplink/mcp/install?name=mibera-codex&config=eyJ1cmwiOiJodHRwczovL21jcC4weGhvbmV5amFyLnh5ei9jb2RleC9tY3AifQ=="
        className="quick-install__btn"
      >
        <img src="/logos/cursor.svg" alt="" width={18} height={18} />
        Open in Cursor
      </a>
      <a
        href="vscode:mcp/install?%7B%22name%22%3A%20%22mibera-codex%22%2C%20%22url%22%3A%20%22https%3A//mcp.0xhoneyjar.xyz/codex/mcp%22%7D"
        className="quick-install__btn"
      >
        <img src="/logos/vscodium.svg" alt="" width={18} height={18} />
        Open in VS Code
      </a>
    </div>
  );
}
