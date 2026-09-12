import type { Metadata } from 'next'
import { Map } from 'lucide-react'
import { SeverityLegend } from '@/features/incidents/components/SeverityLegend'
import { ActiveIncidentsPanel } from '@/features/incidents/components/ActiveIncidentsPanel'

export const metadata: Metadata = {
  title: 'Incidents — Map',
}

export default function IncidentsMapPage() {
  return (
    <div className="grid h-[calc(100vh-5.5rem)] gap-4 lg:grid-cols-[1fr_22rem]">
      {/* Interactive map goes here next — this area is intentionally left blank */}
      <div className="relative flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
        <div className="flex flex-col items-center gap-2 text-zinc-600">
          <Map className="h-10 w-10" />
          <p className="text-sm">Map coming next — every incident will render here as a marker.</p>
        </div>

        <div className="absolute bottom-4 left-4">
          <SeverityLegend />
        </div>
      </div>

      <ActiveIncidentsPanel />
    </div>
  )
}
