'use client'

import 'leaflet/dist/leaflet.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { divIcon } from 'leaflet'
import { MOCK_INCIDENTS } from '@/features/incidents/data'
import type { MockIncident } from '@/features/incidents/types'

const SEVERITY_MARKER_COLOR: Record<MockIncident['severity'], string> = {
  1: '#facc15',
  2: '#f59e0b',
  3: '#f97316',
  4: '#ef4444',
}

function severityIcon(severity: MockIncident['severity']) {
  return divIcon({
    html: `<div style="
      background:${SEVERITY_MARKER_COLOR[severity]};
      width:28px;height:28px;border-radius:9999px;
      display:flex;align-items:center;justify-content:center;
      color:white;font-weight:700;font-size:13px;
      border:2px solid rgba(0,0,0,0.4);
    ">${severity}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

// Centred on the mock incident cluster (Broadford/Kinglake area, VIC) — will
// need a real default centre once real incident data replaces the mock set.
export function IncidentsMap() {
  return (
    <MapContainer center={[-37.4, 145.2]} zoom={9} scrollWheelZoom className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerClusterGroup chunkedLoading>
        {MOCK_INCIDENTS.map((incident) => (
          <Marker
            key={incident.id}
            position={[incident.latitude, incident.longitude]}
            icon={severityIcon(incident.severity)}
          >
            <Popup>
              <strong>{incident.title}</strong>
              <br />
              {incident.tag} · {incident.id}
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  )
}
