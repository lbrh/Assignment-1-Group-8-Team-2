import { redirect } from 'next/navigation'
import { getServerSession } from '@/actions/auth.actions'
import { TeamHeader } from '@/components/layout/TeamHeader'

export default async function TeamLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()
  if (!session) redirect('/auth/signin')

  return (
    <div className="min-h-screen bg-surface">
      <TeamHeader />
      <div className="bg-hero-gradient">{children}</div>
    </div>
  )
}
