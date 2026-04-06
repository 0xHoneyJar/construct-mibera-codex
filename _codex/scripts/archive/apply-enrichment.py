#!/usr/bin/env python3
"""Apply cultural context and justification text to migrated trait files.

Usage:
    python3 apply-enrichment.py <mapping-file> <directory>
    python3 apply-enrichment.py /tmp/freetekno-items-mapping.txt traits/items/general-items/

Mapping file format (one per line):
    filename.md|JUSTIFICATION|Justification text here.
    filename.md|CONTEXT|Cultural context text here.

JUSTIFICATION lines replace [TO BE ENRICHED] in the file.
CONTEXT lines insert a ## Cultural Context section before ## Justification.
"""

import os
import sys


def apply_justification(content, text):
    """Replace [TO BE ENRICHED] with justification text."""
    if '[TO BE ENRICHED]' in content:
        return content.replace('[TO BE ENRICHED]', text), True
    return content, False


def apply_context(content, text):
    """Insert ## Cultural Context section before ## Justification."""
    # Check if Cultural Context already exists
    if '## Cultural Context' in content:
        return content, False

    # Insert before ## Justification
    marker = '## Justification'
    if marker in content:
        section = f'## Cultural Context\n\n{text}\n\n'
        content = content.replace(marker, section + marker)
        return content, True

    return content, False


def main():
    if len(sys.argv) < 3:
        print('Usage: python3 apply-enrichment.py <mapping-file> <directory>')
        sys.exit(1)

    mapping_file = sys.argv[1]
    directory = sys.argv[2]

    # Load mappings
    justifications = {}
    contexts = {}

    with open(mapping_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            parts = line.split('|', 2)
            if len(parts) == 3:
                filename = parts[0].strip()
                entry_type = parts[1].strip().upper()
                text = parts[2].strip()
                if entry_type == 'JUSTIFICATION':
                    justifications[filename] = text
                elif entry_type == 'CONTEXT':
                    contexts[filename] = text

    # Get all unique filenames
    all_files = sorted(set(list(justifications.keys()) + list(contexts.keys())))

    j_applied = 0
    c_applied = 0
    missing = 0
    errors = 0

    for filename in all_files:
        filepath = os.path.join(directory, filename)
        if not os.path.exists(filepath):
            print(f'  ? {filename} — file not found')
            missing += 1
            continue

        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        changed = False

        # Apply context first (inserts section before Justification)
        if filename in contexts:
            content, ok = apply_context(content, contexts[filename])
            if ok:
                c_applied += 1
                changed = True
            else:
                print(f'  ~ {filename} — context already exists or no insertion point')

        # Apply justification
        if filename in justifications:
            content, ok = apply_justification(content, justifications[filename])
            if ok:
                j_applied += 1
                changed = True
            else:
                print(f'  ~ {filename} — no [TO BE ENRICHED] placeholder')

        if changed:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            status = []
            if filename in contexts:
                status.append('context')
            if filename in justifications:
                status.append('justification')
            print(f'  ✓ {filename} — {" + ".join(status)}')

    print(f'\nDone: {j_applied} justifications, {c_applied} contexts applied, {missing} missing files')


if __name__ == '__main__':
    main()
