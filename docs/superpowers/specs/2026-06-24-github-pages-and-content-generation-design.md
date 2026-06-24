# GitHub Pages版 + 自動コンテンツ生成 設計仕様

**Date:** 2026-06-24
**Status:** Approved

## Overview

既存の Electron アプリと並行して GitHub Pages で公開可能な Web 版を追加する。
さらに GitHub Actions で週次に公式ドキュメントからコンテンツを自動生成し、リポジトリに直接コミットする。

## Goals

1. 同一リポジトリで Electron 版 / Web 版を両立（コンポーネント共有）
2. GitHub Pages に自動デプロイ（main push をトリガー）
3. GitHub Models (GPT-4o-mini) で週次コンテンツ生成・自動コミット

## Subsystems

### A. GitHub Pages Web版

#### ビルド切り替え方式

Vite のパスエイリアスを使い **ビルド時に** `src/shared/ipc.ts` → `src/shared/ipc.web.ts` に差し替える。
`src/features/` 以下のコンポーネントは一切変更しない。

```
src/shared/ipc.ts       既存（Electron用・変更なし）
src/shared/ipc.web.ts   新規（Web用 api 実装）
vite.web.config.ts      新規（alias + GitHub Pages base 設定）
.github/workflows/deploy.yml  新規
```

既存の `index.html` / `src/main.tsx` はそのまま Web版エントリとして再利用する。

#### ipc.web.ts の責務

| 機能 | 実装 |
|---|---|
| カテゴリ/セクション/コマンド/ナレッジ | `import.meta.glob` で `categories/**/*.json` をビルド時一括バンドル |
| 進捗（覚えた/学習中） | localStorage `progress:{type}:{id}` |
| カスタムデータ追加/編集/削除 | localStorage `custom:commands` / `custom:knowledge` |
| `shell.openExternal(url)` | `window.open(url, '_blank')` |
| `ai.checkOllama()` | `{ ok: false, models: [] }` を返す（グレーアウト） |
| `ai.generateCloze()` | `throw new Error('Web版では利用できません')` |

#### データロード方式

`src/shared/ipc.web.ts` 内で `import.meta.glob` を使い、ビルド時に全 JSON をバンドル。
ソートされたパス順に連番 ID を付与することで、セッションをまたいでも ID が一定になる。

```
内部データ構造:
  ALL_CATEGORIES: Category[]
  ALL_SECTIONS: Section[] (+ 内部 sectionId)
  ALL_COMMANDS: (Command & { _sectionId: number })[]
  ALL_KNOWLEDGE: (Knowledge & { _sectionId: number })[]
```

`Category.icon` は常に `''`（DB デフォルトに合わせる）。

#### localStorage スキーマ

```
progress:command:{id}   → JSON: { status, updatedAt }
progress:knowledge:{id} → JSON: { status, updatedAt }
custom:commands         → JSON: Command[]
custom:knowledge        → JSON: Knowledge[]
```

#### GitHub Pages デプロイ

- トリガー: `main` への push
- ビルドコマンド: `npm run build:web`
- 出力先: `dist/web/`
- GitHub Pages の Source: GitHub Actions

---

### B. 自動コンテンツ生成

#### フロー

```
週次 cron (毎週日曜 00:00 UTC)
  ↓
各カテゴリ × セクションの公式ドキュメント URL をフェッチ
  ↓
GitHub Models (gpt-4o-mini) で JSON 生成
  ↓
既存エントリと重複チェック (name / title で dedup)
  ↓
新規のみ categories/**/*.json に追記
  ↓
logs/content-generation/YYYY-MM-DD.json にログ出力
  ↓
git commit & push (main へ直接)
```

#### 追加ファイル

```
.github/scripts/generate-content.ts   生成スクリプト本体
.github/workflows/generate-content.yml  週次 Actions ワークフロー
logs/content-generation/.gitkeep      ログディレクトリ
```

