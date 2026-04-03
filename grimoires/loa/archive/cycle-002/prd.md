# PRD: Cycle 002 — Content Gap Remediation

**Version**: 1.0.0
**Date**: 2026-02-15
**Cycle**: 002
**Status**: Draft

---

## 1. Problem Statement

Cycle 001's structural audit identified 6 content gaps across the Mibera Codex: missing files, filename mismatches, corrupted data, and incomplete frontmatter. These gaps cause 106 broken links (out of 239,140 total) and 7 structural validation errors. While the codex is 99.96% healthy, these remaining issues affect agent navigation, link integrity, and data consistency.

> Sources: `grimoires/loa/NOTES.md` blockers section, `_scripts/reports/audit-structure.json`, `_scripts/reports/audit-links.json`

---

## 2. Goals & Success Metrics

| Goal | Metric | Target |
|------|--------|--------|
| Zero broken links | `audit-links.sh` broken count | 0 |
| Zero structural errors | `audit-structure.sh` error count | 0 |
| All content types pass validation | Per-type error count | 0 per type |
| No regressions | New broken links introduced | 0 |

---

## 3. Scope

### In Scope

| ID | Gap | Action | Files Affected |
|----|-----|--------|----------------|
| G1 | Missing Traveller ancestor | Create minimal stub `core-lore/ancestors/traveller.md` | 1 new + 0 edits (92 Mibera links resolve) |
| G2 | Drug filename: mucana → mucuna | Rename `mucana-pruriens.md` → `mucuna-pruriens.md`, update all internal links | 1 rename + N link updates |
| G3 | Drug filename: yohimbine → yohimbe | Rename `yohimbine.md` → `yohimbe.md`, update all internal links | 1 rename + N link updates |
| G4 | Duplicate sakae-naa.md | Delete corrupted `sakae-naa.md`, update any references to point to `sakae-na.md` | 1 delete + N link updates |
| G5 | Missing trait variant stubs | Create `ecstasy-brown-2.md` and `crying-ocean-2.md` matching sibling structure | 2 new files |
| G6 | Special collections missing `type` | Add `type` field to `apdao.md`, `beradoge.md`, `berakin.md`, `gumball.md` | 4 edits |

### Out of Scope

- Creating full lore content for Traveller ancestor (stub only)
- Fixing the `hiberanation` typo in mask filename (separate concern, not a broken link)
- PROCESS.md framework references (confirmed valid — false positive from Cycle 001)
- Content enrichment or new features
- Any commits or pushes (local-only)

---

## 4. User Personas

Same as Cycle 001:
- **Community Member**: Browses codex in GitHub/Gitbook/Obsidian
- **AI Agent**: Navigates codex programmatically for identity synthesis or collection queries
- **Maintainer**: Runs validation scripts, maintains structural integrity

---

## 5. Functional Requirements

### FR1: Create Traveller Ancestor Stub (P0)
- Create `core-lore/ancestors/traveller.md` with YAML frontmatter (`name`, `period_ancient`, `period_modern`, `locations`)
- Include standard markdown sections (Cultural Significance, Drug Connections, Sources) with placeholder content
- Follow exact pattern of existing ancestor files (e.g., `aboriginal.md`, `greek.md`)
- **Acceptance**: 92 Mibera links to `traveller.md` resolve; `audit-links.sh` count drops by 92

### FR2: Rename Drug Files & Update Links (P0)
- Rename `traits/overlays/molecules/mucana-pruriens.md` → `traits/overlays/molecules/mucuna-pruriens.md`
- Rename `traits/overlays/molecules/yohimbine.md` → `traits/overlays/molecules/yohimbe.md`
- Update YAML `name` field inside each renamed file if needed
- Find and update ALL internal links pointing to old filenames across the entire codex
- **Acceptance**: `audit-links.sh` shows 0 broken links to these drug files; `generate-browse.sh` runs clean

### FR3: Remove Duplicate sakae-naa.md (P0)
- Delete `traits/overlays/molecules/sakae-naa.md` (corrupted duplicate of `sakae-na.md`)
- Find and update any references to `sakae-naa.md` to point to `sakae-na.md`
- **Acceptance**: No broken links to `sakae-naa.md`; `audit-structure.sh` error count drops by 1

### FR4: Create Trait Variant Stubs (P1)
- Create `ecstasy-brown-2.md` in the appropriate traits directory (same as `ecstasy-brown.md`)
- Create `crying-ocean-2.md` in the appropriate traits directory (same as `crying-ocean.md`)
- Mirror YAML frontmatter structure of the `-1` variant, adjusting name to include "2"
- **Acceptance**: Index references to these files resolve; `audit-links.sh` count drops by 2

### FR5: Add Type Field to Special Collections (P1)
- Add `type` field to YAML frontmatter of: `apdao.md`, `beradoge.md`, `berakin.md`, `gumball.md`
- Infer `type` values from existing file content:
  - `apdao.md` → determine from description
  - `beradoge.md` → "NFT" (described as NFT project)
  - `berakin.md` → determine from description
  - `gumball.md` → determine from description
- **Acceptance**: `audit-structure.sh` error count drops by 4; all special collections have `type` field

### FR6: Final Validation (P0)
- Run `audit-structure.sh` — target: 0 errors
- Run `audit-links.sh` — target: 0 broken links
- Run `generate-browse.sh` — verify no regressions in generated pages
- Update `grimoires/loa/NOTES.md` to clear resolved blockers

---

## 6. Technical Approach

- All file renames must update every referencing file across the codex (use grep to find all references)
- Drug file renames may affect `generate-browse.sh` normalization map — verify and update if needed
- Trait stubs should be minimal but schema-compliant (pass `audit-structure.sh`)
- Special collection `type` values should be inferred from file body content, not guessed
- Validation scripts from Cycle 001 are the acceptance gate

---

## 7. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Drug rename breaks browse pages | Medium | Medium | Re-run `generate-browse.sh` after rename, verify output |
| Traveller stub missing critical fields | Low | Low | Follow exact pattern of existing ancestors |
| sakae-naa deletion leaves orphan references | Medium | Low | Grep entire codex for references before deleting |
| Unknown references to old drug filenames | Medium | Medium | Run `audit-links.sh` after each rename to catch stragglers |
