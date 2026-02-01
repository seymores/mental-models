import type { MentalModel } from './types'

export const shuffle = <T,>(items: T[]) => {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export const buildDeck = (items: MentalModel[]) => {
  const buckets = new Map<string, MentalModel[]>()
  for (const model of items) {
    const key = model.category || 'Other'
    const bucket = buckets.get(key) || []
    bucket.push(model)
    buckets.set(key, bucket)
  }

  const categoryOrder = ['People', 'Process', 'Product']
  const otherCategories = Array.from(buckets.keys()).filter(
    (key) => !categoryOrder.includes(key)
  )
  const order = [...categoryOrder, ...otherCategories]
  const shuffledBuckets = order.map((key) => shuffle(buckets.get(key) || []))
  const startOffset = Math.floor(Math.random() * order.length)
  const deck: MentalModel[] = []
  let index = 0

  while (shuffledBuckets.some((bucket) => bucket.length > 0)) {
    const bucketIndex = (startOffset + index) % shuffledBuckets.length
    const bucket = shuffledBuckets[bucketIndex]
    if (bucket.length > 0) {
      deck.push(bucket.shift() as MentalModel)
    }
    index += 1
  }

  return deck
}
