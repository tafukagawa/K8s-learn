import type {
  Category, Section, Command, Knowledge,
  CommandWithProgress, KnowledgeWithProgress,
  Progress, ProgressStatus,
} from '../types'

// ─── import.meta.glob でビルド時に全 JSON をバンドル ───────────────────────────
const CAT_METAS = import.meta.glob<{ default: { name?: string } }>(
  '../../categories/*/meta.json', { eager: true }
)
const SEC_METAS = import.meta.glob<{ default: { title?: string } }>(
  '../../categories/*/sections/*/meta.json', { eager: true }
)
const CMD_FILES = import.meta.glob<{ default: RawCommand[] }>(
  '../../categories/*/sections/*/commands.json', { eager: true }
)
const KN_FILES = import.meta.glob<{ default: RawKnowledge[] }>(
  '../../categories/*/sections/*/knowledge.json', { eager: true }
)

interface RawCommand {
  name: string; description: string; syntax: string; example: string; tags: string[]; url?: string
}
interface RawKnowledge {
  title: string; body: string; tags: string[]; url?: string
}
interface CommandInternal extends Command { _sectionId: number }
interface KnowledgeInternal extends Knowledge { _sectionId: number }

// ─── データ構築（起動時1回のみ実行） ───────────────────────────────────────────
function buildData() {
  const categories: Category[] = []
  const sections: Section[] = []
  const allCommands: CommandInternal[] = []
  const allKnowledge: KnowledgeInternal[] = []

  let catId = 1, secId = 1, cmdId = 1, knId = 1

  const catPaths = Object.keys(CAT_METAS).sort()
  for (const catPath of catPaths) {
    const slug = catPath.match(/\/categories\/([^/]+)\/meta\.json$/)![1]
    const meta = CAT_METAS[catPath].default ?? (CAT_METAS[catPath] as any)
    categories.push({ id: catId, slug, name: meta.name ?? slug, icon: '', order: catId - 1 })

    const secPaths = Object.keys(SEC_METAS)
      .filter(p => p.includes(`/categories/${slug}/`))
      .sort()

    for (const secPath of secPaths) {
      const secSlug = secPath.match(/\/sections\/([^/]+)\/meta\.json$/)![1]
      const secMeta = SEC_METAS[secPath].default ?? (SEC_METAS[secPath] as any)
      sections.push({
        id: secId, categoryId: catId, slug: secSlug,
        title: secMeta.title ?? secSlug, order: secId - 1,
      })

      const cmdKey = `../../categories/${slug}/sections/${secSlug}/commands.json`
      if (CMD_FILES[cmdKey]) {
        const raws: RawCommand[] = CMD_FILES[cmdKey].default ?? (CMD_FILES[cmdKey] as any)
        for (const r of raws) {
          allCommands.push({
            id: cmdId++, categoryId: catId, _sectionId: secId,
            name: r.name, description: r.description, syntax: r.syntax,
            example: r.example, tags: r.tags, url: r.url ?? '',
            isCustom: false,
          })
        }
      }

      const knKey = `../../categories/${slug}/sections/${secSlug}/knowledge.json`
      if (KN_FILES[knKey]) {
        const raws: RawKnowledge[] = KN_FILES[knKey].default ?? (KN_FILES[knKey] as any)
        for (const r of raws) {
          allKnowledge.push({
            id: knId++, categoryId: catId, _sectionId: secId,
            title: r.title, body: r.body, tags: r.tags, url: r.url ?? '',
            isCustom: false, cloze: null,
          })
        }
      }

      secId++
    }
    catId++
  }

  return { categories, sections, allCommands, allKnowledge }
}

const DB = buildData()

// ─── localStorage ヘルパー ──────────────────────────────────────────────────────
function getProgress(type: 'command' | 'knowledge', id: number): Progress | null {
  const raw = localStorage.getItem(`progress:${type}:${id}`)
  if (!raw) return null
  const p = JSON.parse(raw)
  return { id, itemType: type, itemId: id, status: p.status, correctCount: 0, attemptCount: 0, lastReviewed: p.updatedAt }
}

function getCustomCommands(): Command[] {
  const raw = localStorage.getItem('custom:commands')
  return raw ? JSON.parse(raw) : []
}
function saveCustomCommands(cmds: Command[]) {
  localStorage.setItem('custom:commands', JSON.stringify(cmds))
}
function getCustomKnowledge(): Knowledge[] {
  const raw = localStorage.getItem('custom:knowledge')
  return raw ? JSON.parse(raw) : []
}
function saveCustomKnowledge(items: Knowledge[]) {
  localStorage.setItem('custom:knowledge', JSON.stringify(items))
}

