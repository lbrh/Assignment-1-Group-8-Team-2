"use client";

import { useState, type ReactNode } from "react";
import type { Incident, SeverityBand } from "@/lib/types";
import { SEVERITY, SEVERITY_ORDER, bandFromSum } from "@/lib/constants/severity";
import { HatchBanner } from "@/components/primitives/HatchBanner";
import { ConfidenceMeter } from "@/components/primitives/ConfidenceMeter";
import { MetaList } from "@/components/primitives/MetaField";
import { ElementScoreRows } from "@/components/primitives/ElementScoreRows";
import { RubricExplainer } from "@/components/primitives/RubricExplainer";
import { Button } from "@/components/primitives/Button";
import { SectionHeading } from "@/components/primitives/Card";
import { useIncidentStore } from "@/lib/store/useIncidentStore";

const HEADLINE: Record<string, string> = {
  below_threshold: "Flagged for manual review",
  sent_by_coordinator: "Sent for a human check",
  restored_not_fire: "Restored for re-check",
  restored_discarded: "Restored for re-check",
};

export function ReviewPane({ incident }: { incident: Incident }) {
  const confirmReview = useIncidentStore((s) => s.confirmReview);
  const changeReview = useIncidentStore((s) => s.changeReview);
  const discardReview = useIncidentStore((s) => s.discardReview);
  const [busy, setBusy] = useState<string | null>(null);

  const provisionalBand = incident.sum ? bandFromSum(incident.sum) : null;
  const headline = HEADLINE[incident.reviewReason ?? "below_threshold"];

  async function run(action: string, fn: () => Promise<void>) {
    setBusy(action);
    await fn();
    setBusy(null);
  }

  return (
    <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
      <HatchBanner style={{ padding: "18px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                font: "600 22px/1.2 var(--font-plex-sans)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--accent)",
              }}
            >
              {headline}
            </span>
            <span style={{ font: "400 11px/1.4 var(--font-plex-mono)", color: "var(--accent-fg)" }}>
              routed {incident.reviewReason === "below_threshold" ? "by the confidence gate" : "by a coordinator"}
            </span>
          </div>
          <span style={{ font: "600 13px/1 var(--font-plex-mono)", letterSpacing: "0.08em", color: "var(--fg-2)" }}>
            {incident.id}
          </span>
        </div>
        {incident.confidence != null ? (
          <div style={{ marginTop: 14 }}>
            <ConfidenceMeter
              confidence={incident.confidence}
              size="lg"
              note="Below 0.75 threshold"
            />
          </div>
        ) : null}
      </HatchBanner>

      <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            height: 236,
            width: 340,
            border: "1px dashed var(--border-4)",
            background: "repeating-linear-gradient(135deg, var(--surface-2) 0 8px, var(--surface) 8px 16px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ font: "400 10px/1 var(--font-plex-mono)", color: "var(--muted)" }}>{incident.file}</span>
        </div>
        <span style={{ font: "400 10px/1 var(--font-plex-mono)", color: "var(--muted)" }}>
          unmodified · as received from field
        </span>

        <MetaList
          rows={[
            { label: "Geotag", value: `${incident.coords.lat.toFixed(4)}, ${incident.coords.lng.toFixed(4)}` },
            { label: "Place", value: incident.place },
            { label: "Status", value: "flagged · held out of ranking" },
            { label: "Class label", value: "Uncertain · not confirmed" },
            { label: "Priority", value: "not ranked until reviewed" },
            { label: "Group ID", value: incident.groupId ?? "none" },
          ]}
        />

        <div
          style={{
            border: "1px dashed var(--accent-border)",
            background: "var(--surface)",
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <SectionHeading accent note="shown for review · not applied to the map or the dispatch order">
            AI provisional tag
          </SectionHeading>
          {provisionalBand ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  width: 47,
                  height: 47,
                  borderRadius: "50%",
                  background: SEVERITY[provisionalBand].fillVar,
                  border: `2px dashed ${SEVERITY[provisionalBand].ringVar}`,
                  opacity: 0.75,
                }}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ font: "600 17px/1.2 var(--font-plex-sans)", textTransform: "uppercase", color: "var(--fg)" }}>
                  {SEVERITY[provisionalBand].label}
                </span>
                <span style={{ font: "400 11px/1 var(--font-plex-mono)", color: "var(--muted)" }}>
                  provisional · level {provisionalBand} of 4
                </span>
              </div>
              <span
                style={{
                  marginLeft: "auto",
                  font: "700 17px/1 var(--font-plex-mono)",
                  color: "var(--accent)",
                  borderLeft: "1px solid var(--border-3)",
                  paddingLeft: 14,
                }}
              >
                {incident.confidence?.toFixed(2)}
              </span>
            </div>
          ) : (
            <span style={{ font: "400 12px/1.4 var(--font-plex-sans)", color: "var(--muted)" }}>
              No element scores were produced for this image.
            </span>
          )}
          <ElementScoreRows elements={incident.elements} sum={incident.sum} />
        </div>

        <div
          style={{
            border: "1px dashed var(--accent-border)",
            background: "var(--surface)",
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <SectionHeading accent>Reason for flagging</SectionHeading>
          <p style={{ font: "400 13.5px/1.55 var(--font-plex-sans)", color: "var(--fg-3)" }}>
            {incident.explanation ??
              `Confidence ${incident.confidence?.toFixed(2)} is below the fixed 0.75 threshold — this image was held out of the ranking rather than force-classified.`}
          </p>
        </div>

        <div
          style={{
            border: "1px solid var(--border-3)",
            background: "var(--map-bg)",
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <SectionHeading note="one action applies immediately · logged with your id and the time">
            Reviewer decision
          </SectionHeading>

          <DecisionBlock
            label="Confirm the AI tag"
            description="Applies the provisional level as final and promotes this image to an active incident."
          >
            <Button
              variant="solid"
              disabled={!provisionalBand || busy !== null}
              onClick={() => run("confirm", () => confirmReview(incident.id))}
            >
              {provisionalBand ? `Confirm ${SEVERITY[provisionalBand].label} · level ${provisionalBand}` : "Confirm"}
            </Button>
          </DecisionBlock>

          <DecisionBlock
            label="Change the severity and promote"
            description="Recorded as a coordinator decision, not an AI classification."
          >
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {SEVERITY_ORDER.map((band: SeverityBand) => (
                <div key={band} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => run("change", () => changeReview(incident.id, band))}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      background: "var(--panel)",
                      border: "1px solid var(--border-2)",
                      padding: "7px 10px",
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: SEVERITY[band].fillVar,
                        border: `2px solid ${SEVERITY[band].ringVar}`,
                      }}
                    />
                    <span style={{ font: "600 11px/1 var(--font-plex-mono)", color: "var(--fg-2)" }}>
                      {SEVERITY[band].label}
                    </span>
                  </button>
                  <RubricExplainer band={band} />
                </div>
              ))}
            </div>
          </DecisionBlock>

          <DecisionBlock
            label="Discard · not a fire"
            description="Removes it from the map and the dispatch order. The image stays retrievable in the Archive."
          >
            <Button
              variant="outline"
              disabled={busy !== null}
              onClick={() => run("discard", () => discardReview(incident.id))}
            >
              Discard · not a fire
            </Button>
          </DecisionBlock>
        </div>
      </div>
    </div>
  );
}

function DecisionBlock({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ font: "600 11px/1 var(--font-plex-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fg)" }}>
        {label}
      </span>
      <span style={{ font: "400 12.5px/1.4 var(--font-plex-sans)", color: "var(--muted)" }}>{description}</span>
      <div
        style={{
          border: "1px solid var(--border-4)",
          background: "var(--panel)",
          padding: "13px 14px",
        }}
      >
        {children}
      </div>
    </div>
  );
}
