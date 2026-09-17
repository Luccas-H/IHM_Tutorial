import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import type { Tutorial } from '../domain/types'
import { Timeline } from './Timeline'

afterEach(() => { cleanup(); localStorage.clear() })

const tutorial: Tutorial = {
  id: 't1', slug: 't1', title: 'Teste', summary: '', platforms: ['Linux'], difficulty: 'Fácil', duration: 5,
  coverImage: '', icon: 'HardDrive', position: 1, rating: { average: 0, count: 0, viewerScore: null }, intro: '',
  steps: [{ id: 's1', title: 'Um', body: '' }, { id: 's2', title: 'Dois', body: '' }, { id: 's3', title: 'Três', body: '' }, { id: 's4', title: 'Quatro', body: '' }, { id: 's5', title: 'Cinco', body: '' }],
}

describe('Timeline', () => {
  it('avisa quando o usuário tenta pular uma etapa', async () => {
    render(<Timeline tutorial={tutorial} platform="Linux" />)
    const buttons = screen.getAllByRole('button', { name: 'Marcar como feita' })
    await userEvent.click(buttons[0])
    await userEvent.click(buttons[1])
    await userEvent.click(buttons[3])
    const dialog = screen.getByRole('alertdialog', { name: 'Você está pulando uma etapa' })
    expect(within(dialog).getByText('Três')).toBeInTheDocument()
    expect(screen.getByText('2 de 5 etapas')).toBeInTheDocument()
  })

  it('marca todas as etapas até a escolhida quando o usuário confirma', async () => {
    const { container } = render(<Timeline tutorial={tutorial} platform="Linux" />)
    const buttons = screen.getAllByRole('button', { name: 'Marcar como feita' })
    await userEvent.click(buttons[0])
    await userEvent.click(buttons[1])
    await userEvent.click(buttons[3])
    await userEvent.click(screen.getByRole('button', { name: 'Sim, já fiz' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.getByText('4 de 5 etapas')).toBeInTheDocument()
    const items = container.querySelectorAll('.timeline > li')
    expect([...items].map((item) => item.className)).toEqual(['done', 'done', 'done', 'done', 'current'])
  })

  it('volta para a etapa pulada quando o usuário desiste', async () => {
    const { container } = render(<Timeline tutorial={tutorial} platform="Linux" />)
    const buttons = screen.getAllByRole('button', { name: 'Marcar como feita' })
    await userEvent.click(buttons[0])
    await userEvent.click(buttons[1])
    await userEvent.click(buttons[3])
    await userEvent.click(screen.getByRole('button', { name: 'Não, voltar para a etapa 3' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.getByText('2 de 5 etapas')).toBeInTheDocument()
    const third = container.querySelectorAll('.timeline > li')[2]
    expect(third).toHaveClass('current')
    expect(within(third as HTMLElement).getByRole('button', { name: 'Marcar como feita' })).toHaveFocus()
  })

  it('fecha o aviso com Esc voltando para a etapa pulada', async () => {
    render(<Timeline tutorial={tutorial} platform="Linux" />)
    await userEvent.click(screen.getAllByRole('button', { name: 'Marcar como feita' })[2])
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.getByText('0 de 5 etapas')).toBeInTheDocument()
  })

  it('ignora etapas salvas que não existem mais no tutorial', () => {
    localStorage.setItem('e-o-tutoras:progress:v1', JSON.stringify({ 't1:Linux': ['s1', 'etapa-antiga', 'outra-antiga'] }))
    render(<Timeline tutorial={tutorial} platform="Linux" />)
    expect(screen.getByText('1 de 5 etapas')).toBeInTheDocument()
    expect(screen.getByText('20%')).toBeInTheDocument()
  })
})