// ─── api 実装 ──────────────────────────────────────────────────────────────────
let _nextCustomId = 100000

export const api = {
  categories: {
    list: (): Promise<Category[]> => Promise.resolve([...DB.categories]),
  },

  sections: {
    list: (categoryId: number): Promise<Section[]> =>
      Promise.resolve(DB.sections.filter(s => s.categoryId === categoryId)),
  },

  commands: {
    list: (categoryId: number, sectionId?: number): Promise<CommandWithProgress[]> => {
      const base = DB.allCommands.filter(c =>
        c.categoryId === categoryId &&
        (sectionId === undefined || c._sectionId === sectionId)
      )
      const custom = getCustomCommands().filter(c =>
        c.categoryId === categoryId && c.isCustom
      )
      const all = [...base, ...custom]
      return Promise.resolve(
        all.map(c => ({ ...c, progress: getProgress('command', c.id) }))
      )
    },
    create: (data: Omit<Command, 'id' | 'isCustom'>): Promise<Command> => {
      const cmd: Command = { ...data, id: _nextCustomId++, isCustom: true }
      saveCustomCommands([...getCustomCommands(), cmd])
      return Promise.resolve(cmd)
    },
    update: (id: number, data: Partial<Omit<Command, 'id'>>): Promise<Command> => {
      const cmds = getCustomCommands().map(c => c.id === id ? { ...c, ...data } : c)
      saveCustomCommands(cmds)
      const updated = cmds.find(c => c.id === id)!
      return Promise.resolve(updated)
    },
    delete: (id: number): Promise<void> => {
      saveCustomCommands(getCustomCommands().filter(c => c.id !== id))
      return Promise.resolve()
    },
  },

  knowledge: {
    list: (categoryId: number, sectionId?: number): Promise<KnowledgeWithProgress[]> => {
      const base = DB.allKnowledge.filter(k =>
        k.categoryId === categoryId &&
        (sectionId === undefined || k._sectionId === sectionId)
      )
      const custom = getCustomKnowledge().filter(k =>
        k.categoryId === categoryId && k.isCustom
      )
      const all = [...base, ...custom]
      return Promise.resolve(
        all.map(k => ({ ...k, progress: getProgress('knowledge', k.id) }))
      )
    },
    create: (data: Omit<Knowledge, 'id' | 'isCustom'>): Promise<Knowledge> => {
      const item: Knowledge = { ...data, id: _nextCustomId++, isCustom: true }
      saveCustomKnowledge([...getCustomKnowledge(), item])
      return Promise.resolve(item)
    },
    update: (id: number, data: Partial<Omit<Knowledge, 'id'>>): Promise<Knowledge> => {
      const items = getCustomKnowledge().map(k => k.id === id ? { ...k, ...data } : k)
      saveCustomKnowledge(items)
      const updated = items.find(k => k.id === id)!
      return Promise.resolve(updated)
    },
    delete: (id: number): Promise<void> => {
      saveCustomKnowledge(getCustomKnowledge().filter(k => k.id !== id))
      return Promise.resolve()
    },
  },

  progress: {
    upsert: (itemType: 'command' | 'knowledge', itemId: number, status: ProgressStatus): Promise<Progress> => {
      const updatedAt = new Date().toISOString()
      localStorage.setItem(`progress:${itemType}:${itemId}`, JSON.stringify({ status, updatedAt }))
      const result: Progress = {
        id: itemId, itemType, itemId, status,
        correctCount: 0, attemptCount: 0, lastReviewed: updatedAt,
      }
      return Promise.resolve(result)
    },
  },

  shell: {
    openExternal: (url: string): Promise<void> => {
      window.open(url, '_blank', 'noopener,noreferrer')
      return Promise.resolve()
    },
  },

  ai: {
    checkOllama: (): Promise<{ ok: boolean; models: string[] }> =>
      Promise.resolve({ ok: false, models: [] }),
    generateCloze: (_knowledgeId: number): Promise<import('../types').ClozeItem[]> =>
      Promise.reject(new Error('Web版ではAI穴埋め生成は利用できません（Ollamaがローカルに必要）')),
  },
}
