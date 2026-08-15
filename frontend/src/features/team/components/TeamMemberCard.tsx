'use client'

import { useEffect, useRef, useState } from 'react'
import { User } from 'lucide-react'
import type { TeamMember } from '@/types/firestore'
import { toDisplayName } from '@/features/team/utils'
import { cn } from '@/lib/utils'

interface TeamMemberCardProps {
  member: TeamMember
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  const blurbRef = useRef<HTMLParagraphElement>(null)
  const [open, setOpen] = useState(false)
  const [canExpand, setCanExpand] = useState(false)
  const hasBlurb = Boolean(member.blurb)

  useEffect(() => {
    const el = blurbRef.current
    if (!el || !hasBlurb) return
    setCanExpand(el.scrollHeight > el.clientHeight + 1)
  }, [hasBlurb, member.blurb])

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-ink/10 bg-surface-card p-5 shadow-sm">
      <div className="aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-lg bg-ink/5">
        {member.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- unconfigured external host
          <img src={member.photoUrl} alt={member.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center" aria-label="Default avatar">
            <User className="size-8 text-ink-faint" />
          </div>
        )}
      </div>

      <div className={cn('flex flex-1 flex-col gap-2', !hasBlurb && 'justify-center')}>
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-ink">
            {toDisplayName(member.name)}
          </h3>
          <p className="mt-0.5 font-mono text-[11px] font-medium tracking-wide text-brand-500 uppercase">
            {member.role}
          </p>
        </div>

        {hasBlurb && (
          <div className="flex flex-col gap-1.5">
            <p
              ref={blurbRef}
              className={cn('text-sm leading-relaxed text-ink-muted', !open && 'line-clamp-4')}
            >
              {member.blurb}
            </p>
            {canExpand && (
              <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="self-start text-xs font-medium text-brand-500 underline underline-offset-2 hover:text-brand-600"
              >
                {open ? 'Read less' : 'Read more'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
