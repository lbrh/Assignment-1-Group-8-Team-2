'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface MockIncident {
  id: string
  title: string
  severity: 1 | 2 | 3 | 4
  tag: 'MOD' | 'HIGH' | 'EXT' | 'CAT' | 'REVIEW'
  timeAgo: string
  confidence: number | null
  status: 'AWAITING' | 'REVIEW'
}

// Static sample data — real incidents come from Firestore once the map/data
// layer is built. This panel exists to prove the layout and filtering first.
const MOCK_INCIDENTS: MockIncident[] = [
  {
    id: 'INC-0428',
    title: 'Ridge Rd, 3 km NE of Broadford',
    severity: 4,
    tag: 'CAT',
    timeAgo: '6m ago',
    confidence: 92,
    status: 'AWAITING',
  },
  {
    id: 'INC-0431',
    title: 'Simmons Creek Track',
    severity: 3,
    tag: 'EXT',
    timeAgo: '21m ago',
    confidence: 88,
    status: 'AWAITING',
  },
  {
    id: 'INC-0426',
    title: 'Warrandale Rd culvert',
    severity: 3,
    tag: 'EXT',
    timeAgo: '37m ago',
    confidence: 71,
    status: 'AWAITING',
  },
  {
    id: 'INC-0419',
    title: 'Kinglake NP eastern boundary',
    severity: 2,
    tag: 'HIGH',
    timeAgo: '1h ago',
    confidence: 90,
    status: 'AWAITING',
  },
  {
    id: 'INC-0402',
    title: 'Old Mill Reserve',
    severity: 1,
    tag: 'MOD',
    timeAgo: '1h 28m ago',
    confidence: 94,
    status: 'AWAITING',
  },
  {
    id: 'INC-0433',
    title: 'Unnamed track, Bellbird Gully',
    severity: 1,
    tag: 'REVIEW',
    timeAgo: '2m ago',
    confidence: 34,
    status: 'REVIEW',
  },
  {
    id: 'INC-0435',
    title: 'Broadmeadow fire trail',
    severity: 1,
    tag: 'REVIEW',
    timeAgo: '4m ago',
    confidence: 41,
    status: 'REVIEW',
  },
]

const SEVERITY_TAG_COLOR: Record<MockIncident['tag'], string> = {
  CAT: 'bg-red-500 text-red-50',
  EXT: 'bg-orange-500 text-orange-50',
  HIGH: 'bg-amber-500 text-amber-950',
  MOD: 'bg-yellow-400 text-yellow-950',
  REVIEW: 'bg-teal-500 text-teal-50',
}

type Filter = 'all' | 'high' | 'review'

export function ActiveIncidentsPanel() {
  const [filter, setFilter] = useState<Filter>('all')

  const reviewCount = MOCK_INCIDENTS.filter((i) => i.status === 'REVIEW').length
  const filtered = MOCK_INCIDENTS.filter((incident) => {
    if (filter === 'high') return incident.severity >= 3
    if (filter === 'review') return incident.status === 'REVIEW'
    return true
  })

  return (
    <div className="flex h-full flex-col rounded-lg border border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 p-3">
        <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
          Active incidents
        </p>
        <div className="mt-3 flex gap-2">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
            All {MOCK_INCIDENTS.length}
          </FilterChip>
          <FilterChip active={filter === 'high'} onClick={() => setFilter('high')}>
            Sev 3–4
          </FilterChip>
          <FilterChip active={filter === 'review'} onClick={() => setFilter('review')}>
            Review {reviewCount}
          </FilterChip>
        </div>
      </div>

      <ul className="flex-1 divide-y divide-zinc-800 overflow-y-auto">
        {filtered.map((incident) => (
          <li key={incident.id} className="flex items-start gap-3 p-3">
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                SEVERITY_TAG_COLOR[incident.tag],
              )}
            >
              {incident.status === 'REVIEW' ? '?' : incident.severity}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide',
                    SEVERITY_TAG_COLOR[incident.tag],
                  )}
                >
                  {incident.tag}
                </span>
                <p className="truncate text-sm font-medium text-zinc-100">{incident.title}</p>
              </div>
              <p className="mt-0.5 text-xs text-zinc-500">
                {incident.id} · {incident.timeAgo}
                {incident.confidence !== null && (
                  <>
                    {' '}
                    · conf{' '}
                    <span className={incident.confidence < 60 ? 'text-amber-400' : 'text-teal-400'}>
                      {incident.confidence}%
                    </span>
                  </>
                )}
              </p>
            </div>

            <span
              className={cn(
                'shrink-0 rounded px-2 py-1 text-[10px] font-semibold tracking-wide',
                incident.status === 'REVIEW'
                  ? 'bg-teal-500/20 text-teal-300'
                  : 'bg-zinc-800 text-zinc-400',
              )}
            >
              {incident.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1 text-xs font-medium transition-colors',
        active ? 'bg-teal-500 text-teal-950' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200',
      )}
    >
      {children}
    </button>
  )
}
