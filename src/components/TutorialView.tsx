import { ArrowLeft, Clock3, Gauge, ListChecks, MessageCircle, Star } from 'lucide-react'
import { useState } from 'react'
import { useComments, useCreateComment, useRateTutorial, useVoteComment } from '../api/queries'
import type { CommentRecord, Tutorial } from '../domain/types'
import { Community } from './Community'
import { RatingPanel } from './RatingPanel'
import { Timeline } from './Timeline'

const NICKNAME_KEY = 'e-o-tutoras:nickname'

export function TutorialView({ tutorial, visitorId, onBack }: { tutorial: Tutorial; visitorId: string; onBack: () => void }) {
  const [tab, setTab] = useState<'tutorial' | 'community'>('tutorial')
  const [nickname, setNickname] = useState(() => localStorage.getItem(NICKNAME_KEY) ?? '')
  const comments = useComments(tutorial.id, visitorId)
  const rate = useRateTutorial(tutorial, visitorId)
  const createComment = useCreateComment(tutorial.id, visitorId)
  const vote = useVoteComment(tutorial.id, visitorId)
  const updateNickname = (value: string) => { setNickname(value); localStorage.setItem(NICKNAME_KEY, value) }
  const toggleVote = (comment: CommentRecord) => vote.mutate({ id: comment.id, active: !comment.viewerHasUpvoted })
  return <article className="tutorial-view">
    <button type="button" className="mobile-back" onClick={onBack}><ArrowLeft size={17} /> Voltar aos tutoriais</button>
    <div className="tutorial-hero">
      <img src={tutorial.coverImage} alt="" aria-hidden="true" />
      <div className="hero-shade" />
      <div className="hero-content"><div className="platforms">{tutorial.platforms.map((platform) => <span key={platform}>{platform}</span>)}</div><h1>{tutorial.title}</h1><p>{tutorial.summary}</p>
        <div className="hero-meta"><span><Star fill="currentColor" /> <strong>{tutorial.rating.average.toFixed(1)}</strong> ({tutorial.rating.count} {tutorial.rating.count === 1 ? 'avaliação' : 'avaliações'})</span><span><Clock3 /> {tutorial.duration} min</span><span><Gauge /> {tutorial.difficulty}</span><span><ListChecks /> {tutorial.steps.length} etapas</span></div>
      </div>
    </div>
    <div className="tutorial-tabs" role="tablist"><button type="button" role="tab" aria-selected={tab === 'tutorial'} className={tab === 'tutorial' ? 'active' : ''} onClick={() => setTab('tutorial')}><ListChecks size={17} /> Tutorial</button><button type="button" role="tab" aria-selected={tab === 'community'} className={tab === 'community' ? 'active' : ''} onClick={() => setTab('community')}><MessageCircle size={17} /> Ajuda da comunidade <span>{comments.data?.length ?? 0}</span></button></div>
    {tab === 'tutorial' ? <div className="tutorial-content"><div className="intro-block"><p>{tutorial.intro}</p></div><Timeline tutorial={tutorial} /><RatingPanel rating={tutorial.rating} onRate={(score) => rate.mutate(score)} isPending={rate.isPending} />{rate.isError && <p className="request-error">A nota anterior foi restaurada. Tente novamente.</p>}</div> : <div className="community-content">{comments.isLoading ? <div className="community-loading">Carregando conversa…</div> : comments.isError ? <div className="request-error">Não foi possível abrir a conversa. <button onClick={() => comments.refetch()}>Tentar novamente</button></div> : <Community comments={comments.data ?? []} nickname={nickname} onNicknameChange={updateNickname} onSubmit={(input) => createComment.mutate(input)} onVote={toggleVote} isSubmitting={createComment.isPending} />}</div>}
  </article>
}
