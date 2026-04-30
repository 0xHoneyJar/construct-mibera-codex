import { lookupZone, listZones } from "../src/lookups/zone.js";
import { lookupArchetype, listArchetypes } from "../src/lookups/archetype.js";
import { lookupFactor, getFactorIds } from "../src/lookups/factor.js";
import { lookupGrail } from "../src/lookups/grail.js";
import { lookupMibera } from "../src/lookups/mibera.js";
import { validateWorldElement } from "../src/validate.js";

console.log("=== list_zones ===");
console.log(JSON.stringify(listZones(), null, 2));

console.log("\n=== lookup_zone(stonehenge) ===");
const z = lookupZone("stonehenge");
console.log(JSON.stringify({
  name: z?.name,
  archetype: z?.archetype,
  emoji: z?.emoji,
  essence: z?.essence,
  era: z?.era_resonance,
  has_lynch: !!z?.lynch_primitives,
  has_kansei: !!z?.kansei_tokens,
  lynch_keys: z?.lynch_primitives ? Object.keys(z.lynch_primitives) : [],
}, null, 2));

console.log("\n=== list_archetypes ===");
console.log(JSON.stringify(listArchetypes(), null, 2));

console.log("\n=== lookup_archetype(Freetekno) ===");
const a = lookupArchetype("Freetekno");
console.log(JSON.stringify({
  name: a?.name,
  era: a?.era,
  zodiac: a?.zodiac_signs,
  season: a?.season,
  locations_count: a?.locations.length,
  figures_count: a?.figures.length,
  events_count: a?.events.length,
  drugs: a?.drugs,
  ancestor_count: a?.ancestor_connections.length,
}, null, 2));

console.log("\n=== getFactorIds (count + sample) ===");
const fids = getFactorIds();
console.log("count:", fids.length, "sample:", fids.slice(0, 5));

console.log("\n=== lookup_factor(nft:mibera) ===");
const f = lookupFactor("nft:mibera");
console.log(JSON.stringify(f, null, 2));

console.log("\n=== lookup_factor(nft:mibera_quality) ===");
const fh = lookupFactor("nft:mibera_quality");
console.log(JSON.stringify({ id: fh?.factor_id, status: fh?.status, archetype: fh?.archetype }, null, 2));

console.log("\n=== lookup_grail(buddhist) ===");
console.log(JSON.stringify(lookupGrail("buddhist"), null, 2));

console.log("\n=== lookup_mibera(1) ===");
const m = lookupMibera(1);
console.log(JSON.stringify({
  id: m?.id,
  archetype: m?.archetype,
  ancestor: m?.ancestor,
  drug: m?.drug,
  swag: m?.swag_rank,
}, null, 2));

console.log("\n=== validate_world_element ===");
console.log("zone(bear-cave):", JSON.stringify(validateWorldElement("zone", "bear-cave")));
console.log("zone(bearcave):", JSON.stringify(validateWorldElement("zone", "bearcave")));
console.log("archetype(Freetekno):", JSON.stringify(validateWorldElement("archetype", "Freetekno")));
console.log("archetype(Freetech):", JSON.stringify(validateWorldElement("archetype", "Freetech")));
console.log("archetype(Atlantis):", JSON.stringify(validateWorldElement("archetype", "Atlantis")));
console.log("factor(nft:mibera):", JSON.stringify(validateWorldElement("factor", "nft:mibera")));
console.log("mibera(1):", JSON.stringify(validateWorldElement("mibera", "1")));
console.log("mibera(99999):", JSON.stringify(validateWorldElement("mibera", "99999")));

console.log("\n=== smoke test passed ===");
