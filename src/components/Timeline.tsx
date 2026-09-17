import { AlertTriangle, Check, ChevronRight, Circle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { Platform, Tutorial } from '../domain/types'
import { loadProgress, saveProgress, setTutorialCompleted } from '../lib/progress'
import { CommandBlock } from './CommandBlock'
import { Keycap } from './Keycap'
import { MediaFigure } from './MediaFigure'

export function Timeline({ tutorial, platform }: { tutorial: Tutorial; platform: Platform }) {
  const [progress, setProgress] = useState(loadProgress)
  const steps = useMemo(() => tutorial.steps.filter((step) => !step.platforms?.length || step.platforms.includes(platform)), [platform, tutorial.steps])
  const progressKey = `${tutorial.id}:${platform}`
  const completed = useMemo(() => new Set(progress[progressKey] ?? []), [progress, progressKey])
  const toggle = (id: string) => setProgress((current) => {
    const ids = new Set(current[progressKey] ?? [])
    ids.has(id) ? ids.delete(id) : ids.add(id)
    const next = { ...current, [progressKey]: [...ids] }
    saveProgress(next); return next
  })
  // ignora ids salvos de etapas que não existem mais neste sistema
  const doneCount = steps.filter((step) => completed.has(step.id)).length
  const currentIndex = steps.findIndex((step) => !completed.has(step.id))
  const percent = steps.length ? Math.round((doneCount / steps.length) * 100) : 0
  useEffect(() => {
    setTutorialCompleted(tutorial.id, platform, steps.length > 0 && currentIndex === -1)
  }, [currentIndex, platform, steps.length, tutorial.id])
  return <div className="timeline-wrap">
    <div className="progress-summary"><div><span>Seu progresso em {platform}</span><strong>{doneCount} de {steps.length} etapas</strong></div><span>{percent}%</span><div className="progress-track"><i style={{ width: `${percent}%` }} /></div></div>
    <ol className="timeline">{steps.map((step, index) => {
      const done = completed.has(step.id)
      return <li key={step.id} className={done ? 'done' : index === currentIndex ? 'current' : ''}>
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
