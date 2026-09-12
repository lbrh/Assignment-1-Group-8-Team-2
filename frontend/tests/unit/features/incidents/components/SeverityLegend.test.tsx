import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
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

  it('renders the severity number for each level', () => {
    render(<SeverityLegend />)

    for (const level of ['1', '2', '3', '4']) {
      expect(screen.getByText(level)).toBeInTheDocument()
    }
  })
})
