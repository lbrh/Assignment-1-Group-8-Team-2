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

  const isFlagged = incident.flag === "flagged_review";
  const isLive = incident.dispatch === "live";
  const isExtinguished = incident.dispatch === "extinguished";

  return (
    <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
      {/* one slot for both labels, so the button that was clicked shows its ✓ and then the next step */}
      {!isExtinguished ? (
        <Button
          variant="primary"
          ack
          disabled={!isLive && incident.band === 0}
          onClick={() => (isLive ? markExtinguished(incident.id) : dispatchCrew(incident.id))}
        >
          {isLive ? "Mark extinguished" : "Dispatch crew"}
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
