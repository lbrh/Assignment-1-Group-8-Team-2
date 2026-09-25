"use client";

import { useCallback, useEffect, useState } from "react";
import { dataSource } from "@/lib/data-source";

/** The incident's field image. Shows the downscaled WebP preview straight away; the signed
 * full-resolution link loads alongside it for "Open full size", and stands in if the preview
 * can't be served. Falls back to a labelled placeholder in mock mode or when nothing is stored. */
export function IncidentImage({ imageId, alt, height = 200 }: { imageId: string; alt: string; height?: number }) {
  const preview = dataSource.getImagePreviewUrl(imageId, 800);
  const [fullUrl, setFullUrl] = useState<string | null>(null);
  const [fullError, setFullError] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [retried, setRetried] = useState(false);

  const loadFull = useCallback(() => {
    let cancelled = false;
    dataSource.getImageUrl(imageId).then(
      (url) => {
        if (cancelled) return;
        if (url) setFullUrl(url);
        else setFullError(imageId);
      },
      (err: unknown) => {
        if (!cancelled) setFullError(err instanceof Error ? err.message : "Image unavailable");
      }
    );
    return () => {
      cancelled = true;
    };
  }, [imageId]);

  useEffect(loadFull, [loadFull]);

  const src = preview && !previewFailed ? preview : fullUrl;
  if (!src) {
    return (
      <div className="image-slot" style={{ height }}>
        {fullError ?? "Loading image…"}
      </div>
    );
  }

  return (
    <a
      href={fullUrl ?? undefined}
      target="_blank"
      rel="noopener noreferrer"
      title={fullUrl ? "Open full size" : undefined}
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
      {/* Previews are already sized and cached by the backend, so next/image adds nothing here. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        decoding="async"
        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        onError={() => {
          if (src === preview) {
            setPreviewFailed(true); // fall back to the full-size image
          } else if (!retried) {
            setRetried(true); // an expired signed link: fetch a fresh one once
            setFullUrl(null);
            loadFull();
          } else {
            setFullUrl(null);
            setFullError("Image could not be loaded");
          }
        }}
      />
    </a>
  );
}
