"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import L from "leaflet";
import { useIncidentStore, type ZoomTier } from "@/lib/store/useIncidentStore";
import {
  extinguishedMarkers,
  legendCounts,
  mapMarkers,
} from "@/lib/store/selectors";
import { SEVERITY } from "@/lib/constants/severity";
import { STAGING_COORDS, distanceKm } from "@/lib/utils/geo";
import { clusterByProximity } from "@/lib/utils/project";
import { SeverityLegend } from "@/components/map/SeverityLegend";
import type { Incident, SeverityBand } from "@/lib/types";

/**
 * Leaflet is imperative and touches `window` on import, so this module is only ever loaded
 * client-side (see the `ssr: false` dynamic import in the Map page). Everything the map draws
 * is derived from the incident store on each change (Leaflet owns the viewport, the store owns
 * the data), and the store's coarse `zoom` tier / `mapView` are written back from Leaflet's
 * events so the rest of the UI (legend header, tab-return) stays in step.
 */

const ZOOM_LABEL = { 1: "Regional, clustered", 2: "District", 3: "Site, all markers" } as const;
const CLUSTER_THRESHOLD_PX = { 1: 64, 2: 0, 3: 0 } as const; // screen px; 0 disables clustering
const MIN_ZOOM = 8;
const MAX_ZOOM = 19;
const INITIAL_MAX_ZOOM = 12;

