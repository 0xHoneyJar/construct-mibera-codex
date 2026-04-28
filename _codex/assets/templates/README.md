# Assembler Templates

Base layer PNGs used by `_codex/scripts/micodex-assembler.py` to composite
Mibera trait portraits.

| File | Z-index | Purpose |
|------|---------|---------|
| `background.PNG` | 0 (bottom) | Solid background canvas |
| `body.PNG` | 1 | Character body, drawn on top of background |
| `arms.PNG` | top | Arms, drawn on top of all trait layers |

All three are **1848×2500** RGBA PNGs. The assembler layers:
`background → body → (trait layers, z-indexed) → arms`.

These templates are committed so anyone can regenerate trait images without
needing the external micodex-images repo. The assembler's `--templates` flag
defaults to this directory.

See `_codex/scripts/README.md` → *Image Pipeline* for the full workflow.
