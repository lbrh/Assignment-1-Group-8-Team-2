import type { DispatchState, PipelineFlag } from "@/lib/types";

interface Props {
  flag: PipelineFlag;
  dispatch: DispatchState;
}

/** One flag per image at any time — Dispatched is shown in place of Processed once a crew is
 * assigned (redline: "dispatch state is shown separately so it no longer overwrites the
 * pipeline flag"). */
export function StatusFlagChip({ flag, dispatch }: Props) {
  let label: string;
  let color: string;
  let bg: string;
  let border: string;

  if (dispatch === "extinguished") {
    label = "Extinguished";
    color = "var(--fg-3)";
    bg = "var(--surface-3)";
    border = "1px solid var(--border-7)";
  } else if (dispatch === "live") {
    label = "Dispatched";
    color = "var(--ok-fg)";
    bg = "var(--grn-10)";
    border = "1px solid var(--ok-border)";
  } else if (flag === "flagged_review") {
    label = "Flagged · review";
    color = "var(--accent)";
    bg = "var(--acc-10)";
    border = "1px dashed var(--accent)";
  } else if (flag === "not_a_fire") {
    label = "Not a fire";
    color = "var(--faint)";
    bg = "var(--surface-3)";
    border = "1px solid var(--border-2)";
  } else {
    label = "Processed";
    color = "var(--fg-2)";
    bg = "var(--surface-2)";
    border = "1px solid var(--border-3)";
  }

  return (
    <span
      style={{
        font: "600 10px/1 var(--font-plex-mono)",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color,
        background: bg,
        border,
        padding: "5px 9px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
