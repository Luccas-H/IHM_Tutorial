import { Bluetooth, CheckCircle2, ChevronRight, Clock3, HardDrive, PanelLeftClose, PanelLeftOpen, Printer, RotateCcw, Search, Smartphone, Star, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Platform, TutorialSummary } from '../domain/types'
import type { CompletedTutorials } from '../lib/progress'

const icons = { HardDrive, Bluetooth, RotateCcw, Smartphone, Printer }

export function TutorialList({ tutorials, selectedSlug, query, onQueryChange, onSelect, loading, collapsed = false, onToggleCollapsed, completedPlatforms = {} }: {
  tutorials: TutorialSummary[]; selectedSlug: string | null; query: string; onQueryChange: (value: string) => void;
  onSelect: (slug: string, platform?: Platform) => void; loading: boolean; collapsed?: boolean; onToggleCollapsed?: () => void;
  completedPlatforms?: CompletedTutorials;
}) {
  const [section, setSection] = useState<'library' | 'completed'>('library')
  const completedCount = useMemo(() => tutorials.filter((tutorial) => completedPlatforms[tutorial.id]?.length).length, [completedPlatforms, tutorials])
  const visibleTutorials = section === 'completed' ? tutorials.filter((tutorial) => completedPlatforms[tutorial.id]?.length) : tutorials
  return <section className="tutorial-list-panel" aria-label="Lista de tutoriais">
    <header><div className="list-title"><p>{section === 'completed' ? 'Seu progresso' : 'Biblioteca'}</p><h2>{section === 'completed' ? 'Concluídos' : 'Tutoriais'}</h2></div><div className="list-header-actions"><span>{visibleTutorials.length}</span>{onToggleCollapsed && <button type="button" className="panel-size-toggle" onClick={onToggleCollapsed} aria-expanded={!collapsed} aria-label={collapsed ? 'Expandir biblioteca' : 'Recolher biblioteca'} title={collapsed ? 'Expandir biblioteca' : 'Recolher biblioteca'}>{collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}</button>}</div></header>
    <div className="library-sections" role="group" aria-label="Seções da biblioteca"><button type="button" className={section === 'library' ? 'active' : ''} aria-pressed={section === 'library'} onClick={() => setSection('library')}>Biblioteca</button><button type="button" className={section === 'completed' ? 'active' : ''} aria-pressed={section === 'completed'} onClick={() => setSection('completed')}>Concluídos <span>{completedCount}</span></button></div>
    <div className="search-field"><Search size={17} /><input type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Buscar uma tarefa…" aria-label="Buscar tutoriais" />{query && <button type="button" onClick={() => onQueryChange('')} aria-label="Limpar busca"><X size={15} /></button>}</div>
    <div className="tutorial-items" data-section={section}>{loading ? Array.from({ length: 5 }, (_, index) => <div className="list-skeleton" key={index} />) : visibleTutorials.length ? visibleTutorials.map((tutorial) => {
      const Icon = icons[tutorial.icon as keyof typeof icons] ?? HardDrive
      const completions = completedPlatforms[tutorial.id] ?? []
      return <button type="button" key={tutorial.id} className={selectedSlug === tutorial.slug ? 'tutorial-item active' : 'tutorial-item'} onClick={() => onSelect(tutorial.slug, section === 'completed' ? completions[0] : undefined)} title={collapsed ? tutorial.title : undefined} aria-label={collapsed ? tutorial.title : undefined}>
        <span className="tutorial-icon"><Icon size={19} /></span><span className="tutorial-copy"><strong>{tutorial.title}</strong><small>{tutorial.summary}</small>{section === 'completed' && <span className="completion-platforms">{completions.map((platform) => <span key={platform}><CheckCircle2 size={12} /> Concluído no {platform}</span>)}</span>}<span className="tutorial-meta"><span><Star size={12} fill="currentColor" /> {tutorial.rating.average.toFixed(1)}</span><span><Clock3 size={12} /> {tutorial.duration} min</span><span>{tutorial.platforms.slice(0, 2).join(' + ')}</span></span></span><ChevronRight className="item-chevron" size={17} />
      </button>
    }) : <div className="empty-list">{section === 'completed' ? <CheckCircle2 /> : <Search />}<strong>{section === 'completed' ? 'Nenhum tutorial concluído' : 'Nenhum tutorial encontrado'}</strong><p>{section === 'completed' ? 'Conclua todas as etapas de um tutorial para vê-lo aqui.' : 'Tente outro termo ou limpe o filtro.'}</p>{section === 'library' && <button type="button" onClick={() => onQueryChange('')}>Limpar busca</button>}</div>}</div>
  </section>
}
