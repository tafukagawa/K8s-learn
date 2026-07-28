# Kong Gateway(APIGW相当)導入 設計書

## 背景・目的

AWSハンズオン(`C:\Users\fukagawa\aws`のARCHITECTURE.md参照)の当初設計では「APIGW → ALB → Service → Pod」という構成を想定していたが、APIGW(Amazon API Gateway)自体はAWS固有のマネージドサービスのため、ローカルのRancher Desktop(k3s)上では検証できず、AWS個別検証トラックに先送りされていた。

本設計では、OSSのKong Gateway(DB-lessモード)を「APIGW相当」の役割として`server/`のProgress APIの手前に導入し、rate-limiting・key-auth・request/response-transformerといったAPI Gateway共通の概念をローカルで実地に学習する。

## アーキテクチャ

```
[curl / ブラウザ] → Traefik Ingress(host: k8s-learning-app-api.localhost)
                        → Service(kong-gateway) → Kong Pod(DB-less, 宣言的設定)
                                                       │ rate-limiting → key-auth → request/response-transformer
                                                       ▼
                                          http://k8s-learning-app-api(既存API Service)
                                                       → api Pod

[ui Pod] ──(Kongを経由せず直接)──→ http://k8s-learning-app-api
```

- Traefikの既存Ingress(`k8s/ingress.yaml`、APIの`k8s-learning-app-api.localhost`用)の転送先を、`k8s-learning-app-api` Serviceから新設する`kong-gateway` Serviceに変更する
- `ui`Pod(`C:\Users\fukagawa\work\k8s-learning-app`の`ui/`、別セッションで実装中)から`api`Serviceへの内部通信(クラスタ内部DNS経由)はKongを経由しない。信頼境界内のサービス間通信はゲートウェイを通さない、という現実によくある構成パターンをそのまま踏襲する

## コンポーネント

### `kong/kong.yml`(新規、宣言的設定ファイル)

Kong DB-lessモードが読み込む宣言的設定。1つのService、1つのRoute、3種類のPluginを定義する。

```yaml
_format_version: "3.0"
services:
  - name: api-service
    url: http://k8s-learning-app-api
    routes:
      - name: api-route
        paths:
          - /
        strip_path: false
    plugins:
      - name: rate-limiting
        config:
          minute: 5
          policy: local
      - name: key-auth
      - name: request-transformer
        config:
          add:
            headers:
              - "X-Kong-Gateway:true"
      - name: response-transformer
        config:
          add:
            headers:
              - "X-Powered-By:Kong-APIGW"
consumers:
  - username: demo-user
    keyauth_credentials:
      - key: demo-api-key-12345
```

- `rate-limiting`の`policy: local`は、Redisなど外部ストアなしでPodローカルメモリでカウントする設定(学習用途でシンプルさを優先。replicas > 1にすると各Podで別カウントになる点は「本番運用として意識しておきたい点」に後述)
- `minute: 5`は、動作確認をすぐ体感できるようあえて低い閾値にしている

### `k8s/kong-configmap.yaml`(新規)

`kong/kong.yml`の内容をそのままConfigMap化し、Kong Podにマウントする。

### `k8s/kong-deployment.yaml`(新規)

公式イメージ`kong:3.7`を使用。

- 環境変数: `KONG_DATABASE=off`(DB-lessモード)、`KONG_DECLARATIVE_CONFIG=/kong/declarative/kong.yml`、`KONG_PROXY_LISTEN=0.0.0.0:8000`
- ConfigMapを`/kong/declarative/kong.yml`にマウント
- readinessProbe/livenessProbeは`/status`(Kongのステータスエンドポイント、ポート8100の`KONG_STATUS_LISTEN`を有効化して使う)

### `k8s/kong-service.yaml`(新規)

ClusterIP、プロキシポート(8000)のみを公開する。Admin API(8001)はServiceに含めず、外部からアクセス不可にする(必要な場合はユーザーが検証時に`kubectl port-forward`で個別にアクセスする)。

### `k8s/ingress.yaml`(既存ファイルを修正)

`spec.rules[].http.paths[].backend.service`を、既存の`k8s-learning-app-api`から`kong-gateway`に変更する。ホスト名(`k8s-learning-app-api.localhost`)は変更しない。

## データフロー

1. `curl -H "Host: k8s-learning-app-api.localhost" http://localhost/api/categories`(APIキーなし)→ Traefik → Kong → `key-auth`プラグインが認証情報なしを検知 → `401 Unauthorized`
2. 同じリクエストに`apikey: demo-api-key-12345`ヘッダーを付与 → `key-auth`通過 → `rate-limiting`カウント → `request-transformer`が上流へのリクエストに`X-Kong-Gateway: true`を追加 → 実際のAPI Podが応答 → `response-transformer`が`X-Powered-By: Kong-APIGW`をレスポンスヘッダーに追加 → クライアントに返る
3. 同じAPIキーで1分間に6回連続リクエスト → 6回目で`rate-limiting`プラグインが`429 Too Many Requests`を返す(上流のAPI Podまで到達しない)
4. `ui`Podが`http://k8s-learning-app-api/api/categories`にサーバーサイドfetchする際は、Kongを経由せず直接`api`Serviceに到達する(認証・レート制限は適用されない)

## 検証方針(ユーザー自身が実施)

- APIキーなしでcurl → `401`を確認
- APIキー付きでcurl(`-i`でヘッダーを確認) → `200`+`X-Powered-By: Kong-APIGW`ヘッダーを確認
- 1分間に6回連続リクエストをスクリプトまたは手動連打 → 6回目で`429`を確認
- `ui`経由のページ(`http://k8s-learning-app-ui.localhost/`)は今まで通りAPIキーなしで正常に表示されることを確認(Kongを経由しないルートであることの裏付け)

## テスト方針

Kong自体は宣言的YAML設定なので、単体テスト(vitest等)は書かない。上記の「検証方針」がそのままテストの代わりとなる。ただし、`kong.yml`の構文検証として`kubectl create configmap --dry-run=client`相当のYAML妥当性チェックと、Kongコンテナ起動時のログで宣言的設定の読み込みエラーがないことの確認は実装タスクに含める。

## 本番運用として意識しておきたい点(ハンズオンでは簡略化している箇所)

- `rate-limiting`の`policy: local`は各Pod(レプリカ)ごとに独立してカウントするため、複数レプリカ構成では実質的な制限値が「設定値 × レプリカ数」に緩む。本番でレプリカを増やす場合は`policy: redis`など共有ストアを使う必要がある
- APIキーを`kong.yml`に平文で記載している点は学習用の割り切り。本番ではSecret化やVaultとの連携を検討すべき
- Kong Admin APIを完全に無効化・非公開にしている点も学習用のシンプルさ優先。本番ではAdmin APIをRBAC付きで内部ネットワークからのみ利用可能にする、またはKonnect(Kongのマネージドコントロールプレーン)を使う選択肢もある

## スコープ外(今回含めない)

- Kong Ingress Controller(KIC)としての導入(今回はスタンドアロンのKong Gatewayとして、既存Traefikの後段に配置する)
- UI側のIngressをKong経由にすること
- Postgres/DBモードでの動的なAdmin API操作
- Redis等を使った複数レプリカ間で共有されるrate-limiting
