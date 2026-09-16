import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Community } from './Community'

const comments = [{
  id: 'c1', tutorialId: 't1', parentId: null, author: 'Nina', body: 'Funcionou aqui.',
  createdAt: new Date().toISOString(), upvotes: 2, viewerHasUpvoted: false, replies: [],
}]

describe('Community', () => {
  it('keeps the alias and submits a helpful comment', async () => {
    const onSubmit = vi.fn()
    render(<Community comments={comments} nickname="" onNicknameChange={() => {}} onSubmit={onSubmit} onVote={() => {}} isSubmitting={false} />)
    await userEvent.type(screen.getByLabelText('Seu apelido'), 'Lia')
    await userEvent.type(screen.getByLabelText('Escreva sua dúvida ou dica'), 'A etapa resolveu meu problema.')
    await userEvent.click(screen.getByRole('button', { name: 'Publicar comentário' }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ author: 'Lia', body: 'A etapa resolveu meu problema.', parentId: null }))
  })
})
