'use client'

import { orderBy } from 'firebase/firestore'
import { useCollection } from '@/hooks/useFirestore'
import { getTeamMembersCollection } from '@/lib/firebase/firestore'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { TeamMemberCard } from './TeamMemberCard'

export function TeamRoster() {
  const { data: members, loading } = useCollection(getTeamMembersCollection(), orderBy('order'))

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" className="border-white/30 border-t-white" />
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 py-16">
        <EmptyState
          title="No team members yet"
          description="Run pnpm --filter frontend run seed:team to add the roster."
        />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {members.map((member) => (
        <TeamMemberCard key={member.id} member={member} />
      ))}
    </div>
  )
}
