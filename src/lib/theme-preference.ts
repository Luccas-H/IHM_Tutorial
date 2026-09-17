import { withViewTransition } from './view-transition'

export type ThemeMode = 'light' | 'dark'

const KEY = 'e-o-tutoras:theme'

export function loadThemePreference(): ThemeMode {
  const stored = localStorage.getItem(KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#101112' : '#eef2f5')
}

// Troca o tema com um fade suave na tela inteira em vez de mudar as cores de uma vez.
export function transitionTheme(theme: ThemeMode) {
  if (withViewTransition(() => applyTheme(theme))) return
  const root = document.documentElement
  root.classList.add('theme-fading')
  applyTheme(theme)
  window.setTimeout(() => root.classList.remove('theme-fading'), 420)
}

export function saveThemePreference(theme: ThemeMode) {
  localStorage.setItem(KEY, theme)
}
