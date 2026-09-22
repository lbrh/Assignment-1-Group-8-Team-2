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
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {!isLive && !isExtinguished ? (
        <Button variant="solid" onClick={() => dispatchCrew(incident.id)} disabled={incident.band === 0}>
          Dispatch crew
        </Button>
      ) : null}
      {isLive ? (
        <>
          <Button variant="outline" onClick={() => markExtinguished(incident.id)}>
            Mark extinguished
          </Button>
          <Button variant="outline" onClick={() => cancelDispatch(incident.id)}>
            Cancel dispatch
          </Button>
        </>
      ) : null}
      <Button
        variant="outline"
        onClick={() =>
          isFlagged ? router.push("/review") : sendToManualReview(incident.id)
        }
      >
        {isFlagged ? "Open in manual review" : "Send to manual review"}
      </Button>
      <Button variant="outline" onClick={() => router.push("/dispatch")}>
        View in dispatch order
      </Button>
    </div>
  );
}
