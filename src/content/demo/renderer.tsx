import { memo } from 'react'
import type { CardRenderProps, CardRenderer } from '../../core/types'
import { renderRichText, shouldTightenHeadline } from '../../core/richText'
import { demoTheme } from './themes'

const DemoCardFaces = memo(function DemoCardFaces({
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
            <span className="card__badge">{card.front.badge ?? 'Vocab'}</span>
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
              {card.front.badge ?? 'Vocab'}
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

export const demoRenderer: CardRenderer = {
  type: 'vocab',
  getTheme: () => demoTheme,
  renderFaces: (props) => <DemoCardFaces {...props} />,
}
