# UI改善まとめ — ui-contrast-dashboard ブランチ

## 対象ブランチ
`ui-contrast-dashboard`（mainからブランチ）

---

## 機能追加

### 続きから学習する（セクション別フラッシュカード遷移）
- Commands/Knowledge それぞれの「続きから学習する」ボタンを押すと、フラッシュカードモードに遷移
- 対象セクションの未学習アイテムのみを自動フィルタリングして表示
- 実装ファイル: `App.tsx`, `ReferenceView.tsx`, `CommandList.tsx`, `KnowledgeList.tsx`, `FlashcardView.tsx`

### 画面共通ナビゲーション
- **ロゴクリック** → リファレンスモード（ホーム）へ遷移
- **フラッシュカードの戻るボタン** → リファレンスモードへ戻る
- 実装ファイル: `Header.tsx`, `App.tsx`, `FlashcardView.tsx`

### タグフィルターのドロップダウン化
- チップ一覧 → MUI Select ドロップダウンに変更してスペースを節約
- 実装ファイル: `TagFilter.tsx`

### スプラッシュスクリーン
- アプリ起動時に最低1.2秒間表示（データ読み込み中）
- K8sホイールアイコン（回転アニメーション）＋アプリ名＋ローディングバー
- データ読み込み完了後に0.4秒フェードアウトしてメイン画面へ
- エラー時も `finally` で確実に閉じる
- 実装ファイル: `SplashScreen.tsx`, `App.tsx`

---

## データ・状態管理修正

### 進捗のハードコード削除
- 変更前: 完了率60%、学習中15% がハードコード
- 変更後: `api.progress` から取得した実データ（doneCount / total × 100）を表示
- サイドバー・ヒーローカードの進捗は実データ反映
- 個別カードの LinearProgress は削除（データなし）

### 未実装ボタンの無効化
- 「目標を見る」「設定」「通知」ボタンを `disabled` に設定（UI は残す）

---

## デザイン変更

### カラーテーマ: 紫 → K8sブルー
| 要素 | 変更前 | 変更後 |
|---|---|---|
| Primary | `#8b3dff`（紫） | `#3B82F6`（K8s系ブルー） |
| Primary light | `#b478ff` | `#60A5FA` |
| Primary dark | `#6420d7` | `#1D4ED8` |

### ダークモード: ネオン感の除去
- **カラー付き box-shadow（グロー）を廃止** → ニュートラルな `rgba(0,0,0,x)` に統一
- **ラジアルグラデーション背景を廃止**（Layout・ヒーローカード・Sidebar）
- **LinearProgress の高さを 7px → 4px** に細く

### ダークモード: フラットニュートラルデザインへ（Rancher Desktop 参考）
| 要素 | 変更前 | 変更後 |
|---|---|---|
| 背景色 | `#0B1628`（ネイビー） | `#141414`（ニュートラルダーク） |
| カード背景 | グラデーション | フラット `#1C1C1C` |
| Contained ボタン | グラデーション | ソリッドブルー `#3B82F6` |
| Outlined ボタン | 細い枠線 | `1.5px` 明確な枠線 |
| サイドバー選択 | 薄いグラデーション | ソリッド `#2A4A78` |
| ヒーローカード | 発光グラデーション | フラット単色 |
| ダイアログ | グラデーション | フラット `#1C1C1C` |

---

## 主な変更ファイル一覧

| ファイル | 変更内容 |
|---|---|
| `src/shared/theme.ts` | カラーパレット全面変更、ボタン・カードスタイル刷新 |
| `src/App.tsx` | フラッシュカード遷移ロジック、スプラッシュ制御 |
| `src/shared/components/SplashScreen.tsx` | 新規作成 |
| `src/shared/components/Header.tsx` | ロゴクリック対応、配色変更 |
| `src/shared/components/Sidebar.tsx` | 動的マイルストーン計算、配色変更 |
| `src/shared/components/Layout.tsx` | 背景グラデーション除去 |
| `src/features/reference/ReferenceView.tsx` | onStartLearning prop追加 |
| `src/features/reference/CommandList.tsx` | 実進捗データ表示、ヒーロー刷新 |
| `src/features/reference/KnowledgeList.tsx` | 実進捗データ表示、ヒーロー刷新 |
| `src/features/reference/CommandCard.tsx` | LinearProgress削除、配色変更 |
| `src/features/reference/KnowledgeCard.tsx` | 配色変更 |
| `src/features/reference/TagFilter.tsx` | チップ→ドロップダウン化 |
| `src/features/flashcard/FlashcardView.tsx` | セクション別フィルタ、戻るボタン追加 |
