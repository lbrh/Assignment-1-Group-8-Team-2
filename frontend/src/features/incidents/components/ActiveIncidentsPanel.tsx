'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { MOCK_INCIDENTS } from '@/features/incidents/data'
import type { MockIncident } from '@/features/incidents/types'

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
  const [incidents, setIncidents] = useState<MockIncident[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reviewCount = (incidents ?? []).filter((i) => i.status === 'REVIEW').length
  const filtered = (incidents ?? []).filter((incident) => {
    if (filter === 'high') return incident.severity >= 3
    if (filter === 'review') return incident.status === 'REVIEW'
    return true
  })
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIncidents(MOCK_INCIDENTS)
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex h-full flex-col rounded-lg border border-zinc-800 bg-zinc-950">
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <LoadingSpinner className="border-zinc-700 border-t-zinc-300" />
        </div>
      ) : error ? (
        <div className="flex flex-1 items-center justify-center p-4 text-center text-sm text-red-400">
          {error}
        </div>
      ) : (
      <>
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
          <li key={incident.id}>
            <Link
              href={`/incidents/${incident.id}`}
              className="flex items-start gap-3 p-3 transition-colors hover:bg-zinc-900"
            >
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
                      <span
                        className={incident.confidence < 60 ? 'text-amber-400' : 'text-teal-400'}
                      >
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
            </Link>
          </li>
        ))}
      </ul>
      </>
      )}
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
