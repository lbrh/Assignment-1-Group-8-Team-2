import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "pending" | "link";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  small?: boolean;
}

/** One primary action per view (gradient, lifts on hover); secondary for everything else;
 * pending (dashed) for reversible, still-undecided actions such as Restore, Reopen or opening
 * the review queue; link for inline text actions. States live in styles/components.css. */
export function Button({ variant = "secondary", small = false, className, type = "button", ...rest }: Props) {
  const classes = ["btn", `btn--${variant}`, small && variant !== "link" ? "btn--sm" : null, className]
    .filter(Boolean)
    .join(" ");
  return <button type={type} className={classes} {...rest} />;
}
