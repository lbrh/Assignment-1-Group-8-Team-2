"use client";

import { useRouter } from "next/navigation";
import { useIncidentStore } from "@/lib/store/useIncidentStore";
import { archiveList } from "@/lib/store/selectors";
import { SeverityDot } from "@/components/primitives/SeverityDot";
import { SourceChip } from "@/components/primitives/SourceChip";
import { Button } from "@/components/primitives/Button";
import { relativeTime } from "@/lib/utils/time";

const GRID = "minmax(96px, auto) 1.4fr auto auto 2fr 1fr auto";

export default function ArchivePage() {
  const router = useRouter();
  const incidents = useIncidentStore((s) => s.incidents);
  const order = useIncidentStore((s) => s.order);
  const tick = useIncidentStore((s) => s.clockTick);
  const restoreFromArchive = useIncidentStore((s) => s.restoreFromArchive);

  const list = archiveList(incidents, order);

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", padding: "20px 24px 40px" }}>
      <button
        type="button"
        onClick={() => router.push("/")}
        style={{
          font: "600 11px/1 var(--font-plex-mono)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--accent)",
          marginBottom: 14,
        }}
      >
        ← Back to map
      </button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ font: "600 22px/1.2 var(--font-plex-sans)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg)" }}>
            Archive · Not a Fire
          </h1>
          <p style={{ font: "400 12.5px/1.4 var(--font-plex-sans)", color: "var(--muted)", marginTop: 6, maxWidth: 620 }}>
            Dismissed images are removed from the map and the dispatch order. Nothing is deleted —
            every record stays retrievable and restorable.
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
          <span style={{ width: 7, height: 7, background: "var(--faint)" }} />
          {list.length} retained for audit
        </span>
      </div>

      <div style={{ border: "1px solid var(--border)", background: "var(--panel)", marginTop: 18 }}>
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
          <span>Image ID</span>
          <span>Location</span>
          <span>Source</span>
          <span>Captured</span>
          <span>Why dismissed</span>
          <span>Decided by</span>
          <span />
        </div>

        {list.length === 0 ? (
          <div style={{ padding: "40px 18px", font: "400 13.5px/1.6 var(--font-plex-sans)", color: "var(--muted)" }}>
            Nothing has been dismissed. Images classified as not a fire, and images a reviewer
            discards, are listed here.
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
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <SeverityDot band="not_a_fire" size={26} />
                <span style={{ font: "600 12px/1 var(--font-plex-mono)", color: "var(--fg-2)" }}>{incident.id}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{ font: "500 13.5px/1.35 var(--font-plex-sans)", color: "var(--fg-3)" }}>{incident.place}</span>
                <span style={{ font: "400 11px/1 var(--font-plex-mono)", color: "var(--muted)" }}>
                  {incident.coords.lat.toFixed(2)},{incident.coords.lng.toFixed(2)} · conf{" "}
                  {incident.confidence?.toFixed(2) ?? "—"}
                </span>
              </div>
              <SourceChip source={incident.source} />
              <span style={{ font: "500 12px/1.4 var(--font-plex-mono)", color: "var(--fg-2)" }}>
                {relativeTime(incident.capturedAtIso, tick)}
              </span>
              <span style={{ font: "400 13px/1.45 var(--font-plex-sans)", color: "var(--fg-3)" }}>
                {incident.dismissedReason}
              </span>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ font: "500 12px/1 var(--font-plex-mono)", color: "var(--fg-2)" }}>{incident.dismissedBy}</span>
                <span style={{ font: "400 11px/1.4 var(--font-plex-mono)", color: "var(--muted)" }}>
                  {incident.dismissedAtIso ? relativeTime(incident.dismissedAtIso, tick) : ""}
                </span>
              </div>
              <Button variant="dashed" small onClick={() => restoreFromArchive(incident.id)}>
                Restore
              </Button>
            </div>
          ))
        )}
      </div>

      {list.length > 0 ? (
        <p style={{ font: "400 12.5px/1.5 var(--font-plex-sans)", color: "var(--muted)", maxWidth: 820, marginTop: 14 }}>
          Restoring returns an image to Manual Review with its provisional tag and confidence
          figure intact. The dismissal stays on the record.
        </p>
      ) : null}
    </div>
  );
}
