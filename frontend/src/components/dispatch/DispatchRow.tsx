"use client";

import { useRouter } from "next/navigation";
import type { Incident } from "@/lib/types";
import { SeverityDot } from "@/components/primitives/SeverityDot";
import { SeverityChip } from "@/components/primitives/SeverityChip";
import { confidenceColor } from "@/components/primitives/ConfidenceMeter";
import { Button } from "@/components/primitives/Button";
import { relativeTime } from "@/lib/utils/time";
import { useIncidentStore } from "@/lib/store/useIncidentStore";
import { SOURCE_META } from "@/components/primitives/SourceChip";

export const DISPATCH_GRID = "44px 104px minmax(180px, 1fr) minmax(220px, 1.5fr) 64px 72px 136px";

export function DispatchRow({ incident, rank }: { incident: Incident; rank: number | null }) {
  const router = useRouter();
  const tick = useIncidentStore((s) => s.clockTick);
  const dispatchCrew = useIncidentStore((s) => s.dispatchCrew);
  const markExtinguished = useIncidentStore((s) => s.markExtinguished);
  const isLive = incident.dispatch === "live";
  const isNext = rank === 1;

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={`${rank ? `Rank ${rank}, ` : "Live, "}${incident.place}, open incident`}
      className="row-btn"
      onClick={() => router.push(`/incident/${incident.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target === e.currentTarget) router.push(`/incident/${incident.id}`);
      }}
      style={{
        display: "grid",
        gridTemplateColumns: DISPATCH_GRID,
        gap: "var(--space-4)",
        alignItems: "center",
        padding: "var(--space-4) var(--space-5)",
        borderBottom: "1px solid var(--border)",
        cursor: "pointer",
        background: isNext ? "var(--grad-pending)" : undefined,
      }}
    >
      {isLive ? (
        <span className="chip chip--pill" style={{ color: "var(--ok-fg)", background: "var(--ok-soft)", borderColor: "var(--ok-border)", justifySelf: "start" }}>
          Live
        </span>
      ) : (
        <span
          className="data"
          style={{
            font: "700 var(--text-xl)/1 var(--font-plex-mono)",
            letterSpacing: "var(--tracking-tight)",
            color: isNext ? "var(--accent)" : "var(--fg)",
          }}
        >
          {rank ?? "–"}
        </span>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <SeverityDot band={incident.band} size={30} />
        <SeverityChip band={incident.band} short />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
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
        <span className="data" style={{ font: "400 var(--text-2xs)/1.3 var(--font-plex-mono)", color: "var(--muted)" }}>
          {incident.id} · {incident.coords.lat.toFixed(2)}, {incident.coords.lng.toFixed(2)} · {SOURCE_META[incident.source].abbr}
        </span>
        <span className="caption" style={{ fontSize: 12 }}>
          Captured {relativeTime(incident.capturedAtIso, tick)}
        </span>
      </div>
      <span style={{ font: "400 var(--text-sm)/1.5 var(--font-plex-sans)", color: "var(--fg-2)" }}>
        {isLive
          ? "Crew assigned. Stays live until the crew reports the fire out."
          : incident.recommendedAction ?? "Ranked by severity, then distance from staging."}
      </span>
      <span
        className="data"
        style={{
          font: "600 var(--text-sm)/1 var(--font-plex-mono)",
          color: incident.confidence ? confidenceColor(incident.confidence) : "var(--muted)",
        }}
      >
        {incident.confidence?.toFixed(2) ?? "–"}
      </span>
      <span className="data" style={{ font: "500 var(--text-sm)/1 var(--font-plex-mono)", color: "var(--fg-2)" }}>
        {incident.distanceKm.toFixed(1)} km
      </span>
      <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} style={{ justifySelf: "end" }}>
        {isLive ? (
          <Button variant="secondary" small onClick={() => markExtinguished(incident.id)}>
            Mark extinguished
          </Button>
        ) : (
          <Button variant={isNext ? "primary" : "secondary"} small onClick={() => dispatchCrew(incident.id)}>
            Dispatch crew
          </Button>
        )}
      </div>
    </div>
  );
}
