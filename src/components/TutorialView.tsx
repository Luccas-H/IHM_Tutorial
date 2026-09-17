import { ArrowLeft, Clock3, Gauge, ListChecks, MessageCircle, Monitor, Smartphone, Star, Terminal } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useComments, useCreateComment, useRateTutorial, useVoteComment } from '../api/queries'
import type { CommentRecord, Tutorial } from '../domain/types'
import { Community } from './Community'
import { RatingPanel } from './RatingPanel'
import { Timeline } from './Timeline'
import type { Platform } from '../domain/types'

const NICKNAME_KEY = 'e-o-tutoras:nickname'

function guidePlatforms(platforms: Platform[]) {
  const desktop = platforms.filter((platform) => platform === 'Windows' || platform === 'Linux')
  return desktop.length > 1 ? desktop : platforms
}

const platformIcon = {
  Windows: Monitor,
  Linux: Terminal,
  Android: Smartphone,
  iPhone: Smartphone,
}

export function TutorialView({ tutorial, visitorId, preferredPlatform, onPlatformChange, onBack }: { tutorial: Tutorial; visitorId: string; preferredPlatform?: Platform; onPlatformChange: (platform: Platform) => void; onBack: () => void }) {
  const [tab, setTab] = useState<'tutorial' | 'community'>('tutorial')
  const availablePlatforms = guidePlatforms(tutorial.platforms)
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(() => preferredPlatform && availablePlatforms.includes(preferredPlatform) ? preferredPlatform : availablePlatforms[0])
  useEffect(() => {
    if (preferredPlatform && availablePlatforms.includes(preferredPlatform)) setSelectedPlatform(preferredPlatform)
  }, [preferredPlatform, tutorial.id])
  const visibleSteps = tutorial.steps.filter((step) => !step.platforms?.length || step.platforms.includes(selectedPlatform))
  const platformCover = tutorial.steps.find((step) => step.platforms?.includes(selectedPlatform) && step.media)?.media?.src ?? tutorial.coverImage
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
      <img src={platformCover} alt={`Exemplo visual para ${selectedPlatform}`} />
      <div className="hero-shade" />
      <div className="hero-content"><div className="platforms">{tutorial.platforms.map((platform) => <span key={platform}>{platform}</span>)}</div><h1>{tutorial.title}</h1><p>{tutorial.summary}</p>
        <div className="hero-meta"><span><Star fill="currentColor" /> <strong>{tutorial.rating.average.toFixed(1)}</strong> ({tutorial.rating.count} {tutorial.rating.count === 1 ? 'avaliação' : 'avaliações'})</span><span><Clock3 /> {tutorial.duration} min</span><span><Gauge /> {tutorial.difficulty}</span><span><ListChecks /> {visibleSteps.length} etapas</span></div>
      </div>
    </div>
    <div className="tutorial-tabs"><div className="tabs-inner" role="tablist" aria-label="Seções do tutorial"><button type="button" role="tab" aria-selected={tab === 'tutorial'} className={tab === 'tutorial' ? 'active' : ''} onClick={() => setTab('tutorial')}><ListChecks size={17} /> Tutorial</button><button type="button" role="tab" aria-selected={tab === 'community'} className={tab === 'community' ? 'active' : ''} onClick={() => setTab('community')}><MessageCircle size={17} /> Ajuda da comunidade <span>{comments.data?.length ?? 0}</span></button></div></div>
    {tab === 'tutorial' ? <div className="tutorial-content"><div className="intro-block"><p>{tutorial.intro}</p></div>{availablePlatforms.length > 1 && <div className="platform-selector" role="group" aria-label="Sistema deste tutorial"><div className="platform-selector-copy"><strong>Qual sistema você usa?</strong><span>As imagens e as etapas mudam com a sua escolha.</span></div><div className="platform-options">{availablePlatforms.map((platform) => { const Icon = platformIcon[platform]; const count = tutorial.steps.filter((step) => !step.platforms?.length || step.platforms.includes(platform)).length; return <button key={platform} type="button" aria-label={platform} aria-pressed={selectedPlatform === platform} className={selectedPlatform === platform ? 'active' : ''} onClick={() => { setSelectedPlatform(platform); onPlatformChange(platform) }}><span><Icon size={17} />{platform}</span><small>{count} etapas</small></button> })}</div></div>}<Timeline tutorial={tutorial} platform={selectedPlatform} /><RatingPanel rating={tutorial.rating} onRate={(score) => rate.mutate(score)} isPending={rate.isPending} didSucceed={rate.isSuccess} />{rate.isError && <p className="request-error">A nota anterior foi restaurada. Tente novamente.</p>}</div> : <div className="community-content">{comments.isLoading ? <div className="community-loading">Carregando conversa…</div> : comments.isError ? <div className="request-error">Não foi possível abrir a conversa. <button onClick={() => comments.refetch()}>Tentar novamente</button></div> : <Community comments={comments.data ?? []} nickname={nickname} onNicknameChange={updateNickname} onSubmit={(input) => createComment.mutate(input)} onVote={toggleVote} isSubmitting={createComment.isPending} />}</div>}
  </article>
}
