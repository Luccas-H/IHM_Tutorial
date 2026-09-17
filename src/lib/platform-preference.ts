import type { Platform, PlatformFilter } from '../domain/types'

const KEY = 'e-o-tutoras:preferred-platform'
const FILTER_KEY = 'e-o-tutoras:platform-filter'
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
  // "Todos os tutoriais" só muda a lista; o sistema do usuário continua valendo nos tutoriais
  return current
}

export function detectPlatform(): PlatformPreference {
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

/** Sistema usado para abrir os tutoriais: a escolha salva ou, sem escolha, o sistema detectado. */
export function loadPlatformPreference(): PlatformPreference {
  const stored = localStorage.getItem(KEY)
  // versões antigas salvavam 'all' aqui ao clicar em "Todos os tutoriais"; isso não é um sistema
  return platforms.includes(stored as Platform) ? stored as Platform : detectPlatform()
}

export function savePlatformPreference(platform: PlatformPreference) {
  if (platform === 'all') localStorage.removeItem(KEY)
  else localStorage.setItem(KEY, platform)
}

export function loadPlatformFilter(preference: PlatformPreference): PlatformFilter {
  const stored = localStorage.getItem(FILTER_KEY)
  if (stored === 'all' || stored === 'windows' || stored === 'linux' || stored === 'mobile') return stored
  if (localStorage.getItem(KEY) === 'all') return 'all'
  return platformToFilter(preference)
}

export function savePlatformFilter(filter: PlatformFilter) {
  localStorage.setItem(FILTER_KEY, filter)
}
