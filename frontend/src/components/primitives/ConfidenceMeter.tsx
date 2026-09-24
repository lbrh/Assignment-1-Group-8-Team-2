import { needsManualReview } from "@/lib/constants/severity";

export function confidenceColor(confidence: number): string {
  if (confidence >= 0.85) return "var(--conf-high)";
  if (!needsManualReview(confidence)) return "var(--conf-mid)";
  return "var(--accent)";
}

export function confidenceLabel(confidence: number): string {
  if (confidence >= 0.85) return "High confidence";
  if (!needsManualReview(confidence)) return "Moderate confidence";
  return "Low confidence";
}

interface Props {
  confidence: number;
  size?: "sm" | "lg";
  note?: string;
}

export function ConfidenceMeter({ confidence, size = "sm", note }: Props) {
  const color = confidenceColor(confidence);
  const filled = Math.max(1, Math.round(confidence * 5));
  const big = size === "lg";

  return (
    <div
      role="group"
      aria-label={`${confidenceLabel(confidence)}, ${confidence.toFixed(2)}`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        paddingLeft: "var(--space-5)",
        borderLeft: "1px solid var(--border)",
      }}
    >
      <span
        className="data"
        style={{
          font: `700 ${big ? "var(--text-xl)" : "var(--text-sm)"}/1 var(--font-plex-mono)`,
          letterSpacing: "var(--tracking-tight)",
          color,
        }}
      >
        {confidence.toFixed(2)}
      </span>
      <span style={{ font: "600 var(--text-xs)/1.3 var(--font-plex-sans)", color }}>
        {confidenceLabel(confidence)}
      </span>
      <div style={{ display: "flex", gap: 3 }} aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            style={{
              width: 22,
              height: 6,
              borderRadius: "var(--radius-full)",
              background: i < filled ? color : "var(--surface-3)",
            }}
          />
        ))}
      </div>
      {note ? <span className="caption">{note}</span> : null}
    </div>
  );
}
