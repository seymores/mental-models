import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { DeckStack } from './core/DeckStack'
import type { Card, DeckDescriptor, DeckLoadResult, DeckManifest } from './core/types'
import { useDeck } from './core/useDeck'
import { useFlip } from './core/useFlip'
import { useSwipe } from './core/useSwipe'
import { getCardRenderer, getDeckAdapter } from './content/registry.tsx'

const GITHUB_REPO_URL = 'https://github.com/seymores/mental-models'

const fetchManifest = async (options?: { bypassCache?: boolean }) => {
  const baseUrl = new URL('./', window.location.href)
  const path = options?.bypassCache
    ? `decks.json?ts=${Date.now()}`
    : 'decks.json'
  const url = new URL(path, baseUrl).toString()
  const response = await fetch(url, {
    cache: options?.bypassCache ? 'no-store' : 'default',
  })
  if (!response.ok) {
    throw new Error('Unable to load deck manifest')
  }
  return (await response.json()) as DeckManifest
}

const fetchDeckFile = async (file: string, options?: { bypassCache?: boolean }) => {
  const baseUrl = new URL('./', window.location.href)
  const path = options?.bypassCache
    ? `${file}${file.includes('?') ? '&' : '?'}ts=${Date.now()}`
    : file
  const url = new URL(path, baseUrl).toString()
  const response = await fetch(url, {
    cache: options?.bypassCache ? 'no-store' : 'default',
  })
  if (!response.ok) {
    throw new Error('Unable to load deck data')
  }
  return (await response.json()) as unknown
}

const pickDeck = (manifest: DeckManifest) => {
  const decks = manifest.decks ?? []
  if (!decks.length) return null
  return decks.find((deck) => deck.default) ?? decks[0]
}

const loadDeck = async (
  descriptor: DeckDescriptor,
  options?: { bypassCache?: boolean }
): Promise<DeckLoadResult> => {
  const payload = await fetchDeckFile(descriptor.file, options)
  const adapter = getDeckAdapter(descriptor.type)
  if (!adapter) {
    throw new Error(`Unsupported deck type: ${descriptor.type}`)
  }
  return adapter.load(payload)
}

const isLandscapePhoneViewport = () => {
  if (typeof window === 'undefined') return false
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches
  const isPhoneLikeViewport = window.matchMedia('(max-width: 1024px)').matches
  return isCoarsePointer && isPhoneLikeViewport && window.innerWidth > window.innerHeight
}

