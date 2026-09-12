import { describe, it, expect, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PhotoSubmissionArea } from '@/features/incidents/components/PhotoSubmissionArea'

function makeImageFile(name = 'fire.jpg') {
  return new File(['fake-image-bytes'], name, { type: 'image/jpeg' })
}

// jsdom doesn't implement this browser-only API — stub it for the preview logic.
beforeAll(() => {
  URL.createObjectURL = () => 'blob:mock-preview-url'
})

describe('PhotoSubmissionArea', () => {
  it('shows the dropzone and a disabled submit button before any file is chosen', () => {
    render(<PhotoSubmissionArea />)

    expect(screen.getByText(/click to attach a photo/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit for assessment/i })).toBeDisabled()
  })

  it('shows a preview and enables submit once a photo is selected', async () => {
    const user = userEvent.setup()
    render(<PhotoSubmissionArea />)

    const input = screen.getByLabelText(/click to attach a photo/i)
    await user.upload(input, makeImageFile())

    expect(screen.getByAltText(/selected bushfire photo preview/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit for assessment/i })).toBeEnabled()
  })

  it('clears the preview and disables submit again when removed', async () => {
    const user = userEvent.setup()
    render(<PhotoSubmissionArea />)

    const input = screen.getByLabelText(/click to attach a photo/i)
    await user.upload(input, makeImageFile())
    await user.click(screen.getByRole('button', { name: /remove selected photo/i }))

    expect(screen.queryByAltText(/selected bushfire photo preview/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit for assessment/i })).toBeDisabled()
  })
})
