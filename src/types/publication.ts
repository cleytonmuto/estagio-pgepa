export interface PublicationInput {
  title: string
  description: string
  content: string
}

export interface Publication extends PublicationInput {
  id: string
  createdAt: string
}

