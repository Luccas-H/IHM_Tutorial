import { HardDrive, LayoutGrid, MonitorCog, Moon, Smartphone, Sun, TerminalSquare } from 'lucide-react'
import type { PlatformFilter } from '../domain/types'
import type { ThemeMode } from '../lib/theme-preference'

const filters: { id: PlatformFilter; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'all', label: 'Todos os tutoriais', icon: LayoutGrid },
  { id: 'windows', label: 'Windows', icon: MonitorCog },
  { id: 'linux', label: 'Linux', icon: TerminalSquare },
  { id: 'mobile', label: 'Dispositivos móveis', icon: Smartphone },
]

export function Sidebar({ active, onChange, count, theme = 'light', onToggleTheme }: { active: PlatformFilter; onChange: (value: PlatformFilter) => void; count: number; theme?: ThemeMode; onToggleTheme?: () => void }) {
  return <aside className="sidebar">
    <div className="brand"><img className="brand-mark" src="/brand-mark.svg" alt="Símbolo do É o Tutoras" /><div><strong>É o Tutoras</strong><small>Aprenda vendo.</small></div></div>
    <div className="sidebar-rule" />
    <p className="nav-label">Filtro de dispositivos</p>
    <nav aria-label="Filtro de dispositivos">{filters.map(({ id, label, icon: Icon }) => <button type="button" key={id} aria-pressed={active === id} className={active === id ? 'active' : ''} onClick={() => onChange(id)}><Icon size={18} /><span>{label}</span>{id === 'all' && <em>{count}</em>}</button>)}</nav>
    <div className="sidebar-tip"><HardDrive /><div><strong>5 guias práticos</strong><p>Windows, Linux e mobile, com imagens e comandos.</p></div></div>
    <footer>{onToggleTheme && <button type="button" className="theme-toggle" onClick={onToggleTheme} aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'} title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}>{theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}<span>{theme === 'light' ? 'Modo escuro' : 'Modo claro'}</span></button>}<strong>Versão 1.0</strong><span>Projeto acadêmico de IHM</span></footer>
  </aside>
}
