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

const app = new Hono();

app.get("/healthz", (c) => c.text("ok"));
app.get("/.well-known/mcp.json", (c) => c.json(MCP_CARD));

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
