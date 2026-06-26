import { contextBridge, ipcRenderer } from 'electron'
import type { IpcApi } from '../src/types'

const api: IpcApi = {
  categories: {
    list: () => ipcRenderer.invoke('categories:list'),
  },
  sections: {
    list: (categoryId) => ipcRenderer.invoke('sections:list', categoryId),
  },
  commands: {
    list: (categoryId, sectionId) => ipcRenderer.invoke('commands:list', categoryId, sectionId),
    create: (data) => ipcRenderer.invoke('commands:create', data),
    update: (id, data) => ipcRenderer.invoke('commands:update', id, data),
    delete: (id) => ipcRenderer.invoke('commands:delete', id),
  },
  knowledge: {
    list: (categoryId, sectionId) => ipcRenderer.invoke('knowledge:list', categoryId, sectionId),
    create: (data) => ipcRenderer.invoke('knowledge:create', data),
    update: (id, data) => ipcRenderer.invoke('knowledge:update', id, data),
    delete: (id) => ipcRenderer.invoke('knowledge:delete', id),
  },
  progress: {
    upsert: (itemType, itemId, status) =>
      ipcRenderer.invoke('progress:upsert', itemType, itemId, status),
  },
  shell: {
    openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
  },
  ai: {
    checkOllama: () => ipcRenderer.invoke('ai:checkOllama'),
    generateCloze: (knowledgeId: number) => ipcRenderer.invoke('ai:generateCloze', knowledgeId),
    gradeAnswers: (requests) => ipcRenderer.invoke('ai:gradeAnswers', requests),
  },
}

contextBridge.exposeInMainWorld('api', api)
