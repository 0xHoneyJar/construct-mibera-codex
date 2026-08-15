import { suggestClosest } from "./lib/levenshtein.js";
import { logCoverageGap } from "./coverage-gaps.js";
import { getZoneSlugs, getZoneNames } from "./lookups/zone.js";
import { getArchetypeNames } from "./lookups/archetype.js";
import { getFactorIds } from "./lookups/factor.js";
import { getGrailNames } from "./lookups/grail.js";
import { getMiberaIds } from "./lookups/mibera.js";
import { getMstCollection } from "./lookups/mst.js";
import type { ValidateResult, WorldElementType } from "./types.js";

const FUZZY_THRESHOLD: Record<WorldElementType, number> = {
  zone: 3,
  archetype: 3,
  factor: 4,
  grail: 4,
  mibera: 0,
  mst: 0,
  shadow: 0,
};

export function validateWorldElement(
  type: WorldElementType,
  value: string,
  consumerHint?: string,
): ValidateResult {
  const trimmed = value.trim();

  switch (type) {
    case "zone": {
      const canonical = getZoneSlugs().concat(getZoneNames());
      return decide(type, trimmed, canonical, consumerHint);
    }
    case "archetype": {
      return decide(type, trimmed, getArchetypeNames(), consumerHint);
    }
    case "factor": {
      return decide(type, trimmed, getFactorIds(), consumerHint);
    }
    case "grail": {
      return decide(type, trimmed, getGrailNames(), consumerHint);
    }
    case "mibera": {
      const id = Number(trimmed);
      if (Number.isInteger(id) && getMiberaIds().includes(id)) {
        return { canonical: true, type };
      }
      logCoverageGap(type, trimmed, null, null, consumerHint);
      return { canonical: false, type };
    }
    case "mst":
    case "shadow": {
      // MST tokens are user-minted via trait-string keccak256 hashing — no
      // curated id list. Treat in-range numeric tokenIds as canonical
      // (heuristic; for definitive existence call on-chain tokenURI).
      // Shadow ≡ MST alias per _codex/data/shadow-traits.md.
      const stripped = trimmed.startsWith("@mst")
        ? trimmed.slice(4)
        : trimmed.startsWith("@shadow")
          ? trimmed.slice(7)
          : trimmed;
      const id = Number(stripped);
      const c = getMstCollection();
      if (Number.isInteger(id) && id >= 1 && id <= c.totalSupplyKnown) {
        return { canonical: true, type };
      }
      logCoverageGap(type, trimmed, null, null, consumerHint);
      return { canonical: false, type };
    }
  }
}

function decide(
  type: WorldElementType,
  value: string,
  candidates: readonly string[],
  consumerHint?: string,
): ValidateResult {
  const exactHit = candidates.find(
    (c) => c.toLowerCase() === value.toLowerCase(),
  );
  if (exactHit) return { canonical: true, type };

  const threshold = FUZZY_THRESHOLD[type];
  const suggestion = suggestClosest(value, candidates, threshold);

  if (suggestion) {
    logCoverageGap(type, value, suggestion.match, suggestion.distance, consumerHint);
    return {
      canonical: false,
      suggested: suggestion.match,
      distance: suggestion.distance,
      type,
    };
  }

  logCoverageGap(type, value, null, null, consumerHint);
  return { canonical: false, type };
}
