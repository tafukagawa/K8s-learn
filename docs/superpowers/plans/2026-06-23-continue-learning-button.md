# Continue Learning Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 「続きから学習する」ボタンを押すと、現在のセクション（Commands / Knowledge）の学習中アイテムのみでフラッシュカードモードに遷移する。

**Architecture:** App.tsx が `flashcardConfig` state（section + filter）を持ち、ReferenceView 経由で CommandList / KnowledgeList にコールバックを渡す。ボタン押下で config をセットしてモードを切り替え、FlashcardView が初期 props で絞り込んだデッキを生成する。

**Tech Stack:** TypeScript, React, MUI, Electron (IPC経由でデータ取得)

---

## File Map

| ファイル | 変更種別 | 内容 |
|---|---|---|
| `src/features/flashcard/FlashcardView.tsx` | Modify | `initialFilter` / `initialSection` props 追加、filtered useMemo を拡張 |
| `src/App.tsx` | Modify | `flashcardConfig` state 追加、`handleStartLearning` コールバック定義、props 渡し |
| `src/features/reference/ReferenceView.tsx` | Modify | `onStartLearning` prop 追加して CommandList / KnowledgeList に中継 |
| `src/features/reference/CommandList.tsx` | Modify | `onStartLearning` prop 追加、ボタンの onClick を置き換え |
| `src/features/reference/KnowledgeList.tsx` | Modify | `onStartLearning` prop 追加、ボタンの onClick を置き換え |

---

### Task 1: FlashcardView に initialSection / initialFilter props を追加

**Files:**
- Modify: `src/features/flashcard/FlashcardView.tsx`

- [ ] **Step 1: props の型定義を変更する**

`FlashcardViewProps` を以下に変更：

```typescript
interface FlashcardViewProps {
  categoryId: number
  initialFilter?: FilterMode
  initialSection?: 'commands' | 'knowledge' | 'all'
}
```

- [ ] **Step 2: filter state の初期値を initialFilter に変える**

```typescript
// 変更前
const [filter, setFilter] = useState<FilterMode>('all')

// 変更後
const [filter, setFilter] = useState<FilterMode>(initialFilter ?? 'all')
```

- [ ] **Step 3: filtered useMemo にセクションフィルターを追加する**

```typescript
// 変更前
const filtered = useMemo<FlashItem[]>(() => {
  const all: FlashItem[] = [...commands, ...knowledge]
  if (filter === 'unseen') return all.filter(i => !i.progress || i.progress.status === 'unseen')
  if (filter === 'learning') return all.filter(i => i.progress?.status === 'learning')
  return all
}, [commands, knowledge, filter])

// 変更後
const filtered = useMemo<FlashItem[]>(() => {
  let base: FlashItem[]
  if (initialSection === 'commands') base = [...commands]
  else if (initialSection === 'knowledge') base = [...knowledge]
  else base = [...commands, ...knowledge]

  if (filter === 'unseen') return base.filter(i => !i.progress || i.progress.status === 'unseen')
  if (filter === 'learning') return base.filter(i => i.progress?.status === 'learning')
  return base
}, [commands, knowledge, filter, initialSection])
```

- [ ] **Step 4: 型チェックを実行する**

```bash
npx tsc --noEmit
```

期待: エラーなし

- [ ] **Step 5: コミットする**

```bash
git add src/features/flashcard/FlashcardView.tsx
git commit -m "feat: add initialSection/initialFilter props to FlashcardView"
```

---

### Task 2: App.tsx に flashcardConfig state と handleStartLearning を追加

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: flashcardConfig state を追加する**

既存の state 宣言群の後に追加：

```typescript
const [flashcardConfig, setFlashcardConfig] = useState<{
  section: 'commands' | 'knowledge' | 'all'
  filter: FilterMode
}>({ section: 'all', filter: 'all' })
```

ファイル先頭の import に `FilterMode` が必要なので追加：

```typescript
// FlashcardView から型を re-export しないため、ここでローカル定義する
type FilterMode = 'all' | 'unseen' | 'learning'
```

- [ ] **Step 2: handleStartLearning 関数を定義する**

`useMemo` の前あたりに追加：

```typescript
function handleStartLearning(section: 'commands' | 'knowledge') {
  setFlashcardConfig({ section, filter: 'learning' })
  setMode('flashcard')
}
```

- [ ] **Step 3: ReferenceView に onStartLearning を渡す**

```typescript
// 変更前
<ReferenceView
  categoryId={selectedCategoryId}
  section={section}
  searchQuery={searchQuery}
/>

// 変更後
<ReferenceView
  categoryId={selectedCategoryId}
  section={section}
  searchQuery={searchQuery}
  onStartLearning={handleStartLearning}
/>
```

- [ ] **Step 4: FlashcardView に initialSection / initialFilter を渡す**

```typescript
// 変更前
<FlashcardView categoryId={selectedCategoryId} />

// 変更後
<FlashcardView
  categoryId={selectedCategoryId}
  initialSection={flashcardConfig.section}
  initialFilter={flashcardConfig.filter}
/>
```

- [ ] **Step 5: 型チェックを実行する**

```bash
npx tsc --noEmit
```

