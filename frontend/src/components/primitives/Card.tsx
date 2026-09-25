import type { CSSProperties, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  /** elevated: top-level white card. inset: a quieter section inside a card. pending: a human
   * decision is outstanding. */
  variant?: "elevated" | "inset" | "pending";
  style?: CSSProperties;
  className?: string;
}

export function Card({ children, variant = "elevated", style, className }: CardProps) {
  const variantClass =
    variant === "inset" ? "card card--inset" : variant === "pending" ? "card card--pending" : "card";
  return (
    <div className={[variantClass, className].filter(Boolean).join(" ")} style={style}>
      {children}
    </div>
  );
}

export function SectionHeading({
  children,
  note,
  as: Tag = "h3",
}: {
  children: ReactNode;
  note?: ReactNode;
  as?: "h2" | "h3" | "h4";
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Tag
        style={{
          font: "600 var(--text-sm)/var(--lh-snug) var(--font-plex-sans)",
          color: "var(--fg)",
        }}
      >
        {children}
      </Tag>
      {note ? <p className="caption">{note}</p> : null}
    </div>
  );
}
