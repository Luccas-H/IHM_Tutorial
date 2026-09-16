import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { RatingPanel } from './RatingPanel'

describe('RatingPanel', () => {
  it('submits a selected score from one to ten', async () => {
    const onRate = vi.fn()
    render(<RatingPanel rating={{ average: 10, count: 1, viewerScore: null }} onRate={onRate} isPending={false} />)
    await userEvent.click(screen.getByRole('radio', { name: 'Nota 8' }))
    await userEvent.click(screen.getByRole('button', { name: 'Registrar nota' }))
    expect(onRate).toHaveBeenCalledWith(8)
  })
})
