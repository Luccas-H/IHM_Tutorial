import { AlertTriangle, Check, ChevronRight, Circle } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Tutorial } from '../domain/types'
import { loadProgress, saveProgress } from '../lib/progress'
import { CommandBlock } from './CommandBlock'
import { Keycap } from './Keycap'
import { MediaFigure } from './MediaFigure'

export function Timeline({ tutorial }: { tutorial: Tutorial }) {
  const [progress, setProgress] = useState(loadProgress)
  const completed = useMemo(() => new Set(progress[tutorial.id] ?? []), [progress, tutorial.id])
  const toggle = (id: string) => setProgress((current) => {
    const ids = new Set(current[tutorial.id] ?? [])
    ids.has(id) ? ids.delete(id) : ids.add(id)
    const next = { ...current, [tutorial.id]: [...ids] }
    saveProgress(next); return next
  })
  const percent = Math.round((completed.size / tutorial.steps.length) * 100)
  return <div className="timeline-wrap">
    <div className="progress-summary"><div><span>Seu progresso</span><strong>{completed.size} de {tutorial.steps.length} etapas</strong></div><span>{percent}%</span><div className="progress-track"><i style={{ width: `${percent}%` }} /></div></div>
    <ol className="timeline">{tutorial.steps.map((step, index) => {
      const done = completed.has(step.id)
      return <li key={step.id} className={done ? 'done' : index === completed.size ? 'current' : ''}>
        <span className="timeline-marker" aria-label={done ? 'Etapa concluída' : `Etapa ${index + 1}`}>{done ? <Check /> : <span>{index + 1}</span>}</span>
        <article className="step-card"><header><div><span>Etapa {index + 1}</span><h3>{step.title}</h3></div><button type="button" onClick={() => toggle(step.id)} className={done ? 'complete active' : 'complete'}>{done ? <Check size={15} /> : <Circle size={15} />}{done ? 'Concluída' : 'Marcar como feita'}</button></header>
          <p>{step.body}</p>
          {step.media && <MediaFigure media={step.media} />}
          {step.keys && <div className="keys-block"><span>Pressione</span><div aria-label={`Combinação de teclas ${step.keys.join(' mais ')}`}>{step.keys.map((key, keyIndex) => <span key={key}>{keyIndex > 0 && <b>+</b>}<Keycap value={key} /></span>)}</div></div>}
          {step.menuPath && <div className="menu-path" aria-label={`Caminho: ${step.menuPath.join(', ')}`}>{step.menuPath.map((part, partIndex) => <span key={part}>{partIndex > 0 && <ChevronRight size={14} />}<b>{part}</b></span>)}</div>}
          {step.command && <CommandBlock command={step.command} />}
          {step.warning && <div className="warning"><AlertTriangle /><div><strong>Atenção</strong><p>{step.warning}</p></div></div>}
          {step.expected && <div className="expected"><Check /><div><strong>Resultado esperado</strong><p>{step.expected}</p></div></div>}
        </article>
      </li>
    })}</ol>
  </div>
}
