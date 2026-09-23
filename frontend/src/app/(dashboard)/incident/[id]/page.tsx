"use client";

import { useParams, useRouter } from "next/navigation";
import { useIncidentStore } from "@/lib/store/useIncidentStore";
import { relativeTime } from "@/lib/utils/time";
import { backLabelForPath } from "@/lib/constants/nav";
import { SeverityHeader } from "@/components/detail/SeverityHeader";
import { DetailActionsBar } from "@/components/detail/DetailActionsBar";
import { OverrideSeverityCard } from "@/components/detail/OverrideSeverityCard";
import { HowScoredExplainer } from "@/components/detail/HowScoredExplainer";
import { NearbyStrip } from "@/components/detail/NearbyStrip";
import { MetaList } from "@/components/primitives/MetaField";
import { DecisionLogList } from "@/components/primitives/DecisionLogList";
import { Card, SectionHeading } from "@/components/primitives/Card";
import type { DecisionLogEntry } from "@/lib/types";

// Stable reference so the Zustand selector below doesn't return a new array every render
// (a fresh `[]` fallback on every call makes useSyncExternalStore think the snapshot changed
// on every render, which is an infinite loop, not just a wasted render).
const EMPTY_LOGS: DecisionLogEntry[] = [];

export default function IncidentDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const incident = useIncidentStore((s) => s.incidents[id]);
  const decisionLogs = useIncidentStore((s) => s.decisionLogs[id] ?? EMPTY_LOGS);
  const tick = useIncidentStore((s) => s.clockTick);
  const lastTabPath = useIncidentStore((s) => s.lastTabPath);

  if (!incident) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p style={{ font: "400 13.5px/1.5 var(--font-plex-sans)", color: "var(--muted)" }}>
          Incident not found.
        </p>
      </div>
    );
  }

  const priorityLabel =
    incident.dispatch === "live"
      ? "live · crew dispatched"
      : incident.dispatch === "extinguished"
        ? "resolved · not ranked"
        : incident.band === 0
          ? "not ranked until reviewed"
          : "ranked in dispatch order";

  const classificationLabel =
    incident.flag === "not_a_fire"
      ? "Non-Fire"
      : incident.dispatch === "extinguished"
        ? "Extinguished"
        : incident.band === 0
          ? "Uncertain"
          : "Fire";

  const record = [
    `sev=${incident.band || "null"}`,
    `smoke=${incident.elements.smoke ?? "null"}`,
    `flame=${incident.elements.flame ?? "null"}`,
    `damage=${incident.elements.damage ?? "null"}`,
    `people=${incident.elements.people ?? "null"}`,
    `sum=${incident.sum ?? "null"}`,
    `conf=${incident.confidence ?? "null"}`,
    `thr=0.75`,
    `lat/lng=${incident.coords.lat.toFixed(4)},${incident.coords.lng.toFixed(4)}`,
    `t=${incident.capturedAtIso}`,
    `flag=${incident.flag}`,
    `label=${classificationLabel.toLowerCase()}`,
    `priority=${priorityLabel}`,
    `group=${incident.groupId ?? "none"}`,
    `src=${incident.source}`,
  ].join(" ");

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "20px 24px 40px" }}>
      <button
        type="button"
        onClick={() => router.push(lastTabPath)}
        style={{
          font: "600 11px/1 var(--font-plex-mono)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--accent)",
          marginBottom: 14,
        }}
      >
        ← {backLabelForPath(lastTabPath)}
      </button>

      <div style={{ border: "var(--border-w) solid var(--border)", background: "var(--panel)" }}>
        <SeverityHeader incident={incident} />

        <div style={{ display: "grid", gridTemplateColumns: "308px 1fr", gap: 22, padding: "0 22px 22px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            <div
              style={{
                height: 186,
                border: "var(--border-w) dashed var(--border-4)",
                background:
                  "repeating-linear-gradient(135deg, var(--surface-2) 0 8px, var(--surface) 8px 16px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                font: "500 10px/1 var(--font-plex-mono)",
                color: "var(--muted)",
              }}
            >
              {incident.file}
            </div>
            <MetaList
              rows={[
                { label: "Location", value: incident.place },
                { label: "Captured", value: `${relativeTime(incident.capturedAtIso, tick)}` },
                { label: "Distance", value: `${incident.distanceKm.toFixed(1)} km from staging` },
                { label: "Class", value: classificationLabel },
                { label: "Priority", value: priorityLabel },
                { label: "Group", value: incident.groupId ?? "none" },
              ]}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span
                style={{
                  font: "600 10px/1 var(--font-plex-mono)",
                  letterSpacing: "0.16em",
                  color: "var(--muted)",
                }}
              >
                Record (exportable)
              </span>
              <div
                style={{
                  font: "400 11px/1.6 var(--font-plex-mono)",
                  color: "var(--muted)",
                  wordBreak: "break-word",
                }}
              >
                {record}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <DetailActionsBar incident={incident} />
            <OverrideSeverityCard incident={incident} />

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <SectionHeading note="original tag, new value, who changed it and when">
                Decision log
              </SectionHeading>
              <DecisionLogList entries={decisionLogs} />
            </div>

            {incident.recommendedAction ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <SectionHeading>Recommended action</SectionHeading>
                <p style={{ font: "400 15px/1.5 var(--font-plex-sans)", color: "var(--fg-3)" }}>
                  {incident.recommendedAction}
                </p>
              </div>
            ) : null}

            {incident.explanation ? (
              <Card
                dashed
                tone="surface"
                style={{
                  padding: "16px 18px",
                  borderLeft: "3px solid var(--accent)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <SectionHeading accent note="read-only explanation">
                  Why this severity
                </SectionHeading>
                <p style={{ font: "400 15px/1.55 var(--font-plex-sans)", color: "var(--fg-3)" }}>
                  {incident.explanation}
                </p>
                {incident.reasonBullets.length > 0 ? (
                  <ul style={{ display: "flex", flexDirection: "column", gap: 6, listStyle: "none" }}>
                    {incident.reasonBullets.map((b) => (
                      <li key={b} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            background: "var(--accent)",
                            marginTop: 6,
                            flex: "none",
                          }}
                        />
                        <span style={{ font: "400 13.5px/1.55 var(--font-plex-sans)", color: "var(--fg-4)" }}>
                          {b}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <span style={{ font: "400 11px/1.4 var(--font-plex-mono)", color: "var(--muted)" }}>
                  confidence {incident.confidence?.toFixed(2) ?? "—"} · assessed{" "}
                  {relativeTime(incident.capturedAtIso, tick)} · model {incident.modelVersion ?? "—"} ·{" "}
                  {incident.provenance.replace(/_/g, " ")}
                </span>
              </Card>
            ) : null}

            <HowScoredExplainer incident={incident} />
          </div>
        </div>

        <NearbyStrip currentId={incident.id} />
      </div>
    </div>
  );
}
