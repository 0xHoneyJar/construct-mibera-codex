import { defineConfig } from "vocs";

export default defineConfig({
  title: "Mibera Codex",
  description:
    "Anti-hallucination MCP for narrative-bot consumers — zones, archetypes, factors, grails, miberas. Codex stays source-of-truth; the MCP is a read-only lookup surface.",
  rootDir: ".",
  iconUrl: "/favicon.svg",
  ogImageUrl: "https://vocs.dev/api/og?logo=%logo&title=%title&description=%description",
  topNav: [
    { text: "Tools", link: "/tools/lookup_zone" },
    { text: "Quickstart", link: "/quickstart" },
    {
      text: "GitHub",
      link: "https://github.com/0xHoneyJar/construct-mibera-codex",
    },
  ],
  sidebar: [
    {
      text: "Overview",
      items: [
        { text: "What is Mibera Codex?", link: "/" },
        { text: "Anti-hallucination", link: "/anti-hallucination" },
        { text: "Quickstart", link: "/quickstart" },
      ],
    },
    {
      text: "Tool reference",
      items: [
        { text: "lookup_zone", link: "/tools/lookup_zone" },
        { text: "lookup_archetype", link: "/tools/lookup_archetype" },
        { text: "lookup_factor", link: "/tools/lookup_factor" },
        { text: "lookup_grail", link: "/tools/lookup_grail" },
        { text: "lookup_mibera", link: "/tools/lookup_mibera" },
        { text: "list_zones", link: "/tools/list_zones" },
        { text: "list_archetypes", link: "/tools/list_archetypes" },
        { text: "validate_world_element", link: "/tools/validate_world_element" },
      ],
    },
    {
      text: "Operations",
      items: [
        { text: "Discovery card", link: "/discovery" },
        { text: "Coverage gaps", link: "/coverage-gaps" },
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
