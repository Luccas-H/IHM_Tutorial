import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'

const summary = {
  id: '1', slug: 'verificar-erros-hd', title: 'Verificar erros e otimizar o HD', summary: 'Saúde do disco',
  platforms: ['Windows', 'Linux'], difficulty: 'Intermediário', duration: 12,
  coverImage: '/images/hd.webp', icon: 'HardDrive', position: 1,
  rating: { average: 10, count: 1, viewerScore: null },
}

const detail = { ...summary, intro: 'Comece identificando a unidade.', steps: [
  { id: 'step-1', title: 'Abra a ferramenta', body: 'Use o atalho.', keys: ['⊞ Win', 'R'], expected: 'A janela abriu.' },
] }

afterEach(() => vi.unstubAllGlobals())

describe('App', () => {
  it('shows the brand, catalog and selected tutorial without a page reload', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      const body = url.includes('/comments') ? [] : url.includes('/api/tutorials/') ? detail : [summary]
      return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }))
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(<QueryClientProvider client={queryClient}><App /></QueryClientProvider>)

    expect(screen.getByText('É o Tutoras')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: summary.title })).toBeInTheDocument()
    expect(screen.getByText('⊞ Win')).toBeInTheDocument()

    await userEvent.type(screen.getByRole('searchbox'), 'nada')
    await waitFor(() => expect(screen.getByText('Nenhum tutorial encontrado')).toBeInTheDocument())
  })
})
