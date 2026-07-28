export interface Category {
  id: number
  slug: string
  name: string
  icon: string
  order: number
}

export interface Progress {
  status: 'unseen' | 'learning' | 'done'
}

export interface CommandWithProgress {
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
  progress: Progress | null
}

export async function fetchCategories(apiBaseUrl: string): Promise<Category[]> {
  const res = await fetch(`${apiBaseUrl}/api/categories`)
  if (!res.ok) {
    throw new Error(`API request to /api/categories failed with status ${res.status}`)
  }
  return res.json()
}

export async function fetchCommands(apiBaseUrl: string, categoryId: number): Promise<CommandWithProgress[]> {
  const res = await fetch(`${apiBaseUrl}/api/categories/${categoryId}/commands`)
  if (!res.ok) {
    throw new Error(`API request to /api/categories/${categoryId}/commands failed with status ${res.status}`)
  }
  return res.json()
}
