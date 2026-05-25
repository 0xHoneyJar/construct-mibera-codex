#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { handleMcpRequest, closeAllSessions } from "../src/transport.js";
import { codexPath } from "../src/lib/codex-root.js";
import { lookupMibera } from "../src/lookups/mibera.js";
import type { MiberaEntry } from "../src/types.js";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";

const MCP_CARD = JSON.parse(
  readFileSync(codexPath("app/.well-known/mcp.json"), "utf-8"),
);

// Cycle C federation beacon (v0.3 broadcast layer · per SDD §2.3 + sprint-2 P1).
// Generated at build time from beacon.yaml via build-beacon-json (CI-validated against
// @0xhoneyjar/beacon-schema BeaconV2Schema). Gateway fetches this endpoint to populate
// its registry-broadcast cache; partners read it to discover capabilities + auth shape.
const BEACON_CARD_RAW = JSON.parse(
  readFileSync(codexPath("app/.well-known/beacon.json"), "utf-8"),
);

// Resolve ${ENV_VAR} placeholders ONCE at startup (per bridgebuilder PR #74 F1+F2).
// BeaconV2Schema declares mcp.remote.endpoint as "Full URL OR template like
// ${MCP_REMOTE_ENDPOINT}" — substitution happens here, env-driven per deploy.
//
// Failure mode (per bridgebuilder F3): unset placeholder → fail startup with a
// clear error rather than serving the literal "${VAR}" string. Federation
// partners caching a malformed URL is a much worse failure than an aborted boot.
const missingPlaceholders = new Set<string>();
// Match POSIX shell identifier syntax: leading letter/underscore, then alnum/underscore.
// Broader than the uppercase-only convention so lowercase or mixed-case schema authors
// don't get silent pass-through (per bridgebuilder F1, PR #74 fourth-pass review).
function resolveBeaconPlaceholders(card: unknown): unknown {
  if (typeof card === "string") {
    return card.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (match, name) => {
      const value = process.env[name];
      if (value === undefined || value === "") {
        missingPlaceholders.add(name);
        return match;
      }
      return value;
    });
  }
  if (Array.isArray(card)) {
    return card.map((item) => resolveBeaconPlaceholders(item));
  }
  if (card !== null && typeof card === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(card)) {
      out[k] = resolveBeaconPlaceholders(v);
    }
    return out;
  }
  return card;
}

const BEACON_CARD = resolveBeaconPlaceholders(BEACON_CARD_RAW) as {
  mcp?: { remote?: { endpoint?: string } };
};
if (missingPlaceholders.size > 0) {
  const names = Array.from(missingPlaceholders).join(", ");
  process.stderr.write(
    `[codex-mcp] FATAL: beacon.yaml references unset env vars: ${names}. ` +
      `Set them in the deploy environment (e.g. MCP_REMOTE_ENDPOINT=https://mcp.0xhoneyjar.xyz/codex/mcp).\n`,
  );
  process.exit(1);
}
// Log resolved endpoint at startup for ops visibility (per bridgebuilder F4 PR #74).
// Helps confirm successful substitution without exposing other beacon contents.
process.stderr.write(
  `[codex-mcp] beacon resolved · mcp.remote.endpoint=${BEACON_CARD.mcp?.remote?.endpoint ?? "<absent>"}\n`,
);

const app = new Hono();

app.get("/healthz", (c) => c.text("ok"));
app.get("/.well-known/mcp.json", (c) => c.json(MCP_CARD));
app.get("/.well-known/beacon.json", (c) => c.json(BEACON_CARD));

