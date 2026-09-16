// @vitest-environment node
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pool } from './db'
import { PgRepository } from './pg-repository'

describe('PgRepository', () => {
  const repository = new PgRepository(pool)

  beforeAll(async () => {
    await pool.query(await readFile(resolve('db/001_schema.sql'), 'utf8'))
    await pool.query(await readFile(resolve('db/002_seed.sql'), 'utf8'))
  })

  beforeEach(async () => {
    await pool.query('DELETE FROM ratings WHERE seeded = false')
  })

  afterEach(async () => {
    await pool.query('DELETE FROM ratings WHERE seeded = false')
  })

  afterAll(() => pool.end())

  it('returns five tutorials with seeded rating ten', async () => {
    const items = await repository.listTutorials()
    expect(items).toHaveLength(5)
    expect(items.every((item) => item.rating.average === 10 && item.rating.count === 1)).toBe(true)
  })

  it('keeps every tutorial detailed enough for a beginner', async () => {
    const items = await repository.listTutorials()
    const tutorials = await Promise.all(items.map((item) => repository.getTutorial(item.slug)))

    expect(tutorials.every((tutorial) => tutorial && tutorial.steps.length >= 7)).toBe(true)
  })

  it('upserts one rating per visitor', async () => {
    const visitorId = crypto.randomUUID()
    const first = await repository.rateTutorial('11111111-1111-4111-8111-111111111111', visitorId, 8)
    const updated = await repository.rateTutorial('11111111-1111-4111-8111-111111111111', visitorId, 6)
    expect(first.count).toBe(updated.count)
    expect(updated.viewerScore).toBe(6)
  })

  it('builds nested comment replies', async () => {
    const comments = await repository.listComments('11111111-1111-4111-8111-111111111111')
    expect(comments[0]?.replies).toHaveLength(1)
  })
})
