import type { PlatformFilter } from '../domain/types'

interface FilterableTutorial {
  title: string
  summary: string
  platforms: string[]
}

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
}

export function filterTutorials<T extends FilterableTutorial>(items: T[], query: string, platform: PlatformFilter): T[] {
  const term = normalize(query.trim())
  return items.filter((item) => {
    const textMatches = !term || normalize(`${item.title} ${item.summary} ${item.platforms.join(' ')}`).includes(term)
    const platformMatches = platform === 'all' || item.platforms.some((itemPlatform) => {
      if (platform === 'mobile') return itemPlatform === 'Android' || itemPlatform === 'iPhone'
      return normalize(itemPlatform) === platform
    })
    return textMatches && platformMatches
  })
}
