"use client";

import { useRouter } from "next/navigation";
import type { Incident } from "@/lib/types";
import { SeverityDot } from "@/components/primitives/SeverityDot";
import { SeverityChip } from "@/components/primitives/SeverityChip";
import { SourceChip } from "@/components/primitives/SourceChip";
import { confidenceColor } from "@/components/primitives/ConfidenceMeter";
import { relativeTime } from "@/lib/utils/time";
import { useIncidentStore } from "@/lib/store/useIncidentStore";

export function RankedIncidentRow({ incident }: { incident: Incident }) {
  const router = useRouter();
  const tick = useIncidentStore((s) => s.clockTick);
  const newIncidentId = useIncidentStore((s) => s.newIncidentId);
  const hovered = useIncidentStore((s) => s.mapHoverId === incident.id);
  const setMapHoverId = useIncidentStore((s) => s.setMapHoverId);

  return (
    <button
      type="button"
      className="row-btn"
      onClick={() => router.push(`/incident/${incident.id}`)}
      // highlights this incident's marker on the map (and vice versa)
      onMouseEnter={() => setMapHoverId(incident.id)}
      onMouseLeave={() => setMapHoverId(null)}
      onFocus={() => setMapHoverId(incident.id)}
      onBlur={() => setMapHoverId(null)}
      style={{
        display: "grid",
        gridTemplateColumns: "32px 1fr",
        gap: "var(--space-3)",
        alignItems: "start",
        padding: "14px var(--space-5)",
        borderBottom: "1px solid var(--border)",
        background: hovered ? "var(--accent-soft)" : incident.id === newIncidentId ? "var(--tint)" : undefined,
        boxShadow: hovered ? "inset 3px 0 0 var(--accent)" : "none",
      }}
    >
      <SeverityDot band={incident.band} size={32} />
      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-2)" }}>
          <span
            style={{
              font: "600 var(--text-sm)/1.3 var(--font-plex-sans)",
              color: "var(--fg)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {incident.place}
          </span>
          <SeverityChip band={incident.band} />
        </div>
        <div
          className="data"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            font: "400 var(--text-2xs)/1 var(--font-plex-mono)",
            color: "var(--muted)",
          }}
        >
          <span>{incident.id}</span>
          <span aria-hidden>·</span>
          <span>{relativeTime(incident.capturedAtIso, tick)}</span>
          <span aria-hidden>·</span>
          <span style={{ color: incident.confidence ? confidenceColor(incident.confidence) : undefined, fontWeight: 600 }}>
            conf {incident.confidence?.toFixed(2) ?? "–"}
          </span>
          <span style={{ marginLeft: "auto" }}>
            <SourceChip source={incident.source} />
          </span>
        </div>
      </div>
    </button>
  );
}
