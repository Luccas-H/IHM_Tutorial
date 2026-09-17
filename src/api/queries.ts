import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CommentInput, CommentRecord, RatingSummary, Tutorial, TutorialSummary } from '../domain/types'
import { previewAverage } from '../lib/ratings'
import { request } from './client'

export const tutorialKeys = {
  list: (visitorId: string) => ['tutorials', visitorId] as const,
  detail: (slug: string, visitorId: string) => ['tutorial', slug, visitorId] as const,
  comments: (id: string, visitorId: string) => ['comments', id, visitorId] as const,
}

export const useTutorials = (visitorId: string) => useQuery({
  queryKey: tutorialKeys.list(visitorId),
  queryFn: () => request<TutorialSummary[]>(`/api/tutorials?visitorId=${visitorId}`),
})

export const useTutorial = (slug: string | null, visitorId: string) => useQuery({
  queryKey: tutorialKeys.detail(slug ?? '', visitorId),
  queryFn: () => request<Tutorial>(`/api/tutorials/${slug}?visitorId=${visitorId}`),
  enabled: Boolean(slug),
  // mantém o tutorial atual na tela enquanto o próximo carrega, sem piscar o skeleton
  placeholderData: keepPreviousData,
})

export const useComments = (tutorialId: string | undefined, visitorId: string) => useQuery({
  queryKey: tutorialKeys.comments(tutorialId ?? '', visitorId),
  queryFn: () => request<CommentRecord[]>(`/api/tutorials/${tutorialId}/comments?visitorId=${visitorId}`),
  enabled: Boolean(tutorialId),
})

export function useRateTutorial(tutorial: Tutorial | undefined, visitorId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (score: number) => request<RatingSummary>(`/api/tutorials/${tutorial!.id}/rating`, {
      method: 'PUT', body: JSON.stringify({ visitorId, score }),
    }),
    onMutate: async (score) => {
      if (!tutorial) return
      const detailKey = tutorialKeys.detail(tutorial.slug, visitorId)
      await client.cancelQueries({ queryKey: detailKey })
      const previous = client.getQueryData<Tutorial>(detailKey)
      client.setQueryData<Tutorial>(detailKey, (current) => current ? { ...current, rating: previewAverage(current.rating, score) } : current)
      return { previous, detailKey }
    },
    onError: (_error, _score, context) => {
      if (context?.previous) client.setQueryData(context.detailKey, context.previous)
    },
    onSuccess: (rating) => {
      if (!tutorial) return
      client.setQueryData<Tutorial>(tutorialKeys.detail(tutorial.slug, visitorId), (current) => current ? { ...current, rating } : current)
      client.setQueryData<TutorialSummary[]>(tutorialKeys.list(visitorId), (items) => items?.map((item) => item.id === tutorial.id ? { ...item, rating } : item))
    },
  })
}

export function useCreateComment(tutorialId: string | undefined, visitorId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: Omit<CommentInput, 'visitorId'>) => request<CommentRecord>(`/api/tutorials/${tutorialId}/comments`, {
      method: 'POST', body: JSON.stringify({ ...input, visitorId }),
    }),
    onSuccess: () => client.invalidateQueries({ queryKey: tutorialKeys.comments(tutorialId ?? '', visitorId) }),
  })
}

function updateComment(items: CommentRecord[], id: string, update: (item: CommentRecord) => CommentRecord): CommentRecord[] {
  return items.map((item) => item.id === id ? update(item) : { ...item, replies: updateComment(item.replies, id, update) })
}

export function useVoteComment(tutorialId: string | undefined, visitorId: string) {
  const client = useQueryClient()
  const key = tutorialKeys.comments(tutorialId ?? '', visitorId)
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => request<{ upvotes: number; viewerHasUpvoted: boolean }>(`/api/comments/${id}/votes`, {
      method: active ? 'POST' : 'DELETE', body: JSON.stringify({ visitorId }),
    }),
    onMutate: async ({ id, active }) => {
      await client.cancelQueries({ queryKey: key })
      const previous = client.getQueryData<CommentRecord[]>(key)
      client.setQueryData<CommentRecord[]>(key, (items = []) => updateComment(items, id, (item) => ({
        ...item, upvotes: Math.max(0, item.upvotes + (active ? 1 : -1)), viewerHasUpvoted: active,
      })))
      return { previous }
    },
    onError: (_error, _variables, context) => context?.previous && client.setQueryData(key, context.previous),
  })
}
