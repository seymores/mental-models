import type { ReactNode } from 'react'

export type CardSection = {
  label: string
  body: string
  format?: 'richtext'
}

export type CardTag = {
  label: string
  targetId?: string
}

export type CardTheme = {
  background: string
  ink: string
  muted: string
  line: string
  badgeBg: string
  tagBg: string
}

export type Card = {
  id: string
  type: string
  category?: string
  front: {
    title: string
    subtitle?: string
    badge?: string
    heroIcons?: string[]
  }
  back: {
    title?: string
    sections: CardSection[]
    tags?: CardTag[]
  }
  meta?: Record<string, string>
}

export type DeckDescriptor = {
  id: string
  title: string
  type: string
  file: string
  default?: boolean
}

export type DeckManifest = {
  generatedAt?: string
  decks: DeckDescriptor[]
}

export type DeckLoadResult = {
  cards: Card[]
  generatedAt?: string
}

export type DeckAdapter = {
  type: string
  load: (payload: unknown) => DeckLoadResult
}

export type CardRenderProps = {
  card: Card
  theme: CardTheme
  onJump: (id: string) => void
  isFacedown: boolean
}

export type CardRenderer = {
  type: string
  renderFaces: (props: CardRenderProps) => ReactNode
  getTheme: (card: Card) => CardTheme
}

export type StackRole = 'current' | 'prev' | 'next' | 'later' | 'far'

export type StackItem = {
  card: Card
  role: StackRole
}
