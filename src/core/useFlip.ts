import { useCallback, useState } from 'react'

export const useFlip = () => {
  const [isFlipped, setIsFlipped] = useState(false)
  const [flipAnimation, setFlipAnimation] = useState<
    'flip-to-back' | 'flip-to-front' | null
  >(null)
  const [isFlipping, setIsFlipping] = useState(false)

  const triggerFlip = useCallback(() => {
    if (isFlipping) return
    const next = !isFlipped
    setIsFlipped(next)
    setFlipAnimation(next ? 'flip-to-back' : 'flip-to-front')
    setIsFlipping(true)
  }, [isFlipped, isFlipping])

  const resetFlip = useCallback(() => {
    setIsFlipped(false)
    setFlipAnimation(null)
    setIsFlipping(false)
  }, [])

  const handleFlipEnd = useCallback(() => {
    if (!isFlipping) return
    setIsFlipping(false)
    setFlipAnimation(null)
  }, [isFlipping])

  return {
    isFlipped,
    flipAnimation,
    isFlipping,
    triggerFlip,
    resetFlip,
    handleFlipEnd,
  }
}
