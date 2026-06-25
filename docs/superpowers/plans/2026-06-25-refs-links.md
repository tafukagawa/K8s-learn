# 参考リンク（refs）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Knowledge/Command に公式ドキュメント以外の参考リンク（ラベル＋URL）を複数追加できるようにする

**Architecture:** `refs: RefLink[]` を JSON TEXT として DB に保存。既存の `url`（公式ドキュメント）はそのまま維持し、`refs` を追加フィールドとして扱う。編集フォームに動的リスト UI を追加し、詳細モーダルに表示する。

**Tech Stack:** SQLite/better-sqlite3, React/MUI, TypeScript, Electron IPC

---

### Task 1: RefLink 型追加 & DB マイグレーション

**Files:**
- Modify: `src/types/index.ts`
- Modify: `electron/db/migrate.ts`

- [ ] **Step 1: `src/types/index.ts` に RefLink 型と refs フィールドを追加**

`export interface ClozeItem` の直前に追加し、`Knowledge` と `Command` に `refs` フィールドを追加する。

```ts
// ClozeItem の直前に追加
export interface RefLink {
  label: string
  url: string
}
```

`Knowledge` インターフェースの `url: string` の次の行に追加：
```ts
  refs: RefLink[]
```

`Command` インターフェースの `url: string` の次の行に追加：
```ts
  refs: RefLink[]
```

- [ ] **Step 2: `electron/db/migrate.ts` に refs カラムのマイグレーションを追加**

`runMigrations` 関数の末尾（`cloze` カラムの追加の後）に追記：

```ts
  if (!commandCols.includes('refs')) {
    db.exec("ALTER TABLE commands ADD COLUMN refs TEXT NOT NULL DEFAULT '[]'")
  }
  if (!knowledgeCols.includes('refs')) {
    db.exec("ALTER TABLE knowledge ADD COLUMN refs TEXT NOT NULL DEFAULT '[]'")
  }
```

- [ ] **Step 3: ビルド確認**

```bash
cd "C:\Users\fukagawa\work\k8s-learning-app" && npm run build:web 2>&1 | tail -20
```

TypeScript エラーが出る場合（refs が必須フィールドになったため）は次のタスクで解消される。エラー内容を確認しておく。

- [ ] **Step 4: コミット**

```bash
git add src/types/index.ts electron/db/migrate.ts
git commit -m "feat: add RefLink type and refs column migration"
```

---

### Task 2: IPC ハンドラーに refs 対応を追加

**Files:**
- Modify: `electron/ipc/knowledge.ts`
- Modify: `electron/ipc/commands.ts`

- [ ] **Step 1: `electron/ipc/knowledge.ts` を更新**

`parseCloze` 関数の後に `parseRefs` を追加：

```ts
function parseRefs(raw: string | null | undefined): import('../../src/types').RefLink[] {
  if (!raw) return []
  try { return JSON.parse(raw) } catch { return [] }
}
```

`rowToKnowledge` 関数を更新（`cloze` の行の後に追加）：

```ts
function rowToKnowledge(row: any): Knowledge {
  return {
    id: row.id,
    categoryId: row.category_id,
    title: row.title,
    body: row.body,
    tags: parseTags(row.tags),
    isCustom: row.is_custom === 1,
    url: row.url ?? '',
    cloze: parseCloze(row.cloze ?? null),
    refs: parseRefs(row.refs),
  }
}
```

`create` メソッドを更新：

```ts
    create(data: Omit<Knowledge, 'id' | 'isCustom'>): Knowledge {
      const row = db.prepare(`
        INSERT INTO knowledge (category_id, title, body, tags, url, refs, is_custom)
        VALUES (?, ?, ?, ?, ?, ?, 1)
        RETURNING *
      `).get(data.categoryId, data.title, data.body, JSON.stringify(data.tags), data.url ?? '', JSON.stringify(data.refs ?? [])) as any
      return rowToKnowledge(row)
    },
```

`update` メソッドを更新（`data.url` の条件の後に追加）：

```ts
      if (data.url !== undefined) { fields.push('url = ?'); values.push(data.url) }
      if (data.refs !== undefined) { fields.push('refs = ?'); values.push(JSON.stringify(data.refs)) }
```

- [ ] **Step 2: `electron/ipc/commands.ts` を更新**

`parseTags` 関数の後に `parseRefs` を追加：

