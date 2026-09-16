import { AlertCircle, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTutorial, useTutorials } from '../api/queries'
import { Sidebar } from '../components/Sidebar'
import { TutorialList } from '../components/TutorialList'
import { TutorialView } from '../components/TutorialView'
import type { PlatformFilter } from '../domain/types'
import { useVisitorId } from '../hooks/useVisitorId'
import { filterTutorials } from '../lib/tutorial-filter'

export function App() {
  const visitorId = useVisitorId()
  const tutorials = useTutorials(visitorId)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [platform, setPlatform] = useState<PlatformFilter>('all')
  const [mobileDetail, setMobileDetail] = useState(false)
  const [tutorialListExpanded, setTutorialListExpanded] = useState(false)
  useEffect(() => { if (!selectedSlug && tutorials.data?.length) setSelectedSlug(tutorials.data[0].slug) }, [selectedSlug, tutorials.data])
  const filtered = useMemo(() => filterTutorials(tutorials.data ?? [], query, platform), [tutorials.data, query, platform])
  const detail = useTutorial(selectedSlug, visitorId)
  const select = (slug: string) => { setSelectedSlug(slug); setMobileDetail(true) }
  return <main className={`app-shell${mobileDetail ? ' showing-detail' : ''}${tutorialListExpanded ? ' tutorials-expanded' : ''}`}>
    <Sidebar active={platform} onChange={(value) => { setPlatform(value); setMobileDetail(false) }} count={tutorials.data?.length ?? 0} />
    <TutorialList tutorials={filtered} selectedSlug={selectedSlug} query={query} onQueryChange={setQuery} onSelect={select} loading={tutorials.isLoading} expanded={tutorialListExpanded} onToggleSize={() => setTutorialListExpanded((value) => !value)} />
    <section className="reader-panel">{tutorials.isError ? <div className="full-error"><AlertCircle /><h2>Não foi possível abrir a biblioteca</h2><p>Confira se a API e o banco estão em execução.</p><button onClick={() => tutorials.refetch()}><RefreshCw /> Tentar novamente</button></div> : detail.isLoading || !detail.data ? <div className="reader-skeleton"><div /><div /><div /></div> : detail.isError ? <div className="full-error"><AlertCircle /><h2>Não foi possível abrir o tutorial</h2><button onClick={() => detail.refetch()}><RefreshCw /> Tentar novamente</button></div> : <TutorialView tutorial={detail.data} visitorId={visitorId} onBack={() => setMobileDetail(false)} />}</section>
  </main>
}