期待: ReferenceView の `onStartLearning` が未定義というエラーが出る（次のタスクで解消）

- [ ] **Step 6: コミットする**

```bash
git add src/App.tsx
git commit -m "feat: add flashcardConfig state and handleStartLearning to App"
```

---

### Task 3: ReferenceView に onStartLearning を中継する

**Files:**
- Modify: `src/features/reference/ReferenceView.tsx`

- [ ] **Step 1: props の型定義を拡張する**

```typescript
// 変更前
interface ReferenceViewProps {
  categoryId: number
  section: AppSection
  searchQuery: string
}

// 変更後
interface ReferenceViewProps {
  categoryId: number
  section: AppSection
  searchQuery: string
  onStartLearning: (section: 'commands' | 'knowledge') => void
}
```

- [ ] **Step 2: CommandList / KnowledgeList に onStartLearning を渡す**

現在の JSX を以下のように変更：

```typescript
export function ReferenceView({ categoryId, section, searchQuery, onStartLearning }: ReferenceViewProps) {
  return (
    <Box sx={{ p: 3, maxWidth: 1180, mx: 'auto' }}>
      {section === 'commands' && (
        <CommandList
          categoryId={categoryId}
          searchQuery={searchQuery}
          onStartLearning={() => onStartLearning('commands')}
        />
      )}
      {section === 'knowledge' && (
        <KnowledgeList
          categoryId={categoryId}
          searchQuery={searchQuery}
          onStartLearning={() => onStartLearning('knowledge')}
        />
      )}
    </Box>
  )
}
```

- [ ] **Step 3: 型チェックを実行する**

```bash
npx tsc --noEmit
```

期待: CommandList / KnowledgeList の `onStartLearning` が未定義というエラーが出る（次のタスクで解消）

- [ ] **Step 4: コミットする**

```bash
git add src/features/reference/ReferenceView.tsx
git commit -m "feat: relay onStartLearning through ReferenceView"
```

---

### Task 4: CommandList のボタンに onStartLearning を繋げる

**Files:**
- Modify: `src/features/reference/CommandList.tsx`

- [ ] **Step 1: CommandListProps に onStartLearning を追加する**

```typescript
// 変更前
interface CommandListProps {
  categoryId: number
  searchQuery: string
}

// 変更後
interface CommandListProps {
  categoryId: number
  searchQuery: string
  onStartLearning: () => void
}
```

- [ ] **Step 2: 関数引数に onStartLearning を追加する**

```typescript
// 変更前
export function CommandList({ categoryId, searchQuery }: CommandListProps) {

// 変更後
export function CommandList({ categoryId, searchQuery, onStartLearning }: CommandListProps) {
```

- [ ] **Step 3: 「続きから学習する」ボタンの onClick を置き換える**

CommandList.tsx 内の「続きから学習する」ボタンを探す。現在は：

```typescript
<Button
  variant="contained"
  startIcon={<PlayArrowIcon />}
  disabled={!featured}
  onClick={() => featured && setDetailCommand(featured)}
>
  続きから学習する
</Button>
```

以下に変更：

```typescript
<Button
  variant="contained"
  startIcon={<PlayArrowIcon />}
  disabled={!featured}
  onClick={onStartLearning}
>
  続きから学習する
</Button>
```

- [ ] **Step 4: 型チェックを実行する**

```bash
npx tsc --noEmit
```

期待: エラーなし

- [ ] **Step 5: コミットする**

```bash
git add src/features/reference/CommandList.tsx
git commit -m "feat: wire onStartLearning to continue-learning button in CommandList"
```

---

### Task 5: KnowledgeList のボタンに onStartLearning を繋げる

**Files:**
- Modify: `src/features/reference/KnowledgeList.tsx`

- [ ] **Step 1: KnowledgeListProps に onStartLearning を追加する**

```typescript
// 変更前
interface KnowledgeListProps {
  categoryId: number
  searchQuery: string
}

// 変更後
interface KnowledgeListProps {
  categoryId: number
  searchQuery: string
  onStartLearning: () => void
}
```

- [ ] **Step 2: 関数引数に onStartLearning を追加する**

```typescript
// 変更前
export function KnowledgeList({ categoryId, searchQuery }: KnowledgeListProps) {

// 変更後
export function KnowledgeList({ categoryId, searchQuery, onStartLearning }: KnowledgeListProps) {
```

- [ ] **Step 3: 「続きから学習する」ボタンの onClick を置き換える**

KnowledgeList.tsx 内の「続きから学習する」ボタンを探す。現在は：

```typescript
<Button variant="contained" startIcon={<PlayArrowIcon />} disabled={!featured} onClick={() => featured && setDetailItem(featured)}>
  続きから学習する
</Button>
```

以下に変更：

```typescript
<Button variant="contained" startIcon={<PlayArrowIcon />} disabled={!featured} onClick={onStartLearning}>
  続きから学習する
</Button>
```

- [ ] **Step 4: 型チェックを実行する**

```bash
npx tsc --noEmit
```

期待: エラーなし（全タスク完了）

- [ ] **Step 5: コミットする**

```bash
git add src/features/reference/KnowledgeList.tsx
git commit -m "feat: wire onStartLearning to continue-learning button in KnowledgeList"
```
