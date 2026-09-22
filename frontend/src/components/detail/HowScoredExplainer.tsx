import type { Incident } from "@/lib/types";
import { SEVERITY, SEVERITY_ORDER } from "@/lib/constants/severity";
import { ElementScoreRows } from "@/components/primitives/ElementScoreRows";

export function HowScoredExplainer({ incident }: { incident: Incident }) {
  const isFire = incident.flag !== "not_a_fire";
  const coordinatorAssigned = incident.provenance === "coordinator_assigned";
  const scoreStepLabel = coordinatorAssigned ? "COORDINATOR" : incident.sum ? "SCORED" : "NOT SCORED";

  return (
    <div
      style={{
        border: "1px solid var(--border-3)",
        background: "var(--surface)",
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        style={{
          font: "600 10px/1 var(--font-plex-mono)",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--fg)",
        }}
      >
        How this severity was scored
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <StepTile step={1} title="Fire / not fire" chip={isFire ? "FIRE" : "NOT A FIRE"} ok={isFire} />
        <StepTile step={2} title="Severity score" chip={scoreStepLabel} ok={scoreStepLabel === "SCORED"} />
      </div>

      <ElementScoreRows
        elements={incident.elements}
        sum={incident.sum}
        coordinatorAssigned={coordinatorAssigned}
      />

      <div>
        <div
          style={{
            font: "500 10px/1.4 var(--font-plex-mono)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 8,
          }}
        >
          Band map
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(124px, 1fr))", gap: 8 }}>
          {SEVERITY_ORDER.slice()
            .reverse()
            .map((band) => {
              const meta = SEVERITY[band];
              const active = incident.band === band;
              return (
                <div
                  key={band}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 10px",
                    background: active ? "var(--tint)" : "transparent",
                    border: active ? "1px solid var(--accent)" : "1px solid var(--border-5)",
                  }}
                >
                  <span
                    style={{
                      width: 19,
                      height: 19,
                      borderRadius: "50%",
                      background: meta.fillVar,
                      border: `1px solid ${meta.ringVar}`,
                      flex: "none",
                    }}
                  />
                  <span
                    style={{
                      font: "600 10px/1.4 var(--font-plex-mono)",
                      color: active ? "var(--fg)" : "var(--muted)",
                    }}
                  >
                    {meta.sumRange[0]}–{meta.sumRange[1]} → {meta.abbr}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function StepTile({ step, title, chip, ok }: { step: number; title: string; chip: string; ok: boolean }) {
  return (
    <div
      style={{
        border: "1px solid var(--border-3)",
        background: "var(--panel)",
        padding: "11px 13px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <span style={{ font: "600 9px/1 var(--font-plex-mono)", letterSpacing: "0.12em", color: "var(--muted)" }}>
        STEP {step}
      </span>
      <span style={{ font: "500 12.5px/1 var(--font-plex-sans)", color: "var(--fg-3)" }}>{title}</span>
      <span
        style={{
          alignSelf: "flex-start",
          font: "700 9px/1 var(--font-plex-mono)",
          letterSpacing: "0.1em",
          padding: "4px 7px",
          color: ok ? "var(--ok-fg)" : "var(--faint)",
          background: ok ? "var(--grn-09)" : "var(--surface-3)",
          border: ok ? "1px solid var(--ok-border)" : "1px solid var(--border-2)",
        }}
      >
        {chip}
      </span>
    </div>
  );
}
