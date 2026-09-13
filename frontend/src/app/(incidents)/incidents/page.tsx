import type { Metadata } from 'next'
import { SeverityLegend } from '@/features/incidents/components/SeverityLegend'
import { ActiveIncidentsPanel } from '@/features/incidents/components/ActiveIncidentsPanel'
import { IncidentsMapLoader } from '@/features/incidents/components/IncidentsMapLoader'

export const metadata: Metadata = {
  title: 'Incidents — Map',
}

export default function IncidentsMapPage() {
  return (
    <div className="grid h-[calc(100vh-5.5rem)] gap-4 lg:grid-cols-[1fr_22rem]">
      <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
        <IncidentsMapLoader />

        <div className="absolute bottom-4 left-4 z-[1000]">
          <SeverityLegend />
        </div>
      </div>

      <ActiveIncidentsPanel />
    </div>
  )
}
