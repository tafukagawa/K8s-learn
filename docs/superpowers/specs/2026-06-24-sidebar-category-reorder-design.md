# サイドバー カテゴリ並び替え 設計書

## 概要

Web版（GitHub Pages）のサイドバーで、カテゴリをドラッグ＆ドロップで並び替えられるようにする。並び順は localStorage に保存し、ページをまたいで永続化する。

---

## スコープ

- **対象**: Web版のみ（`ipc.web.ts`）
- **Electron版**: 変更なし
- **並び替え対象**: カテゴリのみ（セクションは対象外）

---

## ライブラリ

**dnd-kit** を使用する。

- React 19 対応
- 軽量（コアのみなら ~10kB）
- 必要パッケージ: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

---

## データ層（ipc.web.ts）

### localStorage キー

```
"category-order"  →  ["k8s", "docker", "helm", "argocd", "kustomize"]
```

カテゴリの `slug` 配列を保存する。

### `categories.list()` の変更

既存のアルファベット順ソートの後、localStorage の並び順を適用する。

```
1. ファイルシステムから全カテゴリを取得（既存）
2. localStorage の "category-order" を読み込む
3. 保存済みの順序に従ってソート
   - 保存済みに存在するslug → その順番
   - 保存済みにないslug（新規追加カテゴリ）→ 末尾に追加
4. ソート済みリストを返す
```

### `categories.reorder(slugs: string[])` の追加

```ts
reorder: (slugs: string[]): Promise<void> => {
  localStorage.setItem('category-order', JSON.stringify(slugs))
  return Promise.resolve()
}
```

---

## UI層（Sidebar.tsx）

### dnd-kit 構成

```
<DndContext onDragEnd={handleDragEnd}>
  <SortableContext items={catIds} strategy={verticalListSortingStrategy}>
    {categories.map(cat => (
      <SortableCategoryItem key={cat.id} cat={cat} ... />
    ))}
  </SortableContext>
</DndContext>
```

### SortableCategoryItem

既存の `ListItemButton`（カテゴリ行）を `useSortable` でラップしたコンポーネント。

ドラッグハンドル（`⋮⋮` アイコン）を左端に追加する。ホバー時のみ表示してすっきりさせる。

### handleDragEnd

```ts
function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event
  if (!over || active.id === over.id) return
  const oldIndex = categories.findIndex(c => c.id === active.id)
  const newIndex = categories.findIndex(c => c.id === over.id)
  const reordered = arrayMove(categories, oldIndex, newIndex)
  setLocalCategories(reordered)  // 即時反映
  api.categories.reorder(reordered.map(c => c.slug))  // localStorage保存
}
```

### ローカル状態

Sidebar 内に `localCategories` state を持ち、ドラッグ完了時に即時更新する。`categories` prop の変化（初回ロード）も追跡する。

---

## 実装ファイル一覧

| ファイル | 変更種別 |
|---|---|
| `package.json` | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` を追加 |
| `src/shared/ipc.web.ts` | `categories.list()` に並び順適用、`categories.reorder()` 追加 |
| `src/shared/ipc.ts` | `reorder` のスタブを追加（型合わせのみ） |
| `src/shared/components/Sidebar.tsx` | dnd-kit でカテゴリリストをラップ、ドラッグハンドル追加 |

---

## 考慮事項

- **新規カテゴリ追加時**: `list()` で保存済みにないslugを末尾に自動追加するため対応済み
- **カテゴリ削除時**: 保存済みに残っていても `list()` でフィルタされるため問題なし
- **初回アクセス時**: localStorage が空なら既存のアルファベット順をそのまま使用
