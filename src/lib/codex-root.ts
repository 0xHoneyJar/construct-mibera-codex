import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const HERE = dirname(fileURLToPath(import.meta.url));

export function locateCodexRoot(): string {
  const fromEnv = process.env.CODEX_ROOT;
  if (fromEnv && existsSync(fromEnv)) return resolve(fromEnv);

  const candidates = [
    resolve(HERE, "../../"),
    resolve(HERE, "../"),
    resolve(process.cwd()),
  ];
  for (const c of candidates) {
    if (existsSync(resolve(c, "construct.yaml")) && existsSync(resolve(c, "core-lore"))) {
      return c;
    }
  }
  throw new Error(
    `Could not locate codex root. Set CODEX_ROOT env var or run from a directory containing construct.yaml + core-lore/.`,
  );
}

export function codexPath(...segments: string[]): string {
  return resolve(locateCodexRoot(), ...segments);
}
