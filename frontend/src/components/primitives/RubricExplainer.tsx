"use client";

import { useState } from "react";
import { SEVERITY } from "@/lib/constants/severity";
import type { SeverityBand } from "@/lib/types";

/** The "?" hint button next to each override/change severity chip — toggles the plain-language
 * rubric for that band. Shared between Manual Review and Incident Detail. */
export function RubricExplainer({ band }: { band: SeverityBand }) {
  const [open, setOpen] = useState(false);
  const meta = SEVERITY[band];

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        aria-expanded={open}
        aria-label={`Explain ${meta.label} band`}
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: `1px solid ${open ? "var(--accent)" : "var(--border-3)"}`,
          background: open ? "var(--acc-10)" : "transparent",
          color: open ? "var(--accent)" : "var(--muted)",
          font: "700 10px/1 var(--font-plex-mono)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ?
      </button>
      {open ? (
        <div
          style={{
            position: "absolute",
            zIndex: 10,
            top: 24,
            left: 0,
            width: 220,
            background: "var(--panel)",
            border: "var(--border-w) solid var(--border-3)",
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                font: "600 11px/1 var(--font-plex-sans)",
                textTransform: "uppercase",
                color: "var(--fg)",
              }}
            >
              {meta.label} · level {band} of 4
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{
                font: "600 10px/1 var(--font-plex-mono)",
                color: "var(--muted)",
              }}
            >
              ✕
            </button>
          </div>
          <p style={{ font: "400 12px/1.4 var(--font-plex-sans)", color: "var(--fg-4)" }}>
            Sum {meta.sumRange[0]}–{meta.sumRange[1]} of 16 across smoke, flame, damage/impact
            and people proximity.
          </p>
        </div>
      ) : null}
    </div>
  );
}
