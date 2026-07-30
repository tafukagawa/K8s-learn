# Kong Gateway(APIGW相当)導入 設計書

## 背景・目的

AWSハンズオン(`C:\Users\fukagawa\aws`のARCHITECTURE.md参照)の当初設計では「APIGW → ALB → Service → Pod」という構成を想定していたが、APIGW(Amazon API Gateway)自体はAWS固有のマネージドサービスのため、ローカルのRancher Desktop(k3s)上では検証できず、AWS個別検証トラックに先送りされていた。

本設計では、OSSのKong Gateway(DB-lessモード)を「APIGW相当」の役割として`server/`のProgress APIの手前に導入し、rate-limiting・key-auth・request/response-transformerといったAPI Gateway共通の概念をローカルで実地に学習する。

## アーキテクチャ(2026-07-30改訂: Kongを単独の入口にする構成)

当初案は「Traefik Ingress → Kong Service → Kong Pod」という、汎用Ingress(Traefik)の後段にKongを重ねる二重構成だったが、これは実務的には不自然(L7プロキシを2段重ねるだけで得るものが少ない)と判断し、**Kong自身が入口そのものになる**構成に変更した。OSSのAPI Gateway(Kong/APISIX等)は本来、単独のIngress/LoadBalancerとして直接公開するのが一般的な使い方であるため。

```
[curl / ブラウザ] → Service(kong-gateway, type: LoadBalancer, ポート8000)
                        → Kong Pod(DB-less, 宣言的設定。Route自体にhostsを設定してホスト名ルーティング)
                            │ key-auth → rate-limiting → request/response-transformer
                            ▼
                  http://k8s-learning-app-api(既存API Service、ClusterIP)
                            → api Pod

[ui Pod] ──(Kongを経由せず直接)──→ http://k8s-learning-app-api
```

- Traefikの既存Ingress(`k8s/ingress.yaml`)は一切変更しない。Kongは既存のIngress/Traefikとは完全に独立した、別経路の入口として並存する
- Traefikは既にホストの80/443番を使用しているため、KongのLoadBalancer Serviceには別ポート(Kongのデフォルトであるプロキシポート8000)を割り当てる。アクセスは`http://localhost:8000/`で、ホスト名ルーティング(`k8s-learning-app-api.localhost`)はKong自身の`Route`定義(`hosts`フィールド)で継続する(`curl`は`-H "Host: k8s-learning-app-api.localhost"`でHost指定)
- `ui`Pod(`ui/`)から`api`Serviceへの内部通信(クラスタ内部DNS経由)はKongを経由しない。信頼境界内のサービス間通信はゲートウェイを通さない、という現実によくある構成パターンをそのまま踏襲する

## コンポーネント

### `kong/kong.yml`(新規、宣言的設定ファイル)

Kong DB-lessモードが読み込む宣言的設定。1つのService、1つのRoute、3種類のPluginを定義する。RouteにはTraefikのIngressが担っていたのと同じ`hosts`指定を持たせ、Kong単体でホスト名ルーティングを行う。

