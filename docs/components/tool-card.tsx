/**
 * ToolCard — header for a per-tool page.
 *
 * The grimoire image + Imperial title + tier badge + one-line purpose.
 * SSR-safe; styling lives in styles/global.css.
 *
 * Usage in MDX:
 *
 *   import { ToolCard } from '../../components/tool-card'
 *
 *   <ToolCard
 *     n={1}
 *     name="lookup_zone"
 *     tier="HARD"
 *     purpose="Resolve a zone by canonical name. Returns the canon entry or null."
 *   />
 */

export type Tier = "HARD" | "SOFT" | "LLM-OWNED"

type Props = {
  /** Which grimoire avif (1..7) under /grimoire/. */
  n: number
  /** Tool name, e.g. "lookup_zone". Imperial. */
  name: string
  /** Anti-hallucination tier. */
  tier: Tier
  /** One-line declarative purpose. */
  purpose?: string
}

const TIER_GLYPH: Record<Tier, string> = {
  HARD: "[locked]",
  SOFT: "[soft]",
  "LLM-OWNED": "[llm-owned]",
}

const TIER_CLASS: Record<Tier, string> = {
  HARD: "tool-card__badge tool-card__badge--hard",
  SOFT: "tool-card__badge tool-card__badge--soft",
  "LLM-OWNED": "tool-card__badge tool-card__badge--llm",
}

export function ToolCard({ n, name, tier, purpose }: Props) {
  return (
    <header className="tool-card">
      <img
        src={`/grimoire/${n}.avif`}
        alt=""
        width={272}
        height={363}
        loading="eager"
        decoding="async"
        className="tool-card__cover"
      />
      <div className="tool-card__body">
        <span className={TIER_CLASS[tier]}>
          <span aria-hidden>{TIER_GLYPH[tier]}</span>
          <span>{tier}</span>
        </span>
        <h1 className="tool-card__name">{name}</h1>
        {purpose ? <p className="tool-card__purpose">{purpose}</p> : null}
      </div>
    </header>
  )
}
