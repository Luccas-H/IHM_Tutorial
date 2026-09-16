import { Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { RatingSummary } from '../domain/types'

export function RatingPanel({ rating, onRate, isPending }: { rating: RatingSummary; onRate: (score: number) => void; isPending: boolean }) {
  const [selected, setSelected] = useState(rating.viewerScore ?? 10)
  useEffect(() => { if (rating.viewerScore) setSelected(rating.viewerScore) }, [rating.viewerScore])
  return <section className="rating-panel" aria-labelledby="rating-title">
    <div><span className="rating-icon"><Star size={20} fill="currentColor" /></span><div>
      <h3 id="rating-title">Este tutorial ajudou?</h3>
      <p>Sua nota melhora os próximos passos.</p>
    </div></div>
    <fieldset disabled={isPending}><legend>Escolha uma nota de 1 a 10</legend>
      <div className="score-row">{Array.from({ length: 10 }, (_, index) => index + 1).map((score) =>
        <label key={score} className={selected === score ? 'selected' : ''}>
          <input type="radio" name="score" value={score} checked={selected === score} onChange={() => setSelected(score)} aria-label={`Nota ${score}`} />
          <span>{score}</span>
        </label>)}</div>
      <button type="button" className="primary-button" onClick={() => onRate(selected)}>{isPending ? 'Registrando…' : rating.viewerScore ? 'Atualizar nota' : 'Registrar nota'}</button>
    </fieldset>
  </section>
}
