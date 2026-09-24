"use client";

import { useState } from "react";
import type { Incident, SeverityBand } from "@/lib/types";
import { SEVERITY, SEVERITY_ORDER } from "@/lib/constants/severity";
import { RubricExplainer } from "@/components/primitives/RubricExplainer";
import { SectionHeading } from "@/components/primitives/Card";
import { useIncidentStore } from "@/lib/store/useIncidentStore";

export function OverrideSeverityCard({ incident }: { incident: Incident }) {
  const overrideSeverity = useIncidentStore((s) => s.overrideSeverity);
  const [pending, setPending] = useState<SeverityBand | null>(null);

  const stateNote =
    incident.provenance === "coordinator_override"
      ? "Overridden by you."
      : incident.band
        ? `Currently AI level ${incident.band}.`
        : "No severity applied yet.";

  async function apply(level: SeverityBand) {
    setPending(level);
    await overrideSeverity(incident.id, level);
    setPending(null);
  }

  return (
    <section className="card card--inset" style={{ padding: "var(--space-4) var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      <SectionHeading note={`One click applies immediately. ${stateNote}`}>Override severity</SectionHeading>

      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
        {SEVERITY_ORDER.map((band) => {
          const meta = SEVERITY[band];
          return (
            <div key={band} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                type="button"
                className="sev-option"
                aria-pressed={incident.band === band}
                disabled={pending !== null}
                onClick={() => apply(band)}
                style={{ opacity: pending && pending !== band ? 0.6 : undefined }}
              >
                <span className="sev-option__dot" style={{ background: meta.fillVar, borderColor: meta.ringVar }} />
                {meta.label}
              </button>
              <RubricExplainer band={band} />
            </div>
          );
        })}
      </div>

      {incident.provenance === "coordinator_override" ? (
        <button
          type="button"
          className="btn btn--pending btn--sm"
          style={{ alignSelf: "flex-start" }}
          onClick={() => {
            // Undo is also the toast's action for 5 s; this inline version re-applies the AI's
            // original band by re-deriving it from the stored sum.
            const original = incident.sum
              ? SEVERITY_ORDER.find((b) => SEVERITY[b].sumRange[0] <= (incident.sum ?? 0) && (incident.sum ?? 0) <= SEVERITY[b].sumRange[1])
              : null;
            if (original) apply(original);
          }}
        >
          Undo, back to AI level
        </button>
      ) : null}
    </section>
  );
}
