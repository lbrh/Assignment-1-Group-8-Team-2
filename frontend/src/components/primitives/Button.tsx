"use client";

import { useCallback, useEffect, useRef, useState, type ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "pending" | "link";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  small?: boolean;
  /** Show a ✓ in place of the label for a second after a click. For actions the store applies
   * optimistically, so the click reads as done instead of the button greying out while it waits. */
  ack?: boolean;
}

/** Which item (key) is showing its ✓ right now; `ack(key)` starts a one-second flash. The label
 * stays in the layout underneath (see .ack in components.css), so the button keeps its size and
 * comes back showing whatever its label has become. */
export function useAck<K = true>(ms = 1000) {
  const [acked, setAcked] = useState<K | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const ack = useCallback(
    (key: K) => {
      clearTimeout(timer.current);
      setAcked(key);
      timer.current = setTimeout(() => setAcked(null), ms);
    },
    [ms]
  );
  return [acked, ack] as const;
}

/** One primary action per view (gradient, lifts on hover); secondary for everything else;
 * pending (dashed) for reversible, still-undecided actions such as Restore, Reopen or opening
 * the review queue; link for inline text actions. States live in styles/components.css. */
export function Button({
  variant = "secondary",
  small = false,
  ack = false,
  className,
  type = "button",
  onClick,
  children,
  ...rest
}: Props) {
  const [acked, flash] = useAck();
  const classes = ["btn", `btn--${variant}`, small && variant !== "link" ? "btn--sm" : null, acked ? "ack" : null, className]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      type={type}
      className={classes}
      onClick={(e) => {
        if (ack) flash(true);
        onClick?.(e);
      }}
      {...rest}
    >
      <span className="ack__label">{children}</span>
    </button>
  );
}
