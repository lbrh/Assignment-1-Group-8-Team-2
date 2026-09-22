import { ELEMENT_LABELS, ELEMENT_RUBRIC, SEVERITY, bandFromSum } from "@/lib/constants/severity";
import type { ElementScores } from "@/lib/types";

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
        const rubric = value ? ELEMENT_RUBRIC[key][value - 1] : "not scored";
        return (
          <div
            key={key}
            style={{
              display: "grid",
              gridTemplateColumns: "150px 130px 1fr",
              gap: 14,
              padding: "10px 0",
              borderTop: "1px solid var(--border-5)",
              alignItems: "center",
            }}
          >
            <span
              style={{
                font: "600 11px/1.3 var(--font-plex-mono)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--fg-3)",
              }}
            >
              {ELEMENT_LABELS[key]}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {[1, 2, 3, 4].map((n) => (
                <span
                  key={n}
                  style={{
                    width: 27,
                    height: 22,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: value && n <= value ? SEVERITY[value as 1 | 2 | 3 | 4]?.fillVar : "transparent",
                    border: value && n <= value ? `1px solid ${SEVERITY[value as 1 | 2 | 3 | 4]?.ringVar}` : "1px solid var(--border-3)",
                    color: value && n <= value ? SEVERITY[value as 1 | 2 | 3 | 4]?.textVar : "var(--faint)",
                    font: "700 12px/1 var(--font-plex-mono)",
                  }}
                >
                  {n}
                </span>
              ))}
              <span style={{ font: "700 16px/1 var(--font-plex-mono)", color: "var(--fg)", marginLeft: 6 }}>
                {value ?? "—"}
              </span>
            </div>
            <span style={{ font: "400 13px/1.35 var(--font-plex-sans)", color: "var(--fg-4)" }}>
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
          padding: "13px 0 0",
          borderTop: "1px solid var(--border-2)",
          marginTop: 4,
        }}
      >
        <span style={{ font: "400 11px/1 var(--font-plex-mono)", color: "var(--muted)" }}>
          range 4 – 16
        </span>
        <span style={{ font: "700 20px/1 var(--font-plex-mono)", color: "var(--fg)" }}>
          {sum ?? "—"}
        </span>
        <span style={{ font: "500 13.5px/1.4 var(--font-plex-sans)", color: "var(--fg-3)" }}>
          {coordinatorAssigned
            ? "coordinator decision · no element scores recorded"
            : sum
              ? `${sum} of 16 → ${SEVERITY[bandFromSum(sum)].label} (${bandFromSum(sum)})`
              : "not scored"}
        </span>
      </div>
    </div>
  );
}
