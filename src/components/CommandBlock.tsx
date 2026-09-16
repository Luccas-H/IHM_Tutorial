import { Check, Copy, Terminal } from 'lucide-react'
import { useState } from 'react'
import type { StepCommand } from '../domain/types'

export function CommandBlock({ command }: { command: StepCommand }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command.code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }
  return <div className="command-block">
    <div className="command-head"><span><Terminal size={14} /> {command.platform} · {command.label}</span>
      <button type="button" onClick={copy} aria-label="Copiar comando">{copied ? <Check size={15} /> : <Copy size={15} />}<span aria-live="polite">{copied ? 'Copiado' : 'Copiar'}</span></button>
    </div>
    <pre><code>{command.code}</code></pre>
  </div>
}
