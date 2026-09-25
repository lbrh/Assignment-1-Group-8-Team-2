import { SEVERITY, SEVERITY_ORDER } from "@/lib/constants/severity";
import type { SeverityBand } from "@/lib/types";

const DOT = { 4: 20, 3: 17, 2: 15, 1: 13 } as const;

export function SeverityLegend({ counts }: { counts: Record<SeverityBand, number> }) {
  return (
    <section
      aria-label="Severity scale"
      className="card map-legend"
    >
      <div className="map-legend__head">
        <span className="label">Severity scale</span>
        <span className="caption">On map</span>
      </div>
      <ul className="map-legend__list" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {SEVERITY_ORDER.map((band) => {
          const meta = SEVERITY[band];
          return (
            <li key={band} className="map-legend__item">
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
              <span className="map-legend__label">
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
