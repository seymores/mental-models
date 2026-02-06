import { memo } from 'react'
import type { CardRenderer, CardRenderProps } from '../../core/types'
import { renderRichText, shouldTightenHeadline } from '../../core/richText'
import { getHeroIcons, getIconUrl, hashString } from './icons'
import { categoryBadgeIcons, categoryThemes } from './themes'

const MentalModelFaces = memo(function MentalModelFaces({
  card,
  theme,
  onJump,
  isFacedown,
}: CardRenderProps) {
  const badgeIcons =
    categoryBadgeIcons[card.category ?? ''] ?? categoryBadgeIcons.People
  const badgeIcon = badgeIcons[hashString(card.id) % badgeIcons.length]
  const badgeIconUrl = getIconUrl(badgeIcon, '#f7f7f4')
  const badgeIconBackUrl = getIconUrl(badgeIcon, '#f7f7f4')
  const heroIcons =
    card.front.heroIcons ?? getHeroIcons(card.front.title, card.category)
  const heroColor = `color-mix(in srgb, ${theme.muted} 60%, ${theme.background} 40%)`
  const tags = card.back.tags ?? []

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
              {card.front.badge ?? card.category}
            </span>
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
          {heroIcons.length > 0 && (
            <div className="card__hero-icons" aria-hidden="true">
              {heroIcons.map((icon, index) => (
                <img
                  key={`${card.id}-hero-${index}`}
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
          {card.front.subtitle && (
            <p className="card__subtitle">{card.front.subtitle}</p>
          )}
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
              {card.front.badge ?? card.category}
            </span>
            <h2 className="card__back-title">
              {card.back.title ?? card.front.title}
            </h2>
          </div>
          {card.back.sections.map((section) => (
            <section
              key={`${card.id}-${section.label}`}
              className={`card__section${
                section.label === 'Try This Now' ? ' card__section--try' : ''
              }`}
            >
              <h3>{section.label}</h3>
              {renderRichText(section.body)}
            </section>
          ))}
          {tags.length > 0 && (
            <section className="card__section">
              <h3>Related Models</h3>
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

export const mentalModelRenderer: CardRenderer = {
  type: 'mental-model',
  getTheme: (card) =>
    categoryThemes[card.category ?? ''] ?? categoryThemes.People,
  renderFaces: (props) => <MentalModelFaces {...props} />,
}