```ts
function parseRefs(raw: string | null | undefined): import('../../src/types').RefLink[] {
  if (!raw) return []
  try { return JSON.parse(raw) } catch { return [] }
}
```

`rowToCommand` 関数を更新（`url` の行の後に追加）：

```ts
function rowToCommand(row: any): Command {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    description: row.description,
    syntax: row.syntax,
    example: row.example,
    tags: parseTags(row.tags),
    isCustom: row.is_custom === 1,
    url: row.url ?? '',
    refs: parseRefs(row.refs),
  }
}
```

`create` メソッドを更新：

```ts
    create(data: Omit<Command, 'id' | 'isCustom'>): Command {
      const row = db.prepare(`
        INSERT INTO commands (category_id, name, description, syntax, example, tags, url, refs, is_custom)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        RETURNING *
      `).get(data.categoryId, data.name, data.description, data.syntax, data.example, JSON.stringify(data.tags), data.url ?? '', JSON.stringify(data.refs ?? [])) as any
      return rowToCommand(row)
    },
```

`update` メソッドを更新（`data.url` の条件の後に追加）：

```ts
      if (data.url !== undefined) { fields.push('url = ?'); values.push(data.url) }
      if (data.refs !== undefined) { fields.push('refs = ?'); values.push(JSON.stringify(data.refs)) }
```

- [ ] **Step 3: ビルド確認**

```bash
cd "C:\Users\fukagawa\work\k8s-learning-app" && npm run build:web 2>&1 | tail -20
```

Expected: ビルドエラーなし（まだフォームで refs を渡していないので TypeScript エラーが残る可能性あり）

- [ ] **Step 4: コミット**

```bash
git add electron/ipc/knowledge.ts electron/ipc/commands.ts
git commit -m "feat: add refs field to knowledge and command IPC handlers"
```

---

### Task 3: 編集フォームに参考リンク UI を追加

**Files:**
- Modify: `src/features/reference/KnowledgeForm.tsx`
- Modify: `src/features/reference/CommandForm.tsx`

- [ ] **Step 1: `src/features/reference/KnowledgeForm.tsx` を更新**

import に `IconButton` を追加（すでに含まれていない場合）：
```ts
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Autocomplete, Chip, IconButton, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import type { KnowledgeWithProgress, RefLink } from '../../types'
```

state に `refs` を追加：
```ts
  const [refs, setRefs] = useState<RefLink[]>([])
```

`useEffect` に `refs` の初期化を追加：
```ts
  useEffect(() => {
    if (item) {
      setTitle(item.title); setBody(item.body); setTags(item.tags); setUrl(item.url); setRefs(item.refs ?? [])
    } else {
      setTitle(''); setBody(''); setTags([]); setUrl(''); setRefs([])
    }
  }, [item, open])
```

`handleSubmit` の `create` と `update` 呼び出しに `refs` を追加：
```ts
  async function handleSubmit() {
    if (item) {
      const updated = await api.knowledge.update(item.id, { title, body, tags, url, refs })
      onSuccess({ ...updated, progress: item.progress })
    } else {
      const created = await api.knowledge.create({ categoryId, title, body, tags, url, cloze: null, refs })
      onSuccess({ ...created, progress: null })
    }
  }
```

`DialogContent` 内の `TextField`（公式ドキュメント URL）の後に参考リンクセクションを追加：

```tsx
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">参考リンク</Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setRefs(r => [...r, { label: '', url: '' }])}
              >
                追加
              </Button>
            </Box>
            {refs.map((ref, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                <TextField
                  label="ラベル"
                  value={ref.label}
                  onChange={e => setRefs(r => r.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
                  size="small"
                  sx={{ width: 140 }}
                  placeholder="Qiita記事"
                />
                <TextField
                  label="URL"
                  value={ref.url}
                  onChange={e => setRefs(r => r.map((x, j) => j === i ? { ...x, url: e.target.value } : x))}
                  size="small"
                  sx={{ flex: 1 }}
                  placeholder="https://..."
                />
                <IconButton size="small" onClick={() => setRefs(r => r.filter((_, j) => j !== i))}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
```

- [ ] **Step 2: `src/features/reference/CommandForm.tsx` を更新**

import に `IconButton`, `Typography`, `AddIcon`, `DeleteIcon` を追加：
```ts
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Autocomplete, Chip, IconButton, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import type { CommandWithProgress, RefLink } from '../../types'
```

state に `refs` を追加：
```ts
  const [refs, setRefs] = useState<RefLink[]>([])
```