const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function tierFor(leafletZoom: number): ZoomTier {
  if (leafletZoom <= 10) return 1;
  if (leafletZoom <= 12) return 2;
  return 3;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function incidentIcon(incident: Incident): L.DivIcon {
  const meta = SEVERITY[incident.band as SeverityBand];
  const d = meta.dotDiameter;
  return L.divIcon({
    className: "fori-marker",
    iconSize: [d, d],
    iconAnchor: [d / 2, d / 2],
    html:
      `<div class="fori-pin">` +
      `<div class="fori-dot" style="background:${meta.fillVar};color:${meta.textVar};` +
      `border:${meta.ringWidth}px solid ${meta.ringVar};font-size:${meta.numeralFont}px">` +
      `${incident.band}</div>` +
      `<span class="fori-label">${escapeHtml(incident.id)}</span>` +
      `</div>`,
  });
}

function clusterIcon(count: number, maxBand: SeverityBand): L.DivIcon {
  const size = 40 + count * 4;
  const ring = SEVERITY[maxBand].ringVar;
  return L.divIcon({
    className: "fori-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html:
      `<div class="fori-cluster" style="border-color:${ring}">` +
      `<span class="fori-cluster-count" style="color:${ring}">${count}</span>` +
      `<span class="fori-cluster-caption">sites</span>` +
      `</div>`,
  });
}

const extinguishedIcon = () =>
  L.divIcon({
    className: "fori-marker fori-marker-out",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    html: `<div class="fori-out">Out</div>`,
  });

export function MapCanvas() {
  const router = useRouter();
  const incidents = useIncidentStore((s) => s.incidents);
  const order = useIncidentStore((s) => s.order);
  const zoom = useIncidentStore((s) => s.zoom);
  const setZoom = useIncidentStore((s) => s.setZoom);
  const setMapView = useIncidentStore((s) => s.setMapView);
  const mapFilter = useIncidentStore((s) => s.mapFilter);
  const mapHoverId = useIncidentStore((s) => s.mapHoverId);
  const setMapHoverId = useIncidentStore((s) => s.setMapHoverId);
  const setAlertsPanelOpen = useIncidentStore((s) => s.setAlertsPanelOpen);
  const newIncidentId = useIncidentStore((s) => s.newIncidentId);
  const group = useIncidentStore((s) => s.group);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const overlayLayerRef = useRef<L.LayerGroup | null>(null);
  /** incident id -> the marker currently representing it (its own pin, or its cluster). */
  const markerByIdRef = useRef<Map<string, L.Marker>>(new Map());
  const [leafletZoom, setLeafletZoom] = useState<number | null>(null);

  const counts = legendCounts(incidents, order);

  // Map lifecycle: create once, tear down on unmount.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const state = useIncidentStore.getState();

    const map = L.map(container, {
      zoomControl: false,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      attributionControl: true,
    });
    map.attributionControl.setPrefix(false);

    if (state.mapView) {
      map.setView(state.mapView.center, state.mapView.zoom);
    } else {
      const coords = mapMarkers(state.incidents, state.order).map(
        (i) => [i.coords.lat, i.coords.lng] as [number, number]
      );
      // nothing to frame yet: centre on the staging ground rather than an empty (invalid) bounds
      if (coords.length === 0) coords.push([STAGING_COORDS.lat, STAGING_COORDS.lng]);
      map.fitBounds(L.latLngBounds(coords), { padding: [56, 56], maxZoom: INITIAL_MAX_ZOOM });
    }

    L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: MAX_ZOOM }).addTo(map);
    overlayLayerRef.current = L.layerGroup().addTo(map);
    markerLayerRef.current = L.layerGroup().addTo(map);

    const syncZoom = () => {
      setLeafletZoom(map.getZoom());
      setZoom(tierFor(map.getZoom()));
    };
    const syncView = () => {
      const c = map.getCenter();
      setMapView({ center: [c.lat, c.lng], zoom: map.getZoom() });
    };
    map.on("zoomend", syncZoom);
    map.on("moveend", syncView);
    syncZoom();
    syncView();

    // The canvas is a flex child, so keep Leaflet's cached size in step with the layout.
    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(container);

    mapRef.current = map;
    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
      overlayLayerRef.current = null;
      markerByIdRef.current = new Map();
      useIncidentStore.getState().setMapHoverId(null);
    };
  }, [setZoom, setMapView]);

  // Incident markers: rebuilt from the store whenever the data, filter or zoom level changes.
  useEffect(() => {
    const map = mapRef.current;
    const layer = markerLayerRef.current;
    if (!map || !layer || leafletZoom === null) return;

    layer.clearLayers();
    const markerById = new Map<string, L.Marker>();

    const markers = mapMarkers(incidents, order).filter((i) => {
      if (mapFilter === "sev34") return i.band === 3 || i.band === 4;
      return true;
    });
    const points = markers.map((incident) => {
      const p = map.project([incident.coords.lat, incident.coords.lng], leafletZoom);
      return { id: incident.id, x: p.x, y: p.y, incident };
    });
    const threshold = CLUSTER_THRESHOLD_PX[tierFor(leafletZoom)];
    const clusters = threshold > 0 ? clusterByProximity(points, threshold) : points.map((p) => [p]);

    const wireHover = (marker: L.Marker, id: string) => {
      marker.on("mouseover", () => setMapHoverId(id));
      marker.on("mouseout", () => setMapHoverId(null));
      const el = marker.getElement();
      el?.addEventListener("focus", () => setMapHoverId(id));
      el?.addEventListener("blur", () => setMapHoverId(null));
    };

    for (const cluster of clusters) {
      if (cluster.length === 1) {
        const incident = cluster[0].incident;
        const label = `${incident.id} · ${incident.place}`;
        const marker = L.marker([incident.coords.lat, incident.coords.lng], {
          icon: incidentIcon(incident),
          title: label,
          riseOnHover: true,
          zIndexOffset: (incident.band as number) * 100,
        })
          .on("click", () => router.push(`/incident/${incident.id}`))
          .addTo(layer);
        marker.getElement()?.setAttribute("aria-label", `${label}, ${SEVERITY[incident.band as SeverityBand].label}`);
        if (incident.id === newIncidentId) marker.getElement()?.classList.add("is-new");
        wireHover(marker, incident.id);
        markerById.set(incident.id, marker);
        continue;
      }

      const members = cluster.map((p) => p.incident);
      const bounds = L.latLngBounds(members.map((i) => [i.coords.lat, i.coords.lng]));
      const maxBand = Math.max(...members.map((i) => i.band as number)) as SeverityBand;
      const label = `${members.length} sites in this area · click to expand`;
      const marker = L.marker(bounds.getCenter(), {
        icon: clusterIcon(members.length, maxBand),
        title: label,
        zIndexOffset: 1000,
      })
        .on("click", () =>
          map.flyToBounds(bounds, {
            padding: [80, 80],
            maxZoom: Math.max(map.getZoom() + 2, 11),
            duration: 0.4,
          })
        )
        .addTo(layer);
      marker.getElement()?.setAttribute("aria-label", label);
      for (const incident of members) markerById.set(incident.id, marker);
    }

    if (mapFilter === "extinguished") {
      for (const incident of extinguishedMarkers(incidents, order)) {
        L.marker([incident.coords.lat, incident.coords.lng], {
          icon: extinguishedIcon(),
          interactive: false,
          keyboard: false,
          zIndexOffset: -500,
        }).addTo(layer);
      }
    }

    markerByIdRef.current = markerById;
    applyHover(markerById, useIncidentStore.getState().mapHoverId);
  }, [leafletZoom, incidents, order, mapFilter, newIncidentId, router, setMapHoverId]);

  // Pending grouping suggestion: a dashed ring around its members that opens the proposal card.
  useEffect(() => {
    const layer = overlayLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (!group || group.state !== "suggested") return;

    // only members already drawn on the map: a ring centred partly on a flagged image would
    // leak the location the "never drawn on the map" rule is keeping off it
    const onMap = new Set(mapMarkers(incidents, order).map((i) => i.id));
    const members = group.memberIds.filter((id) => onMap.has(id)).map((id) => incidents[id]);
    if (members.length < 2) return;
    const center = {
      lat: members.reduce((s, i) => s + i.coords.lat, 0) / members.length,
      lng: members.reduce((s, i) => s + i.coords.lng, 0) / members.length,
    };
    const radiusM = Math.max(...members.map((i) => distanceKm(i.coords, center))) * 1000 + 600;

    L.circle([center.lat, center.lng], {
      radius: radiusM,
      className: "fori-group-ring",
      bubblingMouseEvents: false,
    })
      .bindTooltip(`Grouping suggested · ${members.length} images · click to review`, {
        direction: "top",
        className: "fori-tooltip",
      })
      .on("click", () => setAlertsPanelOpen(true))
      .addTo(layer);
  }, [group, incidents, order, setAlertsPanelOpen]);

  // Hover linkage with the Active Incidents rail.
  useEffect(() => {
    applyHover(markerByIdRef.current, mapHoverId);
  }, [mapHoverId]);

  const atMin = leafletZoom !== null && leafletZoom <= MIN_ZOOM;
  const atMax = leafletZoom !== null && leafletZoom >= MAX_ZOOM;

  return (
    <div
      style={{
        position: "relative",
        flex: 1,
        minWidth: 0,
        background: "var(--map-bg)",
        overflow: "hidden",
        // keeps Leaflet's internal z-indexes (panes at 400+, controls at 800+) below the
        // app's fixed toasts / shortcut panel
        isolation: "isolate",
      }}
    >
      <div
        ref={containerRef}
        className="fori-map"
        aria-label="Incident map. Arrow keys pan, plus and minus zoom."
        style={{ position: "absolute", inset: 0, zIndex: 0 }}
      />

      <div
        className="card"
        style={{
          position: "absolute",
          left: "var(--space-4)",
          top: "var(--space-4)",
          zIndex: 1,
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          boxShadow: "var(--shadow-pop)",
          borderRadius: "var(--radius-md)",
        }}
      >
        <span style={{ font: "600 var(--text-xs)/1 var(--font-plex-sans)", color: "var(--fg)" }}>Sector 7, VIC</span>
        <span aria-hidden style={{ borderLeft: "1px solid var(--border-2)", height: 14 }} />
        <span className="caption">{ZOOM_LABEL[zoom]}</span>
      </div>

      <div
        className="card"
        style={{
          position: "absolute",
          right: "var(--space-4)",
          top: "var(--space-4)",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: 3,
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-pop)",
        }}
      >
        <button
          type="button"
          className="icon-btn icon-btn--bare"
          onClick={() => mapRef.current?.zoomOut()}
          disabled={atMin}
          aria-label="Zoom out"
          style={{ fontSize: 18 }}
        >
          −
        </button>
        <span
          className="data"
          aria-label={`Zoom level ${leafletZoom ?? "unknown"}`}
          style={{ minWidth: 34, textAlign: "center", font: "500 var(--text-2xs)/1 var(--font-plex-mono)", color: "var(--muted)" }}
        >
          Z{leafletZoom ?? "–"}
        </span>
        <button
          type="button"
          className="icon-btn icon-btn--bare"
          onClick={() => mapRef.current?.zoomIn()}
          disabled={atMax}
          aria-label="Zoom in"
          style={{ fontSize: 18 }}
        >
          +
        </button>
      </div>

      <SeverityLegend counts={counts} />
    </div>
  );
}

function applyHover(markerById: Map<string, L.Marker>, hoverId: string | null) {
  const hovered = hoverId ? markerById.get(hoverId) : undefined;
  for (const marker of new Set(markerById.values())) {
    marker.getElement()?.classList.toggle("is-hover", marker === hovered);
  }
}
