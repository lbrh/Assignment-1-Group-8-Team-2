import { MOCK_INCIDENTS } from '@/features/incidents/data'

const SEVERITY_LEVELS = [
  { level: 4, tag: 'CAT', label: 'Catastrophic', color: 'bg-red-500 text-red-50' },
  { level: 3, tag: 'EXT', label: 'Extreme', color: 'bg-orange-500 text-orange-50' },
  { level: 2, tag: 'HIGH', label: 'High', color: 'bg-amber-500 text-amber-950' },
  { level: 1, tag: 'MOD', label: 'Moderate', color: 'bg-yellow-400 text-yellow-950' },
] as const

// Counts come from the same shared mock data ActiveIncidentsPanel uses, so
// the two stay in sync. Counted by severity level regardless of review
// status, since even an unconfirmed incident carries a tentative severity.
export function SeverityLegend() {
  return (
    <div className="w-56 rounded-lg border border-zinc-800 bg-zinc-950/90 p-3 text-zinc-300">
      <p className="mb-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
        Severity scale
      </p>
      <ul className="space-y-1.5">
        {SEVERITY_LEVELS.map(({ level, tag, label, color }) => {
          const count = MOCK_INCIDENTS.filter((incident) => incident.severity === level).length
          return (
            <li key={level} className="flex items-center gap-2 text-sm">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${color}`}
              >
                {level}
              </span>
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide">
                {tag}
              </span>
              <span className="flex-1">{label}</span>
              <span className="text-xs text-zinc-500">{count}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
