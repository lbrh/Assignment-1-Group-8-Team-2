import type { SourceType } from "@/lib/types";

const SOURCE_META: Record<SourceType, { abbr: string; label: string }> = {
  drone: { abbr: "DRONE", label: "Drone / aerial feed" },
  satellite: { abbr: "SAT", label: "Satellite feed" },
  citizen: { abbr: "MANUAL", label: "Manual upload" },
  cctv: { abbr: "API", label: "Bulk / API submission" },
};

export function SourceChip({ source }: { source: SourceType }) {
  const meta = SOURCE_META[source];
  return (
    <span
      title={`Input source · ${meta.label}`}
      style={{
        font: "700 9px/1 var(--font-plex-mono)",
        letterSpacing: "0.12em",
        color: "var(--fg-4)",
        border: "1px solid var(--border-3)",
        padding: "4px 6px",
        whiteSpace: "nowrap",
      }}
    >
      {meta.abbr}
    </span>
  );
}

export { SOURCE_META };
