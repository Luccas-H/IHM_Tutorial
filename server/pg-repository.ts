import type { Pool } from 'pg'
import type { CommentInput, CommentRecord, RatingSummary, Tutorial, TutorialSummary } from '../src/domain/types'
import type { Repository } from './repository'

type TutorialRow = {
  id: string; slug: string; title: string; summary: string; intro: string; platforms: Tutorial['platforms'];
  difficulty: string; duration: number; cover_image: string; icon: string; position: number; steps: Tutorial['steps'];
  rating_average: string; rating_count: string; viewer_score: number | null
}

type CommentRow = {
  id: string; tutorial_id: string; parent_id: string | null; author: string; body: string; created_at: Date;
  upvotes: string; viewer_has_upvoted: boolean
}

const ratingFromRow = (row: TutorialRow): RatingSummary => ({
  average: Number(row.rating_average), count: Number(row.rating_count), viewerScore: row.viewer_score,
})

const summaryFromRow = (row: TutorialRow): TutorialSummary => ({
  id: row.id, slug: row.slug, title: row.title, summary: row.summary, platforms: row.platforms,
  difficulty: row.difficulty, duration: row.duration, coverImage: row.cover_image, icon: row.icon,
  position: row.position, rating: ratingFromRow(row),
})

const tutorialSelect = `
  SELECT t.*,
    COALESCE(ROUND(AVG(r.score), 1), 0)::text AS rating_average,
    COUNT(r.id)::text AS rating_count,
    MAX(r.score) FILTER (WHERE r.visitor_id = $1::uuid) AS viewer_score
  FROM tutorials t
  LEFT JOIN ratings r ON r.tutorial_id = t.id`

export class PgRepository implements Repository {
  constructor(private readonly db: Pool) {}

  async listTutorials(visitorId?: string): Promise<TutorialSummary[]> {
    const { rows } = await this.db.query<TutorialRow>(`${tutorialSelect}
      GROUP BY t.id ORDER BY t.position`, [visitorId ?? null])
    return rows.map(summaryFromRow)
  }

  async getTutorial(slug: string, visitorId?: string): Promise<Tutorial | null> {
    const { rows } = await this.db.query<TutorialRow>(`${tutorialSelect}
      WHERE t.slug = $2 GROUP BY t.id`, [visitorId ?? null, slug])
    const row = rows[0]
    return row ? { ...summaryFromRow(row), intro: row.intro, steps: row.steps } : null
  }

  async rateTutorial(tutorialId: string, visitorId: string, score: number): Promise<RatingSummary> {
    await this.db.query(`INSERT INTO ratings (tutorial_id, visitor_id, score)
      VALUES ($1, $2, $3)
      ON CONFLICT (tutorial_id, visitor_id) DO UPDATE SET score = EXCLUDED.score, updated_at = now()`,
      [tutorialId, visitorId, score])
    const { rows } = await this.db.query<{ average: string; count: string; viewer_score: number }>(`
      SELECT ROUND(AVG(score), 1)::text AS average, COUNT(*)::text AS count,
        MAX(score) FILTER (WHERE visitor_id = $2::uuid) AS viewer_score
      FROM ratings WHERE tutorial_id = $1`, [tutorialId, visitorId])
    return { average: Number(rows[0].average), count: Number(rows[0].count), viewerScore: rows[0].viewer_score }
  }

  async listComments(tutorialId: string, visitorId?: string): Promise<CommentRecord[]> {
    const { rows } = await this.db.query<CommentRow>(`
      SELECT c.*, COUNT(v.comment_id)::text AS upvotes,
        COALESCE(BOOL_OR(v.visitor_id = $2::uuid), false) AS viewer_has_upvoted
      FROM comments c LEFT JOIN comment_votes v ON v.comment_id = c.id
      WHERE c.tutorial_id = $1 GROUP BY c.id ORDER BY c.created_at`, [tutorialId, visitorId ?? null])

    const byId = new Map<string, CommentRecord>()
    rows.forEach((row) => byId.set(row.id, {
      id: row.id, tutorialId: row.tutorial_id, parentId: row.parent_id, author: row.author,
      body: row.body, createdAt: row.created_at.toISOString(), upvotes: Number(row.upvotes),
      viewerHasUpvoted: row.viewer_has_upvoted, replies: [],
    }))
    const roots: CommentRecord[] = []
    byId.forEach((comment) => {
      const parent = comment.parentId ? byId.get(comment.parentId) : undefined
      if (parent) parent.replies.push(comment)
      else roots.push(comment)
    })
    return roots
  }

  async createComment(tutorialId: string, input: CommentInput): Promise<CommentRecord> {
    const { rows } = await this.db.query<CommentRow>(`
      INSERT INTO comments (tutorial_id, parent_id, visitor_id, author, body)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *, '0'::text AS upvotes, false AS viewer_has_upvoted`,
      [tutorialId, input.parentId ?? null, input.visitorId, input.author.trim(), input.body.trim()])
    const row = rows[0]
    return { id: row.id, tutorialId: row.tutorial_id, parentId: row.parent_id, author: row.author,
      body: row.body, createdAt: row.created_at.toISOString(), upvotes: 0, viewerHasUpvoted: false, replies: [] }
  }

  async setVote(commentId: string, visitorId: string, active: boolean) {
    if (active) {
      await this.db.query('INSERT INTO comment_votes (comment_id, visitor_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [commentId, visitorId])
    } else {
      await this.db.query('DELETE FROM comment_votes WHERE comment_id = $1 AND visitor_id = $2', [commentId, visitorId])
    }
    const { rows } = await this.db.query<{ upvotes: string }>('SELECT COUNT(*)::text AS upvotes FROM comment_votes WHERE comment_id = $1', [commentId])
    return { upvotes: Number(rows[0].upvotes), viewerHasUpvoted: active }
  }
}
