"use client";

import { useEffect, useState } from "react";
import { dataSource } from "@/lib/data-source";
import type { Incident } from "@/lib/types";
import { useIncidentStore } from "@/lib/store/useIncidentStore";
import { relativeTime } from "@/lib/utils/time";
import { IncidentImage } from "@/components/detail/IncidentImage";
import { SeverityChip } from "@/components/primitives/SeverityChip";
import { SeverityDot } from "@/components/primitives/SeverityDot";
import { SOURCE_META } from "@/components/primitives/SourceChip";

/** Every image at the incident. The newest one leads (it is what rates the incident); a strip of
 * thumbnails, newest first, swaps in an earlier image along with that image's own rating. */
export function IncidentGallery({ incident }: { incident: Incident }) {
  const tick = useIncidentStore((s) => s.clockTick);
  const [earlier, setEarlier] = useState<Incident[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // Refetch when the newest image changes, i.e. another photo arrived for this incident.
  useEffect(() => {
    let cancelled = false;
    dataSource.getIncidentImages(incident.id).then(
      (images) => {
        if (!cancelled) setEarlier(images.filter((i) => i.file !== incident.file));
      },
      () => {} // the newest image still shows from the incident itself
    );
    return () => {
      cancelled = true;
    };
  }, [incident.id, incident.file]);

  // The store's copy leads, so a coordinator's override shows here without a refetch.
  const images = [incident, ...earlier];
  const selected = images.find((i) => i.file === selectedFile) ?? incident;
  const index = images.indexOf(selected);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      <IncidentImage
        key={selected.file}
        imageId={selected.file}
        alt={`${index === 0 ? "Latest" : "Earlier"} field image for ${incident.place}`}
      />
      {images.length > 1 ? (
        <>
          <p className="caption gallery-caption" aria-live="polite">
            <SeverityChip band={selected.band} short />
            <span>
              {index === 0 ? "Latest" : `Image ${index + 1} of ${images.length}`} · {SOURCE_META[selected.source].abbr} ·{" "}
              {relativeTime(selected.capturedAtIso, tick)} · conf {selected.confidence?.toFixed(2) ?? "–"}
            </span>
          </p>
          <div className="gallery-strip" role="group" aria-label={`All ${images.length} images, newest first`}>
            {images.map((img, i) => (
              <GalleryThumb
                key={img.file}
                image={img}
                label={`Image ${i + 1} of ${images.length}${i === 0 ? ", latest" : ""}`}
                selected={img === selected}
                onSelect={() => setSelectedFile(img.file)}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function GalleryThumb({
  image,
  label,
  selected,
  onSelect,
}: {
  image: Incident;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const src = dataSource.getImagePreviewUrl(image.file, 240);
  return (
    <button type="button" className="gallery-thumb" aria-pressed={selected} aria-label={label} onClick={onSelect}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" decoding="async" />
      ) : (
        <span className="image-slot" style={{ height: "100%", border: "none" }} />
      )}
      <span className="gallery-thumb__dot">
        <SeverityDot band={image.flag === "not_a_fire" ? "not_a_fire" : image.band} size={16} numeral={false} />
      </span>
    </button>
  );
}
