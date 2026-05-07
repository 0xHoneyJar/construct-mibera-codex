#!/usr/bin/env node
/**
 * check-contracts.mjs
 *
 * Build-time validator for _codex/data/contracts.json. Runs in `pnpm
 * build-indexes` so the build fails before vocs renders if any contract
 * row is malformed.
 *
 * Validates per Flatline SKP-007 (cycle-024 sprint review, severity 740):
 *   - Address shape (regex `^0x[a-fA-F0-9]{40}$`)
 *   - Chain field is present (every row carries chain metadata)
 *   - Duplicate addresses are detected (same address listed twice = error)
 *   - Required name + standard fields are present
 *
 * NOT validated here (intentional, future hardening):
 *   - EIP-55 checksum verification (requires keccak-256; deferred to
 *     cycle-025+ if address-typo bugs surface)
 *   - On-chain liveness (no RPC calls — contracts.json is
 *     trust-the-source-data)
 *
 * Path resolution: __dirname-relative; works whether invoked from
 * docs/ via pnpm or from repo root.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const CONTRACTS_PATH = path.join(ROOT, "_codex", "data", "contracts.json");

console.log(`[check-contracts] resolved repo root: ${ROOT}`);

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

const raw = await readFile(CONTRACTS_PATH, "utf8");
let parsed;
try {
  parsed = JSON.parse(raw);
} catch (err) {
  console.error(`[check-contracts] ✘ invalid JSON in ${CONTRACTS_PATH}`);
  console.error(`  ${err.message}`);
  process.exit(1);
}

if (!Array.isArray(parsed.contracts)) {
  console.error(
    `[check-contracts] ✘ contracts.json missing top-level 'contracts' array`
  );
  process.exit(1);
}

const errors = [];
const seenAddresses = new Map(); // address (lowercase) → first row index

parsed.contracts.forEach((c, idx) => {
  const tag = c.name ? `"${c.name}"` : `row ${idx}`;
  if (!c.name) errors.push(`${tag}: missing required field 'name'`);
  if (!c.address) {
    errors.push(`${tag}: missing required field 'address'`);
  } else {
    if (!ADDRESS_REGEX.test(c.address)) {
      errors.push(`${tag}: address '${c.address}' fails regex ${ADDRESS_REGEX}`);
    }
    const lc = c.address.toLowerCase();
    if (seenAddresses.has(lc)) {
      const firstIdx = seenAddresses.get(lc);
      const firstName = parsed.contracts[firstIdx]?.name ?? `row ${firstIdx}`;
      errors.push(
        `${tag}: duplicate address ${c.address} (also used by "${firstName}")`
      );
    } else {
      seenAddresses.set(lc, idx);
    }
  }
  if (!c.chain) errors.push(`${tag}: missing required field 'chain'`);
  if (!c.standard) errors.push(`${tag}: missing required field 'standard'`);
});

if (errors.length > 0) {
  console.error(`[check-contracts] ✘ ${errors.length} validation error(s):`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}

console.log(
  `[check-contracts] ✔ ${parsed.contracts.length} contracts validated (address shape, chain required, no duplicates)`
);
