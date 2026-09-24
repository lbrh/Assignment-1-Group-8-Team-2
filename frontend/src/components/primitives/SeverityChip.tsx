import { SEVERITY } from "@/lib/constants/severity";
import type { SeverityBand } from "@/lib/types";

export function SeverityChip({ band }: { band: SeverityBand | 0 }) {
  if (band === 0) {
    return (
      <span
        style={{
          font: "700 9px/1 var(--font-plex-mono)",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--accent)",
          background: "var(--halo)",
          border: "1px dashed var(--accent)",
          padding: "4px 7px",
        }}
      >
        ?
      </span>
    );
  }
  const meta = SEVERITY[band];
  return (
    <span
      style={{
        font: "700 9px/1 var(--font-plex-mono)",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: meta.ringVar,
        background: "var(--halo)",
        border: `1px solid ${meta.ringVar}`,
        padding: "4px 7px",
      }}
    >
      {meta.abbr}
    </span>
  );
}
