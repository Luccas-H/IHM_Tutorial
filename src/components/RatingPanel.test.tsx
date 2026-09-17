import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RatingPanel } from './RatingPanel'

afterEach(cleanup)

describe('RatingPanel', () => {
  it('submits a selected score from one to ten', async () => {
    const onRate = vi.fn()
    render(<RatingPanel rating={{ average: 10, count: 1, viewerScore: null }} onRate={onRate} isPending={false} />)
    await userEvent.click(screen.getByRole('radio', { name: 'Nota 8' }))
    await userEvent.click(screen.getByRole('button', { name: 'Registrar nota' }))
    expect(onRate).toHaveBeenCalledWith(8)
  })

  it('uses expressive emojis and thanks the user after the score is registered', async () => {
    const onRate = vi.fn()
    const { rerender } = render(<RatingPanel rating={{ average: 10, count: 1, viewerScore: null }} onRate={onRate} isPending={false} />)

    const highestScore = screen.getByRole('radio', { name: 'Nota 10' })
    expect(within(highestScore.closest('label')!).getByText('🤩')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('radio', { name: 'Nota 8' }))
    await userEvent.click(screen.getByRole('button', { name: 'Registrar nota' }))
    rerender(<RatingPanel rating={{ average: 9, count: 2, viewerScore: 8 }} onRate={onRate} isPending={false} />)

    expect(screen.getByRole('status')).toHaveTextContent('Obrigado! Sua avaliação foi registrada.')
    expect(screen.getByLabelText('Avaliação registrada')).toBeInTheDocument()
  })
})
