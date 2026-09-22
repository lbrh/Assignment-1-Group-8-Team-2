import type { CSSProperties, ReactNode } from "react";

/** 135° diagonal hatch over a dashed accent border — the prototype's visual signature for
 * "a human decision is outstanding" (review queue header, review banner, grouping banner). */
export function HatchBanner({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        background:
          "repeating-linear-gradient(135deg, var(--acc-07) 0 10px, var(--acc-02) 10px 20px)",
        borderBottom: "1px dashed var(--accent-border)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
