import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'

const summary = {
  id: '1', slug: 'verificar-erros-hd', title: 'Verificar erros e otimizar o HD', summary: 'Saúde do disco',
  platforms: ['Windows', 'Linux'], difficulty: 'Intermediário', duration: 12,
  coverImage: '/images/hd.webp', icon: 'HardDrive', position: 1,
  rating: { average: 10, count: 1, viewerScore: null },
}

const detail = { ...summary, intro: 'Comece identificando a unidade.', steps: [
  { id: 'step-common', title: 'Faça um backup', body: 'Salve seus arquivos.' },
  { id: 'step-windows', title: 'Abra a ferramenta do Windows', body: 'Use o atalho.', platforms: ['Windows'], media: { src: '/windows.svg', alt: 'Tela do Windows', caption: 'Windows' }, keys: ['⊞ Win', 'R'], expected: 'A janela abriu.' },
  { id: 'step-linux', title: 'Abra a ferramenta do Linux', body: 'Use o aplicativo Discos.', platforms: ['Linux'], media: { src: '/linux.svg', alt: 'Tela do Linux', caption: 'Linux' }, expected: 'O aplicativo abriu.' },
] }

const mobileSummary = {
  ...summary,
  id: '2', slug: 'fechar-app', title: 'Fechar aplicativo travado', platforms: ['Android', 'iPhone'],
  icon: 'Smartphone', position: 2,
}

const mobileDetail = { ...mobileSummary, intro: 'Escolha o seu celular.', steps: [
  { id: 'android-step', title: 'Abra no Android', body: 'Abra as informações.', platforms: ['Android'] },
  { id: 'iphone-step', title: 'Abra no iPhone', body: 'Abra os aplicativos recentes.', platforms: ['iPhone'] },
] }

