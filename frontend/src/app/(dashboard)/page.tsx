"use client";

import dynamic from "next/dynamic";
import { ActiveIncidentsRail } from "@/components/map/ActiveIncidentsRail";
import { RailResizer, useRailWidth } from "@/components/map/RailResizer";

// Leaflet reads `window` at import time, so the map canvas is client-only.
const MapCanvas = dynamic(
  () => import("@/components/map/MapCanvas").then((m) => m.MapCanvas),
  { ssr: false, loading: () => <div style={{ flex: 1, background: "var(--map-bg)" }} /> }
);

export default function MapPage() {
  const [railWidth, setRailWidth] = useRailWidth();
  return (
    <div style={{ display: "flex", height: "100%" }}>
      <MapCanvas />
      <RailResizer width={railWidth} onChange={setRailWidth} />
      <ActiveIncidentsRail width={railWidth} />
    </div>
  );
}
