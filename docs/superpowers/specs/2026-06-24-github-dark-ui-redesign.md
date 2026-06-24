# GitHub Dark UI リデザイン 設計仕様

**Date:** 2026-06-24
**Status:** Approved

## Overview

現在の濃いブルー系ダークテーマを GitHub 公式ダークモード配色に刷新する。
アイコンを `@primer/octicons-react` に全面置き換え、コマンド/ナレッジ一覧を大きいカードからテーブルリストスタイルへ変更することで、密度が高く GitHub らしい UI にする。

## カラーパレット（GitHub Dark）

| トークン | 値 | 用途 |
|---|---|---|
| `background.default` | `#0d1117` | メイン背景 |
| `background.paper` | `#161b22` | カード・サイドバー・ヘッダー |
| `divider` | `#30363d` | ボーダー全般 |
| `text.primary` | `#e6edf3` | メインテキスト |
| `text.secondary` | `#8b949e` | サブテキスト |
| `primary.main` | `#1f6feb` | アクセント（ボタン・選択状態） |
| `primary.light` | `#58a6ff` | リンク・選択中テキスト |
| `action.hover` | `#21262d` | ホバー背景 |

ライトモードは現状維持（今回の変更対象外）。

## アイコン

- **パッケージ**: `@primer/octicons-react`
- **置き換え対象**:

| 現在 (MUI) | Octicons | 用途 |
|---|---|---|
| `HubIcon` | `<MarkGithubIcon>` | ヘッダーロゴ |
| `SearchIcon` | `<SearchIcon>` (octicons) | 検索 |
| `NotificationsNoneIcon` | `<BellIcon>` | 通知 |
| `DarkModeIcon` | `<MoonIcon>` | ダークモード切替 |
| `LightModeIcon` | `<SunIcon>` | ライトモード切替 |
| `StyleIcon` | `<StackIcon>` | フラッシュカード |
| `RouteIcon` | `<CompassIcon>` | ロードマップ |
| `HelpOutlineIcon` | `<QuestionIcon>` | ヘルプ |
| `ExpandMoreIcon` | `<ChevronDownIcon>` | カテゴリ展開 |
| `ChevronRightIcon` | `<ChevronRightIcon>` (octicons) | カテゴリ折畳み |
| `EditIcon` | `<PencilIcon>` | 編集 |
| `DeleteIcon` | `<TrashIcon>` | 削除 |
| `OpenInNewIcon` | `<LinkExternalIcon>` | 外部リンク |
| `CloseIcon` | `<XIcon>` | ダイアログ閉じる |
| `AddIcon` / `+` ボタン | `<PlusIcon>` | 追加 |
| `PlayArrowIcon` | `<PlayIcon>` | 学習開始 |
| `AutoAwesomeIcon` | `<ZapIcon>` | AI生成 |

## コンポーネント変更

### テーマ (`src/shared/theme.ts`)
- ダークモードのカラーパレットを上記 GitHub Dark に更新
- `shape.borderRadius`: 6
- ボタンの `textTransform`: `'none'`
- ボタンの `fontWeight`: `500`

### ヘッダー (`src/shared/components/Header.tsx`)
- ロゴ: グラデーション box → `<MarkGithubIcon size={20}>`、背景なし
- 検索: 右端にキーボードショートカット表示 `/`（非機能、見た目のみ）
- アイコンボタン: `bgcolor: 'background.paper'`、`border: '1px solid divider'`

### サイドバー (`src/shared/components/Sidebar.tsx`)
- アイコンを Octicons に置き換え
- 選択状態の bg: `alpha(primary.main, 0.10)`（`#2A4A78` から変更）
- **進捗ウィジェット: 現状維持（円グラフ＋線形プログレス）**
- セクション選択: `borderLeft: 2px solid primary.main`（現状維持）

### コマンド/ナレッジ一覧（テーブルリスト化）

`CommandList.tsx` / `KnowledgeList.tsx` の下部カードリストを以下の構造に変更する。

```
┌─────────────────────────────────────────────────────┐
│ ☐ │ コマンド名（monospace）+ 説明 + タグ  │ status │ ✎ 🗑 │
├─────────────────────────────────────────────────────┤
│ ☑ │ kubectl get pods                       │  完了  │ ✎ 🗑 │
│    │  全 Pod の一覧を表示する  [pod][基本]            │
├─────────────────────────────────────────────────────┤
│ ◉ │ kubectl apply -f                       │ 学習中 │ ✎ 🗑 │
│    │  マニフェストを適用する  [apply]                  │
└─────────────────────────────────────────────────────┘
```

**行の仕様:**
- 行クリック → 既存の `CommandDetail` / `KnowledgeDetail` ダイアログを開く（再利用）
- 左端チェックボックス: status に応じてスタイル変化（未: 空白、学習中: 青点、完了: 青塗り）
- チェックボックスクリック: status をサイクル（未学習 → 学習中 → 完了 → 未学習）
- 編集(✎)/削除(🗑) ボタン: 行ホバー時に表示
- ステータスバッジ: 完了=`#388bfd1a` blue、学習中=`#388bfd1a` blue outline、未学習=テキストのみ

**上部サマリーカード（今日の学習）は現状維持。** テーブルはその下に配置。

## 非機能要件

- Electron ビルド（`npm run build`）は変更後も動作すること
- Web ビルド（`npm run build:web`）も動作すること
- TypeScript エラーゼロを維持すること
- ライトモードは変更しない
