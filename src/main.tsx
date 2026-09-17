import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@fontsource/manrope/latin-400.css'
import '@fontsource/manrope/latin-600.css'
import '@fontsource/manrope/latin-700.css'
import '@fontsource/manrope/latin-800.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-600.css'
import { App } from './app/App'
import './styles/global.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/theme-light.css'
import './styles/theme-dark.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60_000, retry: 1, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}><App /></QueryClientProvider>
  </StrictMode>,
)
