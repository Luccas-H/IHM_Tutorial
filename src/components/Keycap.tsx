const labels: Record<string, string> = { '⊞ Win': 'Tecla Windows', Ctrl: 'Tecla Control', Shift: 'Tecla Shift', Esc: 'Tecla Escape' }

export function Keycap({ value }: { value: string }) {
  return <kbd className="keycap" aria-label={labels[value] ?? `Tecla ${value}`}>{value}</kbd>
}
