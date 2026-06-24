# GitHub Pages Web版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 既存の Electron アプリと同一コンポーネントを使い、GitHub Pages で公開できる Web版ビルドを追加する。

**Architecture:** Vite のパスエイリアスで `src/shared/ipc.ts` → `src/shared/ipc.web.ts` をビルド時に差し替える。`src/features/` のコンポーネントは無変更。データは `import.meta.glob` でビルド時に全 JSON をバンドルし、進捗・カスタムデータは localStorage に保存する。

**Tech Stack:** React 19, MUI v9, TypeScript, Vite, GitHub Actions, GitHub Pages

---

## Task 1: ipc.web.ts — データロード基盤

**Files:**
- Create: `src/shared/ipc.web.ts`

- [ ] **Step 1: ファイルを作成する**

```ts
// src/shared/ipc.web.ts
import type {
  Category, Section, Command, Knowledge,
  CommandWithProgress, KnowledgeWithProgress,
  Progress, ProgressStatus, ClozeItem,
} from '../../src/types'
```

Wait — このファイル自体が `src/shared/` 内にあるため、types のパスは `'../types'` が正しい。以下のコードで作成する：

```ts
// src/shared/ipc.web.ts
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
```

- [ ] **Step 2: 型チェックを実行する**

```bash
npx tsc --noEmit
```

Expected: `ipc.web.ts` の型エラーのみ（`vite.web.config.ts` 未作成のため `import.meta.glob` が未解決）→ 次タスクで解消

- [ ] **Step 3: コミットする**

```bash
git add src/shared/ipc.web.ts
git commit -m "feat: add ipc.web.ts — localStorage + import.meta.glob data layer"
```

---

## Task 2: vite.web.config.ts — Web版ビルド設定

**Files:**
- Create: `vite.web.config.ts`
- Modify: `package.json`

- [ ] **Step 1: vite.web.config.ts を作成する**

```ts
// vite.web.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  base: '/k8s-learning-app/',
  resolve: {
    alias: {
      [resolve(__dirname, 'src/shared/ipc.ts')]: resolve(__dirname, 'src/shared/ipc.web.ts'),
    },
  },
  build: {
    outDir: 'dist/web',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },
})
```

> **注意:** `base` の値はあなたの GitHub リポジトリ名に合わせる。
> リポジトリが `https://github.com/username/k8s-learning-app` なら `/k8s-learning-app/`。

- [ ] **Step 2: package.json にスクリプトを追加する**

`package.json` の `"scripts"` に以下を追加する（既存スクリプトの末尾に追加）:

```json
"build:web": "vite build --config vite.web.config.ts",
"dev:web": "vite --config vite.web.config.ts"
```

- [ ] **Step 3: 型チェックを実行する**

```bash
npx tsc --noEmit
```

Expected: エラーなし

- [ ] **Step 4: Web版をローカルでビルドして確認する**

```bash
npm run build:web
```

Expected: `dist/web/` に `index.html`, `assets/` が生成される。
`electron` や `better-sqlite3` のインポートエラーが出た場合 → `ipc.web.ts` の alias が正しく機能していない。

- [ ] **Step 5: ビルド済みファイルをローカルでプレビューする**

```bash
npx serve dist/web
```

ブラウザで `http://localhost:3000/k8s-learning-app/` を開く。
確認事項:
- サイドバーにカテゴリ（k8s / docker / helm / argocd / kustomize）が表示される
- コマンド・ナレッジが表示される
- フラッシュカードが動作する
- AI穴埋め生成ボタンがグレーアウトしている

- [ ] **Step 6: コミットする**

```bash
git add vite.web.config.ts package.json
git commit -m "feat: add vite.web.config.ts and build:web script"
```

---

## Task 3: GitHub Pages デプロイ Actions

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: .github/workflows/ ディレクトリを確認する**

```bash
ls .github/workflows/ 2>/dev/null || mkdir -p .github/workflows
```

- [ ] **Step 2: deploy.yml を作成する**

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build web version
        run: npm run build:web

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist/web

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: GitHub リポジトリの Pages 設定を有効にする（手動）**

GitHub リポジトリ → Settings → Pages → Source: **GitHub Actions** に変更する。

- [ ] **Step 4: main にプッシュして Actions を確認する**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deploy workflow"
git push origin main
```

GitHub の Actions タブで `Deploy to GitHub Pages` が成功することを確認する。

Expected: `https://<username>.github.io/k8s-learning-app/` でアプリが開く。

---

## Task 4: Electron 版が壊れていないことを確認する

**Files:** なし（確認のみ）

- [ ] **Step 1: Electron 版のビルドを実行する**

```bash
npm run build
```

Expected: エラーなし。`dist/renderer/` と `dist/main/` が生成される。

- [ ] **Step 2: Electron 版を起動して動作確認する**

```bash
npm run dev
```

確認事項:
- カテゴリ・コマンド・ナレッジが表示される
- AI穴埋め生成が（Ollama があれば）動作する
- Web版ビルドの影響を受けていないこと
