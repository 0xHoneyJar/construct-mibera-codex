import { appendFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { codexPath } from "./lib/codex-root.js";
import type { CoverageGap, WorldElementType } from "./types.js";

const DEFAULT_LOG = "grimoires/codex-mcp/coverage-gaps.jsonl";

function logPath(): string {
  return process.env.COVERAGE_GAP_LOG ?? codexPath(DEFAULT_LOG);
}

function ensureDir(path: string): void {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

export function logCoverageGap(
  type: WorldElementType,
  value: string,
  suggested: string | null,
  distance: number | null,
  consumerHint?: string,
): void {
  const entry: CoverageGap = {
    ts: new Date().toISOString(),
    type,
    value,
    suggested,
    distance,
    consumer_hint: consumerHint,
  };
  try {
    const path = logPath();
    ensureDir(path);
    appendFileSync(path, JSON.stringify(entry) + "\n", "utf8");
  } catch (err) {
    process.stderr.write(
      `[codex-mcp] coverage-gap log write failed: ${(err as Error).message}\n`,
    );
  }
}
