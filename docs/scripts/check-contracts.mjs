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
 *   - FracturedMibera current phases are complete, unique, and cannot resolve
 *     to a superseded zero-Transfer deployment
 *   - FracturedMibera lineage carries explicit superseded_by relationships
 *     and verification provenance
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
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const CONTRACTS_PATH = path.join(ROOT, "_codex", "data", "contracts.json");

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

function lower(address) {
  return typeof address === "string" ? address.toLowerCase() : address;
}

function validateFracturedMibera(fractures, errors) {
  const tag = '"FracturedMibera"';

  if (fractures.status !== "active") {
    errors.push(`${tag}: status must be 'active'`);
  }
  if (fractures.registry_status !== "verified_current") {
    errors.push(`${tag}: registry_status must be 'verified_current'`);
  }

  const provenance = fractures.provenance;
  for (const field of [
    "source_repository",
    "source_issue",
    "verified_at",
    "consumer_rule",
  ]) {
    if (!provenance?.[field]) {
      errors.push(`${tag}: provenance.${field} is required`);
    }
  }
  if (
    !Array.isArray(provenance?.verification_basis) ||
    provenance.verification_basis.length === 0
  ) {
    errors.push(`${tag}: provenance.verification_basis must be non-empty`);
  }

  if (!Array.isArray(fractures.phases)) {
    errors.push(`${tag}: phases must be an array`);
    return;
  }

  const phaseNumbers = fractures.phases.map((phase) => phase.phase);
  const expectedPhaseNumbers = Array.from({ length: 10 }, (_, idx) => idx + 1);
  if (
    phaseNumbers.length !== expectedPhaseNumbers.length ||
    !phaseNumbers.every((phase, idx) => phase === expectedPhaseNumbers[idx])
  ) {
    errors.push(`${tag}: phases must be ordered exactly 1 through 10`);
  }

  const activeAddresses = [];
  const seenActiveAddresses = new Set();
  for (const phase of fractures.phases) {
    const phaseTag = `${tag} phase ${phase.phase ?? "unknown"}`;
    if (phase.status !== "active") {
      errors.push(`${phaseTag}: status must be 'active'`);
    }
    if (!ADDRESS_REGEX.test(phase.current_address ?? "")) {
      errors.push(`${phaseTag}: current_address is missing or malformed`);
      continue;
    }
    const address = lower(phase.current_address);
    if (seenActiveAddresses.has(address)) {
      errors.push(`${phaseTag}: duplicate current_address ${phase.current_address}`);
    }
    seenActiveAddresses.add(address);
    activeAddresses.push(address);
  }

  if (!Array.isArray(fractures.all_addresses)) {
    errors.push(`${tag}: all_addresses must be an array`);
  } else {
    const allAddresses = fractures.all_addresses.map(lower);
    if (
      allAddresses.length !== activeAddresses.length ||
      !allAddresses.every((address, idx) => address === activeAddresses[idx])
    ) {
      errors.push(
        `${tag}: all_addresses must exactly match phases[*].current_address in phase order`
      );
    }
  }

  if (lower(fractures.address) !== activeAddresses[0]) {
    errors.push(`${tag}: address must equal the current phase 1 address`);
  }

  if (!Array.isArray(fractures.deployment_history)) {
    errors.push(`${tag}: deployment_history must be an array`);
    return;
  }

  const historyByPhase = new Map();
  const supersededAddresses = new Set();
  for (const record of fractures.deployment_history) {
    const historyTag = `${tag} deployment_history phase ${record.phase ?? "unknown"}`;
    if (record.status !== "superseded") {
      errors.push(`${historyTag}: status must be 'superseded'`);
    }
    if (record.transfer_log_count !== 0) {
      errors.push(`${historyTag}: transfer_log_count must be 0`);
    }
    if (!ADDRESS_REGEX.test(record.address ?? "")) {
      errors.push(`${historyTag}: address is missing or malformed`);
      continue;
    }
    if (!ADDRESS_REGEX.test(record.superseded_by ?? "")) {
      errors.push(`${historyTag}: superseded_by is missing or malformed`);
      continue;
    }

    const historicalAddress = lower(record.address);
    const supersededBy = lower(record.superseded_by);
    if (supersededAddresses.has(historicalAddress)) {
      errors.push(`${historyTag}: duplicate historical address ${record.address}`);
    }
    supersededAddresses.add(historicalAddress);

    if (seenActiveAddresses.has(historicalAddress)) {
      errors.push(
        `${historyTag}: superseded address ${record.address} cannot be selected as current`
      );
    }

    const currentPhase = fractures.phases.find(
      (phase) => phase.phase === record.phase
    );
    if (!currentPhase) {
      errors.push(`${historyTag}: no matching current phase`);
    } else if (lower(currentPhase.current_address) !== supersededBy) {
      errors.push(
        `${historyTag}: superseded_by must equal phase ${record.phase} current_address`
      );
    }

    historyByPhase.set(
      record.phase,
      (historyByPhase.get(record.phase) ?? 0) + 1
    );
  }

  for (const phase of expectedPhaseNumbers) {
    const expectedHistoryCount = phase === 2 ? 0 : 1;
    const actualHistoryCount = historyByPhase.get(phase) ?? 0;
    if (actualHistoryCount !== expectedHistoryCount) {
      errors.push(
        `${tag}: phase ${phase} must have ${expectedHistoryCount} superseded history record(s), found ${actualHistoryCount}`
      );
    }
  }
}

