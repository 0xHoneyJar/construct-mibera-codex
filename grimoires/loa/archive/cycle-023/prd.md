# PRD: CDN URL Migration — assets.0xhoneyjar.xyz

**Cycle:** 023
**Created:** 2026-04-29
**Source:** [Issue #54](https://github.com/0xHoneyJar/construct-mibera-codex/issues/54)
**Stakeholder:** soju (zkSoju) — CDN infrastructure owner

---

## Problem

The codex stores ~52K image URLs across ~20K+ files, pointing at 3 different source hosts (S3-direct, Irys gateway, a second S3 bucket). This fragility creates problems for downstream consumers (codex-mcp, MibeStats, freeside-ruggy) who must handle multiple URL patterns and are vulnerable to host-specific outages or migrations.

## Solution

Rewrite all image URLs in-place to use the unified CDN endpoint `assets.0xhoneyjar.xyz`, which is live as of 2026-04-29, backed by CloudFront → same S3 bucket (`thj-assets`). This makes the codex self-consistent and gives consumers a single, stable URL contract.

## URL Census

| Host | Refs | Location | Strategy |
|------|------|----------|----------|
| `thj-assets.s3.us-west-2.amazonaws.com/{path}` | ~40K | miberas/, miparcels/, _codex/ | Literal hostname swap |
| `gateway.irys.xyz/7rpvw…/{hash}.png` | ~10K | miberas/, special-collections, grails | Rewrite to `assets.0xhoneyjar.xyz/reveal_phase8/images/{hash}.png` |
| `mibera.s3.amazonaws.com/{path}` | ~2.6K | traits/, vending-machine/ | **Needs confirmation** — different S3 bucket, may not be behind CDN |
| `raw.githubusercontent.com` | 9 | .claude/ (framework only) | Out of scope |

## Decisions (from issue #54 comment thread)

1. **Literal-flip for v1** — same S3 keys, swap hostname only
2. **In-place rewrite** — codex must be self-consistent; no runtime resolver
3. **Spot-check before bulk rewrite** — verify CDN serves correct bytes

## Open Question

`mibera.s3.amazonaws.com` is a **different bucket** from `thj-assets`. Need to confirm with soju whether `assets.0xhoneyjar.xyz` serves this bucket too, or if these 2.6K refs need separate handling.

## Out of Scope

- Canonical path renames (mibera-3/mibera-rekey cycles)
- `getAssetURL()` helper (codex-mcp concern, issue #53)
- `.claude/` framework files (not codex content)
