import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { IncidentsTabBar } from '@/features/incidents/components/IncidentsTabBar'

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn() }))

vi.mock('next/navigation', () => ({ usePathname }))

describe('IncidentsTabBar', () => {
  it('renders all four tabs', () => {
    usePathname.mockReturnValue('/incidents')
    render(<IncidentsTabBar />)

    expect(screen.getByRole('link', { name: 'Map' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dispatch Order' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Manual Review' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Submit Image' })).toBeInTheDocument()
  })

  it('marks the tab matching the current path as active', () => {
    usePathname.mockReturnValue('/incidents/submit')
    render(<IncidentsTabBar />)

    expect(screen.getByRole('link', { name: 'Submit Image' })).toHaveClass('text-white')
    expect(screen.getByRole('link', { name: 'Map' })).not.toHaveClass('text-white')
  })
})
