import { SEVERITY, SEVERITY_ORDER } from "@/lib/constants/severity";
import type { SeverityBand } from "@/lib/types";

const DOT = { 4: 20, 3: 17, 2: 15, 1: 13 } as const;

export function SeverityLegend({ counts }: { counts: Record<SeverityBand, number> }) {
  return (
    <section
      aria-label="Severity scale"
      className="card"
      style={{
        position: "absolute",
        left: "var(--space-4)",
        bottom: "var(--space-5)",
        zIndex: 1,
        width: 232,
        padding: "var(--space-3) var(--space-4)",
        boxShadow: "var(--shadow-pop)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "var(--space-2)" }}>
        <span className="label">Severity scale</span>
        <span className="caption">On map</span>
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {SEVERITY_ORDER.map((band) => {
          const meta = SEVERITY[band];
          return (
            <li key={band} style={{ display: "flex", alignItems: "center", gap: 10, height: 30 }}>
              <span style={{ width: 20, display: "flex", justifyContent: "center", flex: "none" }}>
                <span
                  style={{
                    width: DOT[band],
                    height: DOT[band],
                    borderRadius: "50%",
                    background: meta.fillVar,
                    border: `1px solid ${meta.ringVar}`,
                  }}
                />
              </span>
              <span style={{ font: "500 var(--text-sm)/1 var(--font-plex-sans)", color: "var(--fg-2)", flex: 1 }}>
                {meta.label}
              </span>
              <span className="data" style={{ font: "600 var(--text-xs)/1 var(--font-plex-mono)", color: counts[band] ? "var(--fg)" : "var(--faint)" }}>
                {counts[band]}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
