"use client";

import { useEffect, useId, useRef, useState } from "react";
import { SEVERITY } from "@/lib/constants/severity";
import type { SeverityBand } from "@/lib/types";

const PANEL_WIDTH = 240;

/** The "?" hint next to each severity choice. Toggles the plain-language rubric for that band.
 * Shared between Manual Review and Incident Detail. Escape or a click outside closes it. */
export function RubricExplainer({ band }: { band: SeverityBand }) {
  const [open, setOpen] = useState(false);
  // horizontal offset from the "?" that keeps the 240px panel on screen (on a phone it would
  // otherwise spill off the right edge for the options at the end of a row)
  const [shift, setShift] = useState(-8);
  const meta = SEVERITY[band];
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button
        type="button"
        className="icon-btn icon-btn--round"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Explain ${meta.label}`}
        onClick={(e) => {
          const left = e.currentTarget.getBoundingClientRect().left;
          const width = Math.min(PANEL_WIDTH, window.innerWidth - 32);
          setShift(Math.max(16, Math.min(left - 8, window.innerWidth - 16 - width)) - left);
          setOpen((v) => !v);
        }}
        style={{
          width: 22,
          height: 22,
          fontSize: 12,
          fontWeight: 700,
          boxShadow: "none",
          color: open ? "var(--accent)" : "var(--muted)",
          borderColor: open ? "var(--accent)" : "var(--border-2)",
          background: open ? "var(--accent-soft)" : "var(--panel)",
        }}
      >
        ?
      </button>
      {open ? (
        <div
          id={panelId}
          role="note"
          className="card"
          style={{
            position: "absolute",
            zIndex: 10,
            top: 30,
            left: shift,
            width: `min(${PANEL_WIDTH}px, calc(100vw - 32px))`,
            padding: "var(--space-3) var(--space-4)",
            boxShadow: "var(--shadow-pop)",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            animation: "toastIn var(--dur) var(--ease)",
          }}
        >
          <span style={{ font: "600 var(--text-sm)/1.3 var(--font-plex-sans)", color: "var(--fg)" }}>
            {meta.label}, level {band} of 4
          </span>
          <p className="caption">
            Scores {meta.sumRange[0]} to {meta.sumRange[1]} of 16 across smoke, flame, vegetation
            and infrastructure nearby.
          </p>
        </div>
      ) : null}
    </div>
  );
}
