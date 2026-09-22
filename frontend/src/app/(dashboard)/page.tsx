"use client";

import { MapCanvas } from "@/components/map/MapCanvas";
import { ActiveIncidentsRail } from "@/components/map/ActiveIncidentsRail";

export default function MapPage() {
  return (
    <div style={{ display: "flex", height: "100%" }}>
      <MapCanvas />
      <ActiveIncidentsRail />
    </div>
  );
}
