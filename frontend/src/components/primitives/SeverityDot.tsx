import { SEVERITY } from "@/lib/constants/severity";
import type { SeverityBand } from "@/lib/types";

export interface SeverityDotProps {
  band: SeverityBand | 0 | "not_a_fire";
  size?: number;
  provisional?: boolean;
  numeral?: boolean;
  halo?: boolean;
}

export function SeverityDot({
  band,
  size,
  provisional = false,
  numeral = true,
  halo = false,
}: SeverityDotProps) {
  if (band === "not_a_fire") {
    const d = size ?? 34;
    return (
      <div
        style={{
          width: d,
          height: d,
          borderRadius: "50%",
          background: "var(--surface-3)",
          border: "1px solid var(--border-7)",
          color: "var(--muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-plex-mono)",
          fontWeight: 700,
          fontSize: Math.max(10, d * 0.36),
          flex: "none",
        }}
      >
        {numeral ? "∅" : null}
      </div>
    );
  }

  if (band === 0) {
    const d = size ?? 34;
    return (
      <div
        style={{
          width: d,
          height: d,
          borderRadius: "50%",
          background: "var(--acc-10)",
          border: "2px dashed var(--accent)",
          color: "var(--accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-plex-mono)",
          fontWeight: 700,
          fontSize: Math.max(10, d * 0.34),
          flex: "none",
        }}
      >
        {numeral ? "?" : null}
      </div>
    );
  }

  const meta = SEVERITY[band];
  const d = size ?? meta.dotDiameter;
  return (
    <div
      style={{
        width: d,
        height: d,
        borderRadius: "50%",
        background: meta.fillVar,
        color: meta.textVar,
        border: `${meta.ringWidth}px ${provisional ? "dashed" : "solid"} ${meta.ringVar}`,
        boxShadow: halo ? `0 0 0 4px var(--halo)` : undefined,
        opacity: provisional ? 0.75 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-plex-mono)",
        fontWeight: 700,
        fontSize: Math.round(d * (meta.numeralFont / meta.dotDiameter)),
        flex: "none",
      }}
    >
      {numeral ? band : null}
    </div>
  );
}