function App() {
  const [deck, setDeck] = useState<DeckDescriptor | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string | null>(null)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [isJumping, setIsJumping] = useState(false)
  const [isIndexOpen, setIsIndexOpen] = useState(false)
  const [indexQuery, setIndexQuery] = useState('')
  const [isIntroCardOpen, setIsIntroCardOpen] = useState(false)
  const [isLandscapeBlocked, setIsLandscapeBlocked] = useState(
    isLandscapePhoneViewport
  )

  const pendingUpdate = useRef<DeckLoadResult | null>(null)
  const updateTimeout = useRef<number | null>(null)
  const jumpTimeout = useRef<number | null>(null)

  const { isFlipped, flipAnimation, isFlipping, triggerFlip, resetFlip, handleFlipEnd } =
    useFlip()

  const total = cards.length

  const {
    dragState,
    dragX,
    leftProgress,
    rightProgress,
    resetDrag,
    dismissCard,
    rewindCard,
    handlers,
  } = useSwipe({
    total,
    isFlipped,
    isFlipping,
    isJumping,
    onFlip: triggerFlip,
    onDismissComplete: () => {
      resetFlip()
      advanceCard()
    },
    onRewindComplete: () => {
      resetFlip()
      retreatCard()
    },
  })

  const {
    currentIndex,
    currentIndexSafe,
    setCurrentIndex,
    showPrev,
    stack,
    progressRatio,
    advanceCard,
    retreatCard,
    jumpToId,
  } = useDeck({
    cards,
    setCards,
    dragX,
    leftProgress,
    rightProgress,
  })

  const supportsPointer = useMemo(
    () =>
      typeof window !== 'undefined' &&
      'PointerEvent' in window &&
      navigator.maxTouchPoints === 0 &&
      !('ontouchstart' in window),
    []
  )

  const indexEntries = useMemo(
    () =>
      cards
        .map((card) => {
          const renderer = getCardRenderer(card.type)
          const theme = renderer.getTheme(card)
          return {
            id: card.id,
            title: card.front.title,
            badge: card.category ?? card.front.badge ?? 'Card',
            badgeColor: theme.background,
          }
        })
        .sort((left, right) =>
          left.title.localeCompare(right.title, undefined, {
            sensitivity: 'base',
          })
        ),
    [cards]
  )

  const normalizedIndexQuery = indexQuery.trim().toLowerCase()

  const filteredIndexEntries = useMemo(() => {
    if (!normalizedIndexQuery) return indexEntries
    return indexEntries.filter((entry) =>
      entry.title.toLowerCase().includes(normalizedIndexQuery)
    )
  }, [indexEntries, normalizedIndexQuery])

  const showIntroEntry = useMemo(() => {
    if (!normalizedIndexQuery) return true
    return 'introduction'.includes(normalizedIndexQuery)
  }, [normalizedIndexQuery])

  const currentCardId = total ? cards[currentIndexSafe]?.id : null

  const jumpToCard = useCallback(
    (id: string, options?: { animate?: boolean }) => {
      if (!total) return
      resetFlip()
      resetDrag()
      jumpToId(id)
      if (options?.animate === false) {
        setIsJumping(false)
        return
      }
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
    },
    [jumpToId, resetDrag, resetFlip, total]
  )

  const openIndex = useCallback(() => {
    if (!total) return
    setIndexQuery('')
    setIsIntroCardOpen(false)
    setIsIndexOpen(true)
  }, [total])

  const closeIndex = useCallback(() => {
    setIndexQuery('')
    setIsIntroCardOpen(false)
    setIsIndexOpen(false)
  }, [])

  const jumpFromIndex = useCallback(
    (id: string) => {
      setIndexQuery('')
      setIsIntroCardOpen(false)
      setIsIndexOpen(false)
      jumpToCard(id, { animate: false })
    },
    [jumpToCard]
  )

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isIndexOpen || !total || isFlipping) return
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

  useEffect(() => {
    if (typeof window === 'undefined') return
    const updateOrientationState = () => {
      setIsLandscapeBlocked(isLandscapePhoneViewport())
    }
    updateOrientationState()
    window.addEventListener('resize', updateOrientationState)
    window.addEventListener('orientationchange', updateOrientationState)
    return () => {
      window.removeEventListener('resize', updateOrientationState)
      window.removeEventListener('orientationchange', updateOrientationState)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const orientation = window.screen?.orientation as
      | (ScreenOrientation & { lock?: (mode: string) => Promise<void> })
      | undefined
    if (!orientation?.lock) return
    void orientation.lock('portrait').catch(() => {
      // Some browsers require fullscreen/user gesture and will ignore this.
    })
  }, [])

  useEffect(() => {
    if (!isIndexOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      setIsIndexOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isIndexOpen])

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      try {
        const manifest = await fetchManifest()
        if (!isMounted) return
        const selected = pickDeck(manifest)
        if (!selected) {
          throw new Error('No decks found')
        }
        setDeck(selected)
        const result = await loadDeck(selected)
        if (!isMounted) return
        setCards(result.cards)
        setCurrentIndex(0)
        setLastGeneratedAt(result.generatedAt ?? null)
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
  }, [setCurrentIndex])

  useEffect(() => {
    if (isLoading || error || !deck) return
    const updateDelayMs = 10 * 60 * 1000

    const checkForUpdates = async () => {
      if (!lastGeneratedAt || updateAvailable || !deck) return

      try {
        const result = await loadDeck(deck, { bypassCache: true })
        if (!result.generatedAt) return
        const latest = Date.parse(result.generatedAt)
        const current = Date.parse(lastGeneratedAt)
        if (Number.isNaN(latest) || Number.isNaN(current)) return
        if (latest > current) {
          pendingUpdate.current = result
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
  }, [deck, error, isLoading, lastGeneratedAt, updateAvailable])

  useEffect(() => {
    return () => {
      if (jumpTimeout.current) {
        window.clearTimeout(jumpTimeout.current)
      }
    }
  }, [])

  useEffect(() => {
    if (total > 0) return
    setIsIndexOpen(false)
  }, [total])

  const applyUpdate = async () => {
    if (isRefreshing || !deck) return
    setIsRefreshing(true)
    try {
      const result =
        pendingUpdate.current ?? (await loadDeck(deck, { bypassCache: true }))
      setCards(result.cards)
      setCurrentIndex(0)
      resetFlip()
      resetDrag()
      setLastGeneratedAt(result.generatedAt ?? null)
      setUpdateAvailable(false)
      pendingUpdate.current = null
      setError(null)
    } catch {
      setUpdateAvailable(true)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-brand">
          <button
            className="app__index-button"
            type="button"
            onClick={openIndex}
            disabled={!total || isLoading || Boolean(error)}
            aria-label="Open model index"
            aria-haspopup="dialog"
            aria-expanded={isIndexOpen}
            aria-controls="deck-index-card"
            title="Model index"
          >
            <svg
              className="app__index-icon"
              viewBox="0 0 24 24"
              role="img"
              aria-hidden="true"
            >
              <path d="M5 7h14M5 12h14M5 17h14" />
            </svg>
          </button>
          <h1 className="app__title">{deck?.title ?? 'Cards'}</h1>
        </div>
        <div className="app__meta">
          {total ? `${currentIndex + 1} / ${total}` : 'Loading'}
        </div>
      </header>

      <main className="deck" aria-live="polite">
        {isLoading && <div className="deck__message">Loading deck…</div>}
        {error && !isLoading && (
          <div className="deck__message deck__message--error">{error}</div>
        )}
        {!isLoading && !error && total === 0 && (
          <div className="deck__message">No cards found.</div>
        )}
        {!isLoading && !error && total > 0 && (
          <DeckStack
            stack={stack}
            dragState={dragState}
            dragX={dragX}
            leftProgress={leftProgress}
            rightProgress={rightProgress}
            showPrev={showPrev}
            isFlipped={isFlipped}
            isFlipping={isFlipping}
            flipAnimation={flipAnimation}
            isJumping={isJumping}
            supportsPointer={supportsPointer}
            onFlipEnd={handleFlipEnd}
            onKeyDown={handleKeyDown}
            onJump={jumpToCard}
            getRenderer={getCardRenderer}
            handlers={handlers}
          />
        )}
      </main>

      {isIndexOpen && (
        <section
          className="index-card-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="deck-index-title"
          id="deck-index-card"
          onClick={closeIndex}
        >
          <article
            className="index-card"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="index-card__header">
              <div className="index-card__heading">
                <h2 id="deck-index-title" className="index-card__title">
                  {isIntroCardOpen
                    ? 'Introduction'
                    : `${indexEntries.length} Mental Models`}
                </h2>
              </div>
              <button
                className="index-card__close"
                type="button"
                onClick={closeIndex}
              >
                Close
              </button>
            </header>
            {!isIntroCardOpen && (
              <div className="index-card__search-row">
                <input
                  className="index-card__search"
                  type="search"
                  value={indexQuery}
                  onChange={(event) => setIndexQuery(event.target.value)}
                  placeholder="Search model titles"
                  aria-label="Search mental models"
                  autoComplete="off"
                />
              </div>
            )}
            <div className="index-card__list">
              {isIntroCardOpen ? (
                <article className="index-card__virtual" aria-label="Introduction card">
                  <button
                    type="button"
                    className="index-card__virtual-back"
                    onClick={() => setIsIntroCardOpen(false)}
                  >
                    Back to index
                  </button>
                  <div className="index-card__virtual-card">
                    <p className="index-card__virtual-title">Thank you</p>
                    <a
                      className="index-card__virtual-link"
                      href={GITHUB_REPO_URL}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {GITHUB_REPO_URL}
                    </a>
                  </div>
                </article>
              ) : (
                showIntroEntry || filteredIndexEntries.length > 0 ? (
                  <>
                    {showIntroEntry && (
                      <button
                        type="button"
                        className="index-card__item index-card__item--intro"
                        onClick={() => setIsIntroCardOpen(true)}
                      >
                        <span className="index-card__item-order">0</span>
                        <span className="index-card__item-title">Introduction</span>
                      </button>
                    )}
                    {filteredIndexEntries.map((entry, index) => (
                      <button
                        key={entry.id}
                        type="button"
                        className={`index-card__item${
                          currentCardId === entry.id ? ' is-current' : ''
                        }`}
                        style={
                          {
                            '--index-accent': entry.badgeColor,
                          } as React.CSSProperties
                        }
                        onClick={() => jumpFromIndex(entry.id)}
                      >
                        <span className="index-card__item-order">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="index-card__item-title">{entry.title}</span>
                        <span
                          className="card__badge card__badge--back index-card__item-badge"
                          style={
                            {
                              '--card-border': entry.badgeColor,
                              '--card-theme': entry.badgeColor,
                            } as React.CSSProperties
                          }
                        >
                          {entry.badge}
                        </span>
                      </button>
                    ))}
                  </>
                ) : (
                  <p className="index-card__empty">No matching models found.</p>
                )
              )}
            </div>
          </article>
        </section>
      )}

      <footer className="app__footer">
        {updateAvailable ? (
          <div className="app__update app__panel" role="status">
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
          <div className="app__nav app__panel" role="note" aria-label="Navigation help">
            <span className="app__hint">Tap card to flip</span>
            <span className="app__hint">Swipe left or right to navigate</span>
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
          </div>
        )}
      </footer>

      {isLandscapeBlocked && (
        <section
          className="orientation-guard"
          role="dialog"
          aria-modal="true"
          aria-label="Rotate to portrait mode"
        >
          <div className="orientation-guard__content">
            <div className="orientation-guard__icon" aria-hidden="true">
              <span className="orientation-guard__phone" />
            </div>
            <h2 className="orientation-guard__title">Portrait Mode Only</h2>
            <p className="orientation-guard__text">
              Rotate your phone back to portrait to continue.
            </p>
          </div>
        </section>
      )}
    </div>
  )
}

export default App
