"use client";

import { useIncidentStore } from "@/lib/store/useIncidentStore";
import { relativeTime } from "@/lib/utils/time";
import { ASSIGNMENT_LABEL } from "@/lib/constants/crews";
import { Button } from "@/components/primitives/Button";

/** The crews on an incident, each with its status, how long ago that changed, and a recall
 * button. `showAdd` adds a button that opens the crew picker for another crew. */
export function AssignedCrews({ incidentId, showAdd = false }: { incidentId: string; showAdd?: boolean }) {
  const crews = useIncidentStore((s) => s.crews);
  const tick = useIncidentStore((s) => s.clockTick);
  const recallCrew = useIncidentStore((s) => s.recallCrew);
  const openCrewPicker = useIncidentStore((s) => s.openCrewPicker);
  const mine = crews.filter((c) => c.assignment?.incidentId === incidentId);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-2)" }}>
      {mine.length === 0 ? (
        <span className="caption">No crew assigned. Add one, or cancel the dispatch.</span>
      ) : (
        mine.map((crew) => (
          <span key={crew.id} className="chip chip--pill crew-chip">
            <span>
              {crew.label} · {ASSIGNMENT_LABEL[crew.assignment!.status]}
              <span className="crew-chip__age"> · {relativeTime(crew.assignment!.updatedAtIso, tick)}</span>
            </span>
            <button
              type="button"
              className="crew-chip__recall"
              aria-label={`Recall ${crew.label}`}
              title={`Recall ${crew.label}`}
              onClick={(e) => {
                e.stopPropagation(); // rows open the incident on click
                recallCrew(incidentId, crew.assignment!.id);
              }}
            >
              ✕
            </button>
          </span>
        ))
      )}
      {showAdd ? (
        <Button small onClick={() => openCrewPicker(incidentId)}>
          Add crew
        </Button>
      ) : null}
    </div>
  );
}
