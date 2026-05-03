#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { handleMcpRequest, closeAllSessions } from "../src/transport.js";
import { codexPath } from "../src/lib/codex-root.js";

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

// Resolve ${ENV_VAR} placeholders at request time so beacon.json stays env-driven
// across deployments without rebuilding the image (per bridgebuilder F1, PR #74).
// BeaconV2Schema declares mcp.remote.endpoint as "Full URL OR template like
// ${MCP_REMOTE_ENDPOINT}" — substitution happens here.
function resolveBeaconPlaceholders(card: unknown): unknown {
  if (typeof card === "string") {
    return card.replace(/\$\{([A-Z0-9_]+)\}/g, (match, name) => {
      const value = process.env[name];
      if (value === undefined || value === "") {
        process.stderr.write(
          `[codex-mcp] WARN: beacon placeholder ${match} unset; serving literal\n`,
        );
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

const app = new Hono();

app.get("/healthz", (c) => c.text("ok"));
app.get("/.well-known/mcp.json", (c) => c.json(MCP_CARD));
app.get("/.well-known/beacon.json", (c) =>
  c.json(resolveBeaconPlaceholders(BEACON_CARD_RAW)),
);

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
