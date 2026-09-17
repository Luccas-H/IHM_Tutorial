import type { Platform } from '../domain/types'

const KEY = 'e-o-tutoras:progress:v1'
const COMPLETED_KEY = 'e-o-tutoras:completed:v1'
const CHANGE_EVENT = 'e-o-tutoras:progress-change'

export type CompletedTutorials = Record<string, Platform[]>

export function loadProgress(): Record<string, string[]> {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch { return {} }
}

export function saveProgress(progress: Record<string, string[]>) {
  localStorage.setItem(KEY, JSON.stringify(progress))
}

export function loadCompletedTutorials(): CompletedTutorials {
  try {
    const parsed = JSON.parse(localStorage.getItem(COMPLETED_KEY) ?? '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch { return {} }
}

export function setTutorialCompleted(tutorialId: string, platform: Platform, completed: boolean) {
  const current = loadCompletedTutorials()
  const platforms = new Set(current[tutorialId] ?? [])
  const hadPlatform = platforms.has(platform)
  if (completed) platforms.add(platform)
  else platforms.delete(platform)
  if (hadPlatform === completed) return

  const next = { ...current }
  if (platforms.size) next[tutorialId] = [...platforms]
  else delete next[tutorialId]
  localStorage.setItem(COMPLETED_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function subscribeToProgress(listener: () => void) {
  window.addEventListener(CHANGE_EVENT, listener)
  return () => window.removeEventListener(CHANGE_EVENT, listener)
}
