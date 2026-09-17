import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import type { Tutorial } from '../domain/types'
import { Timeline } from './Timeline'

afterEach(() => { cleanup(); localStorage.clear() })

const tutorial: Tutorial = {
  id: 't1', slug: 't1', title: 'Teste', summary: '', platforms: ['Linux'], difficulty: 'Fácil', duration: 5,
  coverImage: '', icon: 'HardDrive', position: 1, rating: { average: 0, count: 0, viewerScore: null }, intro: '',
  steps: [{ id: 's1', title: 'Um', body: '' }, { id: 's2', title: 'Dois', body: '' }, { id: 's3', title: 'Três', body: '' }],
}

describe('Timeline', () => {
  it('destaca a primeira etapa pendente mesmo quando o usuário pula uma etapa', async () => {
    const { container } = render(<Timeline tutorial={tutorial} platform="Linux" />)
    const buttons = screen.getAllByRole('button', { name: 'Marcar como feita' })
    await userEvent.click(buttons[0])
    await userEvent.click(buttons[2])
    const items = container.querySelectorAll('.timeline > li')
    expect(items[1]).toHaveClass('current')
    expect(items[2]).toHaveClass('done')
    expect(screen.getByText('2 de 3 etapas')).toBeInTheDocument()
  })

  it('ignora etapas salvas que não existem mais no tutorial', () => {
    localStorage.setItem('e-o-tutoras:progress:v1', JSON.stringify({ 't1:Linux': ['s1', 'etapa-antiga', 'outra-antiga'] }))
    render(<Timeline tutorial={tutorial} platform="Linux" />)
    expect(screen.getByText('1 de 3 etapas')).toBeInTheDocument()
    expect(screen.getByText('33%')).toBeInTheDocument()
  })
})
