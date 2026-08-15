/**
 * MST (Mibera Shadow Traits) lookup.
 *
 * MST is fundamentally different from canon Mibera: each token is dynamically
 * minted by users submitting a trait string that's hashed keccak256 on-chain
 * (see `_codex/data/shadow-traits.md`). There's no per-token curated record.
 * Instead, the codex publishes COLLECTION-level metadata + URL templates;
 * `lookupMst(tokenId)` enriches a tokenId with composed URLs (sovereign
 * metadata + per-expression sticker URLs).
 *
 * Companion to URL_CONTRACT v1.2.0 (freeside-storage#6) which formally
 * registers the sticker substrate paths under `Mibera/MST/expressions/...`.
 *
 * Substrate state at v1.4.x:
 *   - Sovereign metadata: LIVE (mst-sovereign-cutover · 2026-05-01)
 *   - Sticker substrate: PENDING M-1 (S3 bucket policy) + M-2 (gen pipeline)
 *     · per-token sticker URLs return 403 until those land
 *
 * Agents reading this map: call `lookupMst(tokenId)` to get the enriched
 * envelope. The `stickers.urls` field is the lookup table you want.
 */

import { readFileSync } from "node:fs";
import { codexPath } from "../lib/codex-root.js";
import type { MstCollection, MstEntry } from "../types.js";

const MST_COLLECTION_JSON = "_codex/data/mst-collection.json";

let cache: MstCollection | null = null;

function loadCollection(): MstCollection {
  if (cache) return cache;
  const raw = readFileSync(codexPath(MST_COLLECTION_JSON), "utf8");
  const parsed = JSON.parse(raw) as MstCollection;
  cache = parsed;
  return cache;
}

/**
 * Compose the per-token sticker URL for a single expression.
 * Substitutes `{version}` / `{tokenId}` / `{variant}` / `{expr}` into the
 * collection's `perTokenBaseUrlTemplate`.
 */
function composeStickerUrl(
  template: string,
  version: string,
  tokenId: number,
  variant: string,
  expression: string,
): string {
  return template
    .replace("{version}", version)
    .replace("{tokenId}", String(tokenId))
    .replace("{variant}", variant)
    .replace("{expr}", expression);
}

/**
 * Look up an MST token by tokenId — enriches with sovereign metadata URL
 * and per-expression sticker URLs (composed at call time from collection
 * template + the requested tokenId).
 *
 * Returns `null` for tokenIds outside the known supply range. Note that
 * "in range" doesn't guarantee the token was actually minted — MST is
 * sequentially minted by users, so the in-range check is a heuristic.
 * Use the on-chain `tokenURI` call for definitive existence; this lookup
 * is for URL composition.
 */
export function lookupMst(tokenId: number): MstEntry | null {
  if (!Number.isInteger(tokenId) || tokenId < 1) return null;

  const c = loadCollection();
  if (tokenId > c.totalSupplyKnown) return null;

  const sovereignUrl = c.metadata.sovereignTokenURITemplate.replace(
    "{tokenId}",
    String(tokenId),
  );

  const urls: Record<string, string> = {};
  for (const expr of c.stickers.expressionsAvailable) {
    urls[expr] = composeStickerUrl(
      c.stickers.perTokenBaseUrlTemplate,
      c.stickers.version,
      tokenId,
      c.stickers.defaultVariant,
      expr,
    );
  }

  return {
    type: "mst",
    ref: `@mst${tokenId}`,
    tokenId,
    collection: {
      contract: c.contract,
      chain: c.chain,
      standard: c.standard,
      name: c.name,
      symbol: c.tokenSymbol,
    },
    metadata: {
      sovereignUrl,
    },
    stickers: {
      manifestUrl: c.stickers.manifestUrl,
      version: c.stickers.version,
      expressionsAvailable: c.stickers.expressionsAvailable,
      variants: c.stickers.variants,
      defaultVariant: c.stickers.defaultVariant,
      urls,
      substrateStatus: c.stickers.substrateStatus,
      ...(c.stickers.substrateNotes && {
        substrateNotes: c.stickers.substrateNotes,
      }),
    },
  };
}

/**
 * Return the MST collection-level metadata (without per-token enrichment).
 * Useful for `list` / `validate` operations and for consumers who just need
 * the substrate config (manifest URL, expression catalog, version).
 */
export function getMstCollection(): MstCollection {
  return loadCollection();
}

/** Reset the cache — exposed for tests + integration scripts. */
export function resetMstCache(): void {
  cache = null;
}

/**
 * `lookupShadow` — alias for `lookupMst`. Per `_codex/data/shadow-traits.md`
 * MST = "Mibera Shadow Traits"; "Shadow" is the narrative name, MST is the
 * technical contract symbol. URL_CONTRACT v1.2.0 registers BOTH path
 * conventions (`Mibera/Shadow/expressions/*` and `Mibera/MST/expressions/*`)
 * for transitional consumer compat; this alias mirrors that on the lookup
 * side so agents querying either name resolve to the same enriched envelope.
 *
 * Returned `type` stays `"mst"` (technical truth) but `ref` uses the
 * `@shadow<N>` form to preserve the input vocabulary in the response.
 */
export function lookupShadow(tokenId: number): MstEntry | null {
  const entry = lookupMst(tokenId);
  if (!entry) return null;
  return { ...entry, ref: `@shadow${tokenId}` };
}
