"use client";

import type { Incident, SeverityBand } from "@/lib/types";
import { SEVERITY, SEVERITY_ORDER } from "@/lib/constants/severity";
import { RubricExplainer } from "@/components/primitives/RubricExplainer";
import { SectionHeading } from "@/components/primitives/Card";
import { useIncidentStore } from "@/lib/store/useIncidentStore";
import { useAck } from "@/components/primitives/Button";

export function OverrideSeverityCard({ incident }: { incident: Incident }) {
  const overrideSeverity = useIncidentStore((s) => s.overrideSeverity);
  const [ackedBand, ackBand] = useAck<SeverityBand>();

  const stateNote =
    incident.provenance === "coordinator_override"
      ? "Overridden by you."
      : incident.band
        ? `Currently AI level ${incident.band}.`
        : "No severity applied yet.";

  function apply(level: SeverityBand) {
    ackBand(level);
    overrideSeverity(incident.id, level);
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
                className={ackedBand === band ? "sev-option ack" : "sev-option"}
                aria-pressed={incident.band === band}
                onClick={() => apply(band)}
              >
                <span className="ack__label">
                  <span className="sev-option__dot" style={{ background: meta.fillVar, borderColor: meta.ringVar }} />
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
