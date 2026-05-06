/**
 * SkillLink — a one-line PROMPT the user pastes into their AI agent.
 *
 * Per operator: the visitor doesn't paste a bare URL — they paste a
 * sentence that tells their agent what to do with it. The agent reads
 * the skill.md document and configures itself.
 *
 * Pattern:
 *   "Read https://codex.0xhoneyjar.xyz/skill.md and set up Mibera Codex"
 *
 * Visual: dark-ink panel, prompt left-aligned in mono, "copy" button
 * right-aligned. Clipboard fallback to execCommand for non-secure
 * contexts. State flip ("copy" → "copied") fires inside try/finally so
 * the visual feedback lands even if writeText rejects (unfocused tab).
 */

import { useState } from "react";

const SKILL_URL = "https://codex.0xhoneyjar.xyz/skill.md";
const PROMPT = `Read ${SKILL_URL} and set up the Mibera Codex`;

function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch {
      /* noop */
    }
    document.body.removeChild(ta);
    resolve();
  });
}

export function SkillLink() {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await copyToClipboard(PROMPT);
    } catch {
      /* noop — fallback path or rejected promise; UI still flips below */
    } finally {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  }

  return (
    <div className="skill-link">
      <code className="skill-link__url">{PROMPT}</code>
      <button
        type="button"
        className="skill-link__copy"
        aria-label="Copy prompt to clipboard"
        onClick={onCopy}
      >
        {copied ? "copied" : "copy"}
      </button>
    </div>
  );
}
