"use client";

import { useRouter } from "next/navigation";
import type { Incident } from "@/lib/types";
import { Button } from "@/components/primitives/Button";
import { useIncidentStore } from "@/lib/store/useIncidentStore";

export function DetailActionsBar({ incident }: { incident: Incident }) {
  const router = useRouter();
  const dispatchCrew = useIncidentStore((s) => s.dispatchCrew);
  const cancelDispatch = useIncidentStore((s) => s.cancelDispatch);
  const markExtinguished = useIncidentStore((s) => s.markExtinguished);
  const sendToManualReview = useIncidentStore((s) => s.sendToManualReview);
  const archiveIncident = useIncidentStore((s) => s.archiveIncident);

  const isFlagged = incident.flag === "flagged_review";
  const isLive = incident.dispatch === "live";
  const isExtinguished = incident.dispatch === "extinguished";
  // one slot walks the lifecycle: dispatch -> mark extinguished -> archive
  const primary = isLive
    ? { label: "Mark extinguished", run: () => markExtinguished(incident.id) }
    : isExtinguished
      ? { label: "Archive", run: () => archiveIncident(incident.id) }
      : incident.dispatch === "archived"
        ? null
        : { label: "Dispatch crew", run: () => dispatchCrew(incident.id), disabled: incident.band === 0 };

  return (
    <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
      {/* one slot for every label, so the button that was clicked shows its ✓ and then the next step */}
      {primary ? (
        <Button variant="primary" ack disabled={primary.disabled} onClick={primary.run}>
          {primary.label}
        </Button>
      ) : null}
      {isLive ? (
        <Button variant="secondary" ack onClick={() => cancelDispatch(incident.id)}>
          Cancel dispatch
        </Button>
      ) : null}
      <Button
        variant="secondary"
        ack={!isFlagged}
        onClick={() => (isFlagged ? router.push("/review") : sendToManualReview(incident.id))}
      >
        {isFlagged ? "Open in manual review" : "Send to manual review"}
      </Button>
      <Button variant="secondary" onClick={() => router.push("/dispatch")}>
        View in dispatch order
      </Button>
    </div>
  );
}
