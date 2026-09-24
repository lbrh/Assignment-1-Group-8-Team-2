import { ELEMENT_LABELS, ELEMENT_RUBRIC, SEVERITY, bandFromSum } from "@/lib/constants/severity";
import type { ElementScores, SeverityBand } from "@/lib/types";

const KEYS = Object.keys(ELEMENT_LABELS) as (keyof typeof ELEMENT_LABELS)[];

export function ElementScoreRows({
  elements,
  sum,
  coordinatorAssigned = false,
}: {
  elements: ElementScores;
  sum: number | null;
  coordinatorAssigned?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {KEYS.map((key) => {
        const value = elements[key];
        const meta = value ? SEVERITY[value as SeverityBand] : null;
        const rubric =
          value === 0 ? "Not counted, no fire present" : value ? ELEMENT_RUBRIC[key][value - 1] : "Not scored";
        return (
          <div
            key={key}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(120px, 160px) auto 1fr",
              gap: "var(--space-4)",
              padding: "10px 0",
              borderTop: "1px solid var(--border)",
              alignItems: "center",
            }}
          >
            <span className="label" style={{ color: "var(--fg)" }}>
              {ELEMENT_LABELS[key]}
            </span>
            <div
              style={{ display: "flex", alignItems: "center", gap: 4 }}
              role="img"
              aria-label={`${ELEMENT_LABELS[key]}: ${value ?? "not scored"} of 4`}
            >
              {[1, 2, 3, 4].map((n) => {
                const on = !!meta && !!value && n <= value;
                return (
                  <span
                    key={n}
                    className="data"
                    style={{
                      width: 26,
                      height: 22,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 4,
                      background: on ? meta.fillVar : "var(--surface-2)",
                      border: on ? `1px solid ${meta.ringVar}` : "1px solid var(--border)",
                      color: on ? meta.textVar : "var(--faint)",
                      font: "700 12px/1 var(--font-plex-mono)",
                    }}
                  >
                    {n}
                  </span>
                );
              })}
              <span
                className="data"
                style={{ font: "700 var(--text-base)/1 var(--font-plex-mono)", color: "var(--fg)", marginLeft: 8, minWidth: 14 }}
              >
                {value ?? "–"}
              </span>
            </div>
            <span style={{ font: "400 var(--text-sm)/1.4 var(--font-plex-sans)", color: "var(--fg-4)" }}>
              {rubric}
            </span>
          </div>
        );
      })}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: "var(--space-4)",
          padding: "var(--space-3) 0 0",
          borderTop: "1px solid var(--border-2)",
        }}
      >
        <span className="caption">Range 4–16</span>
        <span className="data" style={{ font: "700 var(--text-lg)/1 var(--font-plex-mono)", color: "var(--fg)" }}>
          {sum ?? "–"}
        </span>
        <span style={{ font: "600 var(--text-sm)/1.4 var(--font-plex-sans)", color: "var(--fg-2)" }}>
          {coordinatorAssigned
            ? "Coordinator decision, no element scores recorded"
            : sum
              ? `${sum} of 16 → ${SEVERITY[bandFromSum(sum)].label} (${bandFromSum(sum)})`
              : "Not scored"}
        </span>
      </div>
    </div>
  );
}
