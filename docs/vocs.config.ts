import { createElement, Fragment } from "react";
import { defineConfig } from "vocs";

/**
 * Mibera Codex — vocs config.
 *
 * Two surfaces in one URL:
 *   - HUMAN visual layer: parchment + ink, Imperial headings, grimoires.
 *   - LLM markdown layer (/llms.txt, /llms-full.txt): structurally clean.
 *
 * Theme tokens (Nier palette, fonts, motion) are declared in
 * styles/global.css and loaded via the `head` link tag below.
 * The vocs `theme.variables` API only handles a subset; the rest is CSS.
 */
export default defineConfig({
  // MiCodex is the brand mark (Imperial, mixed-case). The long-form
  // "Mibera Codex" lives in the description and on-page copy.
  title: "MiCodex",
  titleTemplate: "%s — MiCodex",
  description:
    "The grimoire MCP — anti-hallucination lookup over canonical Mibera lore. Read by agents, browsed by humans, tools shared between.",
  rootDir: ".",

  iconUrl: "/favicon.png",
  // No logoUrl set — vocs's NavLogo is image-OR-title, not both. We
  // want "icon + 'Mibera Codex' text" so we let the title render and
  // inject the icon via CSS ::before in global.css. /logo.png is
  // reserved for OG / social cards where the wordmark has room.
  // Vocs's useOgImageUrl drops string-form ogImageUrl on lookup; the
  // path-map form is the working surface. Glob "**" matches any route
  // so every page gets the same Mibera OG card. Absolute URL so
  // Discord/Twitter/Facebook crawlers resolve it correctly (relative
  // /og.png works for the site but social cards prefer fully-qualified).
  // Update when custom domain lands.
  // Per-page OG cards: when a grail page is shared (Discord/Twitter/Slack),
  // the unfurl shows the grail artwork itself instead of the generic codex card.
  // Order matters in vocs path-maps: useOgImageUrl filters all matching keys
  // and returns keys[keys.length - 1] — LAST match wins. So put the catch-all
  // FIRST and the most-specific overrides LAST.
  ogImageUrl: {
    "**":                       "https://codex.0xhoneyjar.xyz/og.png",
    "/grails/air":              "https://assets.0xhoneyjar.xyz/Mibera/grails/air.webp",
    "/grails/aquarius":         "https://assets.0xhoneyjar.xyz/Mibera/grails/aquarius.webp",
    "/grails/aries":            "https://assets.0xhoneyjar.xyz/Mibera/grails/aries.webp",
    "/grails/black-hole":       "https://assets.0xhoneyjar.xyz/Mibera/grails/black-hole.webp",
    "/grails/buddhist":         "https://assets.0xhoneyjar.xyz/Mibera/grails/buddhist.webp",
    "/grails/cancer":           "https://assets.0xhoneyjar.xyz/Mibera/grails/cancer.webp",
    "/grails/capricorn":        "https://assets.0xhoneyjar.xyz/Mibera/grails/capricorn.webp",
    "/grails/chinese":          "https://assets.0xhoneyjar.xyz/Mibera/grails/chinese.webp",
    "/grails/earth":            "https://assets.0xhoneyjar.xyz/Mibera/grails/earth.webp",
    "/grails/ethiopian":        "https://assets.0xhoneyjar.xyz/Mibera/grails/ethiopian.webp",
    "/grails/fire":             "https://assets.0xhoneyjar.xyz/Mibera/grails/fire.webp",
    "/grails/future":           "https://assets.0xhoneyjar.xyz/Mibera/grails/future.webp",
    "/grails/gaia":             "https://assets.0xhoneyjar.xyz/Mibera/grails/gaia.webp",
    "/grails/gemini":           "https://assets.0xhoneyjar.xyz/Mibera/grails/gemini.webp",
    "/grails/greek":            "https://assets.0xhoneyjar.xyz/Mibera/grails/greek.webp",
    "/grails/hindu":            "https://assets.0xhoneyjar.xyz/Mibera/grails/hindu.webp",
    "/grails/japanese":         "https://assets.0xhoneyjar.xyz/Mibera/grails/japanese.webp",
    "/grails/jupiter":          "https://assets.0xhoneyjar.xyz/Mibera/grails/jupiter.webp",
    "/grails/leo":              "https://assets.0xhoneyjar.xyz/Mibera/grails/leo.webp",
    "/grails/libra":            "https://assets.0xhoneyjar.xyz/Mibera/grails/libra.webp",
    "/grails/mars":             "https://assets.0xhoneyjar.xyz/Mibera/grails/mars.webp",
    "/grails/mayan":            "https://assets.0xhoneyjar.xyz/Mibera/grails/mayan.webp",
    "/grails/mercury":          "https://assets.0xhoneyjar.xyz/Mibera/grails/mercury.webp",
    "/grails/mijedi":           "https://assets.0xhoneyjar.xyz/Mibera/grails/mijedi.webp",
    "/grails/mongolian":        "https://assets.0xhoneyjar.xyz/Mibera/grails/mongolian.webp",
    "/grails/moon":             "https://assets.0xhoneyjar.xyz/Mibera/grails/moon.webp",
    "/grails/native-american":  "https://assets.0xhoneyjar.xyz/Mibera/grails/native-american.webp",
    "/grails/neptune":          "https://assets.0xhoneyjar.xyz/Mibera/grails/neptune.webp",
    "/grails/past":             "https://assets.0xhoneyjar.xyz/Mibera/grails/past.webp",
    "/grails/pisces":           "https://assets.0xhoneyjar.xyz/Mibera/grails/pisces.webp",
    "/grails/pluto":            "https://assets.0xhoneyjar.xyz/Mibera/grails/pluto.webp",
    "/grails/rastafarian":      "https://assets.0xhoneyjar.xyz/Mibera/grails/rastafarian.webp",
    "/grails/sagittarius":      "https://assets.0xhoneyjar.xyz/Mibera/grails/sagittarius.webp",
    "/grails/satanist":         "https://assets.0xhoneyjar.xyz/Mibera/grails/satanist.webp",
    "/grails/satoshi-as-hermes":"https://assets.0xhoneyjar.xyz/Mibera/grails/satoshi-as-hermes.webp",
    "/grails/saturn":           "https://assets.0xhoneyjar.xyz/Mibera/grails/saturn.webp",
    "/grails/scorpio":          "https://assets.0xhoneyjar.xyz/Mibera/grails/scorpio.webp",
    "/grails/sun":              "https://assets.0xhoneyjar.xyz/Mibera/grails/sun.webp",
    "/grails/taurus":           "https://assets.0xhoneyjar.xyz/Mibera/grails/taurus.webp",
    "/grails/uranus":           "https://assets.0xhoneyjar.xyz/Mibera/grails/uranus.webp",
    "/grails/venus":            "https://assets.0xhoneyjar.xyz/Mibera/grails/venus.webp",
    "/grails/virgo":            "https://assets.0xhoneyjar.xyz/Mibera/grails/virgo.webp",
    "/grails/water":            "https://assets.0xhoneyjar.xyz/Mibera/grails/water.webp",
  },

  // Inject our parchment stylesheet on every page. Vocs treats a plain
  // object `head` as a path-map, so we pass a function — it dodges the
  // object branch and returns a React element on every route.
  head: () => createElement(Fragment, null,
    createElement("link", { rel: "stylesheet", href: "/global.css" }),
    createElement("link", { rel: "preload", as: "font", type: "font/ttf", href: "/fonts/ImperialBTRoman.ttf", crossOrigin: "anonymous" }),
    createElement("link", { rel: "preload", as: "font", type: "font/ttf", href: "/fonts/Switzer.ttf", crossOrigin: "anonymous" }),
    createElement("meta", { name: "theme-color", content: "#22201d" }),
  ),

  // We ship Switzer + Imperial via @font-face in /global.css. Vocs's
  // `font` field only accepts Google Fonts, so we omit it entirely —
  // body { font-family } in our stylesheet wins and no Inter <link>
  // is injected.

  // Mibera mode is the only mode. Force light scheme; toggles surface
  // nothing, but our :root + :root.dark CSS overrides cover both anyway.
  theme: {
    colorScheme: "light",
    variables: {
      color: {
        background:           "var(--nier-bg-primary)",
        background2:          "var(--nier-bg-panel)",
        background3:          "var(--nier-bg-panel)",
        background4:          "var(--nier-bg-panel-dark)",
        background5:          "var(--nier-bg-panel-dark)",
        backgroundDark:       "var(--nier-bg-panel)",
        backgroundDarkTint:   "var(--nier-bg-panel-dark)",
        backgroundAccent:     "var(--nier-text-primary)",
        backgroundAccentHover:"var(--nier-text-secondary)",
        backgroundAccentText: "var(--nier-bg-primary)",
        border:               "var(--nier-border-medium)",
        border2:              "var(--nier-border-medium)",
        borderAccent:         "var(--nier-border-dark)",
        text:                 "var(--nier-text-primary)",
        text2:                "var(--nier-text-secondary)",
        text3:                "var(--nier-text-muted)",
        text4:                "var(--nier-text-muted)",
        textHover:            "var(--nier-text-primary)",
        textAccent:           "var(--nier-text-primary)",
        textAccentHover:      "var(--nier-text-secondary)",
        heading:              "var(--nier-text-primary)",
        title:                "var(--nier-text-primary)",
      },
    },
  },

  topNav: [
    { text: "Tools", link: "/tools/lookup_zone" },
    {
      text: "GitHub",
      link: "https://github.com/0xHoneyJar/construct-mibera-codex",
    },
  ],

  // Sidebar mirrors the index's book-by-book structure: each book is
  // a sidebar entry. Vol II nests its two list tools. The sidebar
  // labels match the book covers so an operator can navigate the
  // codex by lore, not by tool name. The canonical snake_case names
  // render in the ToolCard + JSON examples on each tool page.
  sidebar: [
    {
      text: "Front Matter",
      items: [
        { text: "What Is the Codex?", link: "/" },
        { text: "For Agents",         link: "/for-agents" },
      ],
    },
    {
      text: "The Grimoires",
      items: [
        { text: "Introducing Mibera",     link: "/tools/lookup_mibera" },
        { text: "Clearpill vs Ravepill",  link: "/tools/lookup_archetype" },
        { text: "Mibera Maker · Vol I",   link: "/tools/lookup_grail" },
        { text: "Network Mysticism",      link: "/tools/lookup_factor" },
        { text: "Initiation Ritual",      link: "/tools/lookup_zone" },
      ],
    },
  ],

  socials: [
    {
      icon: "github",
      link: "https://github.com/0xHoneyJar/construct-mibera-codex",
    },
  ],
});
