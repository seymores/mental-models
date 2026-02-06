import type { Card, DeckAdapter, DeckLoadResult } from '../../core/types'
import { buildMentalModelDeck } from './buildDeck'
import { getHeroIcons } from './icons'
import type { MentalModel, MentalModelPayload } from './types'

const normalizeTitle = (value: string) => value.trim().toLowerCase()

const buildSections = (model: MentalModel) => {
  const sections = [] as { label: string; body: string }[]
  if (model.principle) {
    sections.push({ label: 'Principle', body: model.principle })
  }
  if (model.coreConcept) {
    sections.push({ label: 'Core Concept', body: model.coreConcept })
  }
  if (model.example) {
    sections.push({ label: 'One Best Example', body: model.example })
  }
  if (model.tryThis) {
    sections.push({ label: 'Try This Now', body: model.tryThis })
  }
  return sections
}

const toCard = (model: MentalModel, titleIndex: Map<string, string>): Card => {
  const related = Array.isArray(model.related) ? model.related : []
  const tags = related.map((item) => {
    const targetId = titleIndex.get(normalizeTitle(item))
    return {
      label: item,
      targetId,
    }
  })

  return {
    id: model.id,
    type: 'mental-model',
    category: model.category,
    front: {
      title: model.title,
      subtitle: model.principle,
      badge: model.category,
      heroIcons: getHeroIcons(model.title, model.category),
    },
    back: {
      title: model.title,
      sections: buildSections(model),
      tags: tags.length ? tags : undefined,
    },
    meta: {
      titleKey: normalizeTitle(model.title),
    },
  }
}

const coercePayload = (payload: unknown): MentalModelPayload => {
  if (!payload || typeof payload !== 'object') {
    return { models: [] }
  }
  return payload as MentalModelPayload
}

export const mentalModelAdapter: DeckAdapter = {
  type: 'mental-models',
  load: (payload: unknown): DeckLoadResult => {
    const data = coercePayload(payload)
    const models = Array.isArray(data.models) ? data.models : []
    const ordered = buildMentalModelDeck(models)
    const titleIndex = new Map<string, string>()
    ordered.forEach((model) => {
      const key = normalizeTitle(model.title)
      if (!titleIndex.has(key)) titleIndex.set(key, model.id)
    })

    return {
      cards: ordered.map((model) => toCard(model, titleIndex)),
      generatedAt: data.generatedAt,
    }
  },
}
