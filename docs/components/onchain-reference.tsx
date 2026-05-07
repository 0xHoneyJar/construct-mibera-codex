/**
 * OnChainReference — IX. On-Chain reference table.
 *
 * Renders the contract registry from /contracts.json (staged at build
 * time from _codex/data/contracts.json by build-onchain-data.mjs) as a
 * table with copy-button per address.
 *
 * Per Flatline SKP-007 (cycle-024 sprint review, severity 740): each
 * row carries name + address + chain + standard. Build-time validation
 * lives in docs/scripts/check-contracts.mjs (regex + chain-required +
 * dedup) — by the time this component renders, the data is trusted.
 */

import { useEffect, useState } from "react";

type Contract = {
  name: string;
  address: string;
  chain: string;
  chain_id?: number;
  standard: string;
  token_count?: number;
  notes?: string;
};

type ContractsFile = {
  version: string;
  generated: string;
  note?: string;
  contracts: Contract[];
};

let cached: ContractsFile | null = null;
let cachedPromise: Promise<ContractsFile | null> | null = null;

async function loadContracts(): Promise<ContractsFile | null> {
  if (cached) return cached;
  if (!cachedPromise) {
    cachedPromise = fetch("/contracts.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: ContractsFile | null) => {
        cached = data;
        return data;
      })
      .catch(() => null);
  }
  return cachedPromise;
}

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

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="onchain-table__copy"
      onClick={async () => {
        await copyToClipboard(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }}
      aria-label={`Copy address ${value}`}
    >
      {copied ? "copied" : "copy"}
    </button>
  );
}

export function OnChainReference() {
  const [data, setData] = useState<ContractsFile | null>(cached);

  useEffect(() => {
    if (!data) {
      let cancelled = false;
      loadContracts().then((d) => {
        if (!cancelled) setData(d);
      });
      return () => {
        cancelled = true;
      };
    }
  }, [data]);

  if (!data) {
    return (
      <div className="onchain-reference onchain-reference--loading" aria-busy="true">
        Loading contract registry…
      </div>
    );
  }

  return (
    <div className="onchain-reference">
      {data.note ? <p className="onchain-reference__note">{data.note}</p> : null}
      <table className="onchain-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Address</th>
            <th>Chain</th>
            <th>Standard</th>
          </tr>
        </thead>
        <tbody>
          {data.contracts.map((c) => (
            <tr key={c.address}>
              <td className="onchain-table__name">
                {c.name}
                {c.notes ? (
                  <div className="onchain-table__notes">{c.notes}</div>
                ) : null}
              </td>
              <td className="onchain-table__addr">
                <code>{c.address}</code>
                <CopyButton value={c.address} />
              </td>
              <td>
                {c.chain}
                {c.chain_id ? (
                  <span className="onchain-table__chain-id"> · {c.chain_id}</span>
                ) : null}
              </td>
              <td className="onchain-table__standard">
                {c.standard}
                {c.token_count ? (
                  <div className="onchain-table__notes">
                    {c.token_count.toLocaleString()} tokens
                  </div>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
