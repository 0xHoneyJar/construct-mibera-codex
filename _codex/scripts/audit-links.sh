#!/usr/bin/env bash
# audit-links.sh — Validate all relative Markdown links across the Mibera Codex
# Uses python3 for reliable cross-platform link extraction
# Outputs JSON report to _codex/scripts/reports/audit-links.json
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
REPORT_DIR="$REPO_ROOT/_codex/scripts/reports"
mkdir -p "$REPORT_DIR"

echo "Mibera Codex Link Audit" >&2
echo "=======================" >&2

# Run the full audit in Python for speed and portability
python3 - "$REPO_ROOT" "$REPORT_DIR" <<'PYEOF'
import re, os, sys, json
from pathlib import Path

repo_root = Path(sys.argv[1])
report_dir = Path(sys.argv[2])

EXCLUDE = {'.git', '.claude', '.beads', 'grimoires', '.run', '_codex', 'node_modules'}
# Loa framework files vendored at repo root — overwritten verbatim on every
# framework update, so their link integrity is upstream's concern (same
# rationale as excluding .claude/)
EXCLUDE_FILES = {'PROCESS.md', 'INSTALLATION.md'}
LINK_RE = re.compile(r'\[(?:[^\]]*)\]\(([^)]+)\)')

total_links = 0
broken_links = 0
files_checked = 0
issues = []

for md_file in repo_root.rglob('*.md'):
    # Skip excluded directories
    parts = md_file.relative_to(repo_root).parts
    if any(p in EXCLUDE for p in parts):
        continue
    if len(parts) == 1 and parts[0] in EXCLUDE_FILES:
        continue

    files_checked += 1
    rel_file = str(md_file.relative_to(repo_root))

    try:
        content = md_file.read_text(encoding='utf-8', errors='replace')
    except Exception:
        continue

    for match in LINK_RE.finditer(content):
        target = match.group(1)

        # Skip external URLs, anchors, mailto
        if target.startswith(('http://', 'https://', 'mailto:', '#')):
            continue

        total_links += 1

        # Strip anchor for file resolution
        file_part = target.split('#')[0]
        if not file_part:
            continue

        # Resolve relative to the file's directory
        resolved = (md_file.parent / file_part).resolve()

        if not resolved.exists():
            broken_links += 1
            issues.append({
                'file': rel_file,
                'target': target,
            })

print(f"Files checked: {files_checked}", file=sys.stderr)
print(f"Total links: {total_links}", file=sys.stderr)
print(f"Broken links: {broken_links}", file=sys.stderr)

# Write JSON report
report = {
    'timestamp': __import__('datetime').datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'),
    'files_checked': files_checked,
    'total_links': total_links,
    'broken_links': broken_links,
    'issues': issues,
}
report_path = report_dir / 'audit-links.json'
with open(report_path, 'w') as f:
    json.dump(report, f, indent=2)

print(f"Report: {report_path}", file=sys.stderr)

if broken_links > 0:
    print("", file=sys.stderr)
    print("=== BROKEN LINKS (first 50) ===", file=sys.stderr)
    for issue in issues[:50]:
        print(f"  {issue['file']} → {issue['target']}", file=sys.stderr)
    if broken_links > 50:
        print(f"  ... and {broken_links - 50} more (see report)", file=sys.stderr)
    sys.exit(1)
else:
    print("=== ALL LINKS VALID ===", file=sys.stderr)
PYEOF
