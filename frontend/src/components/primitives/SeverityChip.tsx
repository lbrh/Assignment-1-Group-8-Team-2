import { SEVERITY } from "@/lib/constants/severity";
import type { SeverityBand } from "@/lib/types";

/** Severity as a word, so the band never relies on colour alone. `short` uses the four-letter
 * code where a row has no room for the full label. */
export function SeverityChip({ band, short = false }: { band: SeverityBand | 0; short?: boolean }) {
  if (band === 0) {
    return (
      <span
        className="chip"
        style={{
          color: "var(--accent-fg)",
          background: "var(--accent-soft)",
          borderColor: "var(--accent-border)",
          borderStyle: "dashed",
        }}
      >
        Unscored
      </span>
    );
  }
  const meta = SEVERITY[band];
  return (
    <span
      className="chip"
      title={short ? meta.label : undefined}
      style={{
        color: meta.ringVar,
        background: `var(--sev${band}-tint)`,
        borderColor: `color-mix(in srgb, ${meta.ringVar} 28%, transparent)`,
      }}
    >
      {short ? meta.abbr : meta.label}
    </span>
  );
}
