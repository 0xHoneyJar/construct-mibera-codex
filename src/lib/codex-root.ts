import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

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
