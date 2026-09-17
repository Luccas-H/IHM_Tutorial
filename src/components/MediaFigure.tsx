import { ImageIcon, Maximize2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { StepMedia } from '../domain/types'

export function MediaFigure({ media }: { media: StepMedia }) {
  const [open, setOpen] = useState(false)
  const [failed, setFailed] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])
  return <>
    <figure className="media-figure">
      {failed ? <div className="media-fallback"><ImageIcon /><span>Imagem de exemplo indisponível</span></div> :
        <img src={media.src} alt={media.alt} loading="lazy" onError={() => setFailed(true)} />}
      <figcaption>{media.caption}</figcaption>
      {!failed && <button type="button" className="expand-media" onClick={() => setOpen(true)}><Maximize2 size={15} /> Abrir imagem</button>}
    </figure>
    {open && createPortal(<div className="lightbox" role="dialog" aria-modal="true" aria-label="Imagem ampliada" onMouseDown={(event) => event.currentTarget === event.target && setOpen(false)}>
      <button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label="Fechar imagem"><X /></button>
      <img src={media.src} alt={media.alt} />
      <p>{media.caption}</p>
    </div>, document.body)}
  </>
}
