import { AlertCircle, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useTutorial, useTutorials } from '../api/queries'
import { Sidebar } from '../components/Sidebar'
import { TutorialList } from '../components/TutorialList'
import { TutorialView } from '../components/TutorialView'
import type { Platform, PlatformFilter } from '../domain/types'
import { useVisitorId } from '../hooks/useVisitorId'
import { filterTutorials } from '../lib/tutorial-filter'
import { filterToPreference, loadPlatformFilter, loadPlatformPreference, platformToFilter, savePlatformFilter, savePlatformPreference } from '../lib/platform-preference'
import { loadCompletedTutorials, subscribeToProgress } from '../lib/progress'
import { applyTheme, loadThemePreference, saveThemePreference, transitionTheme } from '../lib/theme-preference'
import { withViewTransition } from '../lib/view-transition'

export function App() {
  const visitorId = useVisitorId()
  const tutorials = useTutorials(visitorId)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [platformPreference, setPlatformPreference] = useState(loadPlatformPreference)
  const [platform, setPlatform] = useState<PlatformFilter>(() => loadPlatformFilter(platformPreference))
  const [mobileDetail, setMobileDetail] = useState(false)
  const [tutorialListCollapsed, setTutorialListCollapsed] = useState(false)
  const [completedPlatforms, setCompletedPlatforms] = useState(loadCompletedTutorials)
  const [theme, setTheme] = useState(() => { const initial = loadThemePreference(); applyTheme(initial); return initial })
  useEffect(() => { if (!selectedSlug && tutorials.data?.length) setSelectedSlug(tutorials.data[0].slug) }, [selectedSlug, tutorials.data])
  useEffect(() => subscribeToProgress(() => setCompletedPlatforms(loadCompletedTutorials())), [])
  const filtered = useMemo(() => filterTutorials(tutorials.data ?? [], query, platform), [tutorials.data, query, platform])
  const detail = useTutorial(selectedSlug, visitorId)
  const readerRef = useRef<HTMLElement>(null)
  const detailId = detail.data?.id
  useEffect(() => { if (readerRef.current) readerRef.current.scrollTop = 0 }, [detailId])
  const changeListFilter = (value: PlatformFilter) => { setPlatform(value); savePlatformFilter(value) }
  const select = (slug: string, completedPlatform?: Platform) => {
    if (completedPlatform) {
      setPlatformPreference(completedPlatform); savePlatformPreference(completedPlatform); changeListFilter(platformToFilter(completedPlatform))
    }
    setSelectedSlug(slug); setMobileDetail(true)
  }
  const changeFilter = (value: PlatformFilter) => {
    const preference = filterToPreference(value, platformPreference)
    changeListFilter(value); setPlatformPreference(preference); savePlatformPreference(preference); setMobileDetail(false)
  }
  const changeTutorialPlatform = (value: Exclude<typeof platformPreference, 'all'>) => {
    setPlatformPreference(value); savePlatformPreference(value)
    if (platform !== 'all') changeListFilter(platformToFilter(value))
  }
  const toggleTutorialList = () => withViewTransition(() => flushSync(() => setTutorialListCollapsed((value) => !value)))
  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    transitionTheme(next); saveThemePreference(next); setTheme(next)
  }
  return <main className={`app-shell${mobileDetail ? ' showing-detail' : ''}${tutorialListCollapsed ? ' tutorials-collapsed' : ''}`}>
    <div className="library-shell">
      <Sidebar active={platform} onChange={changeFilter} count={tutorials.data?.length ?? 0} theme={theme} onToggleTheme={toggleTheme} />
      <TutorialList tutorials={filtered} selectedSlug={selectedSlug} query={query} onQueryChange={setQuery} onSelect={select} loading={tutorials.isLoading} collapsed={tutorialListCollapsed} onToggleCollapsed={toggleTutorialList} completedPlatforms={completedPlatforms} />
    </div>
    <section ref={readerRef} className={`reader-panel${detail.isPlaceholderData ? ' is-switching' : ''}`}>{tutorials.isError ? <div className="full-error"><AlertCircle /><h2>Não foi possível abrir a biblioteca</h2><p>Confira se a API e o banco estão em execução.</p><button onClick={() => tutorials.refetch()}><RefreshCw /> Tentar novamente</button></div> : detail.isError ? <div className="full-error"><AlertCircle /><h2>Não foi possível abrir o tutorial</h2><button onClick={() => detail.refetch()}><RefreshCw /> Tentar novamente</button></div> : detail.isLoading || !detail.data ? <div className="reader-skeleton"><div /><div /><div /></div> : <TutorialView key={detail.data.id} tutorial={detail.data} visitorId={visitorId} preferredPlatform={platformPreference === 'all' ? undefined : platformPreference} onPlatformChange={changeTutorialPlatform} onBack={() => setMobileDetail(false)} />}</section>
  </main>
}