beforeEach(() => {
  localStorage.setItem('e-o-tutoras:preferred-platform', 'Windows')
  localStorage.setItem('e-o-tutoras:theme', 'light')
})
afterEach(() => {
  cleanup(); localStorage.clear(); delete document.documentElement.dataset.theme
  vi.restoreAllMocks(); vi.unstubAllGlobals()
})

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

  it('shows only the steps for the selected operating system', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      const body = url.includes('/comments') ? [] : url.includes('/api/tutorials/') ? detail : [summary]
      return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }))
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(<QueryClientProvider client={queryClient}><App /></QueryClientProvider>)

    expect(await screen.findByRole('heading', { name: 'Abra a ferramenta do Windows' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Abra a ferramenta do Linux' })).not.toBeInTheDocument()

    const platformSelector = screen.getByRole('group', { name: 'Sistema deste tutorial' })
    await userEvent.click(within(platformSelector).getByRole('button', { name: 'Linux' }))

    expect(screen.getByRole('heading', { name: 'Abra a ferramenta do Linux' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Abra a ferramenta do Windows' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Faça um backup' })).toBeInTheDocument()
    expect(within(screen.getByRole('navigation', { name: 'Filtro de dispositivos' })).getByRole('button', { name: 'Linux' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('changes the main visual example with the selected operating system', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      const body = url.includes('/comments') ? [] : url.includes('/api/tutorials/') ? detail : [summary]
      return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }))
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(<QueryClientProvider client={queryClient}><App /></QueryClientProvider>)

    const windowsVisual = await screen.findByRole('img', { name: 'Exemplo visual para Windows' })
    expect(windowsVisual).toHaveAttribute('src', '/windows.svg')

    const platformSelector = screen.getByRole('group', { name: 'Sistema deste tutorial' })
    await userEvent.click(within(platformSelector).getByRole('button', { name: 'Linux' }))

    expect(screen.getByRole('img', { name: 'Exemplo visual para Linux' })).toHaveAttribute('src', '/linux.svg')
  })

  it('selects a valid platform when the user opens another tutorial', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      const body = url.includes('/comments') ? [] : url.includes('/api/tutorials/fechar-app') ? mobileDetail : url.includes('/api/tutorials/') ? detail : [summary, mobileSummary]
      return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }))
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(<QueryClientProvider client={queryClient}><App /></QueryClientProvider>)

    expect(await screen.findByRole('heading', { name: 'Abra a ferramenta do Windows' })).toBeInTheDocument()
    await userEvent.click(within(screen.getByRole('navigation', { name: 'Filtro de dispositivos' })).getByRole('button', { name: /Todos os tutoriais/ }))
    await userEvent.click(screen.getByRole('button', { name: /Fechar aplicativo travado/ }))

    expect(await screen.findByRole('heading', { name: 'Abra no Android' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Android' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('starts with Linux selected when the browser reports Linux', async () => {
    localStorage.removeItem('e-o-tutoras:preferred-platform')
    vi.spyOn(window.navigator, 'platform', 'get').mockReturnValue('Linux x86_64')
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      const body = url.includes('/comments') ? [] : url.includes('/api/tutorials/') ? detail : [summary]
      return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }))
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(<QueryClientProvider client={queryClient}><App /></QueryClientProvider>)

    const filters = screen.getByRole('navigation', { name: 'Filtro de dispositivos' })
    expect(await within(filters).findByRole('button', { name: 'Linux' })).toHaveAttribute('aria-pressed', 'true')
    expect(await screen.findByRole('heading', { name: 'Abra a ferramenta do Linux' })).toBeInTheDocument()
    expect(within(screen.getByRole('group', { name: 'Sistema deste tutorial' })).getByRole('button', { name: 'Linux' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('keeps opening tutorials on the detected system after the user picks "all tutorials"', async () => {
    localStorage.removeItem('e-o-tutoras:preferred-platform')
    vi.spyOn(window.navigator, 'platform', 'get').mockReturnValue('Linux x86_64')
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      const body = url.includes('/comments') ? [] : url.includes('/api/tutorials/') ? detail : [summary]
      return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }))
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(<QueryClientProvider client={queryClient}><App /></QueryClientProvider>)

    const filters = screen.getByRole('navigation', { name: 'Filtro de dispositivos' })
    await userEvent.click(await within(filters).findByRole('button', { name: /Todos os tutoriais/ }))
    cleanup()
    render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><App /></QueryClientProvider>)

    expect(await within(screen.getByRole('navigation', { name: 'Filtro de dispositivos' })).findByRole('button', { name: /Todos os tutoriais/ })).toHaveAttribute('aria-pressed', 'true')
    expect(await screen.findByRole('heading', { name: 'Abra a ferramenta do Linux' })).toBeInTheDocument()
    expect(within(screen.getByRole('group', { name: 'Sistema deste tutorial' })).getByRole('button', { name: 'Linux' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('switches the theme and remembers the user choice', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      const body = url.includes('/comments') ? [] : url.includes('/api/tutorials/') ? detail : [summary]
      return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }))
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(<QueryClientProvider client={queryClient}><App /></QueryClientProvider>)

    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    await userEvent.click(screen.getByRole('button', { name: 'Ativar modo escuro' }))

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(localStorage.getItem('e-o-tutoras:theme')).toBe('dark')
    expect(screen.getByRole('button', { name: 'Ativar modo claro' })).toBeInTheDocument()
  })

  it('starts in dark mode when the browser prefers a dark theme', () => {
    localStorage.removeItem('e-o-tutoras:theme')
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify([summary]), { status: 200, headers: { 'Content-Type': 'application/json' } })))
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(<QueryClientProvider client={queryClient}><App /></QueryClientProvider>)

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })

  it('lists completed tutorials and lets the user open one again', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      const body = url.includes('/comments') ? [] : url.includes('/api/tutorials/') ? detail : [summary]
      return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }))
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(<QueryClientProvider client={queryClient}><App /></QueryClientProvider>)

    const stepButtons = await screen.findAllByRole('button', { name: 'Marcar como feita' })
    expect(stepButtons).toHaveLength(2)
    await userEvent.click(stepButtons[0])
    await userEvent.click(stepButtons[1])

    const completedSection = screen.getByRole('button', { name: /Concluídos/ })
    await waitFor(() => expect(completedSection).toHaveTextContent('1'))
    await userEvent.click(completedSection)

    expect(screen.getByText('Concluído no Windows')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Verificar erros e otimizar o HD/ }))
    expect(await screen.findByRole('heading', { name: 'Verificar erros e otimizar o HD' })).toBeInTheDocument()
  })
})
