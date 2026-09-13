import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { SeverityLegend } from '@/features/incidents/components/SeverityLegend'

describe('SeverityLegend', () => {
  it('renders all four severity levels with their tag and label', () => {
    render(<SeverityLegend />)

    expect(screen.getByText('CAT')).toBeInTheDocument()
    expect(screen.getByText('Catastrophic')).toBeInTheDocument()

    expect(screen.getByText('EXT')).toBeInTheDocument()
    expect(screen.getByText('Extreme')).toBeInTheDocument()

    expect(screen.getByText('HIGH')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()

    expect(screen.getByText('MOD')).toBeInTheDocument()
    expect(screen.getByText('Moderate')).toBeInTheDocument()
  })

  it('renders the severity number badge for each level, scoped per row', () => {
    render(<SeverityLegend />)

    const rows: Array<[tag: string, badge: string]> = [
      ['CAT', '4'],
      ['EXT', '3'],
      ['HIGH', '2'],
      ['MOD', '1'],
    ]

    for (const [tag, badge] of rows) {
      const row = screen.getByText(tag).closest('li') as HTMLElement
      expect(within(row).getByText(badge)).toBeInTheDocument()
    }
  })

  it('shows a count of sample incidents for each severity level', () => {
    render(<SeverityLegend />)

    // From the shared mock data: 1 CAT, 2 EXT, 1 HIGH, 3 MOD (including review-flagged)
    expect(within(screen.getByText('CAT').closest('li') as HTMLElement).getByText('1')).toBeInTheDocument()
    expect(within(screen.getByText('EXT').closest('li') as HTMLElement).getByText('2')).toBeInTheDocument()
    expect(within(screen.getByText('HIGH').closest('li') as HTMLElement).getByText('1')).toBeInTheDocument()
    expect(within(screen.getByText('MOD').closest('li') as HTMLElement).getByText('3')).toBeInTheDocument()
  })
})
