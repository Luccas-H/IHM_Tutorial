export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly fields?: Record<string, string>) {
    super(message)
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(body?.error?.message ?? 'Não foi possível concluir agora.', response.status, body?.error?.fields)
  }
  return body as T
}
