import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { getDb } from './db/client'
import { applySchema, runMigrations } from './db/migrate'
import { importCategories } from './importer'
import { createCategoryHandlers } from './ipc/categories'
import { createCommandHandlers } from './ipc/commands'
import { createKnowledgeHandlers } from './ipc/knowledge'
import { createProgressHandlers } from './ipc/progress'

function setupIpc() {
  const db = getDb()
  applySchema(db)
  runMigrations(db)

  const categoriesDir = app.isPackaged
    ? path.join(process.resourcesPath, 'categories')
    : path.join(app.getAppPath(), 'categories')
  importCategories(db, categoriesDir)

  const categoryHandlers = createCategoryHandlers(db)
  const commandHandlers = createCommandHandlers(db)
  const knowledgeHandlers = createKnowledgeHandlers(db)
  const progressHandlers = createProgressHandlers(db)

  ipcMain.handle('categories:list', () => categoryHandlers.list())
  ipcMain.handle('commands:list', (_, categoryId) => commandHandlers.list(categoryId))
  ipcMain.handle('commands:create', (_, data) => commandHandlers.create(data))
  ipcMain.handle('commands:update', (_, id, data) => commandHandlers.update(id, data))
  ipcMain.handle('commands:delete', (_, id) => commandHandlers.delete(id))
  ipcMain.handle('knowledge:list', (_, categoryId) => knowledgeHandlers.list(categoryId))
  ipcMain.handle('knowledge:create', (_, data) => knowledgeHandlers.create(data))
  ipcMain.handle('knowledge:update', (_, id, data) => knowledgeHandlers.update(id, data))
  ipcMain.handle('knowledge:delete', (_, id) => knowledgeHandlers.delete(id))
  ipcMain.handle('progress:upsert', (_, itemType, itemId, status) =>
    progressHandlers.upsert(itemType, itemId, status))
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  setupIpc()
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
