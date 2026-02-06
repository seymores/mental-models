const normalizeKey = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

export const getIconUrl = (name: string, color: string) =>
  `https://api.iconify.design/circum:${name}.svg?color=${encodeURIComponent(
    color
  )}`

export const hashString = (value: string) => {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const heroIconOverrides = new Map<string, string[]>([
  [normalizeKey('Activation Energy'), ['battery-charging', 'light', 'circle-plus']],
  [normalizeKey('Adaptation'), ['wheat', 'repeat', 'circle-check']],
  [normalizeKey('Adverse Selection'), ['filter', 'dollar', 'warning']],
  [normalizeKey('Anchoring in Negotiation'), ['map-pin', 'dollar', 'circle-plus']],
  [normalizeKey('Arbitrage'), ['dollar', 'repeat', 'circle-plus']],
  [normalizeKey('Asymmetric Warfare'), ['warning', 'flag-1', 'route']],
  [normalizeKey('BATNA'), ['flag-1', 'dollar', 'circle-check']],
  [normalizeKey('Bayesian Thinking'), ['calculator-1', 'circle-plus', 'circle-check']],
  [normalizeKey('Bottlenecks'), ['filter', 'stop-sign-1', 'route']],
  [normalizeKey('Brand Equity'), ['star', 'shopping-tag', 'dollar']],
  [normalizeKey("Brooks's Law"), ['user', 'route', 'warning']],
  [normalizeKey('Bundling/Unbundling'), ['box-list', 'square-plus', 'square-minus']],
  [normalizeKey('Cannibalization'), ['shopping-cart', 'circle-minus', 'circle-plus']],
  [normalizeKey("Chesterton's Fence"), ['stop-sign-1', 'lock', 'ruler']],
  [normalizeKey('Circle of Competence'), ['circle-check', 'user', 'circle-info']],
  [normalizeKey('Cognitive Load'), ['microchip', 'battery-empty', 'warning']],
  [normalizeKey('Commoditization'), ['boxes', 'dollar', 'circle-minus']],
  [normalizeKey('Comparative Advantage'), ['flag-1', 'dollar', 'circle-check']],
  [normalizeKey('Competitive Exclusion'), ['flag-1', 'warning', 'user']],
  [normalizeKey('Compound Interest/Compounding'), ['repeat', 'dollar', 'circle-plus']],
  [normalizeKey('Creative Destruction'), ['trash', 'beaker-1', 'boxes']],
  [normalizeKey('Critical Mass'), ['circle-plus', 'user', 'circle-check']],
  [normalizeKey('Critical Path'), ['route', 'flag-1', 'circle-check']],
  [normalizeKey('Crossing the Chasm'), ['route', 'warning', 'circle-check']],
  [normalizeKey('Customer Lifetime Value'), ['user', 'clock-1', 'dollar']],
  [normalizeKey('Diminishing Returns'), ['percent', 'circle-minus', 'dollar']],
  [normalizeKey('Disruption'), ['warning', 'wave-pulse-1', 'beaker-1']],
  [normalizeKey('Disruptive Innovation'), ['beaker-1', 'wave-pulse-1', 'circle-plus']],
  [normalizeKey('Economic Moat'), ['vault', 'lock', 'dollar']],
  [normalizeKey('Economies of Scale'), ['maximize-1', 'boxes', 'percent']],
  [normalizeKey('Ecosystems'), ['globe', 'wheat', 'circle-plus']],
  [normalizeKey('Eisenhower Matrix'), ['grid-2-h', 'grid-2-v', 'calendar']],
  [normalizeKey('Elasticity'), ['percent', 'slider-horizontal', 'dollar']],
  [normalizeKey('Price Elasticity'), ['percent', 'slider-horizontal', 'dollar']],
  [normalizeKey('Emergence'), ['grid-4-2', 'circle-plus', 'circle-info']],
  [normalizeKey('Entropy'), ['battery-empty', 'cloud-off', 'wave-pulse-1']],
  [normalizeKey('Equilibrium'), ['circle-minus', 'circle-plus', 'grid-2-h']],
  [normalizeKey('Evolution'), ['wheat', 'view-timeline', 'circle-plus']],
  [normalizeKey('Expected Value'), ['calculator-1', 'dollar', 'percent']],
  [normalizeKey('Falsifiability'), ['circle-question', 'circle-check', 'warning']],
  [normalizeKey('Feedback Loops'), ['repeat', 'undo', 'redo']],
  [normalizeKey('Positive Feedback Loop'), ['repeat', 'circle-plus', 'circle-check']],
  [normalizeKey('First Principles Thinking'), ['beaker-1', 'ruler', 'circle-check']],
  [normalizeKey('First-Mover Advantage'), ['flag-1', 'trophy', 'circle-plus']],
  [normalizeKey('Flywheel Effect'), ['repeat', 'circle-plus', 'circle-check']],
  [normalizeKey('Freemium'), ['gift', 'dollar', 'circle-plus']],
  [normalizeKey('Game Theory'), ['grid-3-1', 'user', 'shuffle']],
  [normalizeKey('Giffen Goods'), ['warning', 'dollar', 'shopping-tag']],
  [normalizeKey('Half-Life'), ['timer', 'circle-minus', 'wave-pulse-1']],
  [normalizeKey('Incentives'), ['badge-dollar', 'circle-plus', 'circle-check']],
  [normalizeKey('Inertia'), ['pause-1', 'stop-sign-1', 'circle-minus']],
  [normalizeKey('Inversion'), ['undo', 'circle-minus', 'circle-check']],
  [normalizeKey('Jobs to Be Done'), ['memo-pad', 'user', 'circle-check']],
  [normalizeKey('Late-Mover Advantage'), ['clock-1', 'flag-1', 'circle-check']],
  [normalizeKey('Lateral Thinking'), ['shuffle', 'bezier', 'circle-plus']],
  [normalizeKey('Leverage'), ['ruler', 'circle-plus', 'route']],
  [normalizeKey('Leverage Points'), ['slider-horizontal', 'ruler', 'circle-plus']],
  [normalizeKey('Lindy Effect'), ['calendar', 'clock-1', 'circle-check']],
  [normalizeKey('Lock-In'), ['lock', 'link', 'dollar']],
  [normalizeKey('Long Tail'), ['view-list', 'circle-minus', 'circle-plus']],
  [normalizeKey('Margin of Safety'), ['ruler', 'warning', 'circle-check']],
  [normalizeKey('Marginal Cost/Benefit'), ['calculator-1', 'dollar', 'circle-plus']],
  [normalizeKey('Market Segmentation'), ['filter', 'shopping-tag', 'grid-3-1']],
  [normalizeKey('Minimum Viable Product'), ['boxes', 'circle-check', 'beaker-1']],
  [normalizeKey('Momentum'), ['wave-pulse-1', 'timer', 'circle-plus']],
  [normalizeKey('Moral Hazard'), ['warning', 'dollar', 'lock']],
  [normalizeKey('Mutation'), ['virus', 'beaker-1', 'circle-plus']],
  [normalizeKey('Nash Equilibrium'), ['grid-4-2', 'circle-check', 'link']],
  [normalizeKey('Natural Selection'), ['wheat', 'sun', 'circle-check']],
  [normalizeKey('Network Effects'), ['link', 'globe', 'user']],
  [normalizeKey("Occam's Razor"), ['ruler', 'circle-minus', 'circle-check']],
  [normalizeKey('Opportunity Cost'), ['dollar', 'circle-minus', 'circle-plus']],
  [normalizeKey('Optionality'), ['circle-plus', 'square-plus', 'shuffle']],
  [normalizeKey('Pareto Principle (80/20 Rule)'), ['percent', 'circle-check', 'circle-plus']],
  [normalizeKey("Parkinson's Law"), ['timer', 'maximize-1', 'clock-1']],
  [normalizeKey('Platform vs. Product'), ['desktop', 'mobile-1', 'link']],
  [normalizeKey("Porter's Five Forces"), ['compass-1', 'flag-1', 'trophy']],
  [normalizeKey('Positioning'), ['map-pin', 'flag-1', 'circle-check']],
  [normalizeKey('Pre-Mortem Analysis'), ['warning', 'circle-info', 'circle-check']],
  [normalizeKey('Price Discrimination'), ['shopping-tag', 'dollar', 'percent']],
  [normalizeKey('Principal-Agent Problem'), ['user', 'chat-1', 'dollar']],
  [normalizeKey("Prisoner's Dilemma"), ['lock', 'chat-1', 'warning']],
  [normalizeKey('Probabilistic Thinking'), ['percent', 'calculator-1', 'circle-info']],
  [normalizeKey('Product-Market Fit'), ['shopping-tag', 'circle-check', 'box-list']],
  [normalizeKey('Razor and Blades'), ['fork-knife', 'dollar', 'repeat']],
  [normalizeKey('Red Queen Effect'), ['repeat', 'timer', 'warning']],
  [normalizeKey('Redundancy'), ['repeat', 'grid-2-h', 'grid-2-v']],
  [normalizeKey('Regret Minimization Framework'), ['stopwatch', 'circle-minus', 'circle-check']],
  [normalizeKey('Reservation Price'), ['dollar', 'lock', 'circle-check']],
  [normalizeKey('Reversible vs. Irreversible Decisions'), ['undo', 'lock', 'unlock']],
  [normalizeKey('Scalability'), ['maximize-1', 'boxes', 'circle-plus']],
  [normalizeKey('Scenario Planning'), ['view-timeline', 'calendar', 'compass-1']],
  [normalizeKey('Screening'), ['filter', 'circle-check', 'user']],
  [normalizeKey('Second-Order Thinking'), ['repeat', 'view-timeline', 'circle-plus']],
  [normalizeKey('Signaling'), ['bullhorn', 'flag-1', 'circle-info']],
  [normalizeKey('Specialization'), ['ruler', 'grid-3-1', 'circle-check']],
  [normalizeKey('Substitutes and Complements'), ['link', 'circle-plus', 'circle-minus']],
  [normalizeKey('Supply and Demand'), ['shopping-cart', 'dollar', 'percent']],
  [normalizeKey('Sustaining Innovation'), ['beaker-1', 'repeat', 'circle-check']],
  [normalizeKey('Switching Costs'), ['lock', 'dollar', 'repeat']],
  [normalizeKey('Systems Thinking'), ['route', 'grid-3-1', 'settings']],
  [normalizeKey('Technical Debt'), ['settings', 'warning', 'ruler']],
  [normalizeKey('Technology Adoption Lifecycle'), ['view-timeline', 'user', 'circle-check']],
  [normalizeKey('The 5 Whys'), ['chat-1', 'circle-question', 'search']],
  [normalizeKey('The Map is Not the Territory'), ['map', 'map-pin', 'circle-info']],
  [normalizeKey('Theory of Constraints'), ['lock', 'filter', 'route']],
  [normalizeKey('Thought Experiments'), ['beaker-1', 'light', 'memo-pad']],
  [normalizeKey('Time Value of Money'), ['clock-1', 'dollar', 'percent']],
  [normalizeKey('Tit-for-Tat'), ['share-1', 'share-2', 'repeat']],
  [normalizeKey('Two-Sided Markets'), ['link', 'user', 'shopping-cart']],
  [normalizeKey('Unintended Consequences'), ['warning', 'circle-alert', 'undo']],
  [normalizeKey('Unit Economics'), ['calculator-1', 'dollar', 'percent']],
  [normalizeKey('Value Chain'), ['link', 'box-list', 'route']],
  [normalizeKey('Value Creation vs. Capture'), ['dollar', 'box-list', 'wallet']],
  [normalizeKey('Veblen Goods'), ['star', 'dollar', 'shopping-tag']],
  [normalizeKey('Via Negativa'), ['circle-minus', 'filter', 'circle-check']],
  [normalizeKey('Winner-Take-All Markets'), ['trophy', 'dollar', 'circle-plus']],
  [normalizeKey('ZOPA'), ['link', 'dollar', 'circle-info']],
])

const heroIconPools = {
  bias: [
    'circle-question',
    'circle-alert',
    'warning',
    'filter',
    'search',
    'circle-info',
    'face-meh',
    'face-frown',
  ],
  learning: ['read', 'memo-pad', 'pen', 'sticky-note', 'light', 'dumbbell', 'ruler'],
  social: ['user', 'chat-1', 'chat-2', 'heart', 'share-1', 'share-2', 'mail', 'phone'],
  decision: [
    'circle-check',
    'square-check',
    'circle-info',
    'circle-plus',
    'circle-minus',
    'flag-1',
    'stop-sign-1',
  ],
  time: [
    'clock-1',
    'clock-2',
    'timer',
    'stopwatch',
    'calendar',
    'calendar-date',
    'view-timeline',
  ],
  systems: [
    'repeat',
    'shuffle',
    'route',
    'bezier',
    'view-timeline',
    'grid-3-1',
    'grid-4-2',
    'view-board',
    'view-table',
  ],
  economics: [
    'dollar',
    'coins-1',
    'money-bill',
    'money-check-1',
    'wallet',
    'bank',
    'credit-card-1',
    'percent',
    'badge-dollar',
    'bitcoin',
  ],
  market: [
    'shopping-cart',
    'shopping-tag',
    'shop',
    'boxes',
    'box-list',
    'delivery-truck',
    'receipt',
    'discount-1',
    'gift',
  ],
  product: [
    'microchip',
    'beaker-1',
    'vial',
    'desktop',
    'mobile-1',
    'cloud',
    'server',
    'database',
    'usb',
  ],
  strategy: ['trophy', 'medal', 'flag-1', 'compass-1', 'mountain-1', 'globe', 'star'],
  biology: ['wheat', 'virus', 'apple', 'droplet', 'sun'],
  physics: ['battery-full', 'battery-charging', 'wave-pulse-1', 'sun', 'cloud', 'cloud-off'],
  negotiation: ['chat-1', 'share-1', 'link', 'dollar', 'percent', 'flag-1'],
  fallback: ['circle-info', 'circle-check', 'circle-question', 'search', 'filter', 'warning'],
}

const heroIconThemes: { match: RegExp; icons: string[] }[] = [
  { match: /(bias|fallacy|heuristic|effect|error|ignorance|gap)/i, icons: heroIconPools.bias },
  {
    match: /(mindset|practice|learning|spacing|interleaving|chunk|bandwidth)/i,
    icons: heroIconPools.learning,
  },
  {
    match: /(social|reciprocity|consistency|authority|liking|bystander|groupthink|consensus|empathy|attribution|halo|exposure|spotlight)/i,
    icons: heroIconPools.social,
  },
  {
    match: /(entropy|inertia|momentum|activation energy|half-life|equilibrium)/i,
    icons: heroIconPools.physics,
  },
  {
    match: /(natural selection|adaptation|mutation|evolution|ecosystem)/i,
    icons: heroIconPools.biology,
  },
  {
    match: /(game theory|nash|prisoner|zero-sum|tit-for-tat|batna|zopa|reservation|anchoring)/i,
    icons: heroIconPools.negotiation,
  },
  {
    match: /(economic|market|price|demand|supply|cost|value|money|interest|elasticity|marginal|returns|compounding|arbitrage|advantage|incentive|principal|hazard|selection|signaling|screening|debt|moat|freemium|bundling|discrimination|veblen|giffen|substitutes|complements|segmentation|positioning|brand|lifetime|unit economics|scalability|leverage)/i,
    icons: heroIconPools.economics,
  },
  {
    match: /(product|innovation|mvp|platform|two-sided|lock-in|technology adoption|chasm|jobs to be done|value chain|switching|commoditization|cannibalization|winner-take-all|long tail|razor|blades|disruption)/i,
    icons: heroIconPools.product,
  },
  {
    match: /(system|feedback|loop|bottleneck|constraint|emergence|leverage|network|critical mass|flywheel)/i,
    icons: heroIconPools.systems,
  },
  {
    match: /(time|calendar|lindy|parkinson|critical path)/i,
    icons: heroIconPools.time,
  },
  {
    match: /(decision|regret|minimization|premortem|scenario|falsifiability|probabilistic|bayesian|expected value|opportunity cost|optional|reversible|irreversible)/i,
    icons: heroIconPools.decision,
  },
  {
    match: /(competition|advantage|red queen|asymmetric warfare|first-mover|late-mover)/i,
    icons: heroIconPools.strategy,
  },
  {
    match: /(market|pricing|segmentation|positioning|brand)/i,
    icons: heroIconPools.market,
  },
]

const categoryHeroPools: Record<string, string[]> = {
  People: heroIconPools.social,
  Process: heroIconPools.systems,
  Product: heroIconPools.product,
}

const pickIcons = (pool: string[], count: number, seed: string) => {
  if (!pool.length) return []
  const start = hashString(seed) % pool.length
  const picks: string[] = []
  for (let offset = 0; offset < pool.length && picks.length < count; offset += 1) {
    const icon = pool[(start + offset) % pool.length]
    if (!picks.includes(icon)) picks.push(icon)
  }
  return picks
}

export const getHeroIcons = (title: string, category?: string) => {
  const key = normalizeKey(title)
  const override = heroIconOverrides.get(key)
  if (override) return override
  const lowerTitle = title.toLowerCase()
  for (const theme of heroIconThemes) {
    if (theme.match.test(lowerTitle)) {
      return pickIcons(theme.icons, 3, key)
    }
  }
  const pool = category ? categoryHeroPools[category] : undefined
  return pickIcons(pool ?? heroIconPools.fallback, 3, key)
}
