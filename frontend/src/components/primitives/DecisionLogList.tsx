import { formatClock } from "@/lib/utils/time";
import type { DecisionLogEntry } from "@/lib/types";

export function DecisionLogList({ entries }: { entries: DecisionLogEntry[] }) {
  if (entries.length === 0) {
    return <p className="caption">No coordinator decision recorded against this incident yet.</p>;
  }

  return (
    <ol className="card card--inset" style={{ listStyle: "none", margin: 0, padding: "0 var(--space-4)" }}>
      {entries.map((entry, i) => (
        <li
          key={entry.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "var(--space-4)",
            padding: "10px 0",
            borderBottom: i < entries.length - 1 ? "1px solid var(--border)" : "none",
          }}
        >
          <span style={{ font: "400 var(--text-sm)/1.5 var(--font-plex-sans)", color: "var(--fg-2)" }}>
            {entry.summary}
          </span>
          <span
            className="data"
            style={{
              flex: "none",
              textAlign: "right",
              font: "400 var(--text-2xs)/1.6 var(--font-plex-mono)",
              color: "var(--muted)",
              whiteSpace: "nowrap",
            }}
          >
            {entry.who} · {formatClock(entry.whenIso)} AEST
          </span>
        </li>
      ))}
    </ol>
  );
}
