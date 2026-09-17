type ViewTransitionDocument = Document & { startViewTransition?: (update: () => void) => { finished: Promise<void> } }

const prefersReducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** Executa uma mudança de layout/tema animando entre o antes e o depois. Retorna false se o navegador não suporta. */
export function withViewTransition(update: () => void) {
  const doc = document as ViewTransitionDocument
  if (prefersReducedMotion() || !doc.startViewTransition) { update(); return false }
  const root = document.documentElement
  // transições CSS atrasariam o estado final que o navegador fotografa
  root.classList.add('view-transitioning')
  doc.startViewTransition(update).finished.finally(() => root.classList.remove('view-transitioning'))
  return true
}
