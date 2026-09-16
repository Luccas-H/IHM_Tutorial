import express from 'express'
import { z } from 'zod'
import type { Repository } from './repository'

const visitorSchema = z.uuid()
const ratingSchema = z.object({ visitorId: visitorSchema, score: z.number().int().min(1).max(10) })
const commentSchema = z.object({
  visitorId: visitorSchema,
  author: z.string().trim().min(2).max(24),
  body: z.string().trim().min(2).max(1000),
  parentId: z.uuid().nullable().optional(),
})
const voteSchema = z.object({ visitorId: visitorSchema })

function invalidInput(error: z.ZodError) {
  return {
    error: {
      code: 'INVALID_INPUT',
      message: 'Confira os dados informados.',
      fields: Object.fromEntries(error.issues.map((issue) => [issue.path.join('.'), issue.message])),
    },
  }
}

export function createApp(repository: Repository) {
  const app = express()
  app.use(express.json({ limit: '24kb' }))

  app.get('/api/health', (_request, response) => response.json({ ok: true }))

  app.get('/api/tutorials', async (request, response, next) => {
    try {
      response.json(await repository.listTutorials(typeof request.query.visitorId === 'string' ? request.query.visitorId : undefined))
    } catch (error) { next(error) }
  })

  app.get('/api/tutorials/:slug', async (request, response, next) => {
    try {
      const tutorial = await repository.getTutorial(request.params.slug, typeof request.query.visitorId === 'string' ? request.query.visitorId : undefined)
      if (!tutorial) return response.status(404).json({ error: { code: 'NOT_FOUND', message: 'Tutorial não encontrado.' } })
      response.json(tutorial)
    } catch (error) { next(error) }
  })

  app.put('/api/tutorials/:id/rating', async (request, response, next) => {
    const parsed = ratingSchema.safeParse(request.body)
    if (!parsed.success) return response.status(400).json(invalidInput(parsed.error))
    try {
      response.json(await repository.rateTutorial(request.params.id, parsed.data.visitorId, parsed.data.score))
    } catch (error) { next(error) }
  })

  app.get('/api/tutorials/:id/comments', async (request, response, next) => {
    try {
      response.json(await repository.listComments(request.params.id, typeof request.query.visitorId === 'string' ? request.query.visitorId : undefined))
    } catch (error) { next(error) }
  })

  app.post('/api/tutorials/:id/comments', async (request, response, next) => {
    const parsed = commentSchema.safeParse(request.body)
    if (!parsed.success) return response.status(400).json(invalidInput(parsed.error))
    try {
      response.status(201).json(await repository.createComment(request.params.id, parsed.data))
    } catch (error) { next(error) }
  })

  app.post('/api/comments/:id/votes', async (request, response, next) => {
    const parsed = voteSchema.safeParse(request.body)
    if (!parsed.success) return response.status(400).json(invalidInput(parsed.error))
    try { response.json(await repository.setVote(request.params.id, parsed.data.visitorId, true)) } catch (error) { next(error) }
  })

  app.delete('/api/comments/:id/votes', async (request, response, next) => {
    const parsed = voteSchema.safeParse(request.body)
    if (!parsed.success) return response.status(400).json(invalidInput(parsed.error))
    try { response.json(await repository.setVote(request.params.id, parsed.data.visitorId, false)) } catch (error) { next(error) }
  })

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    console.error(error)
    response.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Não foi possível concluir agora.' } })
  })

  return app
}
