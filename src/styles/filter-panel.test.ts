import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const layoutCss = readFileSync(resolve(process.cwd(), 'src/styles/layout.css'), 'utf8')
const lightThemeCss = readFileSync(resolve(process.cwd(), 'src/styles/theme-light.css'), 'utf8')

describe('painel de filtros separado da biblioteca', () => {
  it('separa o filtro da biblioteca por espaçamento, sem linha vertical', () => {
    expect(layoutCss).not.toMatch(/\.library-shell \.sidebar\s*\{[^}]*border-right/s)
    expect(layoutCss).toMatch(/\.library-shell\s*\{[^}]*gap:\s*12px/s)
    expect(layoutCss).not.toMatch(/\.library-shell \.sidebar\s*\{[^}]*margin:/s)
  })

  it('não volta a usar o cinza azulado no painel de filtros', () => {
    expect(lightThemeCss).not.toMatch(/#eef4f8/)
  })
})
