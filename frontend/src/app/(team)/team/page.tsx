import type { Metadata } from 'next'
import { adminDb } from '@/lib/firebase/admin'
import { TeamRoster } from '@/features/team/components/TeamRoster'

export const metadata: Metadata = {
  title: 'Team',
}

export default async function TeamPage() {
  const countSnap = await adminDb.collection('teamMembers').count().get()
  const memberCount = countSnap.data().count

  return (
    <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-widest text-brand-300 uppercase">
            Team name
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            IBM Team 8 — AI for Emergency and Environmental Response
          </h1>
          <p className="mt-3 text-sm text-white/70">
            The people who designed, built and tested this release. Every role on the sprint
            board, in the order the work moved through it.
          </p>
        </div>
        <p className="text-sm text-white/60">
          {memberCount} {memberCount === 1 ? 'member' : 'members'}
        </p>
      </div>

      <div className="mt-10">
        <TeamRoster />
      </div>
    </div>
  )
}
