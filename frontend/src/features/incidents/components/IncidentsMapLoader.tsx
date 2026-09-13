'use client'

import dynamic from 'next/dynamic'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

// Leaflet touches the browser DOM directly, so it can't be server-rendered —
// loaded client-side only, with a spinner while the map module itself loads.
const IncidentsMap = dynamic(
  () => import('./IncidentsMap').then((mod) => mod.IncidentsMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner className="border-zinc-700 border-t-zinc-300" />
      </div>
    ),
  },
)

export function IncidentsMapLoader() {
  return <IncidentsMap />
}
