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
  name: string
  description: string
  syntax: string
  example: string
  tags: string[]
  isCustom: boolean
  url: string
}

export interface ClozeItem {
  q: string
  a: string
}

export interface Knowledge {
  id: number
  categoryId: number
  title: string
  body: string
  tags: string[]
  isCustom: boolean
  url: string
  cloze: ClozeItem[] | null
}

export type ProgressStatus = 'unseen' | 'learning' | 'done'

export interface Progress {
  id: number
  itemType: 'command' | 'knowledge'
  itemId: number
  status: ProgressStatus
  correctCount: number
  attemptCount: number
  lastReviewed: string | null
}

export interface CommandWithProgress extends Command {
  progress: Progress | null
}

export interface KnowledgeWithProgress extends Knowledge {
  progress: Progress | null
}

// IPC API の型（window.api）
export interface IpcApi {
  categories: {
    list: () => Promise<Category[]>
  }
  sections: {
    list: (categoryId: number) => Promise<Section[]>
  }
  commands: {
    list: (categoryId: number, sectionId?: number) => Promise<CommandWithProgress[]>
    create: (data: Omit<Command, 'id' | 'isCustom'>) => Promise<Command>
    update: (id: number, data: Partial<Omit<Command, 'id'>>) => Promise<Command>
    delete: (id: number) => Promise<void>
  }
  knowledge: {
    list: (categoryId: number, sectionId?: number) => Promise<KnowledgeWithProgress[]>
    create: (data: Omit<Knowledge, 'id' | 'isCustom'>) => Promise<Knowledge>
    update: (id: number, data: Partial<Omit<Knowledge, 'id'>>) => Promise<Knowledge>
    delete: (id: number) => Promise<void>
  }
  progress: {
    upsert: (itemType: 'command' | 'knowledge', itemId: number, status: ProgressStatus) => Promise<Progress>
  }
  shell: {
    openExternal: (url: string) => Promise<void>
  }
  ai: {
    checkOllama: () => Promise<{ ok: boolean; models: string[] }>
    generateCloze: (knowledgeId: number) => Promise<ClozeItem[]>
  }
}

declare global {
  interface Window {
    api: IpcApi
  }
}
