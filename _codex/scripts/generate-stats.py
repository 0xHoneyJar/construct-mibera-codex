#!/usr/bin/env python3
"""Generate aggregate statistics dashboard from Mibera YAML frontmatter.

Reads all 10,000 Mibera frontmatter files and computes distribution tables,
histograms, and cross-tabulations. Outputs a single Markdown file.

Output: _codex/data/stats.md
"""

import glob
import os
import yaml
from collections import Counter, defaultdict
from datetime import datetime, timezone

MIBERA_DIR = "miberas"
OUTPUT_FILE = "_codex/data/stats.md"
TIMESTAMP = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
DATE_STR = datetime.now(timezone.utc).strftime("%Y-%m-%d")


def load_mibera_data():
    """Load frontmatter from all Mibera files."""
    miberas = []
    for filepath in sorted(glob.glob(os.path.join(MIBERA_DIR, "*.md"))):
        basename = os.path.basename(filepath)
        if basename == "README.md":
            continue
        try:
            with open(filepath, "r") as f:
                content = f.read()
            if not content.startswith("---"):
                continue
            end = content.index("\n---", 3)
            fm = yaml.safe_load(content[4:end])
            if fm and isinstance(fm, dict):
                miberas.append(fm)
        except Exception as e:
            print(f"  WARNING: Error reading {filepath}: {e}")
    return miberas


def format_number(n):
    """Format number with commas."""
    return f"{n:,}"


def format_pct(count, total):
    """Format percentage to 2 decimal places."""
    if total == 0:
        return "0.00%"
    return f"{(count / total) * 100:.2f}%"


def text_bar(count, max_count, width=40):
    """Create a text bar chart element."""
    if max_count == 0:
        return ""
    bar_len = int((count / max_count) * width)
    return "█" * max(bar_len, 1) if count > 0 else ""


def distribution_table(counter, total, label):
    """Generate a distribution table from a Counter."""
    lines = [
        f"| {label} | Count | % |",
        "|" + "-" * (len(label) + 2) + "|-------|---|",
    ]
    for value, count in counter.most_common():
        display = value if value else "(none)"
        lines.append(f"| {display} | {format_number(count)} | {format_pct(count, total)} |")
    return "\n".join(lines)


