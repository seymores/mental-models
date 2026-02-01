import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import './App.css'
import type { MentalModel, ModelPayload } from './lib/types'
import { buildDeck } from './lib/deck'
import { getHeroIcons, getIconUrl, hashString } from './lib/icons'
import { renderRichText, shouldTightenHeadline } from './lib/text'
import { categoryBadgeIcons, categoryThemes } from './lib/themes'

type DragState = {
  x: number
  y: number
  isDragging: boolean
  isDismissing: boolean
}

type CardFacesProps = {
  model: MentalModel
  theme: (typeof categoryThemes)[string]
  titleIndex: Map<string, number>
  onJump: (name: string) => void
  isFacedown: boolean
}

const CardFaces = memo(function CardFaces({
  model,
  theme,
  titleIndex,
  onJump,
  isFacedown,
}: CardFacesProps) {
  const badgeIcons =
    categoryBadgeIcons[model.category] ?? categoryBadgeIcons.People
  const badgeIcon = badgeIcons[hashString(model.id) % badgeIcons.length]
  const badgeIconUrl = getIconUrl(badgeIcon, '#f7f7f4')
  const badgeIconBackUrl = getIconUrl(badgeIcon, '#f7f7f4')
  const heroIcons = getHeroIcons(model)
  const heroColor = `color-mix(in srgb, ${theme.muted} 60%, ${theme.background} 40%)`

  return (
    <>
      <div className="card__face card__face--front" aria-hidden={isFacedown}>
        <div className="card__content card__content--front">
          <div className="card__meta">
            <span className="card__badge">
              <img
                className="card__badge-icon"
                src={badgeIconUrl}
                alt=""
                aria-hidden="true"
                width={14}
                height={14}
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.style.display = 'none'
                }}
              />
              {model.category}
            </span>
          </div>
          <h2
            className={`card__headline${
              shouldTightenHeadline(model.title) ? ' card__headline--tight' : ''
            }`}
          >
            {model.title}
          </h2>
          {heroIcons.length > 0 && (
            <div className="card__hero-icons" aria-hidden="true">
              {heroIcons.map((icon, index) => (
                <img
                  key={`${model.id}-hero-${index}`}
                  className="card__hero-icon"
                  src={getIconUrl(icon, heroColor)}
                  alt=""
                  aria-hidden="true"
                  width={34}
                  height={34}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none'
                  }}
                />
              ))}
            </div>
          )}
          <p className="card__subtitle">{model.principle}</p>
        </div>
      </div>
      <div className="card__face card__face--back" aria-hidden={!isFacedown}>
        <div className="card__back-body">
          <div className="card__back-header">
            <span className="card__badge card__badge--back">
              <img
                className="card__badge-icon card__badge-icon--back"
                src={badgeIconBackUrl}
                alt=""
                aria-hidden="true"
                width={14}
                height={14}
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.style.display = 'none'
                }}
              />
              {model.category}
            </span>
            <h2 className="card__back-title">{model.title}</h2>
          </div>
          {model.principle && (
            <section className="card__section card__section--principle">
              <h3>Principle</h3>
              {renderRichText(model.principle)}
            </section>
          )}
          {model.coreConcept && (
            <section className="card__section">
              <h3>Core Concept</h3>
              {renderRichText(model.coreConcept)}
            </section>
          )}
          {model.example && (
            <section className="card__section">
              <h3>One Best Example</h3>
              {renderRichText(model.example)}
            </section>
          )}
          {model.tryThis && (
            <section className="card__section card__section--try">
              <h3>Try This Now</h3>
              {renderRichText(model.tryThis)}
            </section>
          )}
          {model.related.length > 0 && (
            <section className="card__section">
              <h3>Related Models</h3>
              <div className="card__tags">
                {model.related.map((item) =>
                  titleIndex.has(item.toLowerCase()) ? (
                    <button
                      key={item}
                      type="button"
                      className="card__tag card__tag--link"
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={() => onJump(item)}
                    >
                      {item}
                    </button>
                  ) : (
                    <span key={item} className="card__tag">
                      {item}
                    </span>
                  )
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
})

const swipeConfig = {
  distance: 180,
  tapThreshold: 8,
  dismissDistance: 120,
  flingDistance: 60,
  flingVelocity: 0.6,
}

function App() {
  const [models, setModels] = useState<MentalModel[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [dragState, setDragState] = useState<DragState>({
    x: 0,
    y: 0,
    isDragging: false,
    isDismissing: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string | null>(null)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [isJumping, setIsJumping] = useState(false)
  const [flipAnimation, setFlipAnimation] = useState<'flip-to-back' | 'flip-to-front' | null>(null)
  const [isFlipping, setIsFlipping] = useState(false)
  const dragFrame = useRef<number | null>(null)
  const dragRef = useRef<DragState>({
    x: 0,
    y: 0,
    isDragging: false,
    isDismissing: false,
  })
  const supportsPointer =
    typeof window !== 'undefined' &&
    'PointerEvent' in window &&
    navigator.maxTouchPoints === 0 &&
    !('ontouchstart' in window)

  const { x: dragX, y: dragY, isDragging, isDismissing } = dragState

  const pointerState = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startTime: 0,
    hasMoved: false,
    pointerId: 0,
    inputType: 'pointer' as 'pointer' | 'touch',
  })
  const pendingUpdate = useRef<ModelPayload | null>(null)
  const updateTimeout = useRef<number | null>(null)
  const jumpTimeout = useRef<number | null>(null)
  const navigationTimeout = useRef<number | null>(null)

  const fetchModels = async (options?: { bypassCache?: boolean }) => {
    const url = options?.bypassCache
      ? `/models-latest.json?ts=${Date.now()}`
      : '/models-latest.json'
    const response = await fetch(url, {
      cache: options?.bypassCache ? 'no-store' : 'default',
    })
    if (!response.ok) {
      throw new Error('Unable to load deck data')
    }
    return (await response.json()) as ModelPayload
  }

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      try {
        const payload = await fetchModels()
        if (!isMounted) return
        const deck = buildDeck(payload.models ?? [])
        setModels(deck)
        setCurrentIndex(0)
        setLastGeneratedAt(payload.generatedAt ?? null)
        setError(null)
        setIsLoading(false)
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : 'Unable to load deck data')
        setIsLoading(false)
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (isLoading || error) return
    const updateDelayMs = 10 * 60 * 1000

    const checkForUpdates = async () => {
      if (!lastGeneratedAt || updateAvailable) return

      try {
        const payload = await fetchModels({ bypassCache: true })
        if (!payload.generatedAt) return
        const latest = Date.parse(payload.generatedAt)
        const current = Date.parse(lastGeneratedAt)
        if (Number.isNaN(latest) || Number.isNaN(current)) return
        if (latest > current) {
          pendingUpdate.current = payload
          setUpdateAvailable(true)
        }
      } catch {
        // Ignore transient update-check errors.
      }
    }

    const clearScheduled = () => {
      if (updateTimeout.current === null) return
      window.clearTimeout(updateTimeout.current)
      updateTimeout.current = null
    }

    const scheduleCheck = () => {
      if (updateTimeout.current !== null || updateAvailable) return
      if (!lastGeneratedAt) return
      updateTimeout.current = window.setTimeout(() => {
        updateTimeout.current = null
        void checkForUpdates()
      }, updateDelayMs)
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        clearScheduled()
        scheduleCheck()
      } else {
        clearScheduled()
      }
    }

    if (document.visibilityState === 'visible') {
      scheduleCheck()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearScheduled()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [error, isLoading, lastGeneratedAt, updateAvailable])

  useEffect(() => {
    return () => {
      if (jumpTimeout.current) {
        window.clearTimeout(jumpTimeout.current)
      }
      if (navigationTimeout.current) {
        window.clearTimeout(navigationTimeout.current)
      }
      if (dragFrame.current !== null) {
        window.cancelAnimationFrame(dragFrame.current)
      }
    }
  }, [])

  const total = models.length
  const currentIndexSafe = total ? currentIndex % total : 0
  const getNextIndex = () => (total ? (currentIndexSafe + 1) % total : 0)
  const getLaterIndex = () => (total ? (currentIndexSafe + 2) % total : 0)
  const getFarIndex = () => (total ? (currentIndexSafe + 3) % total : 0)
  const getPrevIndex = () =>
    total ? (currentIndexSafe - 1 + total) % total : 0
  const showPrev = dragX > 0
  const titleIndex = useMemo(() => {
    const map = new Map<string, number>()
    models.forEach((model, index) => {
      const key = model.title.toLowerCase()
      if (!map.has(key)) map.set(key, index)
    })
    return map
  }, [models])
  const stack = useMemo(() => {
    if (!total) return []
    const depth = Math.min(total, 4)
    const candidates: {
      index: number
      role: 'current' | 'prev' | 'next' | 'later' | 'far'
    }[] = [
      { index: currentIndexSafe, role: 'current' },
      { index: showPrev ? getPrevIndex() : getNextIndex(), role: showPrev ? 'prev' : 'next' },
      { index: showPrev ? getNextIndex() : getLaterIndex(), role: showPrev ? 'next' : 'later' },
      { index: showPrev ? getLaterIndex() : getFarIndex(), role: showPrev ? 'later' : 'far' },
    ]

    const items: {
      model: MentalModel
      role: 'current' | 'prev' | 'next' | 'later' | 'far'
    }[] = []
    const seen = new Set<number>()

    for (const candidate of candidates) {
      if (items.length >= depth) break
      if (seen.has(candidate.index)) continue
      seen.add(candidate.index)
      items.push({ model: models[candidate.index], role: candidate.role })
    }

    return items
  }, [currentIndexSafe, showPrev, models, total])

  const leftProgress = Math.min(Math.max(-dragX, 0) / swipeConfig.distance, 1)
  const rightProgress = Math.min(Math.max(dragX, 0) / swipeConfig.distance, 1)
  const progressRatio = useMemo(() => {
    if (!total) return 0
    if (total <= 1) return 1
    const step = 1 / (total - 1)
    const direction = dragX < 0 ? 1 : dragX > 0 ? -1 : 0
    const dragOffset = direction > 0 ? leftProgress : rightProgress
    const next = currentIndexSafe * step + direction * dragOffset * step
    return Math.min(1, Math.max(0, next))
  }, [currentIndexSafe, dragX, leftProgress, rightProgress, total])

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

  const resetFlip = useCallback(() => {
    setIsFlipped(false)
    setFlipAnimation(null)
    setIsFlipping(false)
  }, [])

  const jumpToModel = useCallback((name: string) => {
    const index = titleIndex.get(name.toLowerCase())
    if (index === undefined || !total) return
    if (index === currentIndexSafe) return
    resetFlip()
    resetDrag()
    const target = models[index]
    const order = Array.from({ length: total }, (_, offset) => {
      return models[(currentIndexSafe + offset) % total]
    })
    const nextOrder = [target, ...order.filter((model) => model.id !== target.id)]
    const rotated = Array.from({ length: total }, (_, position) => {
      return nextOrder[(position - currentIndexSafe + total) % total]
    })

    setModels(rotated)
    setCurrentIndex(currentIndexSafe)
    if (jumpTimeout.current) {
      window.clearTimeout(jumpTimeout.current)
    }
    setIsJumping(false)
    window.requestAnimationFrame(() => {
      setIsJumping(true)
      jumpTimeout.current = window.setTimeout(() => {
        setIsJumping(false)
      }, 380)
    })
  }, [currentIndexSafe, models, resetDrag, resetFlip, titleIndex, total])

  const applyUpdate = async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    try {
      const payload = pendingUpdate.current ?? (await fetchModels({ bypassCache: true }))
      const deck = buildDeck(payload.models ?? [])
      setModels(deck)
      setCurrentIndex(0)
      resetFlip()
      setLastGeneratedAt(payload.generatedAt ?? null)
      setUpdateAvailable(false)
      pendingUpdate.current = null
      setError(null)
    } catch (err) {
      // Keep the current deck; allow retry on the next check.
      setUpdateAvailable(true)
    } finally {
      setIsRefreshing(false)
    }
  }

  const advanceCard = () => {
    resetFlip()
    resetDrag()
    const nextIndex = getNextIndex()
    setCurrentIndex(nextIndex)
  }

  const retreatCard = () => {
    resetFlip()
    resetDrag()
    setCurrentIndex(getPrevIndex())
  }

  const triggerFlip = () => {
    if (isFlipping) return
    const next = !isFlipped
    setIsFlipped(next)
    setFlipAnimation(next ? 'flip-to-back' : 'flip-to-front')
    setIsFlipping(true)
  }

  const handleFlipEnd = () => {
    if (!isFlipping) return
    setIsFlipping(false)
    setFlipAnimation(null)
  }

  const dismissCard = () => {
    if (!total || isDismissing) return
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
      advanceCard()
    }, 300)
  }

  const rewindCard = () => {
    if (!total || isDismissing) return
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
      retreatCard()
    }, 300)
  }

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

  const finalizeInteraction = (dx: number, dy: number, elapsed: number) => {
    const state = pointerState.current
    if (isFlipping) {
      resetDrag()
      return
    }
    const velocity = dx / Math.max(elapsed, 1)

    if (isFlipped) {
      if (
        !state.hasMoved ||
        (Math.abs(dx) < swipeConfig.tapThreshold &&
          Math.abs(dy) < swipeConfig.tapThreshold)
      ) {
        triggerFlip()
      }
      resetDrag()
      return
    }

    if (
      !state.hasMoved ||
      (Math.abs(dx) < swipeConfig.tapThreshold &&
        Math.abs(dy) < swipeConfig.tapThreshold)
    ) {
      triggerFlip()
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
    return list.length ? list.item(0) : null
  }

  const handlePointerDown = (event: React.PointerEvent) => {
    if (isDismissing || isJumping || isFlipping || !total) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if (pointerState.current.active) return
    if (event.pointerType === 'touch' && event.cancelable) {
      event.preventDefault()
    }
    beginInteraction(event.clientX, event.clientY, event.pointerId, 'pointer')
  }

  const handlePointerMove = (event: React.PointerEvent) => {
    const state = pointerState.current
    if (!state.active || state.inputType !== 'pointer' || isDismissing) return

    const dx = event.clientX - state.startX
    const dy = event.clientY - state.startY

    if (!state.hasMoved) {
      if (Math.abs(dx) < swipeConfig.tapThreshold && Math.abs(dy) < swipeConfig.tapThreshold) return
      state.hasMoved = true
    }
    if (isFlipped) {
      return
    }

    const isHorizontal = Math.abs(dx) >= Math.abs(dy)
    if (!isDragging && !isHorizontal) return
    if (!isDragging) {
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
    if (!state.active || state.inputType !== 'pointer' || isDismissing) return

    const dx = event.clientX - state.startX
    const dy = event.clientY - state.startY
    const elapsed = performance.now() - state.startTime
    finalizeInteraction(dx, dy, elapsed)
  }

  const handlePointerCancel = (event: React.PointerEvent) => {
    if (!pointerState.current.active || pointerState.current.inputType !== 'pointer' || isDismissing) return
    resetDrag()
  }

  const handleTouchStart = (event: React.TouchEvent) => {
    if (isDismissing || isJumping || isFlipping || !total) return
    if (pointerState.current.active) return
    const touch = event.touches.item(0)
    if (!touch) return
    beginInteraction(touch.clientX, touch.clientY, touch.identifier, 'touch')
  }

  const handleTouchMove = (event: React.TouchEvent) => {
    const state = pointerState.current
    if (!state.active || state.inputType !== 'touch' || isDismissing) return
    const touch = getTrackedTouch(event)
    if (!touch) return

    const dx = touch.clientX - state.startX
    const dy = touch.clientY - state.startY

    if (!state.hasMoved) {
      if (Math.abs(dx) < swipeConfig.tapThreshold && Math.abs(dy) < swipeConfig.tapThreshold) return
      state.hasMoved = true
    }
    if (isFlipped) {
      return
    }

    const isHorizontal = Math.abs(dx) >= Math.abs(dy)
    if (!isDragging && !isHorizontal) return
    if (!isDragging) {
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
    if (!state.active || state.inputType !== 'touch' || isDismissing) return
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
    if (!pointerState.current.active || pointerState.current.inputType !== 'touch' || isDismissing) return
    resetDrag()
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!total || isFlipping) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      triggerFlip()
    }
    if (isFlipped) return
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      dismissCard()
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      rewindCard()
    }
  }

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1 className="app__title">Mental Models</h1>
        </div>
        <div className="app__meta">
          {total ? `${currentIndex + 1} / ${total}` : 'Loading'}
        </div>
      </header>

      <main className="deck" aria-live="polite">
        {isLoading && <div className="deck__message">Loading deck…</div>}
        {error && !isLoading && (
          <div className="deck__message deck__message--error">
            {error}
          </div>
        )}
        {!isLoading && !error && total === 0 && (
          <div className="deck__message">No models found.</div>
        )}
        {!isLoading && !error && total > 0 && (
          <div
            className={`deck__stack${isDragging ? ' is-dragging' : ''}${
              isDismissing ? ' is-dismissing' : ''
            }`}
          >
            <div className="deck__shadow" aria-hidden="true" />
            {stack.map((item, position) => {
              const { model, role } = item
              const isTop = role === 'current'
              const theme =
                categoryThemes[model.category] || categoryThemes.People
              const depthStep = 14
              const depthOffset = position * depthStep
              const depthScale = 1 - position * 0.035
              const isAdvancing = isDragging || isDismissing
              const liftProgress = isAdvancing
                ? showPrev
                  ? rightProgress
                  : leftProgress
                : 0
              const direction = showPrev ? 1 : -1
              const dragProgress = liftProgress
              const exitLift = 24
              const exitRotate = 14
              const exitScale = 0.02
              const incomingTilt = 4
              const incomingLift = 10
              const stackLift = 8
              const themeVars: CSSProperties = {
                '--card-bg': theme.background,
                '--card-ink': theme.ink,
                '--card-muted': theme.muted,
                '--card-line': theme.line,
                '--card-badge-bg': theme.badgeBg,
                '--card-tag-bg': theme.tagBg,
                '--card-border': theme.background,
                '--card-theme': theme.background,
              } as CSSProperties

              let translateX = 0
              let translateY = depthOffset
              let rotateZ = 0
              let scale = depthScale
              let opacity = 1

              if (isTop) {
                if (showPrev) {
                  translateX = 0
                  translateY = depthOffset + rightProgress * 18
                  rotateZ = 0
                  scale = 1 - rightProgress * 0.015
                  opacity = 1
                } else {
                  translateX = dragX
                  translateY = depthOffset - exitLift * dragProgress
                  rotateZ = direction * exitRotate * dragProgress
                  scale = 1 + exitScale * dragProgress
                  opacity = 1
                }
              } else if (role === 'prev' && showPrev) {
                const reveal = rightProgress
                const liftArc = reveal * (1 - reveal) * 2
                translateX = -80 * (1 - reveal)
                translateY = depthOffset * (1 - reveal) - incomingLift * liftArc
                scale = depthScale + (1 - depthScale) * reveal
                rotateZ = -incomingTilt * (1 - reveal)
                opacity = reveal
              } else if (role === 'next' && !showPrev) {
                const reveal = leftProgress
                const liftArc = reveal * (1 - reveal) * 2
                translateX = 0
                translateY =
                  depthOffset * (1 - reveal) - incomingLift * liftArc
                scale = depthScale + (1 - depthScale) * reveal
                rotateZ = -direction * incomingTilt * (1 - reveal)
                opacity = 1
              } else if (role === 'next') {
                translateY = depthOffset + (showPrev ? 1 : -1) * stackLift * liftProgress
              } else if (role === 'later') {
                translateY = depthOffset + (showPrev ? 1 : -1) * stackLift * 0.6 * liftProgress
              } else if (role === 'far') {
                translateY = depthOffset + (showPrev ? 1 : -1) * stackLift * 0.4 * liftProgress
                if (!showPrev) {
                  const baseOpacity = 0.22
                  opacity = baseOpacity + (1 - baseOpacity) * liftProgress
                } else {
                  opacity = liftProgress
                }
              }

              return (
                <article
                  key={model.id}
                  className={`deck__card${
                    isTop ? ' deck__card--top' : ''
                  }${isDragging && isTop ? ' is-dragging' : ''}`}
                  style={{
                    ...themeVars,
                    zIndex:
                      showPrev && role === 'prev'
                        ? stack.length + 1
                        : stack.length - position,
                    opacity,
                    transform: `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotateZ}deg) scale(${scale})`,
                  }}
                >
                  <div
                    className={`deck__card-shell${
                      isTop && isJumping ? ' is-jumping' : ''
                    }`}
                  >
                    <div
                      className={`card${isTop && isFlipped ? ' facedown' : ''}`}
                      style={
                        isTop && flipAnimation
                          ? { animationName: flipAnimation }
                          : undefined
                      }
                      onAnimationEnd={isTop && isFlipping ? handleFlipEnd : undefined}
                      {...(isTop
                        ? supportsPointer
                          ? {
                              onPointerDown: handlePointerDown,
                              onPointerMove: handlePointerMove,
                              onPointerUp: handlePointerUp,
                              onPointerCancel: handlePointerCancel,
                            }
                          : {
                              onTouchStart: handleTouchStart,
                              onTouchMove: handleTouchMove,
                              onTouchEnd: handleTouchEnd,
                              onTouchCancel: handleTouchCancel,
                            }
                        : {})}
                      onKeyDown={isTop ? handleKeyDown : undefined}
                      role={isTop ? 'button' : undefined}
                      tabIndex={isTop ? 0 : -1}
                      aria-pressed={isTop ? isFlipped : undefined}
                      aria-label={
                        isTop
                          ? `Card: ${model.title}. Tap to flip. Swipe left or right to navigate.`
                          : undefined
                      }
                    >
                      <div className="card__inner">
                        <CardFaces
                          model={model}
                          theme={theme}
                          titleIndex={titleIndex}
                          onJump={jumpToModel}
                          isFacedown={isTop ? isFlipped : false}
                        />
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>

      <footer className="app__footer">
        {updateAvailable ? (
          <div className="app__update" role="status">
            <span>New cards available.</span>
            <button
              className="app__update-button"
              type="button"
              onClick={applyUpdate}
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Loading…' : 'Load now'}
            </button>
          </div>
        ) : (
          <>
            <span>Tap to flip.</span>
            <span>Swipe to navigate.</span>
            <div
              className="app__progress app__progress--bottom"
              role="progressbar"
              aria-label="Deck progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progressRatio * 100)}
            >
              <div
                className="app__progress-fill"
                style={{ width: `${progressRatio * 100}%` }}
              />
            </div>
          </>
        )}
      </footer>
    </div>
  )
}

export default App
