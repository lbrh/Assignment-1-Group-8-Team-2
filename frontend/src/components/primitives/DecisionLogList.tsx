import { formatClock } from "@/lib/utils/time";
import type { DecisionLogEntry } from "@/lib/types";

export function DecisionLogList({ entries }: { entries: DecisionLogEntry[] }) {
  if (entries.length === 0) {
    return (
      <p style={{ font: "400 12px/1.5 var(--font-plex-sans)", color: "var(--faint)" }}>
        No coordinator decision recorded against this incident yet.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {entries.map((entry) => (
        <div
          key={entry.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            padding: "9px 11px",
            background: "var(--panel)",
            borderBottom: "1px solid var(--border-5)",
          }}
        >
          <span style={{ font: "400 12px/1.5 var(--font-plex-sans)", color: "var(--fg-4)" }}>
            {entry.summary}
          </span>
          <span
            style={{
              flex: "none",
              textAlign: "right",
              font: "400 11px/1.4 var(--font-plex-mono)",
              color: "var(--muted)",
              whiteSpace: "nowrap",
            }}
          >
            {entry.who} · {formatClock(entry.whenIso)} AEST
          </span>
        </div>
      ))}
    </div>
  );
}
