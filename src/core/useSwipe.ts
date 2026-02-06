import { useCallback, useEffect, useRef, useState } from 'react'

export type DragState = {
  x: number
  y: number
  isDragging: boolean
  isDismissing: boolean
}

const swipeConfig = {
  distance: 180,
  tapThreshold: 8,
  dismissDistance: 120,
  flingDistance: 60,
  flingVelocity: 0.6,
  flipped: {
    // Require clearer horizontal intent on the back face so vertical reading scroll wins.
    intentDistance: 18,
    horizontalRatio: 1.2,
    dragResistance: 0.62,
    dismissDistance: 150,
    flingDistance: 90,
    flingVelocity: 0.75,
  },
}

type UseSwipeArgs = {
  total: number
  isFlipped: boolean
  isFlipping: boolean
  isJumping: boolean
  onFlip: () => void
  onDismissComplete: () => void
  onRewindComplete: () => void
}

export const useSwipe = ({
  total,
  isFlipped,
  isFlipping,
  isJumping,
  onFlip,
  onDismissComplete,
  onRewindComplete,
}: UseSwipeArgs) => {
  const [dragState, setDragState] = useState<DragState>({
    x: 0,
    y: 0,
    isDragging: false,
    isDismissing: false,
  })
  const dragFrame = useRef<number | null>(null)
  const dragRef = useRef<DragState>({
    x: 0,
    y: 0,
    isDragging: false,
    isDismissing: false,
  })

  const pointerState = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startTime: 0,
    hasMoved: false,
    pointerId: 0,
    inputType: 'pointer' as 'pointer' | 'touch',
  })

  const navigationTimeout = useRef<number | null>(null)

  const syncDrag = useCallback((next: DragState) => {
    dragRef.current = next
    if (dragFrame.current !== null) {
      window.cancelAnimationFrame(dragFrame.current)
      dragFrame.current = null
    }
    setDragState(next)
  }, [])

  const updateDrag = useCallback((next: Partial<DragState>) => {
    dragRef.current = { ...dragRef.current, ...next }
    if (dragFrame.current !== null) return
    dragFrame.current = window.requestAnimationFrame(() => {
      dragFrame.current = null
      setDragState({ ...dragRef.current })
    })
  }, [])

  const resetDrag = useCallback(() => {
    syncDrag({
      x: 0,
      y: 0,
      isDragging: false,
      isDismissing: false,
    })
    pointerState.current = {
      active: false,
      startX: 0,
      startY: 0,
      startTime: 0,
      hasMoved: false,
      pointerId: 0,
      inputType: 'pointer',
    }
  }, [syncDrag])

  const dismissCard = useCallback(() => {
    if (!total || dragRef.current.isDismissing) return
    syncDrag({
      x: -window.innerWidth * 1.1,
      y: dragRef.current.y * 0.2,
      isDragging: false,
      isDismissing: true,
    })
    if (navigationTimeout.current) {
      window.clearTimeout(navigationTimeout.current)
    }
    navigationTimeout.current = window.setTimeout(() => {
      navigationTimeout.current = null
      onDismissComplete()
      resetDrag()
    }, 300)
  }, [onDismissComplete, resetDrag, syncDrag, total])

  const rewindCard = useCallback(() => {
    if (!total || dragRef.current.isDismissing) return
    syncDrag({
      x: window.innerWidth * 1.1,
      y: dragRef.current.y * 0.2,
      isDragging: false,
      isDismissing: true,
    })
    if (navigationTimeout.current) {
      window.clearTimeout(navigationTimeout.current)
    }
    navigationTimeout.current = window.setTimeout(() => {
      navigationTimeout.current = null
      onRewindComplete()
      resetDrag()
    }, 300)
  }, [onRewindComplete, resetDrag, syncDrag, total])

  const beginInteraction = (
    clientX: number,
    clientY: number,
    pointerId: number,
    inputType: 'pointer' | 'touch'
  ) => {
    pointerState.current = {
      active: true,
      startX: clientX,
      startY: clientY,
      startTime: performance.now(),
      hasMoved: false,
      pointerId,
      inputType,
    }
  }

  const hasFlippedHorizontalIntent = (dx: number, dy: number) => {
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)
    return (
      absDx >= swipeConfig.flipped.intentDistance &&
      absDx >= absDy * swipeConfig.flipped.horizontalRatio
    )
  }

  const finalizeInteraction = (dx: number, dy: number, elapsed: number) => {
    const state = pointerState.current
    if (isFlipping) {
      resetDrag()
      return
    }
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)
    const isTap =
      !state.hasMoved ||
      (absDx < swipeConfig.tapThreshold && absDy < swipeConfig.tapThreshold)
    const velocity = dx / Math.max(elapsed, 1)

    if (isFlipped) {
      if (isTap) {
        onFlip()
        resetDrag()
        return
      }

      if (!hasFlippedHorizontalIntent(dx, dy)) {
        resetDrag()
        return
      }

      const shouldDismiss =
        dx < -swipeConfig.flipped.dismissDistance ||
        (dx < -swipeConfig.flipped.flingDistance &&
          velocity < -swipeConfig.flipped.flingVelocity)
      const shouldRewind =
        dx > swipeConfig.flipped.dismissDistance ||
        (dx > swipeConfig.flipped.flingDistance &&
          velocity > swipeConfig.flipped.flingVelocity)

      if (shouldDismiss) {
        pointerState.current.active = false
        dismissCard()
      } else if (shouldRewind) {
        pointerState.current.active = false
        rewindCard()
      } else {
        resetDrag()
      }
      return
    }

    if (isTap) {
      onFlip()
      resetDrag()
      return
    }

    const shouldDismiss =
      dx < -swipeConfig.dismissDistance ||
      (dx < -swipeConfig.flingDistance && velocity < -swipeConfig.flingVelocity)
    const shouldRewind =
      dx > swipeConfig.dismissDistance ||
      (dx > swipeConfig.flingDistance && velocity > swipeConfig.flingVelocity)
    if (shouldDismiss) {
      pointerState.current.active = false
      dismissCard()
    } else if (shouldRewind) {
      pointerState.current.active = false
      rewindCard()
    } else {
      resetDrag()
    }
  }

  const getTrackedTouch = (event: React.TouchEvent) => {
    const touchId = pointerState.current.pointerId
    const list = event.touches.length ? event.touches : event.changedTouches
    for (let index = 0; index < list.length; index += 1) {
      const touch = list.item(index)
      if (touch && touch.identifier === touchId) return touch
    }
    return null
  }

  const handlePointerDown = (event: React.PointerEvent) => {
    if (dragRef.current.isDismissing || isJumping || isFlipping || !total) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if (pointerState.current.active) return
    if (event.pointerType === 'touch' && event.cancelable) {
      event.preventDefault()
    }
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.setPointerCapture?.(event.pointerId)
    }
    beginInteraction(event.clientX, event.clientY, event.pointerId, 'pointer')
  }

  const handlePointerMove = (event: React.PointerEvent) => {
    const state = pointerState.current
    if (!state.active || state.inputType !== 'pointer' || dragRef.current.isDismissing) return

    const dx = event.clientX - state.startX
    const dy = event.clientY - state.startY
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    if (!state.hasMoved) {
      if (absDx < swipeConfig.tapThreshold && absDy < swipeConfig.tapThreshold) return
      state.hasMoved = true
    }
    if (isFlipped) {
      if (!dragRef.current.isDragging && !hasFlippedHorizontalIntent(dx, dy)) return
      if (!dragRef.current.isDragging) {
        updateDrag({ isDragging: true })
      }
      if (event.pointerType === 'touch' && event.cancelable) {
        event.preventDefault()
      }
      updateDrag({
        x: dx * swipeConfig.flipped.dragResistance,
        y: 0,
      })
      return
    }

    const isHorizontal = absDx >= absDy
    if (!dragRef.current.isDragging && !isHorizontal) return
    if (!dragRef.current.isDragging) {
      updateDrag({ isDragging: true })
    }
    if (event.pointerType === 'touch' && event.cancelable) {
      event.preventDefault()
    }
    updateDrag({
      x: dx,
      y: 0,
    })
  }

  const handlePointerUp = (event: React.PointerEvent) => {
    const state = pointerState.current
    if (!state.active || state.inputType !== 'pointer' || dragRef.current.isDismissing) return
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.releasePointerCapture?.(event.pointerId)
    }
    const dx = event.clientX - state.startX
    const dy = event.clientY - state.startY
    const elapsed = performance.now() - state.startTime
    finalizeInteraction(dx, dy, elapsed)
  }

  const handlePointerCancel = (event: React.PointerEvent) => {
    if (!pointerState.current.active || pointerState.current.inputType !== 'pointer' || dragRef.current.isDismissing) return
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.releasePointerCapture?.(event.pointerId)
    }
    resetDrag()
  }

  const handleTouchStart = (event: React.TouchEvent) => {
    if (dragRef.current.isDismissing || isJumping || isFlipping || !total) return
    if (pointerState.current.active) return
    const touch = event.touches.item(0)
    if (!touch) return
    beginInteraction(touch.clientX, touch.clientY, touch.identifier, 'touch')
  }

  const handleTouchMove = (event: React.TouchEvent) => {
    const state = pointerState.current
    if (!state.active || state.inputType !== 'touch' || dragRef.current.isDismissing) return
    const touch = getTrackedTouch(event)
    if (!touch) return

    const dx = touch.clientX - state.startX
    const dy = touch.clientY - state.startY
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    if (!state.hasMoved) {
      if (absDx < swipeConfig.tapThreshold && absDy < swipeConfig.tapThreshold) return
      state.hasMoved = true
    }
    if (isFlipped) {
      if (!dragRef.current.isDragging && !hasFlippedHorizontalIntent(dx, dy)) return
      if (!dragRef.current.isDragging) {
        updateDrag({ isDragging: true })
      }
      if (event.cancelable) {
        event.preventDefault()
      }
      updateDrag({
        x: dx * swipeConfig.flipped.dragResistance,
        y: 0,
      })
      return
    }

    const isHorizontal = absDx >= absDy
    if (!dragRef.current.isDragging && !isHorizontal) return
    if (!dragRef.current.isDragging) {
      updateDrag({ isDragging: true })
    }
    if (event.cancelable) {
      event.preventDefault()
    }
    updateDrag({
      x: dx,
      y: 0,
    })
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    const state = pointerState.current
    if (!state.active || state.inputType !== 'touch' || dragRef.current.isDismissing) return
    const touch = getTrackedTouch(event)
    if (!touch) {
      resetDrag()
      return
    }
    const dx = touch.clientX - state.startX
    const dy = touch.clientY - state.startY
    const elapsed = performance.now() - state.startTime
    finalizeInteraction(dx, dy, elapsed)
  }

  const handleTouchCancel = () => {
    if (!pointerState.current.active || pointerState.current.inputType !== 'touch' || dragRef.current.isDismissing) return
    resetDrag()
  }

  useEffect(() => {
    return () => {
      if (navigationTimeout.current) {
        window.clearTimeout(navigationTimeout.current)
      }
      if (dragFrame.current !== null) {
        window.cancelAnimationFrame(dragFrame.current)
      }
    }
  }, [])

  const { x: dragX } = dragState
  const leftProgress = Math.min(Math.max(-dragX, 0) / swipeConfig.distance, 1)
  const rightProgress = Math.min(Math.max(dragX, 0) / swipeConfig.distance, 1)

  return {
    dragState,
    dragX,
    leftProgress,
    rightProgress,
    resetDrag,
    dismissCard,
    rewindCard,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
  }
}
