"use client";

import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useIncidentStore } from "@/lib/store/useIncidentStore";
import {
  extinguishedMarkers,
  legendCounts,
  mapMarkers,
  reviewQueue,
} from "@/lib/store/selectors";
import { projectToPercent, clusterByProximity } from "@/lib/utils/project";
import { SeverityDot } from "@/components/primitives/SeverityDot";
import { SeverityLegend } from "@/components/map/SeverityLegend";

const ZOOM_LABEL = { 1: "REGIONAL · CLUSTERED", 2: "DISTRICT", 3: "SITE · ALL MARKERS" } as const;
const CLUSTER_THRESHOLD = { 1: 9, 2: 0, 3: 0 } as const; // % canvas distance; 0 disables clustering

export function MapCanvas() {
  const router = useRouter();
  const incidents = useIncidentStore((s) => s.incidents);
  const order = useIncidentStore((s) => s.order);
  const zoom = useIncidentStore((s) => s.zoom);
  const setZoom = useIncidentStore((s) => s.setZoom);
  const mapFilter = useIncidentStore((s) => s.mapFilter);

  const markers = mapMarkers(incidents, order).filter((i) => {
    if (mapFilter === "sev34") return i.band === 3 || i.band === 4;
    return true;
  });
  const extinguished = mapFilter === "extinguished" ? extinguishedMarkers(incidents, order) : [];
  const flaggedCount = reviewQueue(incidents, order).length;
  const counts = legendCounts(incidents, order);

  const points = markers.map((m) => ({ id: m.id, ...projectToPercent(m.coords.lat, m.coords.lng), incident: m }));
  const threshold = CLUSTER_THRESHOLD[zoom];
  const clusters = threshold > 0 ? clusterByProximity(points, threshold) : points.map((p) => [p]);

  const scale = 1 + (zoom - 1) * 0.08;

  return (
    <div
      style={{
        position: "relative",
        flex: 1,
        background: "var(--map-bg)",
        overflow: "hidden",
      }}
    >
      {/* terrain backdrop: a stylised grid, not real geography — two layers per the redline
          (fine 48px, coarse 240px), scaled gently with zoom. Large decorative terrain blobs were
          tried and dropped: at this contrast they read as solid shapes competing with markers
          rather than texture, so legibility won over decorative fidelity here. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${scale})`,
          transition: "transform .25s ease",
          backgroundImage:
            "linear-gradient(var(--ter-line) 1px, transparent 1px)," +
            "linear-gradient(90deg, var(--ter-line) 1px, transparent 1px)," +
            "linear-gradient(var(--ter-line-2) 1px, transparent 1px)," +
            "linear-gradient(90deg, var(--ter-line-2) 1px, transparent 1px)",
          backgroundSize: "48px 48px, 48px 48px, 240px 240px, 240px 240px",
        }}
      />
      <span
        style={{
          position: "absolute",
          left: "8%",
          top: "44%",
          font: "500 10px/1 var(--font-plex-mono)",
          letterSpacing: "0.16em",
          color: "var(--muted)",
        }}
      >
        HUME FWY
      </span>
      <span
        style={{
          position: "absolute",
          left: "62%",
          top: "18%",
          font: "500 10px/1 var(--font-plex-mono)",
          letterSpacing: "0.16em",
          color: "var(--muted)",
        }}
      >
        KINGLAKE NP
      </span>

      <div
        style={{
          position: "absolute",
          left: 12,
          top: 12,
          background: "var(--halo)",
          border: "1px solid var(--border-3)",
          padding: "7px 11px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          font: "600 10px/1 var(--font-plex-mono)",
        }}
      >
        <span style={{ letterSpacing: "0.16em", color: "var(--accent)" }}>SECTOR 7 · VIC</span>
        <span style={{ borderLeft: "1px solid var(--border-6)", height: 12 }} />
        <span style={{ letterSpacing: "0.1em", color: "var(--muted)", fontWeight: 500 }}>
          {ZOOM_LABEL[zoom]}
        </span>
      </div>

      <div style={{ position: "absolute", right: 12, top: 12, display: "flex", gap: 6 }}>
        <button
          type="button"
          onClick={() => setZoom(Math.max(1, zoom - 1) as 1 | 2 | 3)}
          aria-label="Zoom out"
          style={zoomBtnStyle}
        >
          −
        </button>
        <button
          type="button"
          onClick={() => setZoom(Math.min(3, zoom + 1) as 1 | 2 | 3)}
          aria-label="Zoom in"
          style={zoomBtnStyle}
        >
          +
        </button>
        <div style={{ ...zoomBtnStyle, cursor: "default", color: "var(--muted)" }}>Z{zoom}</div>
      </div>

      {clusters.map((cluster) => {
        if (cluster.length === 1) {
          const point = cluster[0];
          const incident = point.incident;
          return (
            <button
              key={point.id}
              type="button"
              onClick={() => router.push(`/incident/${incident.id}`)}
              style={{
                position: "absolute",
                left: `${point.x}%`,
                top: `${point.y}%`,
                transform: "translate(-50%, -50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
              title={`${incident.id} · ${incident.place}`}
            >
              <SeverityDot band={incident.band} halo />
              <span
                style={{
                  font: "500 10px/1 var(--font-plex-mono)",
                  color: "var(--fg-4)",
                  background: "var(--halo)",
                  border: "1px solid var(--border-3)",
                  padding: "2px 5px",
                }}
              >
                {incident.id}
              </span>
            </button>
          );
        }

        const cx = cluster.reduce((s, p) => s + p.x, 0) / cluster.length;
        const cy = cluster.reduce((s, p) => s + p.y, 0) / cluster.length;
        const maxBand = Math.max(...cluster.map((p) => p.incident.band as number));
        const ringVar =
          maxBand === 4
            ? "var(--sev4-ring)"
            : maxBand === 3
              ? "var(--sev3-ring)"
              : maxBand === 2
                ? "var(--sev2-ring)"
                : "var(--sev1-ring)";
        const size = 40 + cluster.length * 4;
        return (
          <button
            key={cluster.map((p) => p.id).join("-")}
            type="button"
            onClick={() => setZoom(Math.min(3, zoom + 1) as 1 | 2 | 3)}
            title={`${cluster.length} sites in this area · click to expand`}
            style={{
              position: "absolute",
              left: `${cx}%`,
              top: `${cy}%`,
              transform: "translate(-50%, -50%)",
              width: size,
              height: size,
              background: "var(--map-bg)",
              border: `2px solid ${ringVar}`,
              boxShadow: "0 0 0 4px var(--halo), 0 3px 12px var(--shadow-color)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ font: "700 17px/1 var(--font-plex-mono)", color: ringVar }}>
              {cluster.length}
            </span>
            <span
              style={{
                font: "600 9px/1 var(--font-plex-mono)",
                letterSpacing: "0.12em",
                color: "var(--muted)",
              }}
            >
              SITES
            </span>
          </button>
        );
      })}

      {extinguished.map((incident) => {
        const p = projectToPercent(incident.coords.lat, incident.coords.lng);
        return (
          <div
            key={incident.id}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              opacity: 0.45,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: "2px dashed var(--border-7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                font: "700 9px/1 var(--font-plex-mono)",
                color: "var(--faint)",
              }}
            >
              OUT
            </div>
          </div>
        );
      })}

      <SeverityLegend counts={counts} />

      {flaggedCount > 0 ? (
        <button
          type="button"
          onClick={() => router.push("/review")}
          style={{
            position: "absolute",
            left: 274,
            bottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--acc-06)",
            border: "1px dashed var(--accent-border)",
            padding: "10px 14px",
            font: "400 11px/1.3 var(--font-plex-mono)",
            color: "var(--accent-fg)",
          }}
        >
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              border: "2px dashed var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "none",
            }}
          >
            ?
          </span>
          {flaggedCount} flagged · not drawn on the map until reviewed
          <span style={{ color: "var(--accent)", fontWeight: 600 }}>→</span>
        </button>
      ) : null}
    </div>
  );
}

const zoomBtnStyle: CSSProperties = {
  width: 30,
  height: 30,
  background: "var(--halo)",
  border: "1px solid var(--border-2)",
  color: "var(--fg-4)",
  font: "500 15px/1 var(--font-plex-mono)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
