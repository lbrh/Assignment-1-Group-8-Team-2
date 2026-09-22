"use client";

import { useEffect } from "react";
import { useIncidentStore } from "@/lib/store/useIncidentStore";
import { reviewQueue } from "@/lib/store/selectors";
import { ReviewQueueRail } from "@/components/review/ReviewQueueRail";
import { ReviewPane } from "@/components/review/ReviewPane";

export default function ManualReviewPage() {
  const incidents = useIncidentStore((s) => s.incidents);
  const order = useIncidentStore((s) => s.order);
  const selectedId = useIncidentStore((s) => s.reviewSelectedId);
  const selectReview = useIncidentStore((s) => s.selectReview);

  const queue = reviewQueue(incidents, order);
  const selected = selectedId ? incidents[selectedId] : queue[0];

  useEffect(() => {
    if (!selectedId && queue.length > 0) selectReview(queue[0].id);
  }, [selectedId, queue, selectReview]);

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <ReviewQueueRail />
      {selected ? (
        <ReviewPane incident={selected} />
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ maxWidth: 520, padding: "60px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
            <span
              style={{
                font: "600 16px/1.3 var(--font-plex-sans)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--fg)",
              }}
            >
              Nothing awaiting review
            </span>
            <p style={{ font: "400 13.5px/1.6 var(--font-plex-sans)", color: "var(--muted)" }}>
              Every current detection cleared the 0.75 confidence threshold. Anything below it
              routes here instead of being forced into a severity level.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
