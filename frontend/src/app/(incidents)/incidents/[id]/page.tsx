import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { MOCK_INCIDENTS } from '@/features/incidents/data'
import { haversineDistanceKm, SEVERITY_RUBRIC } from '@/features/incidents/utils'
import { cn } from '@/lib/utils'

const SEVERITY_LABEL = { 1: 'Moderate', 2: 'High', 3: 'Extreme', 4: 'Catastrophic' } as const

const SEVERITY_TAG_COLOR = {
  CAT: 'bg-red-500 text-red-50',
  EXT: 'bg-orange-500 text-orange-50',
  HIGH: 'bg-amber-500 text-amber-950',
  MOD: 'bg-yellow-400 text-yellow-950',
  REVIEW: 'bg-teal-500 text-teal-50',
} as const

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const incident = MOCK_INCIDENTS.find((i) => i.id === id)
  return { title: incident ? `Incidents — ${incident.id}` : 'Incidents — Not found' }
}

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const incident = MOCK_INCIDENTS.find((i) => i.id === id)
  if (!incident) notFound()

  const rubric = SEVERITY_RUBRIC[incident.severity]

  const nearby = MOCK_INCIDENTS.filter((i) => i.id !== incident.id)
    .map((i) => ({
      ...i,
      distanceKm: haversineDistanceKm(
        incident.latitude,
        incident.longitude,
        i.latitude,
        i.longitude,
      ),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 3)

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Link
        href="/incidents"
        className="inline-flex items-center gap-1.5 text-sm text-teal-400 hover:text-teal-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to map
      </Link>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-4">
            <span
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl font-bold',
                SEVERITY_TAG_COLOR[incident.tag],
              )}
            >
              {incident.severity}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-wide text-zinc-100 uppercase">
                  {SEVERITY_LABEL[incident.severity]}
                </h1>
                <span
                  className={cn(
                    'rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide',
                    SEVERITY_TAG_COLOR[incident.tag],
                  )}
                >
                  {incident.tag}
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                AI assessed level {incident.severity} ({SEVERITY_LABEL[incident.severity]})
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="font-mono text-xs text-zinc-500">{incident.id}</p>
            <span
              className={cn(
                'mt-1 inline-block rounded px-2 py-1 text-[10px] font-semibold tracking-wide',
                incident.status === 'REVIEW'
                  ? 'bg-teal-500/20 text-teal-300'
                  : 'bg-zinc-800 text-zinc-400',
              )}
            >
              {incident.status}
            </span>
          </div>
        </div>

        {incident.confidence !== null && (
          <div className="border-b border-zinc-800 py-4">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-lg font-bold',
                  incident.confidence < 60 ? 'text-amber-400' : 'text-teal-400',
                )}
              >
                {incident.confidence}%
              </span>
              <span className="text-xs tracking-wide text-zinc-500 uppercase">
                {incident.confidence < 60 ? 'low confidence' : 'high confidence'}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-40 overflow-hidden rounded-full bg-zinc-800">
              <div
                className={cn(
                  'h-full rounded-full',
                  incident.confidence < 60 ? 'bg-amber-400' : 'bg-teal-400',
                )}
                style={{ width: `${incident.confidence}%` }}
              />
            </div>
            <p className="mt-1 text-[10px] text-zinc-600">
              75% threshold to auto-classify, per Sprint 1 requirements
            </p>
          </div>
        )}

        <div className="grid gap-4 pt-4 md:grid-cols-2">
          {/* Left column */}
          <div className="space-y-4">
            <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-zinc-700 bg-zinc-900 text-xs text-zinc-600">
              [ submitted image ]
            </div>

            <div>
              <p className="text-[10px] font-semibold tracking-wide text-zinc-500 uppercase">
                Location
              </p>
              <p className="font-mono text-sm text-zinc-200">
                {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
              </p>
              <p className="text-xs text-zinc-500">{incident.title}</p>
            </div>

            <div>
              <p className="text-[10px] font-semibold tracking-wide text-zinc-500 uppercase">
                Captured
              </p>
              <p className="text-sm text-zinc-200">{incident.timeAgo}</p>
            </div>

            <div>
              <p className="text-[10px] font-semibold tracking-wide text-zinc-500 uppercase">
                Record (exportable)
              </p>
              <p className="font-mono text-xs text-zinc-500">
                sev={incident.severity} conf={incident.confidence ?? 'n/a'} lat/lng=
                {incident.latitude.toFixed(4)},{incident.longitude.toFixed(4)} status=
                {incident.status.toLowerCase()}
              </p>
            </div>
          </div>

          {/* Right column */}
          <div className="rounded-md border border-teal-900 bg-teal-500/5 p-4">
            <p className="text-[10px] font-semibold tracking-wide text-teal-400 uppercase">
              Why this severity — rubric level {incident.severity} of 4
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[rubric.smoke, rubric.flame, rubric.damage].map((indicator) => (
                <span
                  key={indicator}
                  className="rounded border border-teal-800 bg-teal-500/10 px-2 py-1 text-[11px] text-teal-200"
                >
                  ✓ {indicator}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-zinc-400">
              Rubric-based assessment across smoke level, flame visibility, and damage/impact,
              summed to an overall severity of {incident.severity} ({SEVERITY_LABEL[incident.severity]}
              ), per the Sprint 1 severity matrix.
            </p>
          </div>
        </div>
      </div>

      {nearby.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-semibold tracking-wide text-zinc-500 uppercase">
            Nearby
          </p>
          <div className="flex flex-wrap gap-2">
            {nearby.map((n) => (
              <Link
                key={n.id}
                href={`/incidents/${n.id}`}
                className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm hover:bg-zinc-900"
              >
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                    SEVERITY_TAG_COLOR[n.tag],
                  )}
                >
                  {n.severity}
                </span>
                <span className="text-zinc-300">{n.id}</span>
                <span className="text-xs text-zinc-500">{n.distanceKm.toFixed(1)} km</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
