import type { ReactNode } from "react";

export function MetaField({
  label,
  value,
  secondary,
}: {
  label: string;
  value: ReactNode;
  secondary?: ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div
        style={{
          font: "600 10px/1 var(--font-plex-mono)",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--muted)",
        }}
      >
        {label}
      </div>
      <div style={{ font: "600 14px/1.3 var(--font-plex-mono)", color: "var(--fg)" }}>
        {value}
      </div>
      {secondary ? (
        <div style={{ font: "400 13.5px/1.4 var(--font-plex-sans)", color: "var(--muted)" }}>
          {secondary}
        </div>
      ) : null}
    </div>
  );
}

export function MetaList({
  rows,
}: {
  rows: { label: string; value: ReactNode }[];
}) {
  return (
    <div style={{ border: "var(--border-w) solid var(--border-4)", background: "var(--panel)" }}>
      {rows.map((row, i) => (
        <div
          key={row.label}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            padding: "11px 14px",
            borderBottom: i < rows.length - 1 ? "1px solid var(--border-5)" : "none",
          }}
        >
          <span
            style={{
              flex: "0 0 74px",
              font: "600 10px/1.4 var(--font-plex-mono)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            {row.label}
          </span>
          <span
            style={{
              font: "500 13px/1.4 var(--font-plex-mono)",
              color: "var(--fg)",
              textAlign: "right",
            }}
          >
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}
