"use client";

import { useIncidentStore } from "@/lib/store/useIncidentStore";
import { reviewQueue } from "@/lib/store/selectors";
import { relativeTime } from "@/lib/utils/time";
import { HatchBanner } from "@/components/primitives/HatchBanner";

const REASON_LABEL: Record<string, string> = {
  below_threshold: "below 0.75",
  sent_by_coordinator: "sent by coordinator",
  restored_not_fire: "restored · was not a fire",
  restored_discarded: "restored · was discarded",
};

export function ReviewQueueRail() {
  const incidents = useIncidentStore((s) => s.incidents);
  const order = useIncidentStore((s) => s.order);
  const selectedId = useIncidentStore((s) => s.reviewSelectedId);
  const selectReview = useIncidentStore((s) => s.selectReview);
  const tick = useIncidentStore((s) => s.clockTick);

  const queue = reviewQueue(incidents, order);

  return (
    <div
      style={{
        width: 308,
        flex: "none",
        borderRight: "var(--border-w) dashed var(--accent-border)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <HatchBanner style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div
            style={{
              font: "600 11px/1 var(--font-plex-mono)",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--accent)",
            }}
          >
            Review queue
          </div>
          <span
            style={{
              font: "700 11px/1 var(--font-plex-mono)",
              color: "var(--accent)",
              background: "var(--acc-12)",
              border: "1px solid var(--accent-border)",
              padding: "3px 7px",
            }}
          >
            {queue.length}
          </span>
        </div>
      </HatchBanner>

      <div style={{ flex: 1, overflow: "auto" }}>
        {queue.map((incident) => {
          const selected = incident.id === selectedId;
          return (
            <button
              key={incident.id}
              type="button"
              onClick={() => selectReview(incident.id)}
              style={{
                width: "100%",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: 4,
                padding: "14px 16px",
                background: selected ? "var(--tint)" : "transparent",
                borderLeft: selected ? "3px solid var(--accent)" : "3px solid transparent",
                borderBottom: "1px solid var(--border-5)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      border: "2px dashed var(--accent)",
                      background: "var(--acc-10)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      font: "700 11px/1 var(--font-plex-mono)",
                      color: "var(--accent)",
                    }}
                  >
                    ?
                  </span>
                  <span style={{ font: "600 11px/1 var(--font-plex-mono)", color: "var(--fg-2)" }}>
                    {incident.id}
                  </span>
                </div>
                <span style={{ font: "600 10px/1 var(--font-plex-mono)", color: "var(--accent)" }}>
                  {incident.confidence?.toFixed(2)}
                </span>
              </div>
              <span style={{ font: "500 12.5px/1.3 var(--font-plex-sans)", color: "var(--fg-3)" }}>
                {incident.place}
              </span>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ font: "400 11px/1 var(--font-plex-mono)", color: "var(--muted)" }}>
                  {relativeTime(incident.capturedAtIso, tick)}
                </span>
                <span
                  style={{
                    font: "600 9px/1 var(--font-plex-mono)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                  }}
                >
                  {REASON_LABEL[incident.reviewReason ?? "below_threshold"]}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