// POST /v1/mibera/batch — plain-HTTP REST surface over lookupMibera for
// federation consumers (e.g. identity-api's HttpCodexAdapter, T3.1 Mibera-
// dimensions resolver). Closes the integration gap documented in
// 0xHoneyJar/identity-api PR #5 (BB review F-002, sprint T2.1 build notes):
// adapter projected this shape; codex side now implements it verbatim.
//
// Wire contract is authoritative at:
//   freeside-auth/packages/protocol/src/api/federation/codex.ts
//   (CodexGetMiberaBatchReqSchema + CodexGetMiberaBatchRespSchema)
//
// Body:     { tokenIds: number[] }   1..100 entries, each integer 1..10000
// 200:      { miberas: MiberaEntry[] }  silent-omit on not-found
// 400:      { error: "invalid_request", message: string }
//
// Auth: beacon.yaml declares `auth: kind: none` — no API key required.
// Validation mirrors the Zod schema in identity-api's contract package
// (kept in-sync by hand because the codex's wire-level deps must stay
// minimal — no zod-shaped import from identity-api).
app.post("/v1/mibera/batch", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json(
      { error: "invalid_request", message: "body must be valid JSON" },
      400,
    );
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return c.json(
      { error: "invalid_request", message: "body must be a JSON object" },
      400,
    );
  }

  const tokenIds = (body as { tokenIds?: unknown }).tokenIds;
  if (!Array.isArray(tokenIds)) {
    return c.json(
      { error: "invalid_request", message: "tokenIds must be an array" },
      400,
    );
  }
  if (tokenIds.length === 0) {
    return c.json(
      { error: "invalid_request", message: "tokenIds must contain at least 1 entry" },
      400,
    );
  }
  if (tokenIds.length > 100) {
    return c.json(
      { error: "invalid_request", message: "tokenIds must contain at most 100 entries" },
      400,
    );
  }
  for (const id of tokenIds) {
    if (
      typeof id !== "number" ||
      !Number.isInteger(id) ||
      id < 1 ||
      id > 10000
    ) {
      return c.json(
        {
          error: "invalid_request",
          message: "every tokenId must be an integer in [1, 10000]",
        },
        400,
      );
    }
  }

  // Silent omit on not-found: caller dedupes against its request set if it
  // needs missing-id detection. Ordering is NOT guaranteed to match request
  // order (matches CodexGetMiberaBatchRespSchema documented semantics).
  //
  // Project each entry through the wire-contract field set explicitly. The
  // backing JSONL carries extra fields (e.g. `type: "mibera"`) that the
  // TypeScript `MiberaEntry` interface and `CodexMiberaEntrySchema` both
  // omit; whitelisting prevents future JSONL drift from leaking into the
  // federation surface (any new field becomes a deliberate contract-level
  // change, not an accidental wire-shape mutation).
  const miberas: MiberaEntry[] = [];
  for (const id of tokenIds) {
    const m = lookupMibera(id);
    if (m === null) continue;
    const projected: MiberaEntry = {
      id: m.id,
      archetype: m.archetype,
      ancestor: m.ancestor,
      time_period: m.time_period,
      birthday: m.birthday,
      birth_coordinates: m.birth_coordinates,
      sun_sign: m.sun_sign,
      moon_sign: m.moon_sign,
      ascending_sign: m.ascending_sign,
      element: m.element,
      swag_rank: m.swag_rank,
      swag_score: m.swag_score,
      background: m.background,
      body: m.body,
      hair: m.hair,
      eyes: m.eyes,
      eyebrows: m.eyebrows,
      mouth: m.mouth,
      shirt: m.shirt,
      hat: m.hat,
      glasses: m.glasses,
      mask: m.mask,
      earrings: m.earrings,
      face_accessory: m.face_accessory,
      tattoo: m.tattoo,
      item: m.item,
      drug: m.drug,
    };
    if (m.parcel !== undefined) projected.parcel = m.parcel;
    miberas.push(projected);
  }

  return c.json({ miberas });
});

app.all("/mcp", handleMcpRequest);

const server = serve(
  { fetch: app.fetch, port: PORT, hostname: HOST },
  (info) => {
    process.stderr.write(
      `[codex-mcp] HTTP server listening on ${info.address}:${info.port}\n`,
    );
  },
);

async function shutdown(signal: string): Promise<void> {
  process.stderr.write(`[codex-mcp] ${signal} received, closing sessions...\n`);
  const stats = await closeAllSessions();
  process.stderr.write(`[codex-mcp] closed ${stats.closed} sessions, exiting\n`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
