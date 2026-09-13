import type { Metadata } from 'next'
import { PhotoSubmissionArea } from '@/features/incidents/components/PhotoSubmissionArea'

export const metadata: Metadata = {
  title: 'Incidents — Submit Image',
}

export default function SubmitImagePage() {
  return (
    <div className="mx-auto max-w-xl">
      <PhotoSubmissionArea />
    </div>
  )
}
