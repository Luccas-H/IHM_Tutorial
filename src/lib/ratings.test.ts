import { describe, expect, it } from 'vitest'
import { calculateAverage, previewAverage } from './ratings'

describe('ratings', () => {
  it('starts from the seeded ten', () => {
    expect(calculateAverage([10])).toBe(10)
  })

  it('rounds the arithmetic mean to one decimal place', () => {
    expect(calculateAverage([10, 8, 7])).toBe(8.3)
  })

  it('previews an upsert without increasing the count for an existing visitor', () => {
    expect(previewAverage({ average: 10, count: 1, viewerScore: null }, 8)).toEqual({
      average: 9,
      count: 2,
      viewerScore: 8,
    })
    expect(previewAverage({ average: 9, count: 2, viewerScore: 8 }, 6)).toEqual({
      average: 8,
      count: 2,
      viewerScore: 6,
    })
  })
})