`useEffect` に `refs` の初期化を追加：
```ts
  useEffect(() => {
    if (command) {
      setName(command.name); setDescription(command.description); setSyntax(command.syntax)
      setExample(command.example); setTags(command.tags); setUrl(command.url); setRefs(command.refs ?? [])
    } else {
      setName(''); setDescription(''); setSyntax(''); setExample(''); setTags([]); setUrl(''); setRefs([])
    }
  }, [command, open])
```

`handleSubmit` に `refs` を追加：
```ts
  async function handleSubmit() {
    if (command) {
      const updated = await api.commands.update(command.id, { name, description, syntax, example, tags, url, refs })
      onSuccess({ ...updated, progress: command.progress })
    } else {
      const created = await api.commands.create({ categoryId, name, description, syntax, example, tags, url, refs })
      onSuccess({ ...created, progress: null })
    }
  }
```

公式ドキュメント URL フィールドの後に参考リンクセクションを追加（KnowledgeForm と同じ UI）：

```tsx
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">参考リンク</Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setRefs(r => [...r, { label: '', url: '' }])}
              >
                追加
              </Button>
            </Box>
            {refs.map((ref, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                <TextField
                  label="ラベル"
                  value={ref.label}
                  onChange={e => setRefs(r => r.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
                  size="small"
                  sx={{ width: 140 }}
                  placeholder="Qiita記事"
                />
                <TextField
                  label="URL"
                  value={ref.url}
                  onChange={e => setRefs(r => r.map((x, j) => j === i ? { ...x, url: e.target.value } : x))}
                  size="small"
                  sx={{ flex: 1 }}
                  placeholder="https://..."
                />
                <IconButton size="small" onClick={() => setRefs(r => r.filter((_, j) => j !== i))}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
```

- [ ] **Step 3: ビルド確認**

```bash
cd "C:\Users\fukagawa\work\k8s-learning-app" && npm run build:web 2>&1 | tail -20
```

Expected: ビルドエラーなし

- [ ] **Step 4: コミット**

```bash
git add src/features/reference/KnowledgeForm.tsx src/features/reference/CommandForm.tsx
git commit -m "feat: add refs editor to KnowledgeForm and CommandForm"
```

---

### Task 4: 詳細モーダルに参考リンクを表示

**Files:**
- Modify: `src/features/reference/KnowledgeDetail.tsx`
- Modify: `src/features/reference/CommandDetail.tsx`

- [ ] **Step 1: `src/features/reference/KnowledgeDetail.tsx` を更新**

`item.url` ボタンの後（`Divider` の前）に refs 表示を追加：

```tsx
            {item.refs && item.refs.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                {item.refs.map((ref, i) => (
                  <Button
                    key={i}
                    variant="text"
                    size="small"
                    startIcon={<OpenInNewIcon fontSize="small" />}
                    onClick={() => api.shell.openExternal(ref.url)}
                  >
                    {ref.label || ref.url}
                  </Button>
                ))}
              </Box>
            )}
```

- [ ] **Step 2: `src/features/reference/CommandDetail.tsx` を更新**

`command.url` ボタンの後（`Divider` の前）に refs 表示を追加：

```tsx
            {command.refs && command.refs.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                {command.refs.map((ref, i) => (
                  <Button
                    key={i}
                    variant="text"
                    size="small"
                    startIcon={<OpenInNewIcon fontSize="small" />}
                    onClick={() => api.shell.openExternal(ref.url)}
                  >
                    {ref.label || ref.url}
                  </Button>
                ))}
              </Box>
            )}
```

- [ ] **Step 3: ビルド確認**

```bash
cd "C:\Users\fukagawa\work\k8s-learning-app" && npm run build:web 2>&1 | tail -20
```

Expected: エラーなし

- [ ] **Step 4: 動作確認**

1. アプリを起動する
2. 任意の Knowledge を編集ダイアログで開く
3. 「参考リンク」セクションの「追加」ボタンをクリック
4. ラベル「Qiita記事」、URL「https://qiita.com」を入力して保存
5. 詳細モーダルを開き、「Qiita記事」ボタンが表示されることを確認
6. ボタンをクリックしてブラウザが開くことを確認

- [ ] **Step 5: 最終コミット**

```bash
git add src/features/reference/KnowledgeDetail.tsx src/features/reference/CommandDetail.tsx
git commit -m "feat: display refs links in KnowledgeDetail and CommandDetail"
```
