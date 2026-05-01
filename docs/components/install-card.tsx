/**
 * InstallCard — per-client install card.
 *
 * Logo + name on top. Config file path (mono) below name. Snippet
 * rendered as a static `<pre>` inside the card so vocs's CodeBlock
 * styling carries through (parchment panel + MiDi hairline border +
 * copy button via shiki). Optional href to vendor docs.
 *
 * SSR-safe; styling lives in /global.css under .install-card.
 */

export type InstallCardProps = {
  name: string;
  logo: string; // filename under /logos/ (e.g. "anthropic.svg")
  configFile?: string;
  snippet: string;
  language?: "json" | "bash" | "toml";
  href?: string;
  hrefLabel?: string;
};

export function InstallCard({
  name,
  logo,
  configFile,
  snippet,
  language = "json",
  href,
  hrefLabel,
}: InstallCardProps) {
  return (
    <article className="install-card">
      <header className="install-card__head">
        <img
          src={`/logos/${logo}`}
          alt=""
          className="install-card__logo"
          width={28}
          height={28}
          loading="lazy"
        />
        <div className="install-card__name">{name}</div>
      </header>
      {configFile ? (
        <div className="install-card__file">{configFile}</div>
      ) : null}
      <pre className={`install-card__snippet language-${language}`}>
        <code>{snippet}</code>
      </pre>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="install-card__link"
        >
          {hrefLabel ?? "official docs →"}
        </a>
      ) : null}
    </article>
  );
}
