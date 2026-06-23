# Data Expansion & Section Navigation Design

**Date:** 2026-06-23  
**Status:** Approved

## Overview

k8s学習アプリのデータを大幅に拡充し、公式ドキュメント風のセクション階層ナビゲーションに刷新する。

## Goals

1. カテゴリを k8s 単体から Helm / ArgoCD / Kustomize / Docker を追加（計5カテゴリ）
2. 各カテゴリを「セクション」で階層管理（公式ドキュメント風）
3. セクション対応の3階層サイドバーに刷新
4. 各カテゴリ: コマンド30+件・ナレッジ15+件（網羅的）

## Data Model

### New `sections` Table

```sql
CREATE TABLE IF NOT EXISTS sections (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  slug        TEXT    NOT NULL,
  title       TEXT    NOT NULL,
  "order"     INTEGER NOT NULL DEFAULT 0,
  UNIQUE(category_id, slug)
);
```

### Schema Migrations

- `commands` テーブルに `section_id INTEGER REFERENCES sections(id)` を追加（NULL許容）
- `knowledge` テーブルに `section_id INTEGER REFERENCES sections(id)` を追加（NULL許容）

### File Structure

```
categories/
  k8s/
    sections/
      01-pod-management/
        meta.json       { "title": "Pod管理" }
        commands.json
        knowledge.json
      02-deployment/
      03-service-networking/
      04-config-secret/
      05-storage/
      06-observability/
  helm/
    sections/
      01-chart-management/
      02-repository/
      03-release-management/
      04-templating/
  argocd/
    sections/
      01-app-management/
      02-sync-operations/
      03-repo-cluster/
  kustomize/
    sections/
      01-base-overlay/
      02-generators/
      03-transformers/
  docker/
    sections/
      01-image/
      02-container/
      03-network-volume/
      04-compose/
```

### JSON Format (commands.json)

```json
[
  {
    "name": "kubectl get pods",
    "description": "Pod一覧を表示する",
    "syntax": "kubectl get pods [-n <namespace>] [-A]",
    "example": "kubectl get pods -n default",
    "tags": ["pod", "get"],
    "url": ""
  }
]
```

### JSON Format (knowledge.json)

```json
[
  {
    "title": "Pod とは",
    "body": "## Pod とは\n\n...",
    "tags": ["pod", "basic"],
    "url": ""
  }
]
```

## Importer Changes

`electron/importer/index.ts` を `sections/` サブディレクトリ対応に拡張：

1. `categories/<slug>/sections/` ディレクトリを走査
2. 各セクションディレクトリの `meta.json` から title を読み込み `sections` テーブルに INSERT
3. `commands.json` / `knowledge.json` を読み込み、`section_id` 付きで INSERT
4. 既存の旧フラットファイル（`categories/<slug>/commands.json`）も後方互換で読み込み継続（`section_id = NULL`）

## IPC API Changes

### New `sections` handler

```typescript
ipcMain.handle('sections:list', (_, categoryId) => sectionHandlers.list(categoryId))
```

### Updated `commands:list` / `knowledge:list`

`categoryId` に加え `sectionId` オプションでフィルタリング可能に。

### New types

```typescript
export interface Section {
  id: number
  categoryId: number
  slug: string
  title: string
  order: number
}
```

## Sidebar UI

### Navigation Structure

```
学習ツール
  ├─ フラッシュカード
  └─ ロードマップ

カテゴリ
  ├─ k8s ▼ (展開)
  │   ├─ Commands ▼
  │   │   ├─ Pod管理        ← 選択中
  │   │   ├─ Deployment管理
  │   │   └─ ...
  │   └─ Knowledge ▼
  │       ├─ 基本概念
  │       └─ ...
  ├─ Helm ▶
  ├─ ArgoCD ▶
  ├─ Kustomize ▶
  └─ Docker ▶

学習進捗
次の目標
```

### State Type

```typescript
type AppView =
  | { mode: 'flashcard' }
  | { mode: 'roadmap' }
  | { mode: 'reference'; categoryId: number; sectionId: number; contentType: 'commands' | 'knowledge' }
```

### Behavior

- カテゴリ行クリック → 展開/折りたたみトグル（複数同時展開可）
- Commands / Knowledge 行クリック → 展開/折りたたみ
- セクション行クリック → コンテンツエリアに該当セクション一覧を表示
- 初期状態: k8s 展開、Commands > 最初のセクションが選択状態

## Content Area

- セクション選択時：該当セクションのカード一覧を表示
- セクション内検索は既存のサーチバーで対応
- カード UI は既存の CommandCard / KnowledgeCard をそのまま流用

## Sections Data Plan

### k8s

| セクション | Commands | Knowledge |
|-----------|----------|-----------|
| Pod管理 | 10件 | 5件 |
| Deployment管理 | 8件 | 4件 |
| Service & Networking | 8件 | 4件 |
| Config & Secret | 6件 | 4件 |
| Storage (PV/PVC) | 4件 | 3件 |
| 観察・デバッグ | 8件 | 4件 |

### Helm (新規)

| セクション | Commands | Knowledge |
|-----------|----------|-----------|
| Chart管理 | 8件 | 4件 |
| リポジトリ管理 | 6件 | 3件 |
| リリース管理 | 8件 | 4件 |
| テンプレート | 6件 | 3件 |

### ArgoCD (新規)

| セクション | Commands | Knowledge |
|-----------|----------|-----------|
| アプリ管理 | 8件 | 4件 |
| Sync操作 | 6件 | 3件 |
| リポジトリ・クラスタ管理 | 6件 | 3件 |

### Kustomize (新規)

| セクション | Commands | Knowledge |
|-----------|----------|-----------|
| Base & Overlay | 4件 | 4件 |
| Generators | 4件 | 3件 |
| Transformers | 4件 | 3件 |

### Docker (新規)

| セクション | Commands | Knowledge |
|-----------|----------|-----------|
| イメージ管理 | 8件 | 4件 |
| コンテナ操作 | 10件 | 4件 |
| Network & Volume | 8件 | 4件 |
| Docker Compose | 8件 | 4件 |
