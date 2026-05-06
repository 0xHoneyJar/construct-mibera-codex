/**
 * LogoCarousel — animated logo strip for supported MCP clients.
 *
 * No individual click targets per the operator's brief — the wall is a
 * trust signal ("works with these"), not a config grid. CSS keyframe
 * scrolls the row infinitely; we render the list twice back-to-back so
 * the marquee loops seamlessly.
 *
 * Hover pauses the animation so the visitor can read a logo in flight.
 */

const CLIENTS = [
  { name: "Claude Desktop",    logo: "anthropic.svg" },
  { name: "Claude Code",       logo: "claude.svg" },
  { name: "Cursor",            logo: "cursor.svg" },
  { name: "Codex CLI",         logo: "openai.svg" },
  { name: "Cline",             logo: "visualstudiocode.svg" },
  { name: "Windsurf",          logo: "windsurf.svg" },
  { name: "ChatGPT",           logo: "openai.svg" },
  { name: "VS Code",           logo: "vscodium.svg" },
  { name: "JetBrains",         logo: "jetbrains.svg" },
  { name: "Neovim",            logo: "neovim.svg" },
];

export function LogoCarousel() {
  // Render twice so the keyframe (translateX 0 → -50%) loops without
  // a visible jump — the second copy slides in as the first slides out.
  const sequence = [...CLIENTS, ...CLIENTS];

  return (
    <div
      className="logo-carousel"
      role="region"
      aria-label="Supported MCP clients"
    >
      <div className="logo-carousel__track" aria-hidden>
        {sequence.map((c, i) => (
          <div key={`${c.name}-${i}`} className="logo-carousel__item">
            <img
              src={`/logos/${c.logo}`}
              alt=""
              width={36}
              height={36}
              loading="lazy"
            />
            <span className="logo-carousel__name">{c.name}</span>
          </div>
        ))}
      </div>
      {/* SR-only canonical list for accessibility — visual marquee is aria-hidden. */}
      <ul className="sr-only">
        {CLIENTS.map((c) => (
          <li key={c.name}>{c.name}</li>
        ))}
      </ul>
    </div>
  );
}
