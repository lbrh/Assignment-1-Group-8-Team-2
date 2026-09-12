'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/incidents', label: 'Map' },
  { href: '/incidents/dispatch-order', label: 'Dispatch Order' },
  { href: '/incidents/manual-review', label: 'Manual Review' },
  { href: '/incidents/submit', label: 'Submit Image' },
]

export function IncidentsTabBar() {
  const pathname = usePathname()

  return (
    <header className="flex h-14 items-center gap-1 border-b border-zinc-800 bg-zinc-950 px-4 text-zinc-300">
      <span className="mr-4 text-sm font-semibold tracking-wide text-white uppercase">
        {process.env.NEXT_PUBLIC_APP_NAME ?? 'Incidents'}
      </span>

      <nav className="flex h-full items-center gap-1">
        {TABS.map(({ href, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex h-full items-center border-b-2 px-3 text-xs font-medium tracking-wide uppercase transition-colors',
                isActive
                  ? 'border-teal-400 text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200',
              )}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="flex-1" />

      <span className="flex items-center gap-1.5 text-xs text-zinc-500">
        <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
        Live
      </span>
    </header>
  )
}
