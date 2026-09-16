import type { RatingSummary } from '../domain/types'

const oneDecimal = (value: number) => Math.round(value * 10) / 10

export function calculateAverage(scores: number[]): number {
  if (scores.length === 0) return 0
  return oneDecimal(scores.reduce((total, score) => total + score, 0) / scores.length)
}

export function previewAverage(current: RatingSummary, score: number): RatingSummary {
  const hadScore = current.viewerScore !== null
  const count = hadScore ? current.count : current.count + 1
  const total = current.average * current.count - (current.viewerScore ?? 0) + score
  return { average: oneDecimal(total / count), count, viewerScore: score }
}
