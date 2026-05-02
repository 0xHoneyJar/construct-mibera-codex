import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync } from "node:fs";

const HERE = dirname(fileURLToPath(import.meta.url));

function walkUpForRoot(start: string): string | null {
  let dir = resolve(start);
  while (true) {
    if (
      existsSync(resolve(dir, "construct.yaml")) &&
      existsSync(resolve(dir, "core-lore"))
    ) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

export function locateCodexRoot(): string {
  const fromEnv = process.env.CODEX_ROOT;
  if (fromEnv && existsSync(fromEnv)) return resolve(fromEnv);

  const fromHere = walkUpForRoot(HERE);
  if (fromHere) return fromHere;

  const fromCwd = walkUpForRoot(process.cwd());
  if (fromCwd) return fromCwd;

  throw new Error(
    `Could not locate codex root. Set CODEX_ROOT env var or run from a directory containing construct.yaml + core-lore/.`,
  );
}

export function codexPath(...segments: string[]): string {
  return resolve(locateCodexRoot(), ...segments);
}

/**
 * Read the package version from package.json.
 *
 * Walks up from this module's directory looking for package.json. Handles
 * production (`dist/src/lib/codex-root.js` → repo-root/package.json), dev via
 * tsx (`src/lib/codex-root.ts` → repo-root/package.json), and consumer install
 * (`node_modules/<pkg>/dist/src/lib/codex-root.js` → <pkg>/package.json).
 *
 * Single source of truth for both bin/codex.ts and src/server.ts (CLI/MCP
 * parity invariant; see ~/vault/wiki/concepts/construct-surface-decision-tree.md
 * §6.2 — version drift between transports breaks the parallel-verbs contract).
 */
export function readPackageVersion(): string {
  let dir = HERE;
  for (let i = 0; i < 6; i++) {
    try {
      const pkg = JSON.parse(
        readFileSync(join(dir, "package.json"), "utf8"),
      ) as { version?: string };
      if (pkg.version) return pkg.version;
    } catch {
      // not here; walk up
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return "unknown";
}
