import { AlertTriangle, Check, ChevronRight, Circle, SkipForward } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import type { Platform, Tutorial } from '../domain/types'
import { loadProgress, saveProgress, setTutorialCompleted } from '../lib/progress'
import { CommandBlock } from './CommandBlock'
import { Keycap } from './Keycap'
import { MediaFigure } from './MediaFigure'

// tempo de cada trecho da linha quando várias etapas são marcadas de uma vez
const CASCADE_STEP_MS = 260

export function Timeline({ tutorial, platform }: { tutorial: Tutorial; platform: Platform }) {
  const [progress, setProgress] = useState(loadProgress)
  const steps = useMemo(() => tutorial.steps.filter((step) => !step.platforms?.length || step.platforms.includes(platform)), [platform, tutorial.steps])
  const progressKey = `${tutorial.id}:${platform}`
  const completed = useMemo(() => new Set(progress[progressKey] ?? []), [progress, progressKey])
  const [skipTarget, setSkipTarget] = useState<number | null>(null)
  const [cascade, setCascade] = useState<{ from: number; to: number } | null>(null)
  const itemRefs = useRef(new Map<string, HTMLLIElement>())
  const updateSteps = (ids: string[], done: boolean) => setProgress((current) => {
    const saved = new Set(current[progressKey] ?? [])
    ids.forEach((id) => done ? saved.add(id) : saved.delete(id))
    const next = { ...current, [progressKey]: [...saved] }
    saveProgress(next); return next
  })
  // ignora ids salvos de etapas que não existem mais neste sistema
  const doneCount = steps.filter((step) => completed.has(step.id)).length
  const currentIndex = steps.findIndex((step) => !completed.has(step.id))
  const percent = steps.length ? Math.round((doneCount / steps.length) * 100) : 0
  const toggle = (index: number) => {
    const step = steps[index]
    if (completed.has(step.id)) return updateSteps([step.id], false)
    if (steps.slice(0, index).some((previous) => !completed.has(previous.id))) return setSkipTarget(index)
    updateSteps([step.id], true)
  }
  const confirmSkip = () => {
    if (skipTarget === null) return
    setCascade({ from: currentIndex, to: skipTarget + 1 })
    updateSteps(steps.slice(0, skipTarget + 1).map((step) => step.id), true)
    setSkipTarget(null)
  }
  const cancelSkip = () => {
    setSkipTarget(null)
    const item = itemRefs.current.get(steps[currentIndex]?.id)
    item?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
    item?.querySelector<HTMLButtonElement>('button.complete')?.focus({ preventScroll: true })
  }
  useEffect(() => {
    if (!cascade) return
    const timer = window.setTimeout(() => setCascade(null), (cascade.to - cascade.from + 1) * CASCADE_STEP_MS + 400)
    return () => window.clearTimeout(timer)
  }, [cascade])
  useEffect(() => {
    setTutorialCompleted(tutorial.id, platform, steps.length > 0 && currentIndex === -1)
  }, [currentIndex, platform, steps.length, tutorial.id])
  return <div className="timeline-wrap">
    <div className="progress-summary"><div><span>Seu progresso em {platform}</span><strong>{doneCount} de {steps.length} etapas</strong></div><span>{percent}%</span><div className="progress-track"><i style={{ width: `${percent}%` }} /></div></div>
    <ol className="timeline">{steps.map((step, index) => {
      const done = completed.has(step.id)
      const inCascade = cascade && index >= cascade.from && index <= cascade.to
      const cascadeStyle = inCascade ? { '--fill-delay': `${(index - cascade.from) * CASCADE_STEP_MS}ms`, '--fill-duration': `${CASCADE_STEP_MS}ms` } as CSSProperties : undefined
      return <li key={step.id} ref={(node) => { if (node) itemRefs.current.set(step.id, node); else itemRefs.current.delete(step.id) }} className={done ? 'done' : index === currentIndex ? 'current' : ''} style={cascadeStyle}>
        <span className="timeline-marker" aria-label={done ? 'Etapa concluída' : `Etapa ${index + 1}`}>{done ? <Check /> : <span>{index + 1}</span>}</span>
        <article className="step-card"><header><div><span>Etapa {index + 1}</span><h3>{step.title}</h3></div><button type="button" onClick={() => toggle(index)} className={done ? 'complete active' : 'complete'}>{done ? <Check size={15} /> : <Circle size={15} />}{done ? 'Concluída' : 'Marcar como feita'}</button></header>
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
    {skipTarget !== null && <SkipStepDialog skipped={steps.slice(0, skipTarget).map((step, index) => ({ step, index })).filter(({ step }) => !completed.has(step.id))} target={skipTarget} onConfirm={confirmSkip} onCancel={cancelSkip} />}
  </div>
}

function SkipStepDialog({ skipped, target, onConfirm, onCancel }: { skipped: { step: Tutorial['steps'][number]; index: number }[]; target: number; onConfirm: () => void; onCancel: () => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const onCancelRef = useRef(onCancel)
  onCancelRef.current = onCancel
  useEffect(() => {
    // o foco começa na opção que não altera o progresso
    cancelRef.current?.focus()
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onCancelRef.current()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  const title = skipped.length === 1 ? 'Você está pulando uma etapa' : `Você está pulando ${skipped.length} etapas`
  // portal: o backdrop-filter do painel prenderia o position: fixed dentro dele
  return createPortal(<div className="skip-dialog-backdrop" onMouseDown={(event) => event.currentTarget === event.target && onCancel()}>
    <div className="skip-dialog" role="alertdialog" aria-modal="true" aria-labelledby="skip-dialog-title" aria-describedby="skip-dialog-body">
      <span className="skip-dialog-icon"><SkipForward size={22} /></span>
      <h3 id="skip-dialog-title">{title}</h3>
      <p id="skip-dialog-body">Tem certeza? Se você já fez, marcamos todas as etapas até a etapa {target + 1}.</p>
      <ul>{skipped.map(({ step, index }) => <li key={step.id}><span>Etapa {index + 1}</span>{step.title}</li>)}</ul>
      <div className="skip-dialog-actions">
        <button ref={cancelRef} type="button" className="secondary" onClick={onCancel}>Não, voltar para a etapa {skipped[0].index + 1}</button>
        <button type="button" className="primary-button" onClick={onConfirm}>Sim, já fiz</button>
      </div>
    </div>
  </div>, document.body)
}