def main():
    print("Loading Mibera data...")
    miberas = load_mibera_data()
    total = len(miberas)
    print(f"  Loaded {total} Miberas")

    # Compute all statistics
    archetypes = Counter(m.get("archetype", "") for m in miberas)
    ancestors = Counter(m.get("ancestor", "") for m in miberas)
    drugs = Counter(m.get("drug", "") for m in miberas)
    elements = Counter(m.get("element", "") for m in miberas)
    swag_ranks = Counter(m.get("swag_rank", "") for m in miberas)
    time_periods = Counter(m.get("time_period", "") for m in miberas)
    sun_signs = Counter(m.get("sun_sign", "") for m in miberas)

    # Swag score histogram
    score_buckets = Counter()
    for m in miberas:
        score = m.get("swag_score")
        if score is not None and isinstance(score, (int, float)):
            bucket = min(int(score) // 10, 9)  # 0-9, 10-19, ..., 90-100
            score_buckets[bucket] = score_buckets.get(bucket, 0) + 1

    # Top 20 identity combinations
    combos = Counter()
    for m in miberas:
        key = (m.get("archetype", ""), m.get("ancestor", ""), m.get("element", ""))
        combos[key] += 1

    # Drug × Element cross-tab (top 20 drugs)
    drug_element = defaultdict(Counter)
    for m in miberas:
        d = m.get("drug", "")
        e = m.get("element", "")
        if d and e:
            drug_element[d][e] += 1

    # Build the Markdown output
    lines = [
        f"<!-- generated: {TIMESTAMP} by _codex/scripts/generate-stats.py -->",
        "",
        "# Mibera Codex — Statistics",
        "",
        f"*Generated from {format_number(total)} Mibera YAML frontmatter entries.*",
        f"*Last generated: {DATE_STR}*",
        "",
        "---",
        "",
    ]

    # 1. Archetype Distribution
    lines.append("## 1. Archetype Distribution")
    lines.append("")
    lines.append(distribution_table(archetypes, total, "Archetype"))
    lines.append("")
    lines.append(f"*Sum: {format_number(sum(archetypes.values()))}*")
    lines.append("")
    lines.append("---")
    lines.append("")

    # 2. Ancestor Distribution
    lines.append("## 2. Ancestor Distribution")
    lines.append("")
    lines.append(distribution_table(ancestors, total, "Ancestor"))
    lines.append("")
    lines.append(f"*{len(ancestors)} unique ancestors*")
    lines.append("")
    lines.append("---")
    lines.append("")

    # 3. Drug Distribution
    lines.append("## 3. Drug Distribution")
    lines.append("")
    lines.append(distribution_table(drugs, total, "Drug"))
    lines.append("")
    lines.append(f"*{len(drugs)} unique drugs*")
    lines.append("")
    lines.append("---")
    lines.append("")

    # 4. Element Distribution
    lines.append("## 4. Element Distribution")
    lines.append("")
    lines.append(distribution_table(elements, total, "Element"))
    lines.append("")
    lines.append(f"*Sum: {format_number(sum(elements.values()))}*")
    lines.append("")
    lines.append("---")
    lines.append("")

    # 5. Swag Rank Distribution
    rank_order = ["Sss", "Ss", "S", "A", "B", "C", "D", "F"]
    lines.append("## 5. Swag Rank Distribution")
    lines.append("")
    lines.append("| Rank | Count | % |")
    lines.append("|------|-------|---|")
    for rank in rank_order:
        count = swag_ranks.get(rank, 0)
        lines.append(f"| {rank} | {format_number(count)} | {format_pct(count, total)} |")
    # Any ranks not in the predefined order
    for rank, count in swag_ranks.most_common():
        if rank not in rank_order:
            lines.append(f"| {rank} | {format_number(count)} | {format_pct(count, total)} |")
    lines.append("")
    lines.append("---")
    lines.append("")

    # 6. Swag Score Histogram
    bucket_labels = ["0-9", "10-19", "20-29", "30-39", "40-49", "50-59", "60-69", "70-79", "80-89", "90-100"]
    max_bucket = max(score_buckets.values()) if score_buckets else 1
    lines.append("## 6. Swag Score Histogram")
    lines.append("")
    lines.append("```")
    for i, label in enumerate(bucket_labels):
        count = score_buckets.get(i, 0)
        bar = text_bar(count, max_bucket, 40)
        lines.append(f" {label:>6}  | {bar} {format_number(count)}")
    lines.append("```")
    lines.append("")
    lines.append("---")
    lines.append("")

    # 7. Time Period Distribution
    lines.append("## 7. Time Period Distribution")
    lines.append("")
    lines.append(distribution_table(time_periods, total, "Time Period"))
    lines.append("")
    lines.append("---")
    lines.append("")

    # 8. Sun Sign Distribution
    lines.append("## 8. Sun Sign Distribution")
    lines.append("")
    lines.append(distribution_table(sun_signs, total, "Sun Sign"))
    lines.append("")
    lines.append("---")
    lines.append("")

    # 9. Top 20 Identity Combinations
    lines.append("## 9. Top 20 Identity Combinations")
    lines.append("")
    lines.append("*Most common Archetype + Ancestor + Element triples.*")
    lines.append("")
    lines.append("| Archetype | Ancestor | Element | Count |")
    lines.append("|-----------|----------|---------|-------|")
    for (arch, anc, elem), count in combos.most_common(20):
        lines.append(f"| {arch} | {anc} | {elem} | {format_number(count)} |")
    lines.append("")
    lines.append("---")
    lines.append("")

    # 10. Drug × Element Cross-Tab (top 20 drugs)
    top_drugs = [d for d, _ in drugs.most_common(20)]
    element_order = ["Earth", "Fire", "Water", "Air"]
    lines.append("## 10. Drug × Element Cross-Tab")
    lines.append("")
    lines.append("*Top 20 drugs by frequency. Shows how each drug distributes across elements.*")
    lines.append("")
    header = "| Drug | " + " | ".join(element_order) + " | Total |"
    sep = "|------|" + "|".join(["---" for _ in element_order]) + "|-------|"
    lines.append(header)
    lines.append(sep)
    for d in top_drugs:
        row = f"| {d} |"
        for e in element_order:
            row += f" {drug_element[d].get(e, 0)} |"
        row += f" {sum(drug_element[d].values())} |"
        lines.append(row)
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("*Generated by `_codex/scripts/generate-stats.py`*")
    lines.append("")

    # Write output
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        f.write("\n".join(lines))

    print(f"\nOutput: {OUTPUT_FILE}")
    print(f"Sections: 10")

    # Validation
    arch_sum = sum(archetypes.values())
    elem_sum = sum(elements.values())
    print(f"\nValidation:")
    print(f"  Archetype sum: {arch_sum} {'✓' if arch_sum == total else '✗'}")
    print(f"  Element sum: {elem_sum} {'✓' if elem_sum == total else '✗'}")
    print(f"  Unique ancestors: {len(ancestors)}")
    print(f"  Unique drugs: {len(drugs)}")


if __name__ == "__main__":
    main()
