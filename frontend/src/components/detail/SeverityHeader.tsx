import type { Incident } from "@/lib/types";
import { SEVERITY } from "@/lib/constants/severity";
import { SeverityDot } from "@/components/primitives/SeverityDot";
import { SeverityChip } from "@/components/primitives/SeverityChip";
import { StatusFlagChip } from "@/components/primitives/StatusFlagChip";
import { SourceChip } from "@/components/primitives/SourceChip";
import { ConfidenceMeter } from "@/components/primitives/ConfidenceMeter";

const PROVENANCE_TEXT: Record<Incident["provenance"], (i: Incident) => string> = {
  ai_classified: (i) => `Automated assessment · scored ${i.sum ?? "—"} of 16 · severity ${i.band} of 4`,
  ai_confirmed_by_coordinator: (i) => `AI provisional tag confirmed by coordinator · scored ${i.sum ?? "—"} of 16`,
  coordinator_assigned: () => "Assigned manually by coordinator · not an AI classification",
  coordinator_override: (i) => `Coordinator override · model assessed level ${i.band} of 4`,
  none: () => "No severity applied · routed to manual review",
};

export function SeverityHeader({ incident }: { incident: Incident }) {
  const band = incident.band;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 20, padding: "20px 22px" }}>
      <SeverityDot band={band} size={56} halo />
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 220 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              font: "600 24px/1.1 var(--font-plex-sans)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--fg)",
            }}
          >
            {band ? SEVERITY[band].label : "Flagged for manual review"}
          </span>
          <SeverityChip band={band} />
        </div>
        <span style={{ font: "400 11px/1.4 var(--font-plex-mono)", color: "var(--muted)" }}>
          {band === 0 ? PROVENANCE_TEXT.none(incident) : PROVENANCE_TEXT[incident.provenance](incident)}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
          <StatusFlagChip flag={incident.flag} dispatch={incident.dispatch} />
          <SourceChip source={incident.source} />
        </div>
      </div>

      {incident.confidence != null ? (
        <ConfidenceMeter
          confidence={incident.confidence}
          size="lg"
          note={
            incident.confidence < 0.75
              ? "below the fixed 0.75 threshold · never auto-classified"
              : "at or above the fixed 0.75 threshold"
          }
        />
      ) : null}

      <span
        style={{
          font: "600 13px/1 var(--font-plex-mono)",
          letterSpacing: "0.08em",
          color: "var(--fg-2)",
          alignSelf: "flex-start",
        }}
      >
        {incident.id}
      </span>
    </div>
  );
}
