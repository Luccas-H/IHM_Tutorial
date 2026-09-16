export type Platform = 'Windows' | 'Linux' | 'Android' | 'iPhone'
export type PlatformFilter = 'all' | 'windows' | 'linux' | 'mobile'

export interface RatingSummary {
  average: number
  count: number
  viewerScore: number | null
}

export interface StepMedia {
  src: string
  alt: string
  caption: string
}

export interface StepCommand {
  platform: 'Windows' | 'Linux'
  code: string
  label: string
}

export interface TutorialStep {
  id: string
  title: string
  body: string
  media?: StepMedia
  keys?: string[]
  menuPath?: string[]
  command?: StepCommand
  warning?: string
  expected?: string
}

export interface TutorialSummary {
  id: string
  slug: string
  title: string
  summary: string
  platforms: Platform[]
  difficulty: string
  duration: number
  coverImage: string
  icon: string
  position: number
  rating: RatingSummary
}

export interface Tutorial extends TutorialSummary {
  intro: string
  steps: TutorialStep[]
}

export interface CommentRecord {
  id: string
  tutorialId: string
  parentId: string | null
  author: string
  body: string
  createdAt: string
  upvotes: number
  viewerHasUpvoted: boolean
  replies: CommentRecord[]
}

export interface CommentInput {
  visitorId: string
  author: string
  body: string
  parentId?: string | null
}
