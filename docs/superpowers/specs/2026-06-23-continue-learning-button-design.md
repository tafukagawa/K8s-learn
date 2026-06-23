# 「続きから学習する」ボタン設計

## 概要

CommandList・KnowledgeList に表示される「続きから学習する」ボタンを押すと、現在のセクション（Commands または Knowledge）の「学習中」アイテムを対象にフラッシュカードモードへ遷移する。

## ユーザー体験

1. ユーザーが CommandList（または KnowledgeList）の「続きから学習する」を押す
2. サイドバーのモードが「フラッシュカード」に切り替わる
3. FlashcardView が起動し、そのセクションの「学習中」アイテムだけでデッキが組まれる
4. 学習中アイテムが 0 件の場合は既存の空デッキ処理（「全件を表示」ボタン）が表示される

## データフロー

```
CommandList / KnowledgeList
  ↓ onStartLearning(section: 'commands' | 'knowledge')
App.tsx
  → mode を 'flashcard' に切り替え
  → flashcardConfig = { section, filter: 'learning' } を state に保持
  ↓ initialSection / initialFilter props
FlashcardView
  → デッキをセクション・フィルターで初期絞り込み
```

## 変更ファイル

### 1. `src/features/flashcard/FlashcardView.tsx`

- `initialFilter?: 'all' | 'unseen' | 'learning'` prop を追加
- `initialSection?: 'commands' | 'knowledge' | 'all'` prop を追加
- `filter` state の初期値を `initialFilter ?? 'all'` にする
- `filtered` の useMemo に section フィルタを追加：`initialSection` が `'commands'` なら CommandWithProgress のみ、`'knowledge'` なら KnowledgeWithProgress のみ

### 2. `src/App.tsx`

- `flashcardConfig: { section: 'commands' | 'knowledge' | 'all'; filter: 'all' | 'unseen' | 'learning' }` state を追加（初期値 `{ section: 'all', filter: 'all' }`）
- `handleStartLearning(section: 'commands' | 'knowledge')` 関数を定義：`setFlashcardConfig({ section, filter: 'learning' })` + `setMode('flashcard')`
- `ReferenceView` に `onStartLearning={handleStartLearning}` を渡す
- `FlashcardView` に `initialSection={flashcardConfig.section}` と `initialFilter={flashcardConfig.filter}` を渡す

### 3. `src/features/reference/ReferenceView.tsx`

- `onStartLearning: (section: 'commands' | 'knowledge') => void` prop を追加
- `CommandList` に `onStartLearning={() => onStartLearning('commands')}` を渡す
- `KnowledgeList` に `onStartLearning={() => onStartLearning('knowledge')}` を渡す

### 4. `src/features/reference/CommandList.tsx` / `KnowledgeList.tsx`

- `onStartLearning: () => void` prop を追加
- 既存の `onClick={() => featured && setDetailCommand(featured)}` を `onClick={onStartLearning}` に置き換える

## エッジケース

| 状況 | 挙動 |
|---|---|
| 学習中アイテムが 0 件 | 既存の「このフィルターに該当するカードがありません」UI が表示され、「全件を表示」で全件に切り替えられる |
| フラッシュカード画面でフィルター変更 | 既存の ToggleButtonGroup はそのまま機能する（section は変わらない） |
| featured が null | ボタンは `disabled` 状態のまま（既存の `disabled={!featured}` が効く） |

## 変更しないもの

- FlashcardView 内のフィルター ToggleButtonGroup（ユーザーが手動で変更可能）
- フラッシュカードのめくりアニメーション・キーボードショートカット
- 詳細モーダル（CommandDetail / KnowledgeDetail）の挙動
