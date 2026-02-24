# SDD: Mibera Sets — Individual Token Entries

> **Cycle**: cycle-015
> **Created**: 2026-02-20
> **PRD**: `grimoires/loa/prd.md`

---

## 1. Overview

A single stdlib-only Python script fetches ERC-1155 metadata from Optimism via RPC, resolves Arweave URIs, and generates 12 individual token entries plus a README index in a new `mibera-sets/` top-level directory. Navigation files are then updated manually during implementation.

## 2. Architecture

```
┌──────────────────────────────────────────────┐
│  fetch-mibera-sets.py                        │
│                                              │
│  1. eth_call uri(id) ──→ Optimism RPC        │
│  2. GET metadata     ──→ Arweave gateway     │
│  3. Write files      ──→ mibera-sets/*.md    │
│  4. Write cache      ──→ _codex/data/        │
│                          mibera-sets-meta.json│
└──────────────────────────────────────────────┘
```

### Data Flow

1. **RPC call** → ABI-encoded URI string per token ID
2. **ABI decode** → raw URI (possibly `ar://` or `https://arweave.net/` or template with `{id}`)
3. **Arweave fetch** → JSON metadata object per token
4. **Generate** → markdown files from metadata + existing supply/holder data
5. **Cache** → raw metadata saved as JSON for reproducibility

## 3. Script Design

### 3.1 Location

`_codex/scripts/fetch-mibera-sets.py`

### 3.2 Dependencies

Stdlib only: `json`, `urllib.request`, `pathlib`, `re`, `sys`, `time`

### 3.3 ABI Decoding

The `uri(uint256)` return value is ABI-encoded as a dynamic `string`:

```
Offset:  0x00  [32 bytes] — offset to string data (always 0x20)
         0x20  [32 bytes] — string length
         0x40  [N bytes]  — UTF-8 string data (right-padded to 32-byte boundary)
```

Decoder:

```python
def decode_abi_string(hex_result):
    """Decode ABI-encoded string from eth_call result."""
    raw = bytes.fromhex(hex_result[2:])  # strip 0x
    offset = int.from_bytes(raw[0:32], 'big')
    length = int.from_bytes(raw[offset:offset+32], 'big')
    return raw[offset+32:offset+32+length].decode('utf-8')
```

### 3.4 URI Resolution

ERC-1155 `uri()` may return:
- **Literal URI per token**: Fetch directly
- **Template URI with `{id}`**: Substitute token ID (hex, no padding, per ERC-1155 spec)
- **`ar://` protocol**: Convert to `https://arweave.net/{txid}`
- **`ipfs://` protocol**: Convert to `https://ipfs.io/ipfs/{cid}` (unlikely but handled)

```python
def resolve_uri(raw_uri, token_id):
    """Resolve ERC-1155 URI to fetchable HTTPS URL."""
    uri = raw_uri.replace("{id}", format(token_id, 'x'))  # hex, no padding

    if uri.startswith("ar://"):
        return "https://arweave.net/" + uri[5:]
    if uri.startswith("ipfs://"):
        return "https://ipfs.io/ipfs/" + uri[7:]
    return uri
```

### 3.5 Supply Data

Supply and holder counts come from existing `_codex/data/mibera-sets.md` (already researched in cycle-009). These are hardcoded in the script as a lookup table rather than re-fetching on-chain:

```python
TOKEN_DATA = {
    1:  {"supply": 65,  "holders": 62, "category": "numbered"},
    2:  {"supply": 57,  "holders": 50, "category": "numbered"},
    3:  {"supply": 54,  "holders": 50, "category": "numbered"},
    4:  {"supply": 58,  "holders": 50, "category": "numbered"},
    5:  {"supply": 48,  "holders": 43, "category": "numbered"},
    6:  {"supply": 3,   "holders": 3,  "category": "numbered"},
    7:  {"supply": 1,   "holders": 1,  "category": "numbered"},
    8:  {"supply": 18,  "holders": 16, "category": "media"},
    9:  {"supply": 19,  "holders": 18, "category": "media"},
    10: {"supply": 19,  "holders": 19, "category": "media"},
    11: {"supply": 20,  "holders": 20, "category": "media"},
    12: {"supply": 54,  "holders": 50, "category": "completionist"},
}
```

Note: supplies for IDs 2, 3, 4, 12 are approximate (Blockscout pagination limit).

### 3.6 Output Generation

The script generates:
- 12 files: `mibera-sets/{slug}.md`
- 1 index: `mibera-sets/README.md`
- 1 cache: `_codex/data/mibera-sets-meta.json` (raw metadata for all 12 tokens)

### 3.7 Error Handling

| Error | Behavior |
|-------|----------|
| RPC call fails | Retry 3x with 2s backoff, then abort with message |
| Arweave fetch fails for one token | Log warning, create stub entry with `<!-- GAP -->`, continue |
| URI is empty/null | Log warning, create stub from existing data |
| Unexpected metadata format | Use available fields, log missing fields |

