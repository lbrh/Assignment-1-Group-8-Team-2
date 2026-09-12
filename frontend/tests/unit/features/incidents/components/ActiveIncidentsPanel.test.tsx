import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActiveIncidentsPanel } from '@/features/incidents/components/ActiveIncidentsPanel'

describe('ActiveIncidentsPanel', () => {
  it('shows every sample incident by default', () => {
    render(<ActiveIncidentsPanel />)

    expect(screen.getByText('Ridge Rd, 3 km NE of Broadford')).toBeInTheDocument()
    expect(screen.getByText('Old Mill Reserve')).toBeInTheDocument()
    expect(screen.getByText('Unnamed track, Bellbird Gully')).toBeInTheDocument()
  })

  it('filters to severity 3 and 4 only when "Sev 3–4" is clicked', async () => {
    const user = userEvent.setup()
    render(<ActiveIncidentsPanel />)

    await user.click(screen.getByRole('button', { name: /sev 3–4/i }))

    // Severity 3/4 incidents remain
    expect(screen.getByText('Ridge Rd, 3 km NE of Broadford')).toBeInTheDocument()
    expect(screen.getByText('Simmons Creek Track')).toBeInTheDocument()

    // Severity 1/2 incidents are filtered out
    expect(screen.queryByText('Old Mill Reserve')).not.toBeInTheDocument()
    expect(screen.queryByText('Kinglake NP eastern boundary')).not.toBeInTheDocument()
  })

  it('filters to review-status incidents only when "Review" is clicked', async () => {
    const user = userEvent.setup()
    render(<ActiveIncidentsPanel />)

    await user.click(screen.getByRole('button', { name: /review 2/i }))

    expect(screen.getByText('Unnamed track, Bellbird Gully')).toBeInTheDocument()
    expect(screen.getByText('Broadmeadow fire trail')).toBeInTheDocument()
    expect(screen.queryByText('Ridge Rd, 3 km NE of Broadford')).not.toBeInTheDocument()
  })

  it('returns to showing everything when "All" is clicked again', async () => {
    const user = userEvent.setup()
    render(<ActiveIncidentsPanel />)

    await user.click(screen.getByRole('button', { name: /review 2/i }))
    await user.click(screen.getByRole('button', { name: /all 7/i }))

    expect(screen.getByText('Ridge Rd, 3 km NE of Broadford')).toBeInTheDocument()
    expect(screen.getByText('Unnamed track, Bellbird Gully')).toBeInTheDocument()
  })
})
