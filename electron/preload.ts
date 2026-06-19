import { contextBridge, ipcRenderer } from 'electron'
import type { IpcApi } from '../src/types'

const api: IpcApi = {
  categories: {
    list: () => ipcRenderer.invoke('categories:list'),
  },
  commands: {
    list: (categoryId) => ipcRenderer.invoke('commands:list', categoryId),
    create: (data) => ipcRenderer.invoke('commands:create', data),
    update: (id, data) => ipcRenderer.invoke('commands:update', id, data),
    delete: (id) => ipcRenderer.invoke('commands:delete', id),
  },
  knowledge: {
    list: (categoryId) => ipcRenderer.invoke('knowledge:list', categoryId),
    create: (data) => ipcRenderer.invoke('knowledge:create', data),
    update: (id, data) => ipcRenderer.invoke('knowledge:update', id, data),
    delete: (id) => ipcRenderer.invoke('knowledge:delete', id),
  },
  progress: {
    upsert: (itemType, itemId, status) =>
      ipcRenderer.invoke('progress:upsert', itemType, itemId, status),
  },
}

contextBridge.exposeInMainWorld('api', api)
