"use client";

import { useIncidentStore } from "@/lib/store/useIncidentStore";
import { archiveList } from "@/lib/store/selectors";
import { SeverityDot } from "@/components/primitives/SeverityDot";
import { SourceChip } from "@/components/primitives/SourceChip";
import { Button } from "@/components/primitives/Button";
import { relativeTime } from "@/lib/utils/time";
import { PageHeader } from "@/components/chrome/PageHeader";

const GRID = "minmax(110px, auto) minmax(180px, 1.3fr) 88px 96px minmax(220px, 2fr) minmax(140px, 1fr) 96px";

export default function ArchivePage() {
  const incidents = useIncidentStore((s) => s.incidents);
  const order = useIncidentStore((s) => s.order);
  const tick = useIncidentStore((s) => s.clockTick);
  const restoreFromArchive = useIncidentStore((s) => s.restoreFromArchive);

  const list = archiveList(incidents, order);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "var(--space-6) var(--space-5) var(--space-7)" }}>
      <PageHeader
        title="Archive: not a fire"
        lede="Dismissed images are removed from the map and the dispatch order. Nothing is deleted, and every record can be restored."
        stat={`${list.length} retained for audit`}
      />

      <div className="card" role="table" aria-label="Archived images" style={{ marginTop: "var(--space-5)", overflow: "hidden" }}>
        <div role="row" className="caption" style={headRow}>
          <span role="columnheader">Image</span>
          <span role="columnheader">Location</span>
          <span role="columnheader">Source</span>
          <span role="columnheader">Captured</span>
          <span role="columnheader">Why dismissed</span>
          <span role="columnheader">Decided by</span>
          <span role="columnheader" aria-label="Actions" />
        </div>

        {list.length === 0 ? (
          <p className="caption" style={{ padding: "var(--space-7) var(--space-5)", fontSize: "var(--text-sm)" }}>
            Nothing has been dismissed. Images classified as not a fire, and images a reviewer
            discards, are listed here.
          </p>
        ) : (
          list.map((incident) => (
            <div key={incident.id} role="row" style={bodyRow}>
              <div role="cell" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <SeverityDot band="not_a_fire" size={26} />
                <span className="data" style={{ font: "600 var(--text-xs)/1 var(--font-plex-mono)", color: "var(--fg-2)" }}>
                  {incident.id}
                </span>
              </div>
              <div role="cell" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ font: "600 var(--text-sm)/1.35 var(--font-plex-sans)", color: "var(--fg)" }}>{incident.place}</span>
                <span className="data" style={{ font: "400 var(--text-2xs)/1 var(--font-plex-mono)", color: "var(--muted)" }}>
                  {incident.coords.lat.toFixed(2)}, {incident.coords.lng.toFixed(2)} · conf {incident.confidence?.toFixed(2) ?? "–"}
                </span>
              </div>
              <div role="cell">
                <SourceChip source={incident.source} />
              </div>
              <span role="cell" style={{ font: "400 var(--text-sm)/1.4 var(--font-plex-sans)", color: "var(--fg-2)" }}>
                {relativeTime(incident.capturedAtIso, tick)}
              </span>
              <span role="cell" style={{ font: "400 var(--text-sm)/1.5 var(--font-plex-sans)", color: "var(--fg-2)" }}>
                {incident.dismissedReason ?? "–"}
              </span>
              <div role="cell" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ font: "500 var(--text-sm)/1.35 var(--font-plex-sans)", color: "var(--fg-2)" }}>{incident.dismissedBy ?? "–"}</span>
                <span className="caption" style={{ fontSize: 12 }}>
                  {incident.dismissedAtIso ? relativeTime(incident.dismissedAtIso, tick) : ""}
                </span>
              </div>
              <div role="cell" style={{ justifySelf: "end" }}>
                <Button variant="pending" small onClick={() => restoreFromArchive(incident.id)}>
                  Restore
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {list.length > 0 ? (
        <p className="caption" style={{ marginTop: "var(--space-4)", maxWidth: "80ch" }}>
          Restoring returns an image to Manual review with its provisional tag and confidence
          figure intact. The dismissal stays on the record.
        </p>
      ) : null}
    </div>
  );
}

const headRow = {
  display: "grid",
  gridTemplateColumns: GRID,
  gap: "var(--space-4)",
  padding: "10px var(--space-5)",
  background: "var(--surface)",
  borderBottom: "1px solid var(--border)",
} as const;

const bodyRow = {
  display: "grid",
  gridTemplateColumns: GRID,
  gap: "var(--space-4)",
  padding: "var(--space-4) var(--space-5)",
  borderBottom: "1px solid var(--border)",
  alignItems: "center",
} as const;
