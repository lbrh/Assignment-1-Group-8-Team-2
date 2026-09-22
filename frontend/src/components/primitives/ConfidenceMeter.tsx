import { CONFIDENCE_THRESHOLD } from "@/lib/constants/severity";

export function confidenceColor(confidence: number): string {
  if (confidence >= 0.85) return "var(--conf-high)";
  if (confidence >= CONFIDENCE_THRESHOLD) return "var(--conf-mid)";
  return "var(--accent)";
}

export function confidenceLabel(confidence: number): string {
  if (confidence >= 0.85) return "High confidence";
  if (confidence >= CONFIDENCE_THRESHOLD) return "Moderate confidence";
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
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        paddingLeft: 20,
        borderLeft: "1px solid var(--border)",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span
          style={{
            font: `700 ${big ? 20 : 12}px/1 var(--font-plex-mono)`,
            color,
          }}
        >
          {confidence.toFixed(2)}
        </span>
      </div>
      <div
        style={{
          font: "600 10px/1.4 var(--font-plex-mono)",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color,
        }}
      >
        {confidenceLabel(confidence)}
      </div>
      <div style={{ display: "flex", gap: 3 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            style={{
              width: 22,
              height: 6,
              background: i < filled ? color : "var(--border-2)",
            }}
          />
        ))}
      </div>
      {note ? (
        <div style={{ font: "400 10px/1.4 var(--font-plex-mono)", color: "var(--muted)" }}>
          {note}
        </div>
      ) : null}
    </div>
  );
}
