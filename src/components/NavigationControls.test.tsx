import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { TutorialSummary } from '../domain/types'
import { Sidebar } from './Sidebar'
import { TutorialList } from './TutorialList'

const tutorial: TutorialSummary = {
  id: '1',
  slug: 'verificar-erros-hd',
  title: 'Verificar erros e otimizar o HD',
  summary: 'Confira o disco passo a passo.',
  platforms: ['Windows', 'Linux'],
  difficulty: 'Intermediário',
  duration: 12,
  coverImage: '/images/hd-diagnostico.png',
  icon: 'HardDrive',
  position: 1,
  rating: { average: 10, count: 1, viewerScore: null },
}

describe('navigation controls', () => {
  it('identifies the device filter and exposes the selected option', () => {
    render(<Sidebar active="windows" onChange={() => undefined} count={5} />)

    expect(screen.getByText('Filtro de dispositivos')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Windows' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('img', { name: 'Símbolo do É o Tutoras' })).toBeInTheDocument()
  })

  it('lets the user collapse the tutorial library', async () => {
    const onToggleSize = vi.fn()
    render(<TutorialList
      tutorials={[tutorial]}
      selectedSlug={tutorial.slug}
      query=""
      onQueryChange={() => undefined}
      onSelect={() => undefined}
      loading={false}
      collapsed={false}
      onToggleCollapsed={onToggleSize}
    />)

    await userEvent.click(screen.getByRole('button', { name: 'Recolher biblioteca' }))
    expect(onToggleSize).toHaveBeenCalledOnce()
  })
})
