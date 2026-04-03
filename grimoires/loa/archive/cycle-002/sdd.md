# SDD: Cycle 002 — Content Gap Remediation

**Version**: 1.0.0
**Date**: 2026-02-15
**Cycle**: 002
**PRD**: `grimoires/loa/prd.md`

---

## 1. Overview

This cycle fixes 6 content gaps identified by Cycle 001's structural audit. No new scripts or infrastructure — purely content file operations (create, rename, delete, edit) followed by validation with existing tooling.

---

## 2. Change Manifest

| ID | Operation | Files | Estimated References |
|----|-----------|-------|---------------------|
| G1 | CREATE | `core-lore/ancestors/traveller.md` | 0 (92 Miberas will resolve) |
| G2 | RENAME | `traits/overlays/molecules/mucana-pruriens.md` → `mucuna-pruriens.md` | ~132 files |
| G3 | RENAME | `traits/overlays/molecules/yohimbine.md` → `yohimbe.md` | ~120 files |
| G4 | DELETE | `traits/overlays/molecules/sakae-naa.md` + redirect refs → `sakae-na.md` | ~164 files |
| G5 | CREATE | `traits/character-traits/eyes/ecstasy-brown-2.md`, `crying-ocean-2.md` | 0 (2 index refs will resolve) |
| G6 | EDIT | 4 special-collections files (add `type` field) | 0 |

**Total estimated file touches**: ~420 (mostly Mibera files with link updates)

---

## 3. Detailed Specifications

### 3.1 G1: Create Traveller Ancestor

**New file**: `core-lore/ancestors/traveller.md`

**Template** (follows `aboriginal.md` pattern):
```yaml
---
name: Traveller
period_ancient: TBD
period_modern: TBD
locations: TBD
---
```

Markdown sections: `# Traveller`, `## Cultural Significance` (with Figures, Events, Fashion subsections), `## Drug Connections` (Modern, Ancient), `## Sources`. All sections populated with `*To be documented*` placeholders.

**Validation**: After creation, 92 Mibera links to `../core-lore/ancestors/traveller.md` must resolve.

### 3.2 G2: Rename mucana-pruriens → mucuna-pruriens

**Steps**:
1. Copy `traits/overlays/molecules/mucana-pruriens.md` → `traits/overlays/molecules/mucuna-pruriens.md`
2. Update YAML `name` field: `Mucana Pruriens` → `Mucuna Pruriens`
3. Update heading: `# Mucana Pruriens` → `# Mucuna Pruriens`
4. Find all files containing `mucana-pruriens` (case-insensitive) and update to `mucuna-pruriens`
5. Delete old `mucana-pruriens.md`
6. Update `_scripts/generate-browse.sh` normalization map if needed

**Reference patterns to search**:
- `mucana-pruriens.md` (link targets)
- `Mucana Pruriens` (display text in links and body)
- `mucana pruriens` (body text references)

### 3.3 G3: Rename yohimbine → yohimbe

**Steps**:
1. Copy `traits/overlays/molecules/yohimbine.md` → `traits/overlays/molecules/yohimbe.md`
2. Update YAML `name` field: `Yohimbine` → `Yohimbe`
3. Update heading: `# Yohimbine` → `# Yohimbe`
4. Find all files containing `yohimbine.md` link targets and update to `yohimbe.md`
5. Delete old `yohimbine.md`
6. **Important**: Keep body text references to "yohimbine" (the alkaloid compound name) unchanged — only rename the file and display name to "Yohimbe" (the plant)
7. Update `_scripts/generate-browse.sh` normalization map if needed

**Reference patterns to search**:
- `yohimbine.md` (link targets — must update)
- `[Yohimbine]` (link display text in Mibera files — must update)
- Body text "yohimbine" in other drug files — leave as-is (it's the correct alkaloid name)

### 3.4 G4: Delete sakae-naa.md (Corrupted Duplicate)

**Steps**:
1. Find all files referencing `sakae-naa.md` or `sakae-naa`
2. Update link targets: `sakae-naa.md` → `sakae-na.md`
3. Update link display text: `Sakae Naa` → `Sakae Na` (where it appears as link text)
4. Delete `traits/overlays/molecules/sakae-naa.md`
5. Update `_scripts/generate-browse.sh` if it has normalization entries for sakae-naa
6. **Caution**: The correct file `sakae-na.md` has `image: milady_thai_sakae naa.PNG` — this image filename is correct and should NOT be changed

**Reference patterns to search**:
- `sakae-naa.md` (link targets — must update)
- `[Sakae Naa]` (link display text — must update)
- Tarot card `five-of-cups.md` references sakae-naa — must update

### 3.5 G5: Create Trait Variant Stubs

**New files** (in `traits/character-traits/eyes/`):

#### ecstasy-brown-2.md
```yaml
---
name: ecstasy brown 2
image: ""
date_added: "2026-02-15"
---
```
Mirror structure of `ecstasy-brown.md`: sections for Visual Properties, Connections, Attribution. Visual Description: `*Variant 2 — to be documented*`.

#### crying-ocean-2.md
```yaml
---
name: crying ocean 2
image: ""
date_added: "2026-02-15"
---
```
Mirror structure of `crying-ocean.md`. Visual Description: `*Variant 2 — to be documented*`.

### 3.6 G6: Add Type Field to Special Collections

| File | Inferred `type` | Rationale |
|------|-----------------|-----------|
| `apdao.md` | DAO | "Berachain DAO incubated by The Honey Jar" |
| `beradoge.md` | NFT | "NFT project on Berachain" |
| `berakin.md` | NFT | Has image files, similar to other NFT collections |
| `gumball.md` | DeFi | "project powering multiple dApps" |

**Edit pattern**: Add `type: "VALUE"` after the `name:` line in YAML frontmatter. Also add `**Type:** VALUE` line in the body after the heading (matching the pattern in `baby-bera.md`).

---

## 4. Script Updates

### 4.1 generate-browse.sh

After renames, the `DRUG_NORMALIZE` map may need cleanup:
- Remove `"mucana pruriens": "mucuna pruriens"` entry (no longer needed after rename)
- Remove `"yohimbine": "yohimbe"` entry (no longer needed after rename)
- Check if sakae-naa removal affects drug grouping

### 4.2 audit-structure.sh / audit-links.sh

No changes needed — these scripts are generic validators.

---

## 5. Validation Strategy

After all changes:
1. `bash _scripts/audit-structure.sh` — target: **0 errors**
2. `bash _scripts/audit-links.sh` — target: **0 broken links**
3. `bash _scripts/generate-browse.sh` — verify clean generation, no warnings
4. Spot-check: manually verify 3-5 affected Mibera files render correctly

---

## 6. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Missed references during rename | Run `audit-links.sh` after each rename operation |
| Sakae Naa vs Sakae Na confusion in Mibera display text | Grep for all variants before and after |
| Browse page regression | Re-generate and diff against previous output |
| Yohimbine body text incorrectly changed | Only replace `yohimbine.md` link targets, not body text mentions of the alkaloid |