export function validateContractRegistry(parsed) {
  const errors = [];
  if (!Array.isArray(parsed?.contracts)) {
    return [`contracts.json missing top-level 'contracts' array`];
  }

  const seenAddresses = new Map(); // address (lowercase) → first row index

  parsed.contracts.forEach((contract, idx) => {
    const tag = contract.name ? `"${contract.name}"` : `row ${idx}`;
    if (!contract.name) errors.push(`${tag}: missing required field 'name'`);
    if (!contract.address) {
      errors.push(`${tag}: missing required field 'address'`);
    } else {
      if (!ADDRESS_REGEX.test(contract.address)) {
        errors.push(
          `${tag}: address '${contract.address}' fails regex ${ADDRESS_REGEX}`
        );
      }
      const address = lower(contract.address);
      if (seenAddresses.has(address)) {
        const firstIdx = seenAddresses.get(address);
        const firstName =
          parsed.contracts[firstIdx]?.name ?? `row ${firstIdx}`;
        errors.push(
          `${tag}: duplicate address ${contract.address} (also used by "${firstName}")`
        );
      } else {
        seenAddresses.set(address, idx);
      }
    }
    if (!contract.chain) errors.push(`${tag}: missing required field 'chain'`);
    if (!contract.standard) {
      errors.push(`${tag}: missing required field 'standard'`);
    }
  });

  const fractureRows = parsed.contracts.filter(
    (contract) => contract.name === "FracturedMibera"
  );
  if (fractureRows.length !== 1) {
    errors.push(
      `contracts.json must contain exactly one FracturedMibera row, found ${fractureRows.length}`
    );
  } else {
    validateFracturedMibera(fractureRows[0], errors);
  }

  return errors;
}

async function main() {
  console.log(`[check-contracts] resolved repo root: ${ROOT}`);
  const raw = await readFile(CONTRACTS_PATH, "utf8");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error(`[check-contracts] ✘ invalid JSON in ${CONTRACTS_PATH}`);
    console.error(`  ${err.message}`);
    process.exitCode = 1;
    return;
  }

  const errors = validateContractRegistry(parsed);
  if (errors.length > 0) {
    console.error(`[check-contracts] ✘ ${errors.length} validation error(s):`);
    for (const error of errors) console.error(`  ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log(
    `[check-contracts] ✔ ${parsed.contracts.length} contracts validated (address shape, chain required, no duplicates, FracturedMibera active-lineage invariants)`
  );
}

const invokedPath = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : null;
if (invokedPath === import.meta.url) {
  await main();
}
