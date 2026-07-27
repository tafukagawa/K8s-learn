export interface RefLink {
  label: string
  url: string
}

export interface Category {
  id: number
  slug: string
  name: string
  icon: string
  order: number
}

export interface Section {
  id: number
  categoryId: number
  slug: string
  title: string
  order: number
}

export interface Command {
  id: number
  categoryId: number
  sectionId: number
  name: string
  description: string
  syntax: string
  example: string
  tags: string[]
  isCustom: boolean
  url: string
}

export interface Knowledge {
  id: number
  categoryId: number
  sectionId: number
  title: string
  body: string
  tags: string[]
  isCustom: boolean
  url: string
  cloze: null
}

export type ProgressStatus = 'unseen' | 'learning' | 'done'

export interface Progress {
  id: number
  itemType: 'command' | 'knowledge'
  itemId: number
  status: ProgressStatus
  correctCount: number
  attemptCount: number
  lastReviewed: string
}

export interface CommandWithProgress extends Command {
  progress: Progress | null
}

export interface KnowledgeWithProgress extends Knowledge {
  progress: Progress | null
}
