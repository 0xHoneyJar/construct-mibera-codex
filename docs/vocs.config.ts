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
  ogImageUrl: { "**": "https://docs-iota-cyan.vercel.app/og.png" },

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
    { text: "Quickstart", link: "/quickstart" },
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
      text: "Front matter",
      items: [
        { text: "What is the codex?", link: "/" },
        { text: "Install",            link: "/install" },
        { text: "Anti-hallucination", link: "/anti-hallucination" },
        { text: "Quickstart",         link: "/quickstart" },
      ],
    },
    {
      text: "The grimoires",
      items: [
        { text: "Introducing Mibera",      link: "/tools/lookup_mibera" },
        { text: "Clearpill vs Ravepill",   link: "/tools/lookup_archetype" },
        { text: "Mibera Maker · Vol I",    link: "/tools/lookup_grail" },
        { text: "Network Mysticism",       link: "/tools/lookup_factor" },
        { text: "Initiation Ritual",       link: "/tools/lookup_zone" },
        {
          text: "Mibera Maker · Vol II",
          collapsed: false,
          items: [
            { text: "list_archetypes", link: "/tools/list_archetypes" },
            { text: "list_zones",      link: "/tools/list_zones" },
          ],
        },
        { text: "Mibera Maker · Vol III",  link: "/tools/validate_world_element" },
      ],
    },
    {
      text: "Beyond the tools",
      items: [
        { text: "Discovery card", link: "/discovery" },
        { text: "Coverage gaps",  link: "/coverage-gaps" },
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
