import { useCallback, useMemo, useState } from 'react'
import type { Card, StackItem, StackRole } from './types'

type UseDeckArgs = {
  cards: Card[]
  setCards: React.Dispatch<React.SetStateAction<Card[]>>
  dragX: number
  leftProgress: number
  rightProgress: number
}

export const useDeck = ({
  cards,
  setCards,
  dragX,
  leftProgress,
  rightProgress,
}: UseDeckArgs) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const total = cards.length
  const currentIndexSafe = total ? currentIndex % total : 0
  const showPrev = dragX > 0

  const idIndex = useMemo(() => {
    const map = new Map<string, number>()
    cards.forEach((card, index) => {
      if (!map.has(card.id)) map.set(card.id, index)
    })
    return map
  }, [cards])

  const getNextIndex = useCallback(
    () => (total ? (currentIndexSafe + 1) % total : 0),
    [currentIndexSafe, total]
  )
  const getLaterIndex = useCallback(
    () => (total ? (currentIndexSafe + 2) % total : 0),
    [currentIndexSafe, total]
  )
  const getFarIndex = useCallback(
    () => (total ? (currentIndexSafe + 3) % total : 0),
    [currentIndexSafe, total]
  )
  const getPrevIndex = useCallback(
    () => (total ? (currentIndexSafe - 1 + total) % total : 0),
    [currentIndexSafe, total]
  )

  const stack = useMemo<StackItem[]>(() => {
    if (!total) return []
    const depth = Math.min(total, 4)
    const candidates: { index: number; role: StackRole }[] = [
      { index: currentIndexSafe, role: 'current' },
      {
        index: showPrev ? getPrevIndex() : getNextIndex(),
        role: showPrev ? 'prev' : 'next',
      },
      {
        index: showPrev ? getNextIndex() : getLaterIndex(),
        role: showPrev ? 'next' : 'later',
      },
      {
        index: showPrev ? getLaterIndex() : getFarIndex(),
        role: showPrev ? 'later' : 'far',
      },
    ]

    const items: StackItem[] = []
    const seen = new Set<number>()

    for (const candidate of candidates) {
      if (items.length >= depth) break
      if (seen.has(candidate.index)) continue
      seen.add(candidate.index)
      items.push({ card: cards[candidate.index], role: candidate.role })
    }

    return items
  }, [cards, currentIndexSafe, getFarIndex, getLaterIndex, getNextIndex, getPrevIndex, showPrev, total])

  const progressRatio = useMemo(() => {
    if (!total) return 0
    if (total <= 1) return 1
    const step = 1 / (total - 1)
    const direction = dragX < 0 ? 1 : dragX > 0 ? -1 : 0
    const dragOffset = direction > 0 ? leftProgress : rightProgress
    const next = currentIndexSafe * step + direction * dragOffset * step
    return Math.min(1, Math.max(0, next))
  }, [currentIndexSafe, dragX, leftProgress, rightProgress, total])

  const jumpToId = useCallback(
    (id: string) => {
      const index = idIndex.get(id)
      if (index === undefined || !total) return
      if (index === currentIndexSafe) return
      const target = cards[index]
      const order = Array.from({ length: total }, (_, offset) => {
        return cards[(currentIndexSafe + offset) % total]
      })
      const nextOrder = [target, ...order.filter((card) => card.id !== target.id)]
      const rotated = Array.from({ length: total }, (_, position) => {
        return nextOrder[(position - currentIndexSafe + total) % total]
      })

      setCards(rotated)
      setCurrentIndex(currentIndexSafe)
    },
    [cards, currentIndexSafe, idIndex, setCards, total]
  )

  const advanceCard = useCallback(() => {
    setCurrentIndex((prev) => (total ? (prev + 1) % total : 0))
  }, [total])

  const retreatCard = useCallback(() => {
    setCurrentIndex((prev) => (total ? (prev - 1 + total) % total : 0))
  }, [total])

  return {
    total,
    currentIndex,
    currentIndexSafe,
    setCurrentIndex,
    showPrev,
    stack,
    progressRatio,
    advanceCard,
    retreatCard,
    jumpToId,
  }
}
