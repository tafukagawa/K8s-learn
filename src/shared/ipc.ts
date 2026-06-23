export const api = {
  categories: {
    list: () => window.api.categories.list(),
  },
  sections: {
    list: (categoryId: number) => window.api.sections.list(categoryId),
  },
  commands: {
    list: (categoryId: number, sectionId?: number) => window.api.commands.list(categoryId, sectionId),
    create: (data: Parameters<typeof window.api.commands.create>[0]) =>
      window.api.commands.create(data),
    update: (id: number, data: Parameters<typeof window.api.commands.update>[1]) =>
      window.api.commands.update(id, data),
    delete: (id: number) => window.api.commands.delete(id),
  },
  knowledge: {
    list: (categoryId: number, sectionId?: number) => window.api.knowledge.list(categoryId, sectionId),
    create: (data: Parameters<typeof window.api.knowledge.create>[0]) =>
      window.api.knowledge.create(data),
    update: (id: number, data: Parameters<typeof window.api.knowledge.update>[1]) =>
      window.api.knowledge.update(id, data),
    delete: (id: number) => window.api.knowledge.delete(id),
  },
  progress: {
    upsert: (
      itemType: 'command' | 'knowledge',
      itemId: number,
      status: 'unseen' | 'learning' | 'done'
    ) => window.api.progress.upsert(itemType, itemId, status),
  },
  ai: {
    checkOllama: () => window.api.ai.checkOllama(),
    generateCloze: (knowledgeId: number) => window.api.ai.generateCloze(knowledgeId),
  },
}
