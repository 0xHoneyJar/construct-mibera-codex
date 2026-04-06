#!/usr/bin/env python3
"""Apply justification text to migrated trait files.

Usage:
    python3 apply-justifications.py <justifications-file> <directory>

Justifications file format (one per line):
    filename.md|Justification text here.

Replaces [TO BE ENRICHED] in each matching file.
"""

import os
import sys


def main():
    if len(sys.argv) < 3:
        print('Usage: python3 apply-justifications.py <justifications-file> <directory>')
        sys.exit(1)

    justifications_file = sys.argv[1]
    directory = sys.argv[2]

    # Load justifications
    justifications = {}
    with open(justifications_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            parts = line.split('|', 1)
            if len(parts) == 2:
                justifications[parts[0].strip()] = parts[1].strip()

    applied = 0
    missing = 0

    for filename, justification in sorted(justifications.items()):
        filepath = os.path.join(directory, filename)
        if not os.path.exists(filepath):
            print(f'  ? {filename} — file not found')
            missing += 1
            continue

        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        if '[TO BE ENRICHED]' not in content:
            print(f'  - {filename} — no placeholder found')
            continue

        content = content.replace('[TO BE ENRICHED]', justification)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

        applied += 1
        print(f'  ✓ {filename}')

    print(f'\nDone: {applied} applied, {missing} missing')


if __name__ == '__main__':
    main()
