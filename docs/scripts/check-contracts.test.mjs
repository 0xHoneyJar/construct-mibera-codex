import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { validateContractRegistry } from "./check-contracts.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contractsPath = path.resolve(
  __dirname,
  "..",
  "..",
  "_codex",
  "data",
  "contracts.json"
);
const registry = JSON.parse(await readFile(contractsPath, "utf8"));
const fractureFiles = [
  "miparcels.md",
  "miladies.md",
  "mireveal-1.1.md",
  "mireveal-2.2.md",
  "mireveal-3.3.md",
  "mireveal-4.20.md",
  "mireveal-5.5.md",
  "mireveal-6.9.md",
  "mireveal-7.7.md",
  "mireveal-8.8.md",
];

function cloneRegistry() {
  return structuredClone(registry);
}

function fracturedMibera(candidate) {
  return candidate.contracts.find(
    (contract) => contract.name === "FracturedMibera"
  );
}

test("accepts the verified current FracturedMibera registry", () => {
  assert.deepEqual(validateContractRegistry(cloneRegistry()), []);
});

test("phase documents select only verified current registry addresses", async () => {
  const documentedAddresses = await Promise.all(
    fractureFiles.map(async (file) => {
      const body = await readFile(
        path.resolve(__dirname, "..", "..", "fractures", file),
        "utf8"
      );
      const address = body.match(/^contract: "([^"]+)"$/m)?.[1];
      assert.ok(address, `${file} must declare a contract`);
      return address.toLowerCase();
    })
  );
  const currentAddresses = fracturedMibera(registry).phases.map((phase) =>
    phase.current_address.toLowerCase()
  );

  assert.deepEqual(documentedAddresses, currentAddresses);
});

test("rejects a superseded zero-Transfer deployment selected as current", () => {
  const candidate = cloneRegistry();
  const fractures = fracturedMibera(candidate);
  const superseded = fractures.deployment_history[0].address;

  fractures.address = superseded;
  fractures.all_addresses[0] = superseded;
  fractures.phases[0].current_address = superseded;

  const errors = validateContractRegistry(candidate);
  assert.ok(
    errors.some((error) =>
      error.includes("superseded address") && error.includes("cannot be selected")
    ),
    errors.join("\n")
  );
});

test("rejects lineage whose superseded_by does not resolve to current", () => {
  const candidate = cloneRegistry();
  const fractures = fracturedMibera(candidate);
  fractures.deployment_history[0].superseded_by =
    fractures.phases[2].current_address;

  const errors = validateContractRegistry(candidate);
  assert.ok(
    errors.some((error) =>
      error.includes("superseded_by must equal phase 1 current_address")
    ),
    errors.join("\n")
  );
});

test("rejects a registry without verification provenance", () => {
  const candidate = cloneRegistry();
  delete fracturedMibera(candidate).provenance.source_issue;

  const errors = validateContractRegistry(candidate);
  assert.ok(
    errors.includes('"FracturedMibera": provenance.source_issue is required'),
    errors.join("\n")
  );
});
