import type { ReactNode } from "react";

/** Label / value pairs. `mono` values are machine data (coordinates, ids) and render in Plex Mono. */
export function MetaList({
  rows,
}: {
  rows: { label: string; value: ReactNode; mono?: boolean }[];
}) {
  return (
    <dl className="card card--inset" style={{ margin: 0, padding: "var(--space-1) var(--space-4)" }}>
      {rows.map((row, i) => (
        <div
          key={row.label}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: "var(--space-3)",
            padding: "10px 0",
            borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none",
          }}
        >
          <dt className="caption" style={{ flex: "none" }}>
            {row.label}
          </dt>
          <dd
            className={row.mono ? "data" : undefined}
            style={{
              margin: 0,
              font: row.mono
                ? "500 var(--text-xs)/1.4 var(--font-plex-mono)"
                : "500 var(--text-sm)/1.4 var(--font-plex-sans)",
              color: "var(--fg)",
              textAlign: "right",
            }}
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
