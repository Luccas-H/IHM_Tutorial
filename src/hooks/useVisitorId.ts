import { useState } from 'react'

const KEY = 'e-o-tutoras:visitor-id'

export function useVisitorId() {
  const [visitorId] = useState(() => {
    const stored = localStorage.getItem(KEY)
    if (stored) return stored
    const created = crypto.randomUUID()
    localStorage.setItem(KEY, created)
    return created
  })
  return visitorId
}
