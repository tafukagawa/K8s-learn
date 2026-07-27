# 進捗API + K8sデプロイ 設計書

## 背景・目的

AWS参入向けハンズオン(`C:\Users\fukagawa\aws`のARCHITECTURE.md参照)の一環で、EKS上に構築予定だった「自作API基盤 → APIGW → ALB → K8s Service → Pod」というHTTP API連携パターンを、コスト削減のためローカルのRancher Desktop(k3s)上で学習する。

題材として、既存のk8s-learning-app(Electron製の学習アプリ)が持つcategories/sections/commands/knowledgeのデータモデルを流用し、薄いバックエンドAPIを新規に被せる。Web版(GitHub Pages配信の静的SPA)はAPIサーバーを持たないため、今回新規に追加する。

## アーキテクチャ

```
[GitHub Actions] --build & push--> [GHCR] --image:latest--> [ArgoCD Application]
                                                                     │ sync
                                                                     ▼
                                          [k8s-learning-app-api namespace]
                                          Deployment(Express API) ← PVC(SQLite progress.db)
                                                │
                                          Service(ClusterIP) ← Traefik Ingress(既存流用)
```

- ArgoCD(既存、`argocd`ネームスペースで稼働中)とTraefik(既存、`kube-system`にHelmで導入済み)は流用する
- ローカルクラスタ: Rancher Desktop付属k3s(StorageClass `local-path` がデフォルトで存在)

## コンポーネント

### server/(新規ディレクトリ)

Express製REST API。起動時に`categories/*/meta.json`, `categories/*/sections/*/meta.json`, `categories/*/sections/*/commands.json`, `categories/*/sections/*/knowledge.json`を読み込み、既存の`src/shared/ipc.web.ts`にある`buildData()`相当のロジックをサーバー側に移植してメモリ上に保持する。参照系エンドポイントはこのメモリ上データから返す。

**エンドポイント:**
- `GET /api/categories` — カテゴリ一覧
- `GET /api/categories/:categoryId/sections` — セクション一覧
- `GET /api/categories/:categoryId/commands?sectionId=` — コマンド一覧(progress付き)
- `GET /api/categories/:categoryId/knowledge?sectionId=` — ナレッジ一覧(progress付き)
- `PUT /api/progress` — body: `{ itemType: 'command'|'knowledge', itemId: number, status: 'unseen'|'learning'|'done' }` のupsert。不正な`itemType`/`status`は400
- `GET /healthz` — liveness/readiness用(200固定)

**progress永続化:** `better-sqlite3`で`/data/progress.db`に保存。PVC(1Gi, `local-path`)を`/data`にマウント

**エラーハンドリング:** Express共通エラーミドルウェアでJSON `{error: string}`形式に統一

### k8s/(新規ディレクトリ)

- `namespace.yaml` — `k8s-learning-app-api`ネームスペース
- `deployment.yaml` — レプリカ1、`imagePullPolicy: Always`、イメージ`ghcr.io/tafukagawa/k8s-learning-app-api:latest`
- `service.yaml` — ClusterIP
- `pvc.yaml` — 1Gi, `local-path` StorageClass
- `ingress.yaml` — 既存Traefikを利用してホスト名でルーティング
- `argocd-application.yaml` — 新規ArgoCD Applicationで`k8s-learning-app`リポジトリの`k8s/`ディレクトリを監視、`destination.namespace: k8s-learning-app-api`、`syncPolicy.automated`(prune/selfHeal)

### .github/workflows/build-api.yml(新規)

`server/**`, `k8s/**`変更時にトリガー。GitHubホスト型Runnerでビルドし、`GITHUB_TOKEN`を使ってGHCR(`ghcr.io/tafukagawa/k8s-learning-app-api`)へ`:latest`タグでpush。ARC(セルフホストRunner)は別ステップで後日導入し、その際にworkflowのrunner指定を切り替える想定。

## データフロー

1. GitHub Actionsが`server/`のDockerfileをビルドし、GHCRへpush
2. ArgoCDが`k8s/`の変更(または`imagePullPolicy: Always`による再Pull)を検知してDeploymentを同期
3. クライアント(ブラウザ/curl)がTraefik Ingress経由でServiceにアクセス
4. APIがメモリ上の参照データ + SQLite上のprogressを結合して返す
5. `PUT /api/progress`でSQLiteに書き込み、Pod再起動後もPVC経由でデータが残る

## テスト方針

`vitest` + `supertest`で以下を最小限カバーする:
- `GET /api/categories`が200かつ配列を返す
- `PUT /api/progress`の正常系(有効なitemType/status)
- `PUT /api/progress`の異常系(不正なstatus値で400)

## スコープ外(今回含めない)

- commands/knowledgeのCRUD(create/update/delete) — 参照専用
- AI採点機能(Ollama連携)
- 複数レプリカ/HPAなどのスケーリング
- Argo CD Image Updaterによるタグ自動更新(`:latest`固定で代替)
- ARC(セルフホストRunner)経由でのCI実行 — 別ステップで後日対応
