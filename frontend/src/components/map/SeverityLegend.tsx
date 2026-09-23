import { SEVERITY, SEVERITY_ORDER } from "@/lib/constants/severity";
import type { SeverityBand } from "@/lib/types";

export function SeverityLegend({ counts }: { counts: Record<SeverityBand, number> }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 12,
        bottom: 12,
        width: 250,
        background: "var(--halo)",
        border: "var(--border-w) solid var(--border-3)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "8px 11px",
          borderBottom: "1px solid var(--border-6)",
          font: "600 10px/1 var(--font-plex-mono)",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--muted)",
        }}
      >
        <span>Severity scale</span>
        <span>Qty</span>
      </div>
      {SEVERITY_ORDER.map((band) => {
        const meta = SEVERITY[band];
        return (
          <div
            key={band}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "6px 11px",
            }}
          >
            <div
              style={{
                width: { 4: 20, 3: 17, 2: 15, 1: 13 }[band],
                height: { 4: 20, 3: 17, 2: 15, 1: 13 }[band],
                borderRadius: "50%",
                background: meta.fillVar,
                border: `1px solid ${meta.ringVar}`,
                flex: "none",
              }}
            />
            <span
              style={{
                font: "700 9px/1 var(--font-plex-mono)",
                color: meta.ringVar,
                border: `1px solid ${meta.ringVar}`,
                padding: "2px 5px",
              }}
            >
              {meta.abbr}
            </span>
            <span
              style={{ font: "500 12.5px/1 var(--font-plex-sans)", color: "var(--fg-2)", flex: 1 }}
            >
              {meta.label}
            </span>
            <span style={{ font: "500 11px/1 var(--font-plex-mono)", color: "var(--fg-4)" }}>
              {counts[band]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