### 3.8 Rate Limiting

- 0.5s delay between RPC calls (12 calls total = ~6s)
- 1.0s delay between Arweave fetches (12 fetches = ~12s)
- Total script runtime: ~20s

## 4. File Schema

### 4.1 Individual Token Entry

`mibera-sets/{slug}.md`:

```yaml
---
token_id: 1
name: "Honey Road Set One"
type: mibera-set
category: numbered
supply: 65
image: "https://arweave.net/..."
metadata_uri: "https://arweave.net/..."
---
```

```markdown
# Honey Road Set One

> **Token #1** · Numbered Set · Supply: 65 · [All Mibera Sets →](README.md)

{description from Arweave metadata, verbatim}

| Field | Value |
|-------|-------|
| Token ID | 1 |
| Category | Numbered Set |
| Supply | 65 |
| Image | [View on Arweave](https://arweave.net/...) |

---

<!-- @generated:backlinks-start -->
<!-- @generated:backlinks-end -->
```

If metadata includes `attributes` array, render as additional rows in the table.

### 4.2 README Index

`mibera-sets/README.md`:

```markdown
<!-- codex-status: COMPLETE | entities: 12 | last-verified: 2026-02-20 -->
# Mibera Sets — Honey Road Artifacts

*12 ERC-1155 tokens on Optimism representing artifacts from the Honey Road.*

> **Contract**: `0x886D2176D899796cD1AfFA07Eff07B9b2B80f1be` · Optimism
> **Standard**: ERC-1155 · **Total Supply**: 481
> [Collection-level reference →](../_codex/data/mibera-sets.md)

---

## Numbered Sets (7)

- [Honey Road Set One](honey-road-set-one.md) · Token #1 · Supply: 65
- ...

## Media (4)

- [Honey Road Articles](honey-road-articles.md) · Token #8 · Supply: 18
- ...

## Completionist (1)

- [Honey Road Supersetooor](honey-road-supersetooor.md) · Token #12 · Supply: ~54
```

### 4.3 Metadata Cache

`_codex/data/mibera-sets-meta.json`:

```json
{
  "fetched": "2026-02-20",
  "contract": "0x886D2176D899796cD1AfFA07Eff07B9b2B80f1be",
  "chain": "optimism",
  "tokens": {
    "1": {
      "uri_raw": "ar://...",
      "uri_resolved": "https://arweave.net/...",
      "metadata": { "name": "...", "description": "...", "image": "...", "attributes": [] }
    }
  }
}
```

## 5. Integration Points

### 5.1 manifest.json

Add new entity type:

```json
"mibera_set": {
  "directory": "mibera-sets/",
  "index": "mibera-sets/README.md",
  "count": 12,
  "format": "yaml_frontmatter",
  "naming": "{slug}.md",
  "completeness": "COMPLETE",
  "completeness_note": "All 12 Mibera Set tokens on Optimism",
  "last_verified": "2026-02-20"
}
```

Add to `data_exports`:

```json
"mibera_sets_meta": "_codex/data/mibera-sets-meta.json"
```

### 5.2 _codex/data/mibera-sets.md

Update the Metadata section (lines 94-102) to replace GAP comment with:
- Resolved URI pattern
- Link to `mibera-sets-meta.json` for full metadata
- Links to individual token entry files

### 5.3 SUMMARY.md

Add section between Grails and Fractures (or after Fractures):

```markdown
* [Mibera Sets](mibera-sets/README.md) — 12 ERC-1155 tokens on Optimism
  * [Honey Road Set One](mibera-sets/honey-road-set-one.md)
  * ...
```

### 5.4 CLAUDE.md

Add to Directory Layout table:

```markdown
| `mibera-sets/` | Individual Mibera Set tokens | 12 |
```

Add lookup pattern:

```markdown
- **Mibera Set by name**: `mibera-sets/{slug}.md`
```

### 5.5 Scope and Gaps

- Update `_codex/data/scope.json` to include mibera-sets count
- Resolve applicable GAP comments in `_codex/data/mibera-sets.md`

## 6. Slug Convention

Derive slugs from metadata `name` field:
1. Lowercase
2. Replace spaces with hyphens
3. Remove non-alphanumeric characters except hyphens
4. Collapse consecutive hyphens

Example: "Honey Road Set One" → `honey-road-set-one`

If metadata names don't match expected names from `mibera-sets.md`, use the metadata name as source of truth.

## 7. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| `uri()` returns same template for all IDs | Substitute `{id}` per ERC-1155 spec, fetch each individually |
| Arweave gateway timeout | Retry with backoff; try alternate gateway (`https://arweave.dev/`) |
| Metadata has no `description` | Use empty description, no hallucination — leave field blank or note "No description in metadata" |
| Metadata names differ from Blockscout-sourced names | Use metadata as canonical; note discrepancy in entry if any |
