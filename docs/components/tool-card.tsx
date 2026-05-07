/**
 * ToolCard — header for a per-tool page.
 *
 * Grimoire image + Imperial title + one-line purpose. SSR-safe;
 * styling lives in /global.css.
 *
 * Usage in MDX:
 *
 *   import { ToolCard } from '../../components/tool-card'
 *
 *   <ToolCard n={5} name="lookup_zone" purpose="..." />
 */

type Props = {
  /** Grimoire avif (1..7) under /grimoire/. */
  n: number
  /** Tool name, e.g. "lookup_zone". Imperial. */
  name: string
  /** One-line declarative purpose. */
  purpose?: string
}

export function ToolCard({ n, name, purpose }: Props) {
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
        <h1 className="tool-card__name">{name}</h1>
        {purpose ? <p className="tool-card__purpose">{purpose}</p> : null}
      </div>
    </header>
  )
}
