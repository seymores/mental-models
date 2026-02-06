export type MentalModel = {
  id: string
  title: string
  category: string
  principle: string
  coreConcept: string
  example: string
  tryThis: string
  related: string[]
}

export type MentalModelPayload = {
  models: MentalModel[]
  generatedAt?: string
  count?: number
}
