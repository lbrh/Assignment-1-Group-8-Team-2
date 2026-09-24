"use client";

import { useIncidentStore } from "@/lib/store/useIncidentStore";
import { archiveList } from "@/lib/store/selectors";
import { SeverityDot } from "@/components/primitives/SeverityDot";
import { SourceChip } from "@/components/primitives/SourceChip";
import { Button } from "@/components/primitives/Button";
import { relativeTime } from "@/lib/utils/time";
import { PageHeader } from "@/components/chrome/PageHeader";

// one grid for the whole table (rows are subgrids, see .data-table), so columns line up
const GRID = "auto minmax(160px, 1.2fr) auto auto minmax(200px, 2fr) minmax(140px, 1fr) auto";

export default function ArchivePage() {
  const incidents = useIncidentStore((s) => s.incidents);
  const order = useIncidentStore((s) => s.order);
  const tick = useIncidentStore((s) => s.clockTick);
  const restoreFromArchive = useIncidentStore((s) => s.restoreFromArchive);

  const list = archiveList(incidents, order);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "var(--space-6) var(--space-5) var(--space-7)" }}>
      <PageHeader
        title="Archive"
        lede="Images dismissed as not a fire, and extinguished fires filed away from Resolved. Nothing is deleted, and every record can be restored."
        stat={`${list.length} retained for audit`}
      />

      <div className="card data-table" role="table" aria-label="Archived images" style={{ marginTop: "var(--space-5)", gridTemplateColumns: GRID }}>
        <div role="row" className="caption data-table__row data-table__head">
          <span role="columnheader">Image</span>
          <span role="columnheader">Location</span>
          <span role="columnheader">Source</span>
          <span role="columnheader">Captured</span>
          <span role="columnheader">Why archived</span>
          <span role="columnheader">Decided by</span>
          <span role="columnheader" aria-label="Actions" />
        </div>

        {list.length === 0 ? (
          <p className="caption" style={{ gridColumn: "1 / -1", padding: "var(--space-7) var(--space-5)", fontSize: "var(--text-sm)" }}>
            Nothing archived yet. Images discarded as not a fire, and extinguished fires archived
            from Resolved, are listed here.
          </p>
        ) : (
          list.map((incident) => (
            <div key={incident.id} role="row" className="data-table__row">
              <div role="cell" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <SeverityDot band={incident.dispatch === "archived" ? incident.band : "not_a_fire"} size={26} />
                <span className="data" style={{ font: "600 var(--text-xs)/1 var(--font-plex-mono)", color: "var(--fg-2)" }}>
                  {incident.ref}
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
                <Button variant="pending" small ack onClick={() => restoreFromArchive(incident.id)}>
                  Restore
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {list.length > 0 ? (
        <p className="caption" style={{ marginTop: "var(--space-4)", maxWidth: "80ch" }}>
          Restoring a dismissed image returns it to Manual review with its provisional tag and
          confidence intact; restoring an archived fire returns it to Resolved. Either way the
          decision stays on the record.
        </p>
      ) : null}
    </div>
  );
}
