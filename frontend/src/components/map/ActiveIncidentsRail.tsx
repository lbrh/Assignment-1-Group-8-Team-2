"use client";

import { useRouter } from "next/navigation";
import { useIncidentStore } from "@/lib/store/useIncidentStore";
import { rankedAwaiting, reviewQueue } from "@/lib/store/selectors";
import { RankedIncidentRow } from "@/components/map/RankedIncidentRow";
import { GroupingProposalCard } from "@/components/map/GroupingProposalCard";

const FILTERS: { key: "all" | "sev34" | "extinguished"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "sev34", label: "Sev 3–4" },
  { key: "extinguished", label: "Extinguished" },
];

export function ActiveIncidentsRail() {
  const router = useRouter();
  const incidents = useIncidentStore((s) => s.incidents);
  const order = useIncidentStore((s) => s.order);
  const mapFilter = useIncidentStore((s) => s.mapFilter);
  const setMapFilter = useIncidentStore((s) => s.setMapFilter);
  const alertsPanelOpen = useIncidentStore((s) => s.alertsPanelOpen);
  const setAlertsPanelOpen = useIncidentStore((s) => s.setAlertsPanelOpen);
  const group = useIncidentStore((s) => s.group);

  const ranked = rankedAwaiting(incidents, order).filter((i) => {
    if (mapFilter === "sev34") return i.band === 3 || i.band === 4;
    return true;
  });
  const flaggedCount = reviewQueue(incidents, order).length;

  return (
    <div
      style={{
        width: 372,
        flex: "none",
        display: "flex",
        flexDirection: "column",
        borderLeft: "1px solid var(--border)",
        background: "var(--panel)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "16px 16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        <div
          style={{
            font: "600 11px/1 var(--font-plex-mono)",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--fg)",
          }}
        >
          {alertsPanelOpen ? "Alerts & Suggested" : "Active Incidents"}
        </div>
        <div style={{ font: "400 11px/1.3 var(--font-plex-mono)", color: "var(--muted)" }}>
          {alertsPanelOpen
            ? "Alerts and system suggestions · incidents hidden"
            : "Ranked by severity, then distance from staging"}
        </div>
      </div>

      <div style={{ padding: "0 16px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
        {!alertsPanelOpen &&
          FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setMapFilter(f.key)}
              style={{
                font: "600 10px/1 var(--font-plex-mono)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "7px 10px",
                background: mapFilter === f.key ? "var(--accent)" : "transparent",
                color: mapFilter === f.key ? "var(--on-accent)" : "var(--muted)",
                border: mapFilter === f.key ? "1px solid var(--accent)" : "1px solid var(--border-2)",
              }}
            >
              {f.label}
            </button>
          ))}
        <button
          type="button"
          onClick={() => setAlertsPanelOpen(!alertsPanelOpen)}
          style={{
            marginLeft: alertsPanelOpen ? 0 : "auto",
            font: "600 9px/1 var(--font-plex-mono)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "9px 11px",
            background: alertsPanelOpen ? "var(--accent)" : "var(--acc-08)",
            color: alertsPanelOpen ? "var(--on-accent)" : "var(--accent)",
            border: "1px dashed var(--accent-border)",
          }}
        >
          Alerts & Suggested {group && group.state === "suggested" ? "(1)" : ""}
        </button>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        {alertsPanelOpen ? (
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 18 }}>
            <GroupingProposalCard />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                style={{
                  font: "600 10px/1 var(--font-plex-mono)",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                }}
              >
                Alerts
              </div>
              {flaggedCount > 0 ? (
                <AlertCard
                  tag="MANUAL REVIEW"
                  timing={`${flaggedCount} waiting`}
                  body="Detections below the 0.75 confidence threshold need a coordinator's call before they can be dispatched."
                  cta="Open review queue"
                  onClick={() => router.push("/review")}
                />
              ) : null}
            </div>
          </div>
        ) : (
          <>
            {ranked.map((incident) => (
              <RankedIncidentRow key={incident.id} incident={incident} />
            ))}
            {flaggedCount > 0 ? (
              <button
                type="button"
                onClick={() => router.push("/review")}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 16px",
                  background: "var(--acc-06)",
                  borderTop: "1px dashed var(--accent-border)",
                  textAlign: "left",
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
                    font: "700 9px/1 var(--font-plex-mono)",
                    color: "var(--accent)",
                    flex: "none",
                  }}
                >
                  ?
                </span>
                <span style={{ font: "400 11px/1.4 var(--font-plex-mono)", color: "var(--accent-fg)" }}>
                  {flaggedCount} flagged · not drawn on the map until reviewed
                </span>
                <span style={{ marginLeft: "auto", color: "var(--accent)" }}>→</span>
              </button>
            ) : null}
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => router.push("/dispatch")}
        style={{
          padding: "13px 16px",
          borderTop: "1px solid var(--border)",
          font: "600 11px/1 var(--font-plex-mono)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--accent)",
          textAlign: "left",
        }}
      >
        Open full dispatch order
      </button>
    </div>
  );
}

function AlertCard({
  tag,
  timing,
  body,
  cta,
  onClick,
}: {
  tag: string;
  timing: string;
  body: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px dashed var(--accent-border)",
        padding: "11px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            font: "700 9px/1 var(--font-plex-mono)",
            letterSpacing: "0.12em",
            color: "var(--accent)",
            background: "var(--acc-10)",
            padding: "3px 6px",
          }}
        >
          {tag}
        </span>
        <span style={{ font: "400 10px/1 var(--font-plex-mono)", color: "var(--muted)" }}>
          {timing}
        </span>
      </div>
      <p style={{ font: "400 12.5px/1.5 var(--font-plex-sans)", color: "var(--fg-3)" }}>{body}</p>
      <button
        type="button"
        onClick={onClick}
        style={{
          alignSelf: "flex-start",
          font: "600 10px/1 var(--font-plex-mono)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--accent)",
          background: "var(--acc-08)",
          border: "1px solid var(--accent-border)",
          padding: "7px 10px",
        }}
      >
        {cta}
      </button>
    </div>
  );
}
