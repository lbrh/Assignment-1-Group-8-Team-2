"use client";

import Link from "next/link";
import { useIncidentStore } from "@/lib/store/useIncidentStore";
import { resolvedList } from "@/lib/store/selectors";
import { SeverityDot } from "@/components/primitives/SeverityDot";
import { SeverityChip } from "@/components/primitives/SeverityChip";
import { SOURCE_META } from "@/components/primitives/SourceChip";
import { Button } from "@/components/primitives/Button";
import { PageHeader } from "@/components/chrome/PageHeader";
import { formatClock } from "@/lib/utils/time";

const GRID = "minmax(100px, auto) minmax(180px, 1.3fr) 150px 96px minmax(220px, 1.6fr) minmax(140px, 1fr) 184px";

export default function ResolvedPage() {
  const incidents = useIncidentStore((s) => s.incidents);
  const order = useIncidentStore((s) => s.order);
  const reopenIncident = useIncidentStore((s) => s.reopenIncident);
  const archiveIncident = useIncidentStore((s) => s.archiveIncident);

  const list = resolvedList(incidents, order);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "var(--space-6) var(--space-5) var(--space-7)" }}>
      <PageHeader
        title="Resolved: extinguished"
        lede="Fires a dispatched crew has reported out. They leave the dispatch order, can be reopened if a later image shows re-ignition, and can be archived once they no longer need watching."
        stat={`${list.length} resolved this shift`}
        statTone="ok"
      />

      <div className="card" role="table" aria-label="Resolved incidents" style={{ marginTop: "var(--space-5)", overflow: "hidden" }}>
        <div role="row" className="caption" style={headRow}>
          <span role="columnheader">Incident</span>
          <span role="columnheader">Location</span>
          <span role="columnheader">Peak severity</span>
          <span role="columnheader">Dispatched</span>
          <span role="columnheader">Extinguished</span>
          <span role="columnheader">Reported by</span>
          <span role="columnheader" aria-label="Actions" />
        </div>

        {list.length === 0 ? (
          <p className="caption" style={{ padding: "var(--space-7) var(--space-5)", fontSize: "var(--text-sm)" }}>
            Nothing resolved yet. Dispatch a crew, then mark the incident extinguished from the
            dispatch order or its detail screen when the crew reports it out.
          </p>
        ) : (
          list.map((incident) => (
            <div key={incident.id} role="row" style={bodyRow}>
              <div role="cell">
                <Link
                  href={`/incident/${incident.id}`}
                  className="btn btn--link data"
                  style={{ fontFamily: "var(--font-plex-mono)", fontSize: "var(--text-xs)" }}
                >
                  {incident.id}
                </Link>
              </div>
              <div role="cell" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ font: "600 var(--text-sm)/1.35 var(--font-plex-sans)", color: "var(--fg)" }}>{incident.place}</span>
                <span className="data" style={{ font: "400 var(--text-2xs)/1 var(--font-plex-mono)", color: "var(--muted)" }}>
                  {incident.coords.lat.toFixed(2)}, {incident.coords.lng.toFixed(2)} · {SOURCE_META[incident.source].abbr}
                </span>
              </div>
              <div role="cell" style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", opacity: 0.8 }}>
                <SeverityDot band={incident.band} size={24} />
                <SeverityChip band={incident.band} />
              </div>
              <span role="cell" style={{ font: "400 var(--text-sm)/1.4 var(--font-plex-sans)", color: "var(--fg-2)" }}>
                This shift
              </span>
              <span role="cell" style={{ font: "400 var(--text-sm)/1.5 var(--font-plex-sans)", color: "var(--fg-2)" }}>
                <span className="data" style={{ fontFamily: "var(--font-plex-mono)", fontSize: "var(--text-xs)" }}>
                  {incident.extinguishedAtIso ? `${formatClock(incident.extinguishedAtIso)} AEST` : "–"}
                </span>
                {incident.extinguishedNote ? `. ${incident.extinguishedNote}` : ""}
              </span>
              <span role="cell" style={{ font: "500 var(--text-sm)/1.35 var(--font-plex-sans)", color: "var(--fg-2)" }}>
                {incident.extinguishedBy ?? "–"}
              </span>
              <div role="cell" style={{ justifySelf: "end", display: "flex", gap: "var(--space-2)" }}>
                <Button variant="pending" small ack onClick={() => reopenIncident(incident.id)}>
                  Reopen
                </Button>
                <Button variant="secondary" small ack onClick={() => archiveIncident(incident.id)}>
                  Archive
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
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
