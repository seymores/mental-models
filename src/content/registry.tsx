import { memo } from 'react'
import type { CardRenderProps, CardRenderer, DeckAdapter } from '../core/types'
import { renderRichText, shouldTightenHeadline } from '../core/richText'
import { demoAdapter } from './demo/adapter'
import { demoRenderer } from './demo/renderer'
import { mentalModelAdapter } from './mental-models/adapter'
import { mentalModelRenderer } from './mental-models/renderer'

const fallbackTheme = {
  background: '#f2ece6',
  ink: '#201a15',
  muted: '#3a2f27',
  line: 'rgba(32, 26, 21, 0.2)',
  badgeBg: '#3a2f27',
  tagBg: 'rgba(255, 255, 255, 0.45)',
}

const FallbackFaces = memo(function FallbackFaces({
  card,
  onJump,
  isFacedown,
}: CardRenderProps) {
  const tags = card.back.tags ?? []

  return (
    <>
      <div className="card__face card__face--front" aria-hidden={isFacedown}>
        <div className="card__content card__content--front">
          <div className="card__meta">
            <span className="card__badge">{card.front.badge ?? 'Card'}</span>
          </div>
          <h2
            className={`card__headline${
              shouldTightenHeadline(card.front.title)
                ? ' card__headline--tight'
                : ''
            }`}
          >
            {card.front.title}
          </h2>
          {card.front.subtitle && (
            <p className="card__subtitle">{card.front.subtitle}</p>
          )}
        </div>
      </div>
      <div className="card__face card__face--back" aria-hidden={!isFacedown}>
        <div className="card__back-body">
          <div className="card__back-header">
            <span className="card__badge card__badge--back">
              {card.front.badge ?? 'Card'}
            </span>
            <h2 className="card__back-title">
              {card.back.title ?? card.front.title}
            </h2>
          </div>
          {card.back.sections.map((section) => (
            <section key={`${card.id}-${section.label}`} className="card__section">
              <h3>{section.label}</h3>
              {renderRichText(section.body)}
            </section>
          ))}
          {tags.length > 0 && (
            <section className="card__section">
              <h3>Related</h3>
              <div className="card__tags">
                {tags.map((item) =>
                  item.targetId ? (
                    <button
                      key={item.label}
                      type="button"
                      className="card__tag card__tag--link"
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={() => onJump(item.targetId as string)}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <span key={item.label} className="card__tag">
                      {item.label}
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

const fallbackRenderer: CardRenderer = {
  type: 'fallback',
  getTheme: () => fallbackTheme,
  renderFaces: (props) => <FallbackFaces {...props} />,
}

const adapters = new Map<string, DeckAdapter>([
  [mentalModelAdapter.type, mentalModelAdapter],
  [demoAdapter.type, demoAdapter],
])

const renderers = new Map<string, CardRenderer>([
  [mentalModelRenderer.type, mentalModelRenderer],
  [demoRenderer.type, demoRenderer],
])

export const getDeckAdapter = (type: string) => adapters.get(type)

export const getCardRenderer = (type: string) =>
  renderers.get(type) ?? fallbackRenderer
