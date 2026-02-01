import type { ReactNode } from 'react'

const renderInline = (text: string) =>
  text.split(/\*\*(.+?)\*\*/g).map((part, index) =>
    index % 2 === 1 ? <strong key={`${part}-${index}`}>{part}</strong> : part
  )

export const renderRichText = (text: string): ReactNode => {
  if (!text) return null
  return text.split(/\n\n+/).map((paragraph, index) => {
    const lines = paragraph.split('\n')
    return (
      <p key={`${index}-${lines[0]?.slice(0, 10)}`}>
        {lines.map((line, lineIndex) => (
          <span key={`${lineIndex}-${line.slice(0, 8)}`}>
            {renderInline(line)}
            {lineIndex < lines.length - 1 ? <br /> : null}
          </span>
        ))}
      </p>
    )
  })
}

export const shouldTightenHeadline = (title: string) => {
  const words = title.split(/\s+/).filter(Boolean)
  const maxWordLength = words.reduce(
    (max, word) => Math.max(max, word.length),
    0
  )
  const titleLength = title.replace(/\s+/g, '').length
  return maxWordLength >= 10 || titleLength >= 16
}
