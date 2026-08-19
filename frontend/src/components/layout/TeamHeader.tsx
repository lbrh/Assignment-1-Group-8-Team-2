'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function TeamHeader() {
  const router = useRouter()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.replace('/auth/signin')
    router.refresh()
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-ink/10 bg-surface-card px-6 sm:px-10">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-500 text-sm font-bold text-surface">
          {(process.env.NEXT_PUBLIC_APP_NAME ?? 'A')[0]}
        </div>
        <span className="text-sm font-semibold text-ink">
          {process.env.NEXT_PUBLIC_APP_NAME ?? 'App'}
        </span>
      </div>
      <nav className="flex items-center gap-6 text-sm">
        <Link href="/dashboard" className="text-ink-muted transition-colors hover:text-ink">
          Dashboard
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-1.5 text-ink-muted transition-colors hover:text-ink"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </nav>
    </header>
  )
}
