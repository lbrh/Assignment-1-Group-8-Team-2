import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Authentication',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-hero-gradient flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between px-6 sm:px-10">
        <div className="flex items-center gap-2.5">
          <div className="bg-brand-500 text-surface flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold">
            {(process.env.NEXT_PUBLIC_APP_NAME ?? 'A')[0]}
          </div>
          <span className="text-sm font-semibold text-white">
            {process.env.NEXT_PUBLIC_APP_NAME ?? 'App'}
          </span>
        </div>
        <Link href="/" className="text-sm text-white/70 transition-colors hover:text-white">
          Home
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
