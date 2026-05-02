import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { lookupZone, listZones } from "./lookups/zone.js";
import { lookupArchetype, listArchetypes } from "./lookups/archetype.js";
import { lookupFactor } from "./lookups/factor.js";
import { lookupGrail } from "./lookups/grail.js";
import { lookupMibera } from "./lookups/mibera.js";
import { validateWorldElement } from "./validate.js";

const VERSION = "1.1.0";
const SERVER_NAME = "codex-mcp";

export function createCodexMcpServer(): McpServer {
  const server = new McpServer({ name: SERVER_NAME, version: VERSION });

  server.tool(
    "lookup_zone",
    "Look up a festival zone by canonical slug. Returns name, emoji, archetype anchor, era, essence, Lynch primitives (paths/edges/districts/nodes/landmarks), KANSEI tokens (warmth/motion/shadow/easing/density/sound). Returns null if slug is not canonical.",
    z.object({
      slug: z
        .string()
        .min(1)
        .describe("Zone slug, e.g. 'stonehenge', 'bear-cave', 'el-dorado'"),
    }).shape,
    async ({ slug }) => {
      const zone = lookupZone(slug);
      return {
        content: [
          {
            type: "text",
            text: zone
              ? JSON.stringify(zone, null, 2)
              : JSON.stringify({ error: "not_found", slug }),
          },
        ],
      };
    },
  );

  server.tool(
    "lookup_archetype",
    "Look up one of the 4 canonical archetypes (Freetekno, Milady, Acidhouse, Chicago/Detroit). Returns era, zodiac signs, season, locations, key figures, key events, drug connections, ancestor connections, fashion. Returns null if name is not canonical.",
    z.object({
      name: z
        .string()
        .min(1)
        .describe("Canonical archetype name, e.g. 'Freetekno', 'Milady'"),
    }).shape,
    async ({ name }) => {
      const a = lookupArchetype(name);
      return {
        content: [
          {
            type: "text",
            text: a ? JSON.stringify(a, null, 2) : JSON.stringify({ error: "not_found", name }),
          },
        ],
      };
    },
  );

  server.tool(
    "lookup_factor",
    "Look up a score-mibera factor ID and return its codex lore (display name, dimension, archetype anchor, narrative lore, status). Cross-construct JOIN: score-mibera owns the factor ID surface, codex owns its lore. Returns null if factor ID is not in the codex factor-lore table.",
    z.object({
      factor_id: z
        .string()
        .min(1)
        .describe(
          "Factor ID emitted by score-mibera, e.g. 'nft:mibera', 'og:jani_keys', 'onchain:milady_burner'",
        ),
    }).shape,
    async ({ factor_id }) => {
      const f = lookupFactor(factor_id);
      return {
        content: [
          {
            type: "text",
            text: f
              ? JSON.stringify(f, null, 2)
              : JSON.stringify({ error: "not_found", factor_id }),
          },
        ],
      };
    },
  );

  server.tool(
    "lookup_grail",
    "Look up a 1/1 grail by token ID, slug, or display name. Returns id, name, slug, category (element/luminary/concept/zodiac/planet/ancestor/primordial/special/community), description, image (CDN URL), original_image (legacy irys URL), and attributes (NFT-metadata array). Read the `image` field directly; the slug-derivation convention is documented in grails/README.md (canonical authority). Returns null if not found.",
    z.object({
      query: z
        .string()
        .min(1)
        .describe(
          "Token ID (number as string), slug ('buddhist'), or display name ('Scorpio')",
        ),
    }).shape,
    async ({ query }) => {
      const g = lookupGrail(query);
      return {
        content: [
          {
            type: "text",
            text: g ? JSON.stringify(g, null, 2) : JSON.stringify({ error: "not_found", query }),
          },
        ],
      };
    },
  );

  server.tool(
    "lookup_mibera",
    "Look up a single Mibera by ID (1-10000). Returns canonical traits: archetype, ancestor, time_period, birthday, birth_coordinates, sun/moon/ascending sign, element, swag_rank/score, full visual trait set (background, body, hair, eyes, eyebrows, mouth, shirt, hat, glasses, mask, earrings, face_accessory, tattoo, item), drug, and parcel ID.",
    z.object({
      id: z
        .number()
        .int()
        .min(1)
        .max(10000)
        .describe("Mibera ID, 1-10000"),
    }).shape,
    async ({ id }) => {
      const m = lookupMibera(id);
      return {
        content: [
          {
            type: "text",
            text: m ? JSON.stringify(m, null, 2) : JSON.stringify({ error: "not_found", id }),
          },
        ],
      };
    },
  );

  server.tool(
    "list_zones",
    "List all canonical festival zones. Returns array of {slug, name, emoji, archetype}. Use to discover available zones before calling lookup_zone.",
    z.object({}).shape,
    async () => ({
      content: [
        { type: "text", text: JSON.stringify(listZones(), null, 2) },
      ],
    }),
  );

  server.tool(
    "list_archetypes",
    "List all 4 canonical archetypes. Returns array of {name, era, zodiac_signs, season}. Use to discover canonical archetype names before calling lookup_archetype or to validate archetype claims in narrative output.",
    z.object({}).shape,
    async () => ({
      content: [
        { type: "text", text: JSON.stringify(listArchetypes(), null, 2) },
      ],
    }),
  );

  server.tool(
    "validate_world_element",
    "Validate that a world-element value is canonical. Returns {canonical: bool, suggested?: string, distance?: number}. If the value is not canonical, fuzzy-matches against the canonical set and suggests the closest match (Levenshtein distance, type-tuned threshold). Unmatched-but-Mibera-relevant queries are appended to grimoires/codex-mcp/coverage-gaps.jsonl for periodic curator review (per RFC #53 C6).",
    z.object({
      type: z
        .enum(["zone", "archetype", "factor", "grail", "mibera"])
        .describe("World-element type to validate against"),
      value: z.string().min(1).describe("Value to validate"),
      consumer_hint: z
        .string()
        .optional()
        .describe(
          "Optional consumer identifier for the coverage-gap log (e.g. 'ruggy-v06', 'satoshi-v07')",
        ),
    }).shape,
    async ({ type, value, consumer_hint }) => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(
            validateWorldElement(type, value, consumer_hint),
            null,
            2,
          ),
        },
      ],
    }),
  );

  return server;
}
