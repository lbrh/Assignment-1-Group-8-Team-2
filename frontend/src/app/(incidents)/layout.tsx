import { redirect } from 'next/navigation'
import { getServerSession } from '@/actions/auth.actions'
import { IncidentsTabBar } from '@/features/incidents/components/IncidentsTabBar'

export default async function IncidentsLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()
  if (!session) redirect('/auth/signin')

  return (
    <div className="min-h-screen bg-zinc-950">
      <IncidentsTabBar />
      <main className="p-4">{children}</main>
    </div>
  )
}
