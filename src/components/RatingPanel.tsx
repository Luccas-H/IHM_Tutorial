import { Check, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { RatingSummary } from '../domain/types'

const emojis = ['😞', '😞', '😕', '😕', '😐', '😐', '🙂', '🙂', '😄', '🤩']

export function RatingPanel({ rating, onRate, isPending, didSucceed }: { rating: RatingSummary; onRate: (score: number) => void; isPending: boolean; didSucceed?: boolean }) {
  const [selected, setSelected] = useState(rating.viewerScore ?? 10)
  const [submittedScore, setSubmittedScore] = useState<number | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  useEffect(() => { if (rating.viewerScore) setSelected(rating.viewerScore) }, [rating.viewerScore])
  useEffect(() => {
    const registered = submittedScore !== null && rating.viewerScore === submittedScore && !isPending
    if ((didSucceed === true && registered) || (didSucceed === undefined && registered)) setShowConfirmation(true)
  }, [didSucceed, isPending, rating.viewerScore, submittedScore])

  if (showConfirmation) return <section className="rating-panel rating-panel-success" aria-label="Avaliação concluída">
    <div className="rating-confirmation" role="status">
      <span className="confirmation-check" aria-label="Avaliação registrada"><Check /></span>
      <div><h3>Obrigado!</h3>{' '}<p>Sua avaliação foi registrada.</p></div>
      <button type="button" onClick={() => setShowConfirmation(false)}>Alterar nota</button>
    </div>
  </section>

  return <section className="rating-panel" aria-labelledby="rating-title">
    <div><span className="rating-icon"><Star size={20} fill="currentColor" /></span><div>
      <h3 id="rating-title">Este tutorial ajudou?</h3>
      <p>Sua nota melhora os próximos passos.</p>
    </div></div>
    <fieldset disabled={isPending}><legend>Escolha uma nota de 1 a 10</legend>
      <div className="score-row">{Array.from({ length: 10 }, (_, index) => index + 1).map((score) =>
        <label key={score} className={selected === score ? 'selected' : ''}>
          <input type="radio" name="score" value={score} checked={selected === score} onChange={() => setSelected(score)} aria-label={`Nota ${score}`} />
          <span><b aria-hidden="true">{emojis[score - 1]}</b><small>{score}</small></span>
        </label>)}</div>
      <button type="button" className="primary-button" onClick={() => { setSubmittedScore(selected); setShowConfirmation(false); onRate(selected) }}>{isPending ? 'Registrando…' : rating.viewerScore ? 'Atualizar nota' : 'Registrar nota'}</button>
    </fieldset>
  </section>
}
