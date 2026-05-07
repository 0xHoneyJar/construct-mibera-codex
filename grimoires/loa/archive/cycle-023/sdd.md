# SDD: CDN URL Migration — assets.0xhoneyjar.xyz

**Cycle:** 023
**Created:** 2026-04-29

---

## Approach

Python migration script (`_codex/scripts/migrate-cdn-urls.py`) that rewrites URLs in-place across all codex files. Three rewrite rules applied sequentially:

### Rewrite Rules

| Pattern | Replacement | Files affected |
|---------|-------------|----------------|
| `thj-assets.s3.us-west-2.amazonaws.com/{path}` | `assets.0xhoneyjar.xyz/{path}` | .md, .json, .jsonl, .py |
| `gateway.irys.xyz/7rpvw…/{hash}` | `assets.0xhoneyjar.xyz/reveal_phase8/images/{hash}` | .md, .json |
| `mibera.s3.amazonaws.com/{path}` | **Excluded** — different bucket, CDN returns 403 | .md |

### Script Design

- Stdlib-only Python (per codex convention)
- `--dry-run` mode that prints diff stats without writing
- `--verify N` mode that spot-checks N random rewritten URLs via HTTP HEAD
- Operates on file globs, not git tracking (catches untracked files)
- Skips `.claude/`, `.git/`, `node_modules/`
- Reports per-pattern counts and any failures

### Verification

Before bulk rewrite, spot-check 10 URLs per pattern:
1. Fetch original URL → record status code + content-length
2. Construct rewritten URL → fetch → compare status + content-length
3. Fail if any mismatch (byte-parity check)

### Rollback

Git revert — the entire migration is a single commit on a feature branch. If CDN issues surface post-merge, `git revert` restores all URLs instantly.
