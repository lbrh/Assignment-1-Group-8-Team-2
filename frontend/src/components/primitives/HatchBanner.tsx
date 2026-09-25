import type { CSSProperties, ReactNode } from "react";

/** Marks a surface where a human decision is outstanding (review queue header, review banner):
 * a Blue 10 wash fading down, over a dashed Blue 30 edge. */
export function HatchBanner({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: "var(--grad-pending)",
        borderBottom: "1px dashed var(--accent-border)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
