const KEY = 'e-o-tutoras:progress:v1'

export function loadProgress(): Record<string, string[]> {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch { return {} }
}

export function saveProgress(progress: Record<string, string[]>) {
  localStorage.setItem(KEY, JSON.stringify(progress))
}
