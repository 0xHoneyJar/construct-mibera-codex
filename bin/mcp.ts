#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createCodexMcpServer } from "../src/server.js";

async function main(): Promise<void> {
  const server = createCodexMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write("[codex-mcp] stdio server ready\n");
}

main().catch((err) => {
  process.stderr.write(`[codex-mcp] fatal: ${err.stack ?? err.message ?? err}\n`);
  process.exit(1);
});
