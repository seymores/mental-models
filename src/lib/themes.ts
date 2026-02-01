export const categoryThemes: Record<
  string,
  {
    background: string
    ink: string
    muted: string
    line: string
    badgeBg: string
    tagBg: string
  }
> = {
  People: {
    background: '#da8db0',
    ink: '#3a0c22',
    muted: '#5a1a35',
    line: 'rgba(58, 12, 34, 0.2)',
    badgeBg: '#7a2a4d',
    tagBg: 'rgba(255, 255, 255, 0.45)',
  },
  Process: {
    background: '#8fbbe8',
    ink: '#0a2746',
    muted: '#163c63',
    line: 'rgba(10, 39, 70, 0.2)',
    badgeBg: '#1f4e7f',
    tagBg: 'rgba(255, 255, 255, 0.45)',
  },
  Product: {
    background: '#7fb07a',
    ink: '#162b14',
    muted: '#254025',
    line: 'rgba(22, 43, 20, 0.2)',
    badgeBg: '#2f5a30',
    tagBg: 'rgba(255, 255, 255, 0.45)',
  },
}

export const categoryBadgeIcons: Record<string, string[]> = {
  People: ['user', 'face-smile', 'heart', 'chat-1'],
  Process: ['settings', 'repeat', 'shuffle', 'route'],
  Product: ['boxes', 'box-list', 'shopping-cart', 'shopping-tag'],
}
