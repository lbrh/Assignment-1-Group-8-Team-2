import type { Metadata } from 'next'
import { SearchX } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Incidents — Manual Review',
}

export default function ManualReviewPage() {
  return (
    <div className="flex h-[calc(100vh-5.5rem)] flex-col items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-600">
      <SearchX className="h-10 w-10" />
      <p className="text-sm">Unassessable images queue — coming in a later step.</p>
    </div>
  )
}
