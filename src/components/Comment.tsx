import { MessageCircle, ThumbsUp } from 'lucide-react'
import type { CommentRecord } from '../domain/types'

function relativeTime(value: string) {
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 60_000))
  if (minutes < 60) return `há ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `há ${hours} h`
  return `há ${Math.floor(hours / 24)} d`
}

export function Comment({ comment, depth = 0, onReply, onVote }: { comment: CommentRecord; depth?: number; onReply: (comment: CommentRecord) => void; onVote: (comment: CommentRecord) => void }) {
  return <article className="comment" style={{ '--comment-depth': Math.min(depth, 3) } as React.CSSProperties}>
    <div className="comment-avatar" aria-hidden="true">{comment.author.charAt(0).toUpperCase()}</div>
    <div className="comment-content"><header><strong>{comment.author}</strong><span>{relativeTime(comment.createdAt)}</span></header>
      <p>{comment.body}</p>
      <div className="comment-actions">
        <button type="button" className={comment.viewerHasUpvoted ? 'voted' : ''} onClick={() => onVote(comment)} aria-label={`${comment.viewerHasUpvoted ? 'Remover voto de' : 'Votar em'} comentário de ${comment.author}`}><ThumbsUp size={14} fill={comment.viewerHasUpvoted ? 'currentColor' : 'none'} /> {comment.upvotes}</button>
        <button type="button" onClick={() => onReply(comment)}><MessageCircle size={14} /> Responder</button>
      </div>
      {comment.replies.map((reply) => <Comment key={reply.id} comment={reply} depth={depth + 1} onReply={onReply} onVote={onVote} />)}
    </div>
  </article>
}
