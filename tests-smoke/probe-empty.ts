#!/usr/bin/env tsx
import { searchCodex } from "../src/lookups/search.js";
const terms = process.argv.slice(2);
for (const t of terms) {
  const hits = searchCodex({ intent: t, collection: "grails", limit: 2 });
  if (hits.length === 0) {
    console.log(`✓ "${t}" → empty (refusal works)`);
  } else {
    console.log(`✗ "${t}" → ${hits[0].ref} ${hits[0].name} @ ${hits[0].score}`);
  }
}
