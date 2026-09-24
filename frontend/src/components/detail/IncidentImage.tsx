"use client";

import { useCallback, useEffect, useState } from "react";
import { dataSource } from "@/lib/data-source";

type State =
  | { kind: "loading" }
  | { kind: "ready"; url: string }
  | { kind: "missing"; note: string };

/** The incident's field image, fetched through a signed link. Falls back to a labelled
 * placeholder while loading, in mock mode, or when the image isn't stored yet. */
export function IncidentImage({ imageId, alt, height = 200 }: { imageId: string; alt: string; height?: number }) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [retried, setRetried] = useState(false);

  const load = useCallback(() => {
    let cancelled = false;
    dataSource.getImageUrl(imageId).then(
      (url) => {
        if (!cancelled) setState(url ? { kind: "ready", url } : { kind: "missing", note: imageId });
      },
      (err: unknown) => {
        if (!cancelled) setState({ kind: "missing", note: err instanceof Error ? err.message : "Image unavailable" });
      }
    );
    return () => {
      cancelled = true;
    };
  }, [imageId]);

  useEffect(load, [load]);

  if (state.kind !== "ready") {
    return (
      <div className="image-slot" style={{ height }}>
        {state.kind === "loading" ? "Loading image…" : state.note}
      </div>
    );
  }

  return (
    <a
      href={state.url}
      target="_blank"
      rel="noopener noreferrer"
      title="Open full size"
      style={{
        display: "block",
        height,
        overflow: "hidden",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        background: "var(--map-bg)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Signed storage links are one-off and expire, so next/image optimisation doesn't fit here. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={state.url}
        alt={alt}
        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        onError={() => {
          // an expired link: fetch a fresh one once, then give up
          if (!retried) {
            setRetried(true);
            load();
          } else {
            setState({ kind: "missing", note: "Image could not be loaded" });
          }
        }}
      />
    </a>
  );
}
