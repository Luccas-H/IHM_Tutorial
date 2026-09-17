import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const componentsCss = readFileSync(resolve(process.cwd(), 'src/styles/components.css'), 'utf8')
let style: HTMLStyleElement

beforeAll(() => {
  style = document.createElement('style')
  style.textContent = componentsCss
  document.head.append(style)
})

afterAll(() => style.remove())

describe('tipografia do resumo do tutorial', () => {
  it('mantém descrição e metadados legíveis no painel principal', () => {
    document.body.innerHTML = `
      <section class="tutorial-hero">
        <div class="hero-content">
          <p>Descrição do tutorial selecionado.</p>
          <div class="hero-meta">
            <span><svg></svg>15 min</span>
            <span>7 etapas</span>
          </div>
        </div>
      </section>
    `

    const description = document.querySelector<HTMLElement>('.hero-content > p')!
    const metadata = document.querySelector<HTMLElement>('.hero-meta')!
    const icon = document.querySelector<SVGElement>('.hero-meta svg')!

    expect(getComputedStyle(description).fontSize).toBe('16px')
    expect(getComputedStyle(metadata).fontSize).toBe('12px')
    expect(getComputedStyle(icon).width).toBe('16px')
    expect(getComputedStyle(icon).height).toBe('16px')
  })
})
