import { MessageCircle, MessagesSquare, Send, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { CommentInput, CommentRecord } from '../domain/types'
import { Comment } from './Comment'

export function Community({ comments, nickname, onNicknameChange, onSubmit, onVote, isSubmitting }: {
  comments: CommentRecord[]; nickname: string; onNicknameChange: (value: string) => void;
  onSubmit: (input: Omit<CommentInput, 'visitorId'>) => void; onVote: (comment: CommentRecord) => void; isSubmitting: boolean;
}) {
  const [author, setAuthor] = useState(nickname)
  const [body, setBody] = useState('')
  const [replyTo, setReplyTo] = useState<CommentRecord | null>(null)
  const [error, setError] = useState('')
  useEffect(() => setAuthor(nickname), [nickname])
  const submit = () => {
    if (author.trim().length < 2) return setError('Use um apelido com pelo menos 2 caracteres.')
    if (body.trim().length < 2) return setError('Escreva uma dúvida ou dica antes de publicar.')
    setError(''); onNicknameChange(author.trim()); onSubmit({ author: author.trim(), body: body.trim(), parentId: replyTo?.id ?? null }); setBody(''); setReplyTo(null)
  }
  return <div className="community">
    <div className="community-intro"><span><MessagesSquare /></span><div><h3>Ajuda da comunidade</h3><p>Pergunte, responda e compartilhe o que funcionou.</p></div></div>
    <div className="composer">
      {replyTo && <div className="replying">Respondendo a <strong>{replyTo.author}</strong><button type="button" onClick={() => setReplyTo(null)} aria-label="Cancelar resposta"><X size={14} /></button></div>}
      <label>Seu apelido<input value={author} onChange={(event) => setAuthor(event.target.value)} maxLength={24} /></label>
      <label>Escreva sua dúvida ou dica<textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={1000} rows={3} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="button" className="primary-button" onClick={submit} disabled={isSubmitting}><Send size={16} /> {isSubmitting ? 'Publicando…' : replyTo ? 'Publicar resposta' : 'Publicar comentário'}</button>
    </div>
    <div className="comments-list">{comments.length ? comments.map((comment) => <Comment key={comment.id} comment={comment} onReply={setReplyTo} onVote={onVote} />) : <div className="empty-comments"><MessageCircle /><p>Seja a primeira pessoa a deixar uma dica.</p></div>}</div>
  </div>
}
