/**
 * ConsumerCard — production agent consuming codex-mcp.
 *
 * Used in the "who's using it" section as substrate-truth evidence:
 * real agents already grounded against the codex. Per
 * [[substrate-over-narrative]], the logo wall IS the evidence.
 *
 * Status:
 *   - live   — shipping today, consumes mcp at runtime
 *   - target — operator confirmed interest, integration pending
 *   - planned — future, on roadmap
 */

export type ConsumerStatus = "live" | "target" | "planned";

export type ConsumerCardProps = {
  name: string;
  /** Logo filename under /logos/ (e.g. "discord.svg"); falls back to emoji if absent. */
  logo?: string;
  /** Unicode glyph fallback when no SVG logo is available. */
  emoji?: string;
  /** One-line description of the agent's role. */
  role: string;
  /** Link target — repo, blog post, or live surface. */
  href: string;
  /** Default "live". */
  status?: ConsumerStatus;
};

const STATUS_LABEL: Record<ConsumerStatus, string> = {
  live: "live",
  target: "target",
  planned: "planned",
};

export function ConsumerCard({
  name,
  logo,
  emoji,
  role,
  href,
  status = "live",
}: ConsumerCardProps) {
  return (
    <a
      href={href}
      target={href.startsWith("/") ? undefined : "_blank"}
      rel={href.startsWith("/") ? undefined : "noopener noreferrer"}
      className={`consumer-card consumer-card--${status}`}
    >
      <span className="consumer-card__icon" aria-hidden>
        {logo ? (
          <img src={`/logos/${logo}`} alt="" width={24} height={24} loading="lazy" />
        ) : (
          emoji
        )}
      </span>
      <span className="consumer-card__body">
        <span className="consumer-card__name">{name}</span>
        <span className="consumer-card__role">{role}</span>
      </span>
      {status !== "live" ? (
        <span className="consumer-card__status">{STATUS_LABEL[status]}</span>
      ) : null}
    </a>
  );
}
