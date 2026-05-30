# Orphan-Trait Findings (FR-6, cycle-025 Sprint 2)

**Date:** 2026-05-30
**Source:** `audit-semantic.py check_orphan_traits` → `audit-semantic.json` (20 orphans, `status: "info"`)
**Disposition:** Investigation only — **no deletions this cycle** (FR-6).

## Headline finding

**15 of the 20 reported "orphans" are actually minted traits** — each assigned to
between 1 and 103 of the 10,000 Miberas via the frontmatter trait field (e.g.
`shirt: Plain Fire`). They surface as orphans only because
`check_orphan_traits` (`audit-semantic.py:217`) counts **markdown-link**
references (`](../traits/…)`) exclusively, while Mibera tables reference most
traits by **plain-text / frontmatter name**, not links. So the orphan metric is
substantially a **link-coverage artifact**, not a true zero-usage signal.

The remaining **5 are genuinely zero-mint**, and all 5 are legitimate catalog or
variant entries — **none are erroneous duplicates**. Recommendation: **keep all
20.** Two are flagged for possible future documentation/consolidation.

> Mint counts below are `grep -ril '<field>: <Name>' miberas/` (the canonical
> trait assignment). "linked refs = 0" for every entry confirms the link-coverage
> artifact is the cause of the orphan flag.

## The 20 orphans

| # | Trait (path under `traits/`) | Mint count | Likely reason for orphan flag | Keep/Prune |
|---|------------------------------|-----------:|-------------------------------|------------|
| 1 | `accessories/face-accessories/heart.md` | **102** | Minted; referenced by name, never linked | **Keep** (false orphan) |
| 2 | `accessories/hats/peyote.md` | **103** | Minted; referenced by name, never linked | **Keep** (false orphan) |
| 3 | `clothing/long-sleeves/henlo-jersey.md` | **91** | Minted; referenced by name, never linked | **Keep** (false orphan) |
| 4 | `clothing/long-sleeves/keith-haring-shirt.md` | **36** | Minted; referenced by name, never linked | **Keep** (false orphan) |
| 5 | `clothing/short-sleeves/90s-tracksuit.md` | **30** | Minted; referenced by name, never linked | **Keep** (false orphan) |
| 6 | `clothing/short-sleeves/palestinians-for-black-power.md` | **79** | Minted; referenced by name, never linked | **Keep** (false orphan) |
| 7 | `clothing/short-sleeves/plain-air.md` | **75** | Minted "plain/element" shirt; name-referenced | **Keep** (false orphan) |
| 8 | `clothing/short-sleeves/plain-earth.md` | **82** | Minted "plain/element" shirt; name-referenced | **Keep** (false orphan) |
| 9 | `clothing/short-sleeves/plain-fire.md` | **74** | Minted "plain/element" shirt; name-referenced | **Keep** (false orphan) |
| 10 | `clothing/short-sleeves/plain-water.md` | **91** | Minted "plain/element" shirt; name-referenced | **Keep** (false orphan) |
| 11 | `clothing/short-sleeves/blue-ribbon-tank.md` | **1** | Minted (rare); name-referenced | **Keep** (false orphan, rare) |
| 12 | `clothing/short-sleeves/cactus-shirt.md` | **1** | Minted (rare); name-referenced | **Keep** (false orphan, rare) |
| 13 | `clothing/short-sleeves/knit-sweater.md` | **1** | Minted (rare); name-referenced | **Keep** (false orphan, rare) |
| 14 | `clothing/short-sleeves/ribbon-lolita.md` | **1** | Minted (rare); name-referenced | **Keep** (false orphan, rare) |
| 15 | `clothing/short-sleeves/tennis-outfit.md` | **1** | Minted (rare); name-referenced | **Keep** (false orphan, rare) |
| 16 | `character-traits/tattoos/no-tattoos.md` | **0** | "Absence" trait — Miberas encode it as `tattoo: null` / "None", so the named entry is never assigned | **Keep** (catalog completeness — represents the null case) |
| 17 | `character-traits/hair/middle-orange.md` | **0** | Genuinely zero-mint hair catalog entry | **Keep** (catalog; flag zero-mint) |
| 18 | `clothing/long-sleeves/baby-bera-jacket.md` | **0** | Genuinely zero-mint shirt catalog entry | **Keep** (catalog; flag zero-mint) |
| 19 | `character-traits/eyes/crying-ocean-2.md` | **0** | Variant stub — base `crying-ocean.md` exists; body reads "Variant 2 — to be documented" (NOTES.md:39, Cycle-002 naming-mismatch stub) | **Keep** (flag: undocumented variant — consolidate or document in a future cycle) |
| 20 | `character-traits/eyes/ecstasy-brown-2.md` | **0** | Variant stub — base `ecstasy-brown.md` exists; "Variant 2 — to be documented" | **Keep** (flag: undocumented variant) |

## Categories

- **False orphans — minted, name-referenced (15):** rows 1–15. Used by real
  Miberas; the link-based check misses them. No action needed on the files.
- **Genuine zero-mint catalog entries (3):** `no-tattoos` (null-case),
  `middle-orange`, `baby-bera-jacket`. Legitimate catalog completeness for a
  generative collection where some defined traits roll onto zero of the 10K.
- **Undocumented variant stubs (2):** `crying-ocean-2`, `ecstasy-brown-2`.
  Placeholders whose base trait exists; candidates for documentation or
  consolidation — **not** deletion this cycle.

## Recommendations (no action taken this cycle)

1. **Keep all 20.** None are erroneous duplicates; 15 are actively minted.
2. **Future enhancement (out of scope):** extend `check_orphan_traits` to also
   count frontmatter/plain-text trait assignments, not just markdown links, so
   the orphan metric stops over-reporting by ~15. This is a measurement fix, not
   a content change.
3. **Future cleanup (out of scope):** document or consolidate the two `-2`
   variant stubs.
4. The `orphan_traits` check **remains `status: "info"`** (`audit-semantic.py:248`)
   — never promoted to FAIL — so this investigation does not turn 20 informational
   orphans into a red build (FR-6 AC, SDD §7.2).
