"use client";

import { useRouter } from "next/navigation";
import { useIncidentStore } from "@/lib/store/useIncidentStore";
import { nearby } from "@/lib/store/selectors";
import { SeverityDot } from "@/components/primitives/SeverityDot";

export function NearbyStrip({ currentId }: { currentId: string }) {
  const router = useRouter();
  const incidents = useIncidentStore((s) => s.incidents);
  const order = useIncidentStore((s) => s.order);
  const items = nearby(incidents, order, currentId, 3);

  if (items.length === 0) return null;

  return (
    <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
      <span
        style={{
          font: "500 10px/1 var(--font-plex-mono)",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--muted)",
        }}
      >
        Nearby
      </span>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {items.map((i) => (
          <button
            key={i.id}
            type="button"
            onClick={() => router.push(`/incident/${i.id}`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--panel)",
              border: "1px solid var(--border-4)",
              padding: "6px 11px",
            }}
          >
            <SeverityDot band={i.band} size={20} />
            <span style={{ font: "600 11px/1 var(--font-plex-mono)", color: "var(--fg-2)" }}>{i.id}</span>
            <span style={{ font: "400 11px/1 var(--font-plex-mono)", color: "var(--muted)" }}>
              {i.distanceKm.toFixed(1)} km
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
