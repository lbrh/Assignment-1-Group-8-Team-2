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

  return (
    <button
      type="button"
      onClick={() => router.push(`/incident/${incident.id}`)}
      style={{
        display: "grid",
        gridTemplateColumns: "36px 1fr",
        gap: 12,
        width: "100%",
        padding: "11px 16px",
        borderBottom: "1px solid var(--border-5)",
        background: incident.id === newIncidentId ? "var(--tint)" : "transparent",
        textAlign: "left",
      }}
    >
      <SeverityDot band={incident.band} size={30} />
      <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SeverityChip band={incident.band} />
          <span
            style={{
              font: "500 12.5px/1.3 var(--font-plex-sans)",
              color: "var(--fg-3)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {incident.place}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            font: "400 10px/1 var(--font-plex-mono)",
            color: "var(--muted)",
          }}
        >
          <span>{incident.id}</span>
          <span>·</span>
          <span>{relativeTime(incident.capturedAtIso, tick)}</span>
          <span>·</span>
          <span style={{ color: incident.confidence ? confidenceColor(incident.confidence) : undefined }}>
            conf {incident.confidence?.toFixed(2) ?? "—"}
          </span>
          <SourceChip source={incident.source} />
        </div>
      </div>
    </button>
  );
}
