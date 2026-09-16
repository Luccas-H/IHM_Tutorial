import { describe, expect, it } from 'vitest'
import { filterTutorials } from './tutorial-filter'

const items = [
  { id: '1', title: 'Instalar uma impressora', summary: 'USB no PC', platforms: ['Windows', 'Linux'] },
  { id: '2', title: 'Parear PC e smartphone', summary: 'Conectar via Bluetooth', platforms: ['Windows', 'Android'] },
]

describe('filterTutorials', () => {
  it('ignores accents and letter case', () => {
    expect(filterTutorials(items, 'IMPRESSORA', 'all')).toHaveLength(1)
  })

  it('combines text and platform filters', () => {
    expect(filterTutorials(items, 'pc', 'mobile')[0]?.id).toBe('2')
  })
})