#### GitHub Models 設定

- エンドポイント: `https://models.inference.ai.azure.com`
- 認証: `GITHUB_TOKEN`（追加シークレット設定不要）
- SDK: `openai` npm パッケージ（OpenAI 互換 API）
- モデル: `gpt-4o-mini`

#### 生成 JSON スキーマ（commands）

```json
[
  {
    "name": "コマンド名",
    "description": "1行説明",
    "syntax": "コマンド構文",
    "example": "使用例",
    "tags": ["tag1", "tag2"],
    "url": "https://..."
  }
]
```

#### 生成 JSON スキーマ（knowledge）

```json
[
  {
    "title": "概念名",
    "body": "Markdownで説明",
    "tags": ["tag1"],
    "url": "https://..."
  }
]
```

#### ログ形式

```json
{
  "date": "2026-06-29",
  "category": "k8s",
  "section": "01-pod-management",
  "type": "commands",
  "added": 3,
  "skipped": 12,
  "items": [
    { "name": "kubectl debug", "action": "added" },
    { "name": "kubectl get pods", "action": "skipped" }
  ]
}
```

#### コミット設定

```
git config user.name  'github-actions[bot]'
git config user.email 'github-actions[bot]@users.noreply.github.com'
git commit -m "chore: auto-update content [YYYY-MM-DD]"
```

## 公式ドキュメント URL（スクレイプ対象）

| カテゴリ | セクション | URL |
|---|---|---|
| k8s | 01-pod-management | https://kubernetes.io/docs/reference/kubectl/cheatsheet/ |
| k8s | 02-deployment | https://kubernetes.io/docs/concepts/workloads/controllers/deployment/ |
| k8s | 03-service-networking | https://kubernetes.io/docs/concepts/services-networking/ |
| k8s | 04-config-secret | https://kubernetes.io/docs/concepts/configuration/ |
| k8s | 05-storage | https://kubernetes.io/docs/concepts/storage/ |
| k8s | 06-observability | https://kubernetes.io/docs/tasks/debug/ |
| docker | 01-image | https://docs.docker.com/reference/cli/docker/image/ |
| docker | 02-container | https://docs.docker.com/reference/cli/docker/container/ |
| docker | 03-network-volume | https://docs.docker.com/reference/cli/docker/network/ |
| docker | 04-compose | https://docs.docker.com/reference/cli/docker/compose/ |
| helm | 01-chart-management | https://helm.sh/docs/helm/helm_install/ |
| helm | 02-repository | https://helm.sh/docs/helm/helm_repo/ |
| helm | 03-release-management | https://helm.sh/docs/helm/helm_upgrade/ |
| helm | 04-templating | https://helm.sh/docs/helm/helm_template/ |
| argocd | 01-app-management | https://argo-cd.readthedocs.io/en/stable/user-guide/app-overview/ |
| argocd | 02-sync-operations | https://argo-cd.readthedocs.io/en/stable/user-guide/sync-flags/ |
| argocd | 03-repo-cluster | https://argo-cd.readthedocs.io/en/stable/user-guide/private-repositories/ |
| kustomize | 01-base-overlay | https://kubectl.docs.kubernetes.io/references/kustomize/glossary/ |
| kustomize | 02-generators | https://kubectl.docs.kubernetes.io/references/kustomize/kustomization/generators/ |
| kustomize | 03-transformers | https://kubectl.docs.kubernetes.io/references/kustomize/kustomization/transformers/ |

## 非機能要件

- Electron 版ビルド（`npm run build`）は変更後も動作すること
- Web版ビルド（`npm run build:web`）は Electron 依存モジュール（`electron`, `better-sqlite3`）を含まないこと
- コンテンツ生成は既存エントリを上書きしない（dedup は name/title の完全一致）
- GitHub Actions のレート制限: GitHub Models は 1分あたり15リクエスト。スクリプトはリクエスト間に 5秒スリープを入れる
