import { Bluetooth, ChevronRight, Clock3, HardDrive, Maximize2, Minimize2, Printer, RotateCcw, Search, Smartphone, Star, X } from 'lucide-react'
import type { TutorialSummary } from '../domain/types'

const icons = { HardDrive, Bluetooth, RotateCcw, Smartphone, Printer }

export function TutorialList({ tutorials, selectedSlug, query, onQueryChange, onSelect, loading, expanded = false, onToggleSize }: {
  tutorials: TutorialSummary[]; selectedSlug: string | null; query: string; onQueryChange: (value: string) => void;
  onSelect: (slug: string) => void; loading: boolean; expanded?: boolean; onToggleSize?: () => void;
}) {
  return <section className="tutorial-list-panel" aria-label="Lista de tutoriais">
    <header><div><p>Biblioteca</p><h2>Tutoriais</h2></div><div className="list-header-actions"><span>{tutorials.length}</span>{onToggleSize && <button type="button" className="panel-size-toggle" onClick={onToggleSize} aria-label={expanded ? 'Diminuir aba Tutoriais' : 'Aumentar aba Tutoriais'} title={expanded ? 'Diminuir aba Tutoriais' : 'Aumentar aba Tutoriais'}>{expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}</button>}</div></header>
    <div className="search-field"><Search size={17} /><input type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Buscar uma tarefa…" aria-label="Buscar tutoriais" />{query && <button type="button" onClick={() => onQueryChange('')} aria-label="Limpar busca"><X size={15} /></button>}</div>
    <div className="tutorial-items">{loading ? Array.from({ length: 5 }, (_, index) => <div className="list-skeleton" key={index} />) : tutorials.length ? tutorials.map((tutorial) => {
      const Icon = icons[tutorial.icon as keyof typeof icons] ?? HardDrive
      return <button type="button" key={tutorial.id} className={selectedSlug === tutorial.slug ? 'tutorial-item active' : 'tutorial-item'} onClick={() => onSelect(tutorial.slug)}>
        <span className="tutorial-icon"><Icon size={19} /></span><span className="tutorial-copy"><strong>{tutorial.title}</strong><small>{tutorial.summary}</small><span className="tutorial-meta"><span><Star size={12} fill="currentColor" /> {tutorial.rating.average.toFixed(1)}</span><span><Clock3 size={12} /> {tutorial.duration} min</span><span>{tutorial.platforms.slice(0, 2).join(' + ')}</span></span></span><ChevronRight className="item-chevron" size={17} />
      </button>
    }) : <div className="empty-list"><Search /><strong>Nenhum tutorial encontrado</strong><p>Tente outro termo ou limpe o filtro.</p><button type="button" onClick={() => onQueryChange('')}>Limpar busca</button></div>}</div>
  </section>
}
