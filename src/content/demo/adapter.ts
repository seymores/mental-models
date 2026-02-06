import type { Card, DeckAdapter, DeckLoadResult } from '../../core/types'

type DemoPayload = {
  cards?: Card[]
  generatedAt?: string
}

const coercePayload = (payload: unknown): DemoPayload => {
  if (!payload || typeof payload !== 'object') {
    return {}
  }
  return payload as DemoPayload
}

export const demoAdapter: DeckAdapter = {
  type: 'demo-vocab',
  load: (payload: unknown): DeckLoadResult => {
    const data = coercePayload(payload)
    const cards = Array.isArray(data.cards) ? data.cards : []
    const normalized = cards.map((card) => ({
      ...card,
      type: card.type || 'vocab',
    }))
    return {
      cards: normalized,
      generatedAt: data.generatedAt,
    }
  },
}
