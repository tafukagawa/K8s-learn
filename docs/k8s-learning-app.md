---
date: 2026-06-23
tags: [k8s, electron, react, sqlite, learning-app]
project: k8s-learning-app
status: active
---

# k8s Learning App

## 概要

Kubernetes および周辺ツール（Helm, ArgoCD, Kustomize, Docker 等）を効率的に学習するための Electron デスクトップアプリ。
フラッシュカード・リファレンス・ロードマップ・ヘルプの4つのビューを持ち、SQLite でローカル進捗管理。
ローカルAI（Ollama）を使ったナレッジの穴埋め問題自動生成機能あり。

## 場所

`C:\Users\fukagawa\work\k8s-learning-app`

## 技術スタック

| 要素 | 採用技術 |
|------|---------|
| デスクトップ基盤 | Electron 42 |
| フロントエンド | React 19 + MUI v6 + Vite 8 |
| DB | SQLite（better-sqlite3） |
| Main ↔ Renderer 通信 | IPC（contextBridge） |
| Markdown | react-markdown + remark-gfm |
| ローカルAI | Ollama（qwen2.5:3b） |
| テスト | Vitest |

## 現在の状態（2026-06-23）

### 完成済み
- [x] プロジェクトスキャフォールド・SQLite スキーマ・マイグレーション
- [x] IPC ハンドラー（categories / sections / commands / knowledge / progress / ai）
- [x] カテゴリコンテンツ（k8s / docker / helm / argocd / kustomize）
- [x] **リファレンス機能**
  - カテゴリ＞セクション＞コマンド/ナレッジ の階層ブラウズ
  - タブでコマンド/ナレッジ切り替え、タグチップフィルター
  - 詳細モーダル（Markdown レンダリング・テーブル対応）
  - 進捗ステータス管理（未学習 / 学習中 / 完了）
- [x] **フラッシュカード機能**
  - コマンド：名前→説明/構文/例
  - ナレッジ（穴埋めあり）：`（）` 入力→正解比較
  - ナレッジ（穴埋めなし）：自由記述→正解表示
  - フィルター（全て / 未学習 / 学習中）、セクション絞り込み
  - キーボードショートカット（Space / Y / N / ← →）
- [x] **ロードマップ機能**
  - 全体進捗サークルグラフ
  - カテゴリ別進捗バー、リファレンスへのリンク
  - サイドバーに常時表示の学習進捗ウィジェット
- [x] **AI穴埋め生成（Ollama）**
  - ナレッジカードの「AI生成」ボタンで穴埋め問題を自動生成
  - Ollama 未起動時にインストール案内ダイアログを表示
  - 生成結果を SQLite の `knowledge.cloze` カラムに保存
- [x] **ヘルプページ**
  - アコーディオン形式で各画面・機能・キーボードショートカットを説明
  - サイドバー下部の「ヘルプ」ボタンからアクセス
- [x] ダークモード（フラットニュートラル、Rancher Desktop 風）

## 画面構成

```
App
├── Sidebar（常時表示）
│   ├── 学習ツール
│   │   ├── フラッシュカード
│   │   ├── ロードマップ
│   │   └── 学習進捗ウィジェット（常時）
│   ├── カテゴリツリー（展開/折り畳み）
│   └── ヘルプ（下部）
└── メインエリア（view で切り替え）
    ├── ReferenceView  ← mode: 'reference'
    ├── FlashcardView  ← mode: 'flashcard'
    ├── RoadmapView    ← mode: 'roadmap'
    └── HelpView       ← mode: 'help'
```

## 既知の問題・対処済み

- `better-sqlite3` NODE_MODULE_VERSION ミスマッチ → `npx electron-rebuild` で解消
- Electron 42 の sandbox デフォルト変更 → `electron/main.ts` に `sandbox: false` 追加済み
- `NODE_ENV` が未設定 → `cross-env NODE_ENV=development` を dev スクリプトに追加済み
- Ollama の PATH 問題（winget インストール後）→ フルパス `C:\Users\fukagawa\AppData\Local\Programs\Ollama\ollama.exe` で対処

## 起動方法

```bash
cd C:\Users\fukagawa\work\k8s-learning-app
npm run dev
```

## Ollama セットアップ

```powershell
# インストール（winget）
winget install Ollama.Ollama

# モデル取得
& "C:\Users\fukagawa\AppData\Local\Programs\Ollama\ollama.exe" pull qwen2.5:3b

# 起動確認
& "C:\Users\fukagawa\AppData\Local\Programs\Ollama\ollama.exe" serve
```

## 設計資料

- [[docs/superpowers/specs/2026-06-18-k8s-learning-app-design]]
- [[docs/superpowers/plans/2026-06-18-k8s-learning-app-core]]
- [[docs/superpowers/specs/2026-06-23-flashcard-and-reference-url-design]]
- [[docs/superpowers/plans/2026-06-23-flashcard-and-reference-url]]
