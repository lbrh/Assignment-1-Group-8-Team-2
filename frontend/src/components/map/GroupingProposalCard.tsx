"use client";

import { useRouter } from "next/navigation";
import { useIncidentStore } from "@/lib/store/useIncidentStore";
import { Button } from "@/components/primitives/Button";
import { SeverityChip } from "@/components/primitives/SeverityChip";

export function GroupingProposalCard() {
  const router = useRouter();
  const group = useIncidentStore((s) => s.group);
  const incidents = useIncidentStore((s) => s.incidents);
  const confirmGrouping = useIncidentStore((s) => s.confirmGrouping);
  const keepGroupSeparate = useIncidentStore((s) => s.keepGroupSeparate);

  if (!group) return null;

  const members = group.memberIds.map((id) => incidents[id]).filter(Boolean);
  const stateLabel =
    group.state === "confirmed"
      ? "CONFIRMED BY YOU"
      : group.state === "kept_separate"
        ? "KEPT SEPARATE"
        : "AWAITING CONFIRMATION";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          font: "600 10px/1 var(--font-plex-mono)",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--muted)",
        }}
      >
        Grouping suggestion
      </div>
      <div
        style={{
          background: group.state === "suggested" ? "var(--acc-06)" : "var(--tint)",
          border:
            group.state === "suggested" ? "1px dashed var(--accent-border)" : "1px solid var(--border)",
          padding: "11px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 9,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span
            style={{
              font: "600 10px/1 var(--font-plex-mono)",
              letterSpacing: "0.14em",
              color: "var(--accent)",
            }}
          >
            SUGGESTED GROUPING · {group.id}
          </span>
          <span
            style={{
              font: "600 9px/1 var(--font-plex-mono)",
              letterSpacing: "0.1em",
              color: "var(--accent)",
              border: "1px solid var(--accent-border)",
              padding: "4px 6px",
            }}
          >
            {stateLabel}
          </span>
        </div>
        <p style={{ font: "400 12.5px/1.45 var(--font-plex-sans)", color: "var(--fg-4)" }}>
          These detections sit within {group.proximityKm} km of each other and were captured{" "}
          {Math.round(group.windowHours * 60)} minutes apart, so the system reads them as one
          incident.
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {members.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => router.push(`/incident/${m.id}`)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "var(--panel)",
                border: "1px solid var(--border-3)",
                padding: "5px 7px",
              }}
            >
              <span style={{ font: "500 10px/1 var(--font-plex-mono)", color: "var(--fg-3)" }}>
                {m.id}
              </span>
              <SeverityChip band={m.band} />
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {group.state !== "confirmed" ? (
            <Button variant="solid" small onClick={confirmGrouping}>
              Confirm as one incident
            </Button>
          ) : null}
          {group.state !== "kept_separate" ? (
            <Button variant="outline" small onClick={keepGroupSeparate}>
              {group.state === "confirmed" ? "Split into separate incidents" : "Keep separate"}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
