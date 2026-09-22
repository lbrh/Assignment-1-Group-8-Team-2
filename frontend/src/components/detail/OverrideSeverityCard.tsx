"use client";

import { useState } from "react";
import type { Incident, SeverityBand } from "@/lib/types";
import { SEVERITY, SEVERITY_ORDER } from "@/lib/constants/severity";
import { RubricExplainer } from "@/components/primitives/RubricExplainer";
import { useIncidentStore } from "@/lib/store/useIncidentStore";

export function OverrideSeverityCard({ incident }: { incident: Incident }) {
  const overrideSeverity = useIncidentStore((s) => s.overrideSeverity);
  const [pending, setPending] = useState<SeverityBand | null>(null);

  const stateNote =
    incident.provenance === "coordinator_override"
      ? "overridden by you"
      : incident.band
        ? `currently AI level ${incident.band}`
        : "no severity applied yet";

  async function apply(level: SeverityBand) {
    setPending(level);
    await overrideSeverity(incident.id, level);
    setPending(null);
  }

  return (
    <div
      style={{
        border: "1px solid var(--border-3)",
        background: "var(--map-bg)",
        padding: "15px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span
          style={{
            font: "600 10px/1 var(--font-plex-mono)",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--fg)",
          }}
        >
          Override severity
        </span>
        <span style={{ font: "400 10px/1.4 var(--font-plex-mono)", color: "var(--muted)" }}>
          one click applies immediately · {stateNote}
        </span>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {SEVERITY_ORDER.map((band) => {
          const meta = SEVERITY[band];
          const active = incident.band === band;
          return (
            <div key={band} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                type="button"
                disabled={pending !== null}
                onClick={() => apply(band)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: active ? "var(--acc-12)" : "var(--panel)",
                  border: active ? "1px solid var(--accent)" : "1px solid var(--border-2)",
                  padding: "7px 10px",
                  opacity: pending && pending !== band ? 0.6 : 1,
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: meta.fillVar,
                    border: `2px solid ${meta.ringVar}`,
                  }}
                />
                <span
                  style={{
                    font: "600 11px/1 var(--font-plex-mono)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: active ? "var(--accent-hi)" : "var(--fg-2)",
                  }}
                >
                  {meta.label}
                </span>
              </button>
              <RubricExplainer band={band} />
            </div>
          );
        })}
      </div>

      {incident.provenance === "coordinator_override" ? (
        <button
          type="button"
          onClick={() => {
            // Undo is exposed as the toast's CTA for 5s; the inline version here re-applies the
            // AI's own original band by re-deriving it from the stored elements/sum.
            const original = incident.sum ? SEVERITY_ORDER.find((b) => SEVERITY[b].sumRange[0] <= (incident.sum ?? 0) && (incident.sum ?? 0) <= SEVERITY[b].sumRange[1]) : null;
            if (original) apply(original);
          }}
          style={{
            alignSelf: "flex-start",
            font: "600 10px/1 var(--font-plex-mono)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--muted)",
            border: "1px solid var(--border-2)",
            padding: "9px 12px",
          }}
        >
          Undo · back to AI level
        </button>
      ) : null}
    </div>
  );
}
