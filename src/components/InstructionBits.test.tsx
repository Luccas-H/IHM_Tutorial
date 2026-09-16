import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CommandBlock } from './CommandBlock'
import { Keycap } from './Keycap'

describe('instruction components', () => {
  it('renders a physical-looking key with an accessible label', () => {
    render(<Keycap value="⊞ Win" />)
    expect(screen.getByText('⊞ Win')).toHaveAccessibleName('Tecla Windows')
  })

  it('copies a command and confirms the action', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(<CommandBlock command={{ platform: 'Windows', code: 'chkdsk C: /f', label: 'Verificar disco' }} />)
    await userEvent.click(screen.getByRole('button', { name: 'Copiar comando' }))
    expect(writeText).toHaveBeenCalledWith('chkdsk C: /f')
    expect(screen.getByText('Copiado')).toBeInTheDocument()
  })
})