```yaml
_format_version: "3.0"
services:
  - name: api-service
    url: http://k8s-learning-app-api
    routes:
      - name: api-route
        hosts:
          - k8s-learning-app-api.localhost
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

**type: LoadBalancer**、プロキシポート(8000)のみを公開する。Rancher Desktop(k3s)にはKlipper(ServiceLB)が同梱されており、追加設定なしでLoadBalancer型Serviceがホストのポートにバインドされる。Admin API(8001)はServiceに含めず、外部からアクセス不可にする(必要な場合はユーザーが検証時に`kubectl port-forward`で個別にアクセスする)。

既存の`k8s/ingress.yaml`は変更しない(Kongは既存Ingress/Traefikとは独立した別経路)。

## データフロー

1. `curl -H "Host: k8s-learning-app-api.localhost" http://localhost:8000/api/categories`(APIキーなし)→ Kong(LoadBalancer Service経由) → `key-auth`プラグインが認証情報なしを検知 → `401 Unauthorized`
2. 同じリクエストに`apikey: demo-api-key-12345`ヘッダーを付与 → `key-auth`通過 → `rate-limiting`カウント → `request-transformer`が上流へのリクエストに`X-Kong-Gateway: true`を追加 → 実際のAPI Podが応答 → `response-transformer`が`X-Powered-By: Kong-APIGW`をレスポンスヘッダーに追加 → クライアントに返る
3. 同じAPIキーで1分間に6回連続リクエスト → 6回目で`rate-limiting`プラグインが`429 Too Many Requests`を返す(上流のAPI Podまで到達しない)
4. `ui`Podが`http://k8s-learning-app-api/api/categories`にサーバーサイドfetchする際は、Kongを経由せず直接`api`Serviceに到達する(認証・レート制限は適用されない)
5. 既存の`curl -H "Host: k8s-learning-app-api.localhost" http://localhost/api/categories`(ポート80、Traefik Ingress経由)は今まで通りKongを経由せず動作し続ける(既存経路は無傷のまま、Kongは並存する別経路)

## 検証方針(ユーザー自身が実施)

- APIキーなしで`http://localhost:8000/`にcurl → `401`を確認
- APIキー付きでcurl(`-i`でヘッダーを確認) → `200`+`X-Powered-By: Kong-APIGW`ヘッダーを確認
- 1分間に6回連続リクエストをスクリプトまたは手動連打 → 6回目で`429`を確認
- 既存の`http://localhost/`(ポート80、Traefik Ingress経由、Kongを経由しない既存経路)が今まで通りAPIキーなしで動作することを確認(Kongが既存経路に影響を与えていないことの裏付け)
- `ui`経由のページ(`http://k8s-learning-app-ui.localhost/`)も今まで通りAPIキーなしで正常に表示されることを確認

## テスト方針

Kong自体は宣言的YAML設定なので、単体テスト(vitest等)は書かない。上記の「検証方針」がそのままテストの代わりとなる。ただし、`kong.yml`の構文検証として`kubectl create configmap --dry-run=client`相当のYAML妥当性チェックと、Kongコンテナ起動時のログで宣言的設定の読み込みエラーがないことの確認は実装タスクに含める。

## 本番運用として意識しておきたい点(ハンズオンでは簡略化している箇所)

- `rate-limiting`の`policy: local`は各Pod(レプリカ)ごとに独立してカウントするため、複数レプリカ構成では実質的な制限値が「設定値 × レプリカ数」に緩む。本番でレプリカを増やす場合は`policy: redis`など共有ストアを使う必要がある
- APIキーを`kong.yml`に平文で記載している点は学習用の割り切り。本番ではSecret化やVaultとの連携を検討すべき
- Kong Admin APIを完全に無効化・非公開にしている点も学習用のシンプルさ優先。本番ではAdmin APIをRBAC付きで内部ネットワークからのみ利用可能にする、またはKonnect(Kongのマネージドコントロールプレーン)を使う選択肢もある

## スコープ外(今回含めない)

- Kong Ingress Controller(KIC)としての導入(今回はスタンドアロンのKong Gatewayを`type: LoadBalancer`のServiceで直接公開する形にとどめ、KongにIngressリソース自体を管理させることはしない)
- UI側のルーティングをKong経由にすること(引き続きTraefik Ingress経由のまま)
- Postgres/DBモードでの動的なAdmin API操作
- Redis等を使った複数レプリカ間で共有されるrate-limiting

## 補足: ローカルk3sでのLoadBalancer型Serviceについて

Rancher Desktop(k3s)にはKlipper(ServiceLB)が同梱されており、クラウド環境のような実際のロードバランサープロビジョニングは行われないが、`type: LoadBalancer`のServiceを作成すると指定ポートでホストにバインドされ、実質的にクラウドのNLB/ALBと同様の「外部から直接アクセスできる入口」として機能する。本番のEKSであれば、ここは実際のNLB(AWS Load Balancer Controller、または単純にService typeがLoadBalancerであれば自動でNLBが払い出される)に相当する。
