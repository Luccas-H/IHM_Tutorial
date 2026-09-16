import type { CommentInput, CommentRecord, RatingSummary, Tutorial, TutorialSummary } from '../src/domain/types'

export interface Repository {
  listTutorials(visitorId?: string): Promise<TutorialSummary[]>
  getTutorial(slug: string, visitorId?: string): Promise<Tutorial | null>
  rateTutorial(tutorialId: string, visitorId: string, score: number): Promise<RatingSummary>
  listComments(tutorialId: string, visitorId?: string): Promise<CommentRecord[]>
  createComment(tutorialId: string, input: CommentInput): Promise<CommentRecord>
  setVote(commentId: string, visitorId: string, active: boolean): Promise<{ upvotes: number; viewerHasUpvoted: boolean }>
}
