// @vitest-environment node
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from './app'
import type { Repository } from './repository'
import type { TutorialSummary } from '../src/domain/types'

const tutorials: TutorialSummary[] = Array.from({ length: 5 }, (_, index) => ({
  id: String(index + 1), slug: `tutorial-${index + 1}`, title: `Tutorial ${index + 1}`,
  summary: 'Resumo', platforms: ['Windows'], difficulty: 'Iniciante', duration: 8,
  coverImage: '/images/test.webp', icon: 'HardDrive', position: index + 1,
  rating: { average: 10, count: 1, viewerScore: null },
}))

const repository: Repository = {
  listTutorials: async () => tutorials,
  getTutorial: async (slug) => slug === 'tutorial-1' ? { ...tutorials[0], intro: 'Introdução', steps: [] } : null,
  rateTutorial: async (_id, _visitor, score) => ({ average: 9, count: 2, viewerScore: score }),
  listComments: async () => [],
  createComment: async (_tutorialId, input) => ({ id: 'comment-1', tutorialId: '1', parentId: input.parentId ?? null, author: input.author, body: input.body, createdAt: new Date(0).toISOString(), upvotes: 0, viewerHasUpvoted: false, replies: [] }),
  setVote: async (_commentId, _visitorId, active) => ({ upvotes: active ? 1 : 0, viewerHasUpvoted: active }),
}

describe('tutorial API', () => {
  const app = createApp(repository)

  it('lists the five seeded tutorials', async () => {
    const response = await request(app).get('/api/tutorials')
    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(5)
  })

  it('validates ratings from one to ten', async () => {
    const response = await request(app).put('/api/tutorials/1/rating').send({ visitorId: crypto.randomUUID(), score: 11 })
    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('INVALID_INPUT')
  })

  it('creates a reply with an alias', async () => {
    const response = await request(app).post('/api/tutorials/1/comments').send({
      visitorId: crypto.randomUUID(), author: 'Lia', body: 'Funcionou no meu notebook.', parentId: null,
    })
    expect(response.status).toBe(201)
    expect(response.body.author).toBe('Lia')
  })
})
