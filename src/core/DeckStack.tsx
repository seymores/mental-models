import type { CSSProperties } from 'react'
import type { CardRenderer, StackItem } from './types'
import type { DragState } from './useSwipe'

const defaultTheme = {
  background: '#f4efe9',
  ink: '#1f1a16',
  muted: '#3f342c',
  line: 'rgba(31, 26, 22, 0.2)',
  badgeBg: '#3f342c',
  tagBg: 'rgba(255, 255, 255, 0.45)',
}

type DeckStackProps = {
  stack: StackItem[]
  dragState: DragState
  dragX: number
  leftProgress: number
  rightProgress: number
  showPrev: boolean
  isFlipped: boolean
  isFlipping: boolean
  flipAnimation: 'flip-to-back' | 'flip-to-front' | null
  isJumping: boolean
  supportsPointer: boolean
  onFlipEnd: () => void
  onKeyDown: (event: React.KeyboardEvent) => void
  onJump: (id: string) => void
  getRenderer: (type: string) => CardRenderer
  handlers: {
    onPointerDown: (event: React.PointerEvent) => void
    onPointerMove: (event: React.PointerEvent) => void
    onPointerUp: (event: React.PointerEvent) => void
    onPointerCancel: (event: React.PointerEvent) => void
    onTouchStart: (event: React.TouchEvent) => void
    onTouchMove: (event: React.TouchEvent) => void
    onTouchEnd: (event: React.TouchEvent) => void
    onTouchCancel: (event: React.TouchEvent) => void
  }
}

export const DeckStack = ({
  stack,
  dragState,
  dragX,
  leftProgress,
  rightProgress,
  showPrev,
  isFlipped,
  isFlipping,
  flipAnimation,
  isJumping,
  supportsPointer,
  onFlipEnd,
  onKeyDown,
  onJump,
  getRenderer,
  handlers,
}: DeckStackProps) => {
  const { isDragging, isDismissing } = dragState

  return (
    <div
      className={`deck__stack${isDragging ? ' is-dragging' : ''}${
        isDismissing ? ' is-dismissing' : ''
      }`}
    >
      <div className="deck__shadow" aria-hidden="true" />
      {stack.map((item, position) => {
        const { card, role } = item
        const isTop = role === 'current'
        const renderer = getRenderer(card.type)
        const theme = renderer.getTheme(card) ?? defaultTheme
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
          translateY = depthOffset * (1 - reveal) - incomingLift * liftArc
          scale = depthScale + (1 - depthScale) * reveal
          rotateZ = -direction * incomingTilt * (1 - reveal)
          opacity = 1
        } else if (role === 'next') {
          translateY = depthOffset + (showPrev ? 1 : -1) * stackLift * liftProgress
        } else if (role === 'later') {
          translateY =
            depthOffset + (showPrev ? 1 : -1) * stackLift * 0.6 * liftProgress
        } else if (role === 'far') {
          translateY =
            depthOffset + (showPrev ? 1 : -1) * stackLift * 0.4 * liftProgress
          if (!showPrev) {
            const baseOpacity = 0.22
            opacity = baseOpacity + (1 - baseOpacity) * liftProgress
          } else {
            opacity = liftProgress
          }
        }

        return (
          <article
            key={card.id}
            className={`deck__card${isTop ? ' deck__card--top' : ''}${
              isDragging && isTop ? ' is-dragging' : ''
            }`}
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
                onAnimationEnd={isTop && isFlipping ? onFlipEnd : undefined}
                {...(isTop
                  ? supportsPointer
                    ? {
                        onPointerDown: handlers.onPointerDown,
                        onPointerMove: handlers.onPointerMove,
                        onPointerUp: handlers.onPointerUp,
                        onPointerCancel: handlers.onPointerCancel,
                      }
                    : {
                        onTouchStart: handlers.onTouchStart,
                        onTouchMove: handlers.onTouchMove,
                        onTouchEnd: handlers.onTouchEnd,
                        onTouchCancel: handlers.onTouchCancel,
                      }
                  : {})}
                onKeyDown={isTop ? onKeyDown : undefined}
                role={isTop ? 'button' : undefined}
                tabIndex={isTop ? 0 : -1}
                aria-pressed={isTop ? isFlipped : undefined}
                aria-label={
                  isTop
                    ? `Card: ${card.front.title}. Tap to flip. Swipe left or right to navigate.`
                    : undefined
                }
              >
                <div className="card__inner">
                  {renderer.renderFaces({
                    card,
                    theme,
                    onJump,
                    isFacedown: isTop ? isFlipped : false,
                  })}
                </div>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
