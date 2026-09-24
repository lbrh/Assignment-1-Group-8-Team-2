"use client";

import { useRouter } from "next/navigation";
import { useIncidentStore } from "@/lib/store/useIncidentStore";
import { rankedAwaiting, liveDispatched, reviewQueue } from "@/lib/store/selectors";
import { DispatchRow } from "@/components/dispatch/DispatchRow";
import { Button } from "@/components/primitives/Button";
import { CONFIDENCE_THRESHOLD } from "@/lib/constants/severity";

const FILTERS: { key: "all" | "awaiting" | "live"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "awaiting", label: "Awaiting dispatch" },
  { key: "live", label: "Live / dispatched" },
];

export default function DispatchOrderPage() {
  const router = useRouter();
  const incidents = useIncidentStore((s) => s.incidents);
  const order = useIncidentStore((s) => s.order);
  const dispatchFilter = useIncidentStore((s) => s.dispatchFilter);
  const setDispatchFilter = useIncidentStore((s) => s.setDispatchFilter);

  const awaiting = rankedAwaiting(incidents, order);
  const live = liveDispatched(incidents, order);
  const flaggedCount = reviewQueue(incidents, order).length;

  const showAwaiting = dispatchFilter !== "live";
  const showLive = dispatchFilter !== "awaiting";

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", padding: "20px 24px 40px" }}>
      <h1
        style={{
          font: "600 22px/1.2 var(--font-plex-sans)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--fg)",
        }}
      >
        Dispatch Order
      </h1>
      <p style={{ font: "400 12.5px/1.4 var(--font-plex-sans)", color: "var(--muted)", marginTop: 6 }}>
        Severity first, then distance from staging. Every position states its own reason.
      </p>

      <div style={{ display: "flex", gap: 8, margin: "16px 0" }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setDispatchFilter(f.key)}
            style={{
              font: "600 10px/1 var(--font-plex-mono)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "8px 11px",
              background: dispatchFilter === f.key ? "var(--accent)" : "transparent",
              color: dispatchFilter === f.key ? "var(--on-accent)" : "var(--muted)",
              border: dispatchFilter === f.key ? "var(--border-w) solid var(--accent)" : "var(--border-w) solid var(--border-2)",
            }}
          >
            {f.label} {f.key === "awaiting" ? `(${awaiting.length})` : f.key === "live" ? `(${live.length})` : ""}
          </button>
        ))}
      </div>

      <div style={{ border: "var(--border-w) solid var(--border)", background: "var(--panel)" }}>
        {showAwaiting ? (
          <>
            <SectionBar tone="accent" title={`Awaiting dispatch (${awaiting.length})`} note="ranked by severity, then distance from staging" />
            {awaiting.length === 0 ? (
              <EmptyRow text="Every ranked incident has a crew assigned." />
            ) : (
              awaiting.map((i, idx) => <DispatchRow key={i.id} incident={i} rank={idx + 1} />)
            )}
          </>
        ) : null}

        {showLive ? (
          <>
            <SectionBar tone="ok" title={`Live / dispatched (${live.length})`} note="crew assigned · mark extinguished when the crew reports the fire out" />
            {live.length === 0 ? (
              <EmptyRow text="No crews out yet. Incidents move here when you press Dispatch." />
            ) : (
              live.map((i) => <DispatchRow key={i.id} incident={i} rank={null} />)
            )}
          </>
        ) : null}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18 }}>
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            border: "2px dashed var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
            font: "700 11px/1 var(--font-plex-mono)",
            color: "var(--accent)",
          }}
        >
          ?
        </span>
        <p style={{ font: "400 12.5px/1.4 var(--font-plex-sans)", color: "var(--muted)", flex: 1 }}>
          Detections at or below the {CONFIDENCE_THRESHOLD} confidence threshold are held out of the ranking — never
          force-classified — until a reviewer confirms, changes or discards them. Not-a-fire
          images go to the Archive; extinguished fires leave this order and are listed under
          Resolved.
          {flaggedCount > 0 ? ` ${flaggedCount} currently waiting.` : ""}
        </p>
        {flaggedCount > 0 ? (
          <Button variant="dashed" small onClick={() => router.push("/review")}>
            Open review queue
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function SectionBar({ tone, title, note }: { tone: "accent" | "ok"; title: string; note: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 18px",
        background: tone === "accent" ? "var(--acc-06)" : "var(--grn-09)",
        borderBottom: "1px solid var(--border-5)",
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          background: tone === "accent" ? "var(--accent)" : "var(--ok-fg)",
        }}
      />
      <span
        style={{
          font: "600 10px/1 var(--font-plex-mono)",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: tone === "accent" ? "var(--accent)" : "var(--ok-fg)",
        }}
      >
        {title}
      </span>
      <span style={{ font: "400 11px/1 var(--font-plex-mono)", color: "var(--muted)" }}>{note}</span>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div style={{ padding: "22px 18px", font: "400 13px/1.5 var(--font-plex-sans)", color: "var(--muted)" }}>
      {text}
    </div>
  );
}
