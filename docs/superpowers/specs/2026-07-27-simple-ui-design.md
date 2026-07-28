# 簡易UI(画面表示用Node) 設計書

## 背景・目的

`server/`に構築したProgress APIは、これまでcurl経由でしか呼び出していなかった。EKS案件の技術キャッチアップの一環として、「画面(UI) → API → データ」という一般的なWebアプリケーション構成のうち、K8s上で**Pod間通信(Service経由の内部DNS)**を実際に体験することを主目的とする。見た目や機能は凝らず、最小限の参照画面のみを実装する。

## アーキテクチャ

```
[curl / ブラウザ] → Traefik Ingress(host: k8s-learning-app-ui.localhost)
                        → Service(ui, ClusterIP) → Deployment(ui) Pod(Express+EJS)
                                            │ サーバー側fetch(クラスタ内部DNS経由)
                                            ▼
                              http://k8s-learning-app-api.k8s-learning-app-api.svc.cluster.local
                                            → 既存の api Service(ClusterIP) → api Pod
```

- ui Podとapi Podは同一ネームスペース(`k8s-learning-app-api`)に配置するため、Service名だけで名前解決できる(`http://k8s-learning-app-api`でも到達可能。フルFQDNは`<service>.<namespace>.svc.cluster.local`)
- ブラウザは`ui`のIngressだけにアクセスし、`api`には直接アクセスしない(CORS対応が不要になる理由でもある)

## コンポーネント

### ui/(新規ディレクトリ、k8s-learning-appリポジトリ内、server/と並列)

Express + EJSによる最小限のサーバーサイドレンダリング。

**ルーティング:**
- `GET /` — カテゴリ一覧ページ。起動時ではなくリクエストごとに`http://k8s-learning-app-api/api/categories`をfetchし、EJSテンプレートでHTMLテーブルとして描画。各カテゴリ名はリンクになっており、クリックで`/categories/:id/commands`に遷移
- `GET /categories/:id/commands` — 指定カテゴリのコマンド一覧ページ。`http://k8s-learning-app-api/api/categories/:id/commands`をfetchし、HTMLテーブルで表示(name/description/syntax/exampleの列)
- `GET /healthz` — liveness/readiness用(200固定)

**API接続先:** 環境変数`API_BASE_URL`(デフォルト`http://k8s-learning-app-api`)で切り替え可能にする。ローカル開発時は`http://localhost:3000`等に差し替えて動作確認できるようにする。

**スタイリング:** 一切行わない。素のHTMLテーブルとリンクのみ。

**エラーハンドリング:** API呼び出しが失敗した場合(タイムアウト・5xx等)は、画面に「データを取得できませんでした」という簡単なメッセージを表示する(スタックトレースは出さない)。

### k8s/(既存ディレクトリに追加)

- `ui-deployment.yaml` — レプリカ1、`imagePullPolicy: Always`、イメージ`ghcr.io/tafukagawa/k8s-learning-app-ui:latest`、環境変数`API_BASE_URL=http://k8s-learning-app-api`
- `ui-service.yaml` — ClusterIP、名前`k8s-learning-app-ui`
- `ui-ingress.yaml` — host: `k8s-learning-app-ui.localhost`、`k8s-learning-app-ui`へルーティング
- 既存の`argocd-application.yaml`がそのまま`k8s/`ディレクトリ全体を監視しているため、Application定義の追加は不要(自動的にui関連リソースも同期対象になる)

### Dockerfile(ui/Dockerfile、新規)

`server/Dockerfile`と同様のパターン(Node 20-alpine、マルチステージビルド)。ただし`better-sqlite3`のようなネイティブモジュールがないため、`python3 make g++`のビルドステージは不要。

### CI/CD

今回は自動化しない。`docker build -f ui/Dockerfile -t ghcr.io/tafukagawa/k8s-learning-app-ui:latest .`を手動で1回実行し、GHCRへpushする。ArgoCDの`syncPolicy.automated`(prune/selfHeal)は既存のまま効くため、`k8s/`にマニフェストをcommit&pushすればArgoCDが自動的にui関連リソースを作成する。

## データフロー

1. ブラウザが`http://k8s-learning-app-ui.localhost/`にアクセス
2. Traefik IngressがuiのServiceへルーティング
3. uiのPodが`GET /`を受け、サーバー側で`http://k8s-learning-app-api/api/categories`にfetch(クラスタ内部DNS解決、Ingressを経由しない)
4. 取得したJSONをEJSでHTMLテーブルに変換してブラウザに返す
5. カテゴリリンクをクリックすると同様の流れで`/categories/:id/commands`が描画される

## テスト方針

`vitest` + `supertest`で最小限のみ:
- `GET /healthz`が200を返す
- `GET /`がAPIのモックレスポンスを正しくHTMLに埋め込む(fetchをモック化)
- API呼び出し失敗時に、`GET /`がエラーメッセージを含む200(またはエラー用ステータス)を返す

## 深掘りポイント(実装後の確認フェーズで扱う)

- Service(ClusterIP)のクラスタ内部DNS解決の仕組み(CoreDNSがどう`<service>.<namespace>.svc.cluster.local`を解決するか)
- なぜui→apiの通信にIngressを経由させないのか(内部通信 vs 外部公開の使い分け)
- EKSでの同等パターン(Pod間はService名、外部からはALB経由)との対応関係

## スコープ外(今回含めない)

- progressの書き込み・編集画面
- スタイリング、レスポンシブ対応、フロントエンドフレームワーク(React等)の導入
- CI/CD自動化(GitHub Actions)
- ui用の新しいArgoCD Application(既存Applicationがそのまま`k8s/`全体を監視するため不要)
