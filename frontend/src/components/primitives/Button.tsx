"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "solid" | "outline" | "dashed" | "ghost";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  small?: boolean;
}

/** Square-cornered mono-uppercase action button, per the redline's single button treatment
 * (solid = primary, outline = secondary, dashed = "undecided" affordance like Restore/Undo). */
export function Button({ variant = "outline", small = false, style, ...rest }: Props) {
  const base = {
    font: `600 ${small ? 10 : 11}px/1 var(--font-plex-mono)`,
    letterSpacing: small ? "0.1em" : "0.12em",
    textTransform: "uppercase" as const,
    padding: small ? "9px 12px" : "11px 20px",
    transition: "background .12s, color .12s, border-color .12s",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  };

  const variants: Record<Variant, React.CSSProperties> = {
    solid: {
      background: "var(--accent)",
      color: "var(--on-accent)",
      border: "var(--border-w) solid var(--accent)",
    },
    outline: {
      background: "transparent",
      color: "var(--fg-2)",
      border: "var(--border-w) solid var(--border-2)",
    },
    dashed: {
      background: "transparent",
      color: "var(--accent)",
      border: "var(--border-w) dashed var(--accent)",
    },
    ghost: {
      background: "transparent",
      color: "var(--muted)",
      border: "none",
      padding: 0,
    },
  };

  return (
    <button
      {...rest}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseDown={(e) => {
        if (variant === "solid") e.currentTarget.style.background = "var(--accent-deep)";
        rest.onMouseDown?.(e);
      }}
    />
  );
}
