import type { Platform, PlatformFilter } from '../domain/types'

const KEY = 'e-o-tutoras:preferred-platform'
const platforms: Platform[] = ['Windows', 'Linux', 'Android', 'iPhone']

export type PlatformPreference = Platform | 'all'

export function platformToFilter(platform: PlatformPreference): PlatformFilter {
  if (platform === 'Windows') return 'windows'
  if (platform === 'Linux') return 'linux'
  if (platform === 'Android' || platform === 'iPhone') return 'mobile'
  return 'all'
}

export function filterToPreference(filter: PlatformFilter, current: PlatformPreference): PlatformPreference {
  if (filter === 'windows') return 'Windows'
  if (filter === 'linux') return 'Linux'
  if (filter === 'mobile') return current === 'Android' || current === 'iPhone' ? current : 'Android'
  return 'all'
}

export function loadPlatformPreference(): PlatformPreference {
  const stored = localStorage.getItem(KEY)
  if (stored === 'all' || platforms.includes(stored as Platform)) return stored as PlatformPreference

  const nav = navigator as Navigator & { userAgentData?: { platform?: string } }
  const reported = `${nav.userAgentData?.platform ?? ''} ${nav.platform ?? ''} ${nav.userAgent ?? ''}`.toLowerCase()
  // Android também informa "Linux" no user agent, então os móveis precisam vir antes.
  if (reported.includes('android')) return 'Android'
  if (/iphone|ipad|ipod/.test(reported)) return 'iPhone'
  // iPadOS em modo desktop se apresenta como Mac; a tela sensível ao toque o denuncia.
  if (reported.includes('mac') && nav.maxTouchPoints > 1) return 'iPhone'
  if (reported.includes('win')) return 'Windows'
  if (reported.includes('linux')) return 'Linux'
  return 'all'
}

export function savePlatformPreference(platform: PlatformPreference) {
  localStorage.setItem(KEY, platform)
}
