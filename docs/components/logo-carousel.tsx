/**
 * LogoCarousel — agent silhouette strip for /for-agents.
 *
 * Scrolls a row of supported-agent logos as a trust signal beneath the
 * skill prompt. Icons sourced from skills.sh's "Available for these
 * agents" section to match the canonical agent set users recognize.
 *
 * Logos render as mask-image silhouettes filled with the parchment ink
 * color — uniform monochrome treatment across all 19 agents regardless
 * of their original brand color. SVG black-background tiles already
 * stripped at the source-file level (one-time pre-processing).
 *
 * CSS keyframe scrolls the row infinitely; we render the list twice
 * back-to-back so the marquee loops seamlessly. Hover pauses the
 * animation so the visitor can read a logo in flight.
 */

const AGENTS = [
  { name: "AMP",            slug: "amp" },
  { name: "Antigravity",    slug: "antigravity" },
  { name: "Claude Code",    slug: "claude-code" },
  { name: "ClawdBot",       slug: "clawdbot" },
  { name: "Cline",          slug: "cline" },
  { name: "Codex",          slug: "codex" },
  { name: "Cursor",         slug: "cursor" },
  { name: "Droid",          slug: "droid" },
  { name: "Gemini",         slug: "gemini" },
  { name: "GitHub Copilot", slug: "copilot" },
  { name: "Goose",          slug: "goose" },
  { name: "Kilo",           slug: "kilo" },
  { name: "Kiro CLI",       slug: "kiro-cli" },
  { name: "Nous Research",  slug: "nous-research" },
  { name: "OpenCode",       slug: "opencode" },
  { name: "Roo",            slug: "roo" },
  { name: "Trae",           slug: "trae" },
  { name: "VSCode",         slug: "vscode" },
  { name: "Windsurf",       slug: "windsurf" },
];

export function LogoCarousel() {
  // Render twice so the keyframe (translateX 0 → -50%) loops without
  // a visible jump — the second copy slides in as the first slides out.
  const sequence = [...AGENTS, ...AGENTS];

  return (
    <div
      className="logo-carousel"
      role="region"
      aria-label="Supported AI agents"
    >
      <div className="logo-carousel__track" aria-hidden>
        {sequence.map((a, i) => (
          <div key={`${a.slug}-${i}`} className="logo-carousel__item">
            <span
              className="logo-carousel__icon"
              style={{
                // Inline mask URL so React doesn't strip the vendor-prefix
                // mask-image properties when the CSS file mounts later.
                WebkitMaskImage: `url(/agents/${a.slug}.svg)`,
                maskImage: `url(/agents/${a.slug}.svg)`,
              }}
              aria-hidden
            />
            <span className="logo-carousel__name">{a.name}</span>
          </div>
        ))}
      </div>
      {/* SR-only canonical list for accessibility — visual marquee is aria-hidden. */}
      <ul className="sr-only">
        {AGENTS.map((a) => (
          <li key={a.slug}>{a.name}</li>
        ))}
      </ul>
    </div>
  );
}
