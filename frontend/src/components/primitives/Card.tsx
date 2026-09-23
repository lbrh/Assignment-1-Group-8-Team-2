import type { CSSProperties, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  dashed?: boolean;
  tone?: "panel" | "surface" | "map-bg";
  style?: CSSProperties;
  className?: string;
}

export function Card({ children, dashed = false, tone = "panel", style, className }: CardProps) {
  const bg =
    tone === "panel" ? "var(--panel)" : tone === "surface" ? "var(--surface)" : "var(--map-bg)";
  return (
    <div
      className={className}
      style={{
        background: bg,
        border: dashed ? "var(--border-w) dashed var(--accent-border)" : "var(--border-w) solid var(--border)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  children,
  note,
  accent = false,
}: {
  children: ReactNode;
  note?: string;
  accent?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
      <div
        style={{
          font: "600 10px/1 var(--font-plex-mono)",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: accent ? "var(--accent)" : "var(--muted)",
        }}
      >
        {children}
      </div>
      {note ? (
        <div style={{ font: "400 10px/1.4 var(--font-plex-mono)", color: "var(--muted)" }}>
          {note}
        </div>
      ) : null}
    </div>
  );
}
