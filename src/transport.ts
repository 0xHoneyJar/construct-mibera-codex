import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Context } from "hono";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { createCodexMcpServer } from "./server.js";

const SESSION_TTL_MS = 30 * 60 * 1000;
const IDLE_TTL_MS = 5 * 60 * 1000;
const MAX_SESSIONS = 16;

// Sentinel header recognized by @hono/node-server: tells the adapter the
// underlying Node response has already been written by a lower layer (the
// MCP SDK's Streamable HTTP transport, in our case). Without it, the
// adapter tries to writeHead() a second time and crashes the response
// with ERR_HTTP_HEADERS_SENT.
const ALREADY_SENT = new Response(null, {
  status: 200,
  headers: { "x-hono-already-sent": "1" },
});

interface SessionEntry {
  transport: StreamableHTTPServerTransport;
  createdAt: number;
  lastActiveAt: number;
}

const sessions = new Map<string, SessionEntry>();

const gcTimer: NodeJS.Timeout = setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of sessions) {
    const idle = now - entry.lastActiveAt > IDLE_TTL_MS;
    const expired = now - entry.createdAt > SESSION_TTL_MS;
    if (idle || expired) {
      entry.transport.close().catch(() => {});
      sessions.delete(id);
      process.stderr.write(
        `[micodex-mcp] session ${id} closed (${expired ? "expired" : "idle"})\n`,
      );
    }
  }
}, 60_000);
gcTimer.unref();

export interface ShutdownStats {
  closed: number;
}

export async function closeAllSessions(): Promise<ShutdownStats> {
  const ids = [...sessions.keys()];
  await Promise.all(
    ids.map(async (id) => {
      const entry = sessions.get(id);
      if (!entry) return;
      try {
        await entry.transport.close();
      } catch {
        /* ignore */
      }
      sessions.delete(id);
    }),
  );
  clearInterval(gcTimer);
  return { closed: ids.length };
}

export function _resetSessions(): void {
  sessions.clear();
}

export async function handleMcpRequest(c: Context): Promise<Response> {
  const env = c.env as { incoming?: IncomingMessage; outgoing?: ServerResponse };
  const req = env.incoming;
  const res = env.outgoing;
  if (!req || !res) {
    return c.json(
      { jsonrpc: "2.0", error: { code: -32603, message: "transport unavailable" } },
      500,
    );
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    body = undefined;
  }

  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  let entry: SessionEntry | undefined = sessionId ? sessions.get(sessionId) : undefined;

  if (!entry && isInitializeRequest(body as never)) {
    if (sessions.size >= MAX_SESSIONS) {
      const oldest = [...sessions.entries()].sort(
        (a, b) => a[1].lastActiveAt - b[1].lastActiveAt,
      )[0];
      if (oldest) {
        oldest[1].transport.close().catch(() => {});
        sessions.delete(oldest[0]);
      }
    }
    const newId = randomUUID();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => newId,
      onsessioninitialized: (id) => {
        process.stderr.write(`[micodex-mcp] session ${id} initialized\n`);
      },
    });
    transport.onclose = () => {
      sessions.delete(newId);
    };
    const server = createCodexMcpServer();
    await server.connect(transport);
    entry = { transport, createdAt: Date.now(), lastActiveAt: Date.now() };
    sessions.set(newId, entry);
  } else if (!entry) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32000, message: "No session: send initialize first" },
      }),
    );
    return ALREADY_SENT;
  }

  entry.lastActiveAt = Date.now();
  await entry.transport.handleRequest(req, res, body);
  return ALREADY_SENT;
}

export const _internals = {
  sessions,
  MAX_SESSIONS,
  IDLE_TTL_MS,
  SESSION_TTL_MS,
};
