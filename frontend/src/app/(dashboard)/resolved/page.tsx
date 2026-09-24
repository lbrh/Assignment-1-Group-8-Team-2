"use client";

import { useRouter } from "next/navigation";
import { useIncidentStore } from "@/lib/store/useIncidentStore";
import { resolvedList } from "@/lib/store/selectors";
import { SeverityDot } from "@/components/primitives/SeverityDot";
import { SeverityChip } from "@/components/primitives/SeverityChip";
import { Button } from "@/components/primitives/Button";
import { formatClock } from "@/lib/utils/time";

const GRID = "minmax(96px, auto) 1.4fr auto auto 1.6fr 1fr auto";

export default function ResolvedPage() {
  const router = useRouter();
  const incidents = useIncidentStore((s) => s.incidents);
  const order = useIncidentStore((s) => s.order);
  const reopenIncident = useIncidentStore((s) => s.reopenIncident);

  const list = resolvedList(incidents, order);

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", padding: "20px 24px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ font: "600 22px/1.2 var(--font-plex-sans)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg)" }}>
            Resolved · Extinguished
          </h1>
          <p style={{ font: "400 12.5px/1.4 var(--font-plex-sans)", color: "var(--muted)", marginTop: 6, maxWidth: 620 }}>
            Fires a dispatched crew has reported out. Off the dispatch order, shown on the map
            only under the Extinguished filter, and reopenable if a later image shows re-ignition.
          </p>
        </div>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--panel)",
            border: "1px solid var(--border-3)",
            padding: "8px 13px",
            font: "500 11px/1 var(--font-plex-mono)",
            color: "var(--muted)",
          }}
        >
          <span style={{ width: 7, height: 7, background: "var(--ok-fg)" }} />
          {list.length} resolved this shift
        </span>
      </div>

      <div style={{ border: "var(--border-w) solid var(--border)", background: "var(--panel)", marginTop: 18 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: GRID,
            gap: 14,
            padding: "11px 18px",
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            font: "600 10px/1 var(--font-plex-mono)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          <span>Incident</span>
          <span>Location</span>
          <span>Peak sev</span>
          <span>Dispatched</span>
          <span>Extinguished</span>
          <span>Reported by</span>
          <span />
        </div>

        {list.length === 0 ? (
          <div style={{ padding: "40px 18px", font: "400 13.5px/1.6 var(--font-plex-sans)", color: "var(--muted)" }}>
            Nothing resolved yet. Dispatch a crew, then mark the incident extinguished from the
            dispatch order or its detail screen when the crew reports it out.
          </div>
        ) : (
          list.map((incident) => (
            <div
              key={incident.id}
              style={{
                display: "grid",
                gridTemplateColumns: GRID,
                gap: 14,
                padding: "14px 18px",
                borderBottom: "1px solid var(--border-5)",
                alignItems: "center",
              }}
            >
              <button
                type="button"
                onClick={() => router.push(`/incident/${incident.id}`)}
                style={{ font: "600 12px/1 var(--font-plex-mono)", color: "var(--accent)", textAlign: "left" }}
              >
                {incident.id}
              </button>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{ font: "500 13.5px/1.35 var(--font-plex-sans)", color: "var(--fg-3)" }}>{incident.place}</span>
                <span style={{ font: "400 11px/1 var(--font-plex-mono)", color: "var(--muted)" }}>
                  {incident.coords.lat.toFixed(2)},{incident.coords.lng.toFixed(2)} · {incident.source}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, opacity: 0.7 }}>
                <SeverityDot band={incident.band} size={24} />
                <SeverityChip band={incident.band} />
              </div>
              <span style={{ font: "500 12px/1.4 var(--font-plex-mono)", color: "var(--fg-2)" }}>this shift</span>
              <span style={{ font: "400 13px/1.45 var(--font-plex-sans)", color: "var(--fg-3)" }}>
                {incident.extinguishedAtIso ? formatClock(incident.extinguishedAtIso) : "—"} AEST ·{" "}
                {incident.extinguishedNote}
              </span>
              <span style={{ font: "500 12px/1 var(--font-plex-mono)", color: "var(--fg-2)" }}>
                {incident.extinguishedBy}
              </span>
              <Button variant="dashed" small onClick={() => reopenIncident(incident.id)}>
                Reopen
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
