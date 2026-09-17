import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadPlatformPreference } from './platform-preference'

function mockBrowser({ userAgent, platform, uaPlatform, touchPoints = 0 }: { userAgent: string; platform: string; uaPlatform?: string; touchPoints?: number }) {
  vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(userAgent)
  vi.spyOn(window.navigator, 'platform', 'get').mockReturnValue(platform)
  Object.defineProperty(window.navigator, 'maxTouchPoints', { configurable: true, value: touchPoints })
  Object.defineProperty(window.navigator, 'userAgentData', { configurable: true, value: uaPlatform ? { platform: uaPlatform } : undefined })
}

describe('detecção automática do sistema', () => {
  afterEach(() => { vi.restoreAllMocks(); localStorage.clear() })

  it.each([
    ['Windows (Chrome)', { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36', platform: 'Win32', uaPlatform: 'Windows' }, 'Windows'],
    ['Windows (Firefox)', { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0', platform: 'Win32' }, 'Windows'],
    ['Linux (Chrome)', { userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36', platform: 'Linux x86_64', uaPlatform: 'Linux' }, 'Linux'],
    ['Linux (Firefox)', { userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0', platform: 'Linux x86_64' }, 'Linux'],
    ['Android (Chrome)', { userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36', platform: 'Linux armv81', uaPlatform: 'Android', touchPoints: 5 }, 'Android'],
    ['Android (Firefox)', { userAgent: 'Mozilla/5.0 (Android 14; Mobile; rv:130.0) Gecko/130.0 Firefox/130.0', platform: 'Linux aarch64', touchPoints: 5 }, 'Android'],
    ['iPhone (Safari)', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1', platform: 'iPhone', touchPoints: 5 }, 'iPhone'],
    ['iPad (modo desktop)', { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15', platform: 'MacIntel', touchPoints: 5 }, 'iPhone'],
    ['macOS', { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36', platform: 'MacIntel', uaPlatform: 'macOS' }, 'all'],
  ] as const)('%s', (_, browser, expected) => {
    mockBrowser(browser)
    expect(loadPlatformPreference()).toBe(expected)
  })

  it('respeita a escolha salva pelo usuário', () => {
    mockBrowser({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', platform: 'Win32' })
    localStorage.setItem('e-o-tutoras:preferred-platform', 'Linux')
    expect(loadPlatformPreference()).toBe('Linux')
  })
})
