# AWS カテゴリ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** AWS を新カテゴリとして追加する（IAM/EC2/S3/VPC/RDS/Lambda/EKS/ECR/ELB/CloudWatch/CloudFormation の 11 セクション）

**Architecture:** 既存の `categories/k8s` や `categories/docker` と同じディレクトリ構成。`categories/aws/sections/` 以下に各セクションを配置。アプリ起動時に `importCategories()` が自動的に DB に取り込む。

**Tech Stack:** JSON ファイル, Node.js (importer), SQLite

---

### Task 1: AWS カテゴリ構造の作成 & sectionUrls 追加

**Files:**
- Create: `categories/aws/meta.json`
- Create: `categories/aws/sections/01-iam/meta.json`
- Create: `categories/aws/sections/02-ec2/meta.json`
- Create: `categories/aws/sections/03-s3/meta.json`
- Create: `categories/aws/sections/04-vpc/meta.json`
- Create: `categories/aws/sections/05-rds/meta.json`
- Create: `categories/aws/sections/06-lambda/meta.json`
- Create: `categories/aws/sections/07-eks/meta.json`
- Create: `categories/aws/sections/08-ecr/meta.json`
- Create: `categories/aws/sections/09-elb/meta.json`
- Create: `categories/aws/sections/10-cloudwatch/meta.json`
- Create: `categories/aws/sections/11-cloudformation/meta.json`
- Modify: `src/data/sectionUrls.ts`

- [ ] **Step 1: カテゴリ meta.json を作成**

`categories/aws/meta.json`:
```json
{ "name": "AWS", "icon": "Cloud" }
```

- [ ] **Step 2: 各セクションの meta.json を作成**

`categories/aws/sections/01-iam/meta.json`:
```json
{ "title": "IAM" }
```

`categories/aws/sections/02-ec2/meta.json`:
```json
{ "title": "EC2" }
```

`categories/aws/sections/03-s3/meta.json`:
```json
{ "title": "S3" }
```

`categories/aws/sections/04-vpc/meta.json`:
```json
{ "title": "VPC" }
```

`categories/aws/sections/05-rds/meta.json`:
```json
{ "title": "RDS" }
```

`categories/aws/sections/06-lambda/meta.json`:
```json
{ "title": "Lambda" }
```

`categories/aws/sections/07-eks/meta.json`:
```json
{ "title": "EKS" }
```

`categories/aws/sections/08-ecr/meta.json`:
```json
{ "title": "ECR" }
```

`categories/aws/sections/09-elb/meta.json`:
```json
{ "title": "ELB / ALB" }
```

`categories/aws/sections/10-cloudwatch/meta.json`:
```json
{ "title": "CloudWatch" }
```

`categories/aws/sections/11-cloudformation/meta.json`:
```json
{ "title": "CloudFormation" }
```

- [ ] **Step 3: `src/data/sectionUrls.ts` に aws エントリを追加**

既存の `kustomize` ブロックの後に追記：

```ts
  aws: {
    '01-iam':            'https://docs.aws.amazon.com/IAM/latest/UserGuide/',
    '02-ec2':            'https://docs.aws.amazon.com/ec2/index.html',
    '03-s3':             'https://docs.aws.amazon.com/s3/index.html',
    '04-vpc':            'https://docs.aws.amazon.com/vpc/index.html',
    '05-rds':            'https://docs.aws.amazon.com/rds/index.html',
    '06-lambda':         'https://docs.aws.amazon.com/lambda/index.html',
    '07-eks':            'https://docs.aws.amazon.com/eks/index.html',
    '08-ecr':            'https://docs.aws.amazon.com/ecr/index.html',
    '09-elb':            'https://docs.aws.amazon.com/elasticloadbalancing/index.html',
    '10-cloudwatch':     'https://docs.aws.amazon.com/cloudwatch/index.html',
    '11-cloudformation': 'https://docs.aws.amazon.com/cloudformation/index.html',
  },
```

- [ ] **Step 4: コミット**

```bash
git add categories/aws/ src/data/sectionUrls.ts
git commit -m "feat: scaffold AWS category structure and section URLs"
```

---

### Task 2: IAM セクションデータ

**Files:**
- Create: `categories/aws/sections/01-iam/commands.json`
- Create: `categories/aws/sections/01-iam/knowledge.json`

- [ ] **Step 1: `categories/aws/sections/01-iam/commands.json` を作成**

```json
[
  {
    "name": "aws iam create-user",
    "description": "IAMユーザーを作成する",
    "syntax": "aws iam create-user --user-name <name>",
    "example": "aws iam create-user --user-name john-doe",
    "tags": ["iam", "user", "create"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/iam/create-user.html"
  },
  {
    "name": "aws iam list-users",
    "description": "IAMユーザーの一覧を取得する",
    "syntax": "aws iam list-users",
    "example": "aws iam list-users --query 'Users[].UserName'",
    "tags": ["iam", "user", "list"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/iam/list-users.html"
  },
  {
    "name": "aws iam create-role",
    "description": "IAMロールを作成する",
    "syntax": "aws iam create-role --role-name <name> --assume-role-policy-document file://<policy.json>",
    "example": "aws iam create-role --role-name MyRole --assume-role-policy-document file://trust-policy.json",
    "tags": ["iam", "role", "create"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/iam/create-role.html"
  },
  {
    "name": "aws iam attach-user-policy",
    "description": "IAMユーザーにマネージドポリシーをアタッチする",
    "syntax": "aws iam attach-user-policy --user-name <name> --policy-arn <arn>",
    "example": "aws iam attach-user-policy --user-name john-doe --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess",
    "tags": ["iam", "user", "policy"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/iam/attach-user-policy.html"
  },
  {
    "name": "aws iam attach-role-policy",
    "description": "IAMロールにマネージドポリシーをアタッチする",
    "syntax": "aws iam attach-role-policy --role-name <name> --policy-arn <arn>",
    "example": "aws iam attach-role-policy --role-name MyRole --policy-arn arn:aws:iam::aws:policy/AmazonEKSClusterPolicy",
    "tags": ["iam", "role", "policy"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/iam/attach-role-policy.html"
  },
  {
    "name": "aws iam create-access-key",
    "description": "IAMユーザーのアクセスキーを作成する",
    "syntax": "aws iam create-access-key --user-name <name>",
    "example": "aws iam create-access-key --user-name john-doe",
    "tags": ["iam", "access-key", "credentials"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/iam/create-access-key.html"
  },
  {
    "name": "aws iam get-user",
    "description": "IAMユーザーの詳細情報を取得する",
    "syntax": "aws iam get-user --user-name <name>",
    "example": "aws iam get-user --user-name john-doe",
    "tags": ["iam", "user", "get"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/iam/get-user.html"
  },
  {
    "name": "aws iam list-attached-user-policies",
    "description": "IAMユーザーにアタッチされたポリシー一覧を取得する",
    "syntax": "aws iam list-attached-user-policies --user-name <name>",
    "example": "aws iam list-attached-user-policies --user-name john-doe",
    "tags": ["iam", "user", "policy", "list"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/iam/list-attached-user-policies.html"
  }
]
```

- [ ] **Step 2: `categories/aws/sections/01-iam/knowledge.json` を作成**

```json
[
  {
    "title": "IAM（Identity and Access Management）とは",
    "body": "AWSリソースへのアクセスを安全に制御するためのサービス。**誰が（Authentication）** 何を **できるか（Authorization）** を定義する。\n\n主な構成要素：\n- **ユーザー** — 個人に対応するエンティティ\n- **グループ** — 複数ユーザーをまとめて管理\n- **ロール** — サービスや一時的なアクセスに使用\n- **ポリシー** — 許可/拒否するアクションを JSON で定義",
    "tags": ["iam", "overview", "security"],
    "url": "https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html"
  },
  {
    "title": "IAMポリシーとは",
    "body": "AWS リソースに対する許可・拒否を JSON で記述したドキュメント。\n\n```json\n{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Effect\": \"Allow\",\n      \"Action\": \"s3:GetObject\",\n      \"Resource\": \"arn:aws:s3:::my-bucket/*\"\n    }\n  ]\n}\n```\n\n種類：\n- **マネージドポリシー** — AWS 管理またはカスタム\n- **インラインポリシー** — ユーザー/グループ/ロールに直接埋め込む",
    "tags": ["iam", "policy"],
    "url": "https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html"
  },
  {
    "title": "IAMロールとは",
    "body": "特定のユーザーではなく、**一時的な権限**を付与するための仕組み。EC2 インスタンスや Lambda 関数など AWS サービスがリソースにアクセスする際に使用する。\n\n**信頼ポリシー（Trust Policy）** — 誰がこのロールを引き受けられるかを定義\n\n**ユースケース：**\n- EC2 インスタンスが S3 にアクセスする\n- Lambda が DynamoDB を読み書きする\n- 別の AWS アカウントからのアクセス許可（クロスアカウント）",
    "tags": ["iam", "role"],
    "url": "https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html"
  },
  {
    "title": "最小権限の原則（Principle of Least Privilege）",
    "body": "タスクを実行するために**必要最小限の権限のみ**を付与するセキュリティ原則。IAM 設計の基本。\n\n**実践方法：**\n- ワイルドカード（`*`）は避け、特定のリソース ARN を指定する\n- `Action` も最小限に絞る（`s3:*` より `s3:GetObject` が望ましい）\n- 定期的に IAM Access Analyzer で不要な権限を確認する\n- AWS マネージドポリシーより、カスタムポリシーで細かく制御する",
    "tags": ["iam", "security", "best-practice"],
    "url": "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html"
  }
]
```

- [ ] **Step 3: コミット**

```bash
git add categories/aws/sections/01-iam/
git commit -m "feat: add AWS IAM section data"
```

---

### Task 3: EC2 セクションデータ

**Files:**
- Create: `categories/aws/sections/02-ec2/commands.json`
- Create: `categories/aws/sections/02-ec2/knowledge.json`

- [ ] **Step 1: `categories/aws/sections/02-ec2/commands.json` を作成**

```json
[
  {
    "name": "aws ec2 describe-instances",
    "description": "EC2インスタンスの一覧と詳細情報を取得する",
    "syntax": "aws ec2 describe-instances [--filters <filters>] [--instance-ids <ids>]",
    "example": "aws ec2 describe-instances --filters 'Name=instance-state-name,Values=running'",
    "tags": ["ec2", "instance", "list"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/ec2/describe-instances.html"
  },
  {
    "name": "aws ec2 run-instances",
    "description": "新しいEC2インスタンスを起動する",
    "syntax": "aws ec2 run-instances --image-id <ami-id> --instance-type <type> --key-name <key> --count <n>",
    "example": "aws ec2 run-instances --image-id ami-0abcdef1234567890 --instance-type t3.micro --key-name my-key --count 1",
    "tags": ["ec2", "instance", "create"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/ec2/run-instances.html"
  },
  {
    "name": "aws ec2 stop-instances",
    "description": "実行中のEC2インスタンスを停止する（課金は一部継続）",
    "syntax": "aws ec2 stop-instances --instance-ids <id>",
    "example": "aws ec2 stop-instances --instance-ids i-1234567890abcdef0",
    "tags": ["ec2", "instance", "stop"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/ec2/stop-instances.html"
  },
  {
    "name": "aws ec2 start-instances",
    "description": "停止中のEC2インスタンスを起動する",
    "syntax": "aws ec2 start-instances --instance-ids <id>",
    "example": "aws ec2 start-instances --instance-ids i-1234567890abcdef0",
    "tags": ["ec2", "instance", "start"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/ec2/start-instances.html"
  },
  {
    "name": "aws ec2 terminate-instances",
    "description": "EC2インスタンスを終了（削除）する。この操作は取り消せない",
    "syntax": "aws ec2 terminate-instances --instance-ids <id>",
    "example": "aws ec2 terminate-instances --instance-ids i-1234567890abcdef0",
    "tags": ["ec2", "instance", "delete"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/ec2/terminate-instances.html"
  },
  {
    "name": "aws ec2 create-key-pair",
    "description": "EC2インスタンスへのSSH接続に使用するキーペアを作成する",
    "syntax": "aws ec2 create-key-pair --key-name <name> --query 'KeyMaterial' --output text > <file>.pem",
    "example": "aws ec2 create-key-pair --key-name my-key --query 'KeyMaterial' --output text > my-key.pem",
    "tags": ["ec2", "key-pair", "ssh"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/ec2/create-key-pair.html"
  },
  {
    "name": "aws ec2 describe-security-groups",
    "description": "セキュリティグループの一覧と設定を取得する",
    "syntax": "aws ec2 describe-security-groups [--group-ids <ids>]",
    "example": "aws ec2 describe-security-groups --group-ids sg-0123456789abcdef0",
    "tags": ["ec2", "security-group", "list"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/ec2/describe-security-groups.html"
  },
  {
    "name": "aws ec2 authorize-security-group-ingress",
    "description": "セキュリティグループにインバウンドルールを追加する",
    "syntax": "aws ec2 authorize-security-group-ingress --group-id <sg-id> --protocol <tcp|udp|icmp> --port <port> --cidr <cidr>",
    "example": "aws ec2 authorize-security-group-ingress --group-id sg-0123456789abcdef0 --protocol tcp --port 22 --cidr 0.0.0.0/0",
    "tags": ["ec2", "security-group", "inbound"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/ec2/authorize-security-group-ingress.html"
  }
]
```

- [ ] **Step 2: `categories/aws/sections/02-ec2/knowledge.json` を作成**

```json
[
  {
    "title": "EC2（Elastic Compute Cloud）とは",
    "body": "AWS が提供する仮想サーバーサービス。スペックや OS を選んで数分でサーバーを立ち上げられる。\n\n**特徴：**\n- 数百種類の **インスタンスタイプ** から用途に合ったスペックを選択\n- **従量課金** — 使用した時間分のみ課金\n- **AMI（Amazon Machine Image）** から OS・ソフトウェア構成を選択\n- 複数の **AZ（アベイラビリティゾーン）** に配置して可用性を高められる",
    "tags": ["ec2", "overview"],
    "url": "https://docs.aws.amazon.com/ec2/index.html"
  },
  {
    "title": "インスタンスタイプとは",
    "body": "CPU・メモリ・ネットワーク性能の組み合わせで定義されるサーバースペック。\n\n**命名規則：** `<ファミリー><世代>.<サイズ>`（例: `t3.micro`）\n\n| ファミリー | 用途 | 例 |\n|-----------|------|----|\n| t | バースト型（開発・低負荷） | t3.micro, t3.small |\n| m | 汎用 | m5.large, m6i.xlarge |\n| c | コンピューティング最適化 | c5.xlarge |\n| r | メモリ最適化 | r5.large |\n| p / g | GPU（機械学習） | p3.xlarge |",
    "tags": ["ec2", "instance-type"],
    "url": "https://docs.aws.amazon.com/ec2/latest/instancetypes/instance-types.html"
  },
  {
    "title": "AMI（Amazon Machine Image）とは",
    "body": "EC2 インスタンスを起動するためのテンプレート。OS・アプリケーション・設定が含まれる。\n\n**種類：**\n- **AWS 提供 AMI** — Amazon Linux, Ubuntu, Windows Server など\n- **AWS Marketplace AMI** — サードパーティが提供するソフトウェア入り\n- **カスタム AMI** — 自分で作成した AMI（既存インスタンスから作成可能）\n\nリージョンごとに AMI ID が異なる点に注意。",
    "tags": ["ec2", "ami"],
    "url": "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html"
  },
  {
    "title": "セキュリティグループとは",
    "body": "EC2 インスタンスへの通信を制御する**仮想ファイアウォール**。インバウンド（受信）とアウトバウンド（送信）のルールを設定する。\n\n**特徴：**\n- **ステートフル** — インバウンドを許可すると、そのレスポンスは自動で許可される\n- デフォルトは**全アウトバウンド許可・全インバウンド拒否**\n- 複数のインスタンスに同じセキュリティグループを適用可能\n- ポート・プロトコル・CIDR または別のセキュリティグループを指定できる",
    "tags": ["ec2", "security-group", "networking"],
    "url": "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-security-groups.html"
  }
]
```

- [ ] **Step 3: コミット**

```bash
git add categories/aws/sections/02-ec2/
git commit -m "feat: add AWS EC2 section data"
```

---

### Task 4: S3 セクションデータ

**Files:**
- Create: `categories/aws/sections/03-s3/commands.json`
- Create: `categories/aws/sections/03-s3/knowledge.json`

- [ ] **Step 1: `categories/aws/sections/03-s3/commands.json` を作成**

```json
[
  {
    "name": "aws s3 ls",
    "description": "バケット一覧またはバケット内のオブジェクト一覧を表示する",
    "syntax": "aws s3 ls [s3://<bucket>/<prefix>]",
    "example": "aws s3 ls s3://my-bucket/logs/",
    "tags": ["s3", "list", "bucket"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/s3/ls.html"
  },
  {
    "name": "aws s3 mb",
    "description": "新しいS3バケットを作成する",
    "syntax": "aws s3 mb s3://<bucket-name> [--region <region>]",
    "example": "aws s3 mb s3://my-unique-bucket-name --region ap-northeast-1",
    "tags": ["s3", "bucket", "create"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/s3/mb.html"
  },
  {
    "name": "aws s3 cp",
    "description": "ファイルをローカルとS3間、またはS3バケット間でコピーする",
    "syntax": "aws s3 cp <source> <destination> [--recursive]",
    "example": "aws s3 cp ./local-file.txt s3://my-bucket/uploads/",
    "tags": ["s3", "copy", "upload"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/s3/cp.html"
  },
  {
    "name": "aws s3 sync",
    "description": "ローカルディレクトリとS3バケットを同期する（差分のみ転送）",
    "syntax": "aws s3 sync <source> <destination> [--delete]",
    "example": "aws s3 sync ./dist/ s3://my-website-bucket/ --delete",
    "tags": ["s3", "sync", "upload"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/s3/sync.html"
  },
  {
    "name": "aws s3 rm",
    "description": "S3からオブジェクトを削除する",
    "syntax": "aws s3 rm s3://<bucket>/<key> [--recursive]",
    "example": "aws s3 rm s3://my-bucket/old-files/ --recursive",
    "tags": ["s3", "delete", "remove"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/s3/rm.html"
  },
  {
    "name": "aws s3api get-bucket-policy",
    "description": "バケットポリシーを取得する",
    "syntax": "aws s3api get-bucket-policy --bucket <bucket-name>",
    "example": "aws s3api get-bucket-policy --bucket my-bucket",
    "tags": ["s3", "policy", "bucket"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/s3api/get-bucket-policy.html"
  },
  {
    "name": "aws s3 presign",
    "description": "S3オブジェクトへの署名付き一時URLを生成する",
    "syntax": "aws s3 presign s3://<bucket>/<key> [--expires-in <seconds>]",
    "example": "aws s3 presign s3://my-bucket/secret-file.pdf --expires-in 3600",
    "tags": ["s3", "presign", "url"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/s3/presign.html"
  }
]
```

- [ ] **Step 2: `categories/aws/sections/03-s3/knowledge.json` を作成**

```json
[
  {
    "title": "S3（Simple Storage Service）とは",
    "body": "AWS のオブジェクトストレージサービス。ファイルを「バケット」に「オブジェクト」として保存する。\n\n**特徴：**\n- **無制限の容量** — 保存量に上限なし\n- **高い耐久性** — 11 ナイン（99.999999999%）の耐久性\n- **静的ウェブサイトホスティング** — HTML/CSS/JS をそのまま公開できる\n- **バージョニング** — オブジェクトの変更履歴を保持できる",
    "tags": ["s3", "overview"],
    "url": "https://docs.aws.amazon.com/s3/index.html"
  },
  {
    "title": "S3 バケットとオブジェクトとは",
    "body": "**バケット** — オブジェクトのコンテナ。グローバルに一意な名前が必要。リージョンに紐づく。\n\n**オブジェクト** — バケットに保存されるデータ。**キー（パス）** と **値（データ本体）** とメタデータで構成される。\n\n```\ns3://my-bucket/images/photo.jpg\n      ↑         ↑\n   バケット名    キー（パス）\n```\n\n1つのオブジェクトの最大サイズは 5TB。5GB を超える場合はマルチパートアップロードを使用する。",
    "tags": ["s3", "bucket", "object"],
    "url": "https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingObjects.html"
  },
  {
    "title": "S3 ストレージクラスとは",
    "body": "アクセス頻度やコストに応じてデータの保存方法を選択できる仕組み。\n\n| クラス | 用途 | 特徴 |\n|--------|------|------|\n| Standard | 頻繁にアクセス | 高可用性、デフォルト |\n| Intelligent-Tiering | アクセスパターン不明 | 自動でコスト最適化 |\n| Standard-IA | 低頻度アクセス | Standard より安いが取り出し料金あり |\n| Glacier | 長期アーカイブ | 非常に安いが取り出しに時間がかかる |\n| Glacier Deep Archive | 最長期保存 | 最安値、取り出しに最大12時間 |",
    "tags": ["s3", "storage-class", "cost"],
    "url": "https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html"
  }
]
```

- [ ] **Step 3: コミット**

```bash
git add categories/aws/sections/03-s3/
git commit -m "feat: add AWS S3 section data"
```

---

### Task 5: VPC セクションデータ

**Files:**
- Create: `categories/aws/sections/04-vpc/commands.json`
- Create: `categories/aws/sections/04-vpc/knowledge.json`

- [ ] **Step 1: `categories/aws/sections/04-vpc/commands.json` を作成**

```json
[
  {
    "name": "aws ec2 describe-vpcs",
    "description": "VPCの一覧と設定情報を取得する",
    "syntax": "aws ec2 describe-vpcs [--vpc-ids <ids>]",
    "example": "aws ec2 describe-vpcs --filters 'Name=isDefault,Values=false'",
    "tags": ["vpc", "list"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/ec2/describe-vpcs.html"
  },
  {
    "name": "aws ec2 create-vpc",
    "description": "新しいVPCを作成する",
    "syntax": "aws ec2 create-vpc --cidr-block <cidr>",
    "example": "aws ec2 create-vpc --cidr-block 10.0.0.0/16",
    "tags": ["vpc", "create"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/ec2/create-vpc.html"
  },
  {
    "name": "aws ec2 describe-subnets",
    "description": "サブネットの一覧と設定情報を取得する",
    "syntax": "aws ec2 describe-subnets [--filters <filters>]",
    "example": "aws ec2 describe-subnets --filters 'Name=vpc-id,Values=vpc-12345678'",
    "tags": ["vpc", "subnet", "list"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/ec2/describe-subnets.html"
  },
  {
    "name": "aws ec2 create-subnet",
    "description": "VPC内にサブネットを作成する",
    "syntax": "aws ec2 create-subnet --vpc-id <vpc-id> --cidr-block <cidr> --availability-zone <az>",
    "example": "aws ec2 create-subnet --vpc-id vpc-12345678 --cidr-block 10.0.1.0/24 --availability-zone ap-northeast-1a",
    "tags": ["vpc", "subnet", "create"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/ec2/create-subnet.html"
  },
  {
    "name": "aws ec2 create-internet-gateway",
    "description": "インターネットゲートウェイを作成する",
    "syntax": "aws ec2 create-internet-gateway",
    "example": "aws ec2 create-internet-gateway",
    "tags": ["vpc", "internet-gateway", "create"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/ec2/create-internet-gateway.html"
  },
  {
    "name": "aws ec2 attach-internet-gateway",
    "description": "インターネットゲートウェイをVPCにアタッチする",
    "syntax": "aws ec2 attach-internet-gateway --internet-gateway-id <igw-id> --vpc-id <vpc-id>",
    "example": "aws ec2 attach-internet-gateway --internet-gateway-id igw-12345678 --vpc-id vpc-12345678",
    "tags": ["vpc", "internet-gateway"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/ec2/attach-internet-gateway.html"
  },
  {
    "name": "aws ec2 describe-route-tables",
    "description": "ルートテーブルの一覧と設定を取得する",
    "syntax": "aws ec2 describe-route-tables [--filters <filters>]",
    "example": "aws ec2 describe-route-tables --filters 'Name=vpc-id,Values=vpc-12345678'",
    "tags": ["vpc", "route-table", "list"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/ec2/describe-route-tables.html"
  }
]
```

- [ ] **Step 2: `categories/aws/sections/04-vpc/knowledge.json` を作成**

```json
[
  {
    "title": "VPC（Virtual Private Cloud）とは",
    "body": "AWS クラウド内に構築する**論理的に分離されたプライベートネットワーク**。\n\n**特徴：**\n- CIDR ブロックで IP アドレス範囲を定義（例: `10.0.0.0/16`）\n- リージョン全体にまたがる\n- サブネット・ルートテーブル・ゲートウェイで構成\n- **デフォルト VPC** が各リージョンに 1 つ存在する",
    "tags": ["vpc", "overview", "networking"],
    "url": "https://docs.aws.amazon.com/vpc/index.html"
  },
  {
    "title": "パブリックサブネットとプライベートサブネット",
    "body": "**パブリックサブネット** — インターネットゲートウェイへのルートがあり、インターネットからアクセス可能。Web サーバーや ALB を配置する。\n\n**プライベートサブネット** — インターネットへの直接ルートがない。DB サーバーやアプリサーバーを配置する。外部へのアウトバウンド通信は **NAT ゲートウェイ** 経由。\n\n**推奨構成：**\n```\nパブリックサブネット: ALB, NAT Gateway, Bastion\nプライベートサブネット: EC2 App, RDS, EKS Nodes\n```",
    "tags": ["vpc", "subnet", "networking"],
    "url": "https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Scenario2.html"
  },
  {
    "title": "NAT ゲートウェイとは",
    "body": "プライベートサブネット内のリソースがインターネットへアウトバウンド通信するための**ネットワークアドレス変換**サービス。\n\n**特徴：**\n- パブリックサブネットに配置する\n- マネージドサービスで高可用性\n- **インバウンド通信は不可**（外部からプライベートサブネットへの直接通信は不可）\n- Elastic IP アドレスが割り当てられる\n- AZ ごとに作成を推奨（AZ 障害対策）",
    "tags": ["vpc", "nat-gateway", "networking"],
    "url": "https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html"
  }
]
```

- [ ] **Step 3: コミット**

```bash
git add categories/aws/sections/04-vpc/
git commit -m "feat: add AWS VPC section data"
```

---

### Task 6: RDS セクションデータ

**Files:**
- Create: `categories/aws/sections/05-rds/commands.json`
- Create: `categories/aws/sections/05-rds/knowledge.json`

- [ ] **Step 1: `categories/aws/sections/05-rds/commands.json` を作成**

```json
[
  {
    "name": "aws rds describe-db-instances",
    "description": "RDS DBインスタンスの一覧と詳細情報を取得する",
    "syntax": "aws rds describe-db-instances [--db-instance-identifier <id>]",
    "example": "aws rds describe-db-instances --db-instance-identifier mydb",
    "tags": ["rds", "instance", "list"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/rds/describe-db-instances.html"
  },
  {
    "name": "aws rds create-db-instance",
    "description": "新しいRDS DBインスタンスを作成する",
    "syntax": "aws rds create-db-instance --db-instance-identifier <id> --db-instance-class <class> --engine <engine> --master-username <user> --master-user-password <pass> --allocated-storage <gb>",
    "example": "aws rds create-db-instance --db-instance-identifier mydb --db-instance-class db.t3.micro --engine mysql --master-username admin --master-user-password secret --allocated-storage 20",
    "tags": ["rds", "instance", "create"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/rds/create-db-instance.html"
  },
  {
    "name": "aws rds stop-db-instance",
    "description": "RDS DBインスタンスを一時停止する（最大7日間）",
    "syntax": "aws rds stop-db-instance --db-instance-identifier <id>",
    "example": "aws rds stop-db-instance --db-instance-identifier mydb",
    "tags": ["rds", "instance", "stop"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/rds/stop-db-instance.html"
  },
  {
    "name": "aws rds create-db-snapshot",
    "description": "DBインスタンスの手動スナップショットを作成する",
    "syntax": "aws rds create-db-snapshot --db-instance-identifier <id> --db-snapshot-identifier <snapshot-id>",
    "example": "aws rds create-db-snapshot --db-instance-identifier mydb --db-snapshot-identifier mydb-snapshot-2026",
    "tags": ["rds", "snapshot", "backup"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/rds/create-db-snapshot.html"
  },
  {
    "name": "aws rds restore-db-instance-from-db-snapshot",
    "description": "スナップショットからDBインスタンスを復元する",
    "syntax": "aws rds restore-db-instance-from-db-snapshot --db-instance-identifier <new-id> --db-snapshot-identifier <snapshot-id>",
    "example": "aws rds restore-db-instance-from-db-snapshot --db-instance-identifier mydb-restored --db-snapshot-identifier mydb-snapshot-2026",
    "tags": ["rds", "snapshot", "restore"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/rds/restore-db-instance-from-db-snapshot.html"
  },
  {
    "name": "aws rds modify-db-instance",
    "description": "DBインスタンスの設定を変更する",
    "syntax": "aws rds modify-db-instance --db-instance-identifier <id> [--apply-immediately] [options]",
    "example": "aws rds modify-db-instance --db-instance-identifier mydb --db-instance-class db.t3.small --apply-immediately",
    "tags": ["rds", "instance", "modify"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/rds/modify-db-instance.html"
  }
]
```

- [ ] **Step 2: `categories/aws/sections/05-rds/knowledge.json` を作成**

```json
[
  {
    "title": "RDS（Relational Database Service）とは",
    "body": "AWS のマネージドリレーショナルデータベースサービス。OS パッチ・バックアップ・フェイルオーバーを AWS が管理する。\n\n**対応エンジン：**\n- MySQL / MariaDB\n- PostgreSQL\n- Oracle\n- SQL Server\n- Amazon Aurora（MySQL/PostgreSQL 互換の独自エンジン）\n\n**Aurora の特徴：** 通常の MySQL の最大 5 倍のスループット、ストレージの自動拡張",
    "tags": ["rds", "overview"],
    "url": "https://docs.aws.amazon.com/rds/index.html"
  },
  {
    "title": "Multi-AZ 配置とは",
    "body": "**異なるアベイラビリティゾーン（AZ）にスタンバイレプリカを配置**し、障害時に自動フェイルオーバーする機能。\n\n**特徴：**\n- プライマリとスタンバイは**同期レプリケーション**\n- フェイルオーバーは自動（通常 1〜2 分）\n- スタンバイは読み取りには使用できない（Read Replica とは異なる）\n- 本番環境では必須の設定\n\n**vs Read Replica：**\n- Multi-AZ → 可用性のため\n- Read Replica → 読み取りスケールのため",
    "tags": ["rds", "multi-az", "high-availability"],
    "url": "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html"
  },
  {
    "title": "RDS スナップショットとは",
    "body": "DBインスタンスの**ポイントインタイムバックアップ**。\n\n**自動スナップショット：** 毎日自動取得（保持期間: 1〜35日）\n**手動スナップショット：** 任意のタイミングで作成・永続保持\n\n**ユースケース：**\n- 本番データを別環境に復元してテスト\n- リージョン間コピーで DR 対策\n- 削除前の最終バックアップ",
    "tags": ["rds", "snapshot", "backup"],
    "url": "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_CreateSnapshot.html"
  }
]
```

- [ ] **Step 3: コミット**

```bash
git add categories/aws/sections/05-rds/
git commit -m "feat: add AWS RDS section data"
```

---

### Task 7: Lambda セクションデータ

**Files:**
- Create: `categories/aws/sections/06-lambda/commands.json`
- Create: `categories/aws/sections/06-lambda/knowledge.json`

- [ ] **Step 1: `categories/aws/sections/06-lambda/commands.json` を作成**

```json
[
  {
    "name": "aws lambda list-functions",
    "description": "Lambda関数の一覧を取得する",
    "syntax": "aws lambda list-functions",
    "example": "aws lambda list-functions --query 'Functions[].FunctionName'",
    "tags": ["lambda", "function", "list"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/lambda/list-functions.html"
  },
  {
    "name": "aws lambda invoke",
    "description": "Lambda関数を同期的に実行する",
    "syntax": "aws lambda invoke --function-name <name> [--payload <json>] <output-file>",
    "example": "aws lambda invoke --function-name my-function --payload '{\"key\":\"value\"}' response.json",
    "tags": ["lambda", "function", "invoke"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/lambda/invoke.html"
  },
  {
    "name": "aws lambda update-function-code",
    "description": "Lambda関数のコードをZIPファイルまたはS3から更新する",
    "syntax": "aws lambda update-function-code --function-name <name> --zip-file fileb://<file.zip>",
    "example": "aws lambda update-function-code --function-name my-function --zip-file fileb://function.zip",
    "tags": ["lambda", "function", "update", "deploy"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/lambda/update-function-code.html"
  },
  {
    "name": "aws lambda get-function",
    "description": "Lambda関数の設定と情報を取得する",
    "syntax": "aws lambda get-function --function-name <name>",
    "example": "aws lambda get-function --function-name my-function",
    "tags": ["lambda", "function", "get"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/lambda/get-function.html"
  },
  {
    "name": "aws lambda delete-function",
    "description": "Lambda関数を削除する",
    "syntax": "aws lambda delete-function --function-name <name>",
    "example": "aws lambda delete-function --function-name my-old-function",
    "tags": ["lambda", "function", "delete"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/lambda/delete-function.html"
  },
  {
    "name": "aws lambda update-function-configuration",
    "description": "Lambda関数のタイムアウト・メモリ・環境変数などを更新する",
    "syntax": "aws lambda update-function-configuration --function-name <name> [--timeout <sec>] [--memory-size <mb>]",
    "example": "aws lambda update-function-configuration --function-name my-function --timeout 30 --memory-size 512",
    "tags": ["lambda", "function", "configure"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/lambda/update-function-configuration.html"
  }
]
```

- [ ] **Step 2: `categories/aws/sections/06-lambda/knowledge.json` を作成**

```json
[
  {
    "title": "AWS Lambda とは",
    "body": "**サーバーレス**のコード実行サービス。サーバーの管理不要で、コードをアップロードして実行できる。イベント（HTTP リクエスト・S3 イベント・タイマーなど）をトリガーに実行される。\n\n**特徴：**\n- 使用した実行時間のみ課金（月 100 万リクエストまで無料）\n- 自動スケーリング\n- 対応ランタイム: Node.js, Python, Go, Java, .NET, Ruby\n- 最大タイムアウト: **15 分**\n- 最大メモリ: **10,240 MB**",
    "tags": ["lambda", "overview", "serverless"],
    "url": "https://docs.aws.amazon.com/lambda/index.html"
  },
  {
    "title": "Lambda ハンドラーとは",
    "body": "Lambda 関数のエントリポイントとなる関数。イベントとコンテキストを受け取り、処理結果を返す。\n\n**Python の例：**\n```python\ndef handler(event, context):\n    print(event)  # トリガーからのデータ\n    return {\n        'statusCode': 200,\n        'body': 'Hello World'\n    }\n```\n\n**event** — トリガーから渡されるデータ（API Gateway なら HTTP リクエスト情報）\n**context** — 実行環境の情報（残り実行時間など）",
    "tags": ["lambda", "handler", "code"],
    "url": "https://docs.aws.amazon.com/lambda/latest/dg/python-handler.html"
  },
  {
    "title": "Lambda レイヤーとは",
    "body": "複数の Lambda 関数で共有できる**ライブラリ・依存関係のパッケージ**。\n\n**メリット：**\n- 関数のデプロイパッケージを小さくできる\n- 共通ライブラリを一元管理できる\n- 1 関数に最大 5 つのレイヤーをアタッチ可能\n\n**構成：**\n```\nmy-layer.zip\n  └── python/\n        └── lib/\n              └── python3.x/\n                    └── site-packages/\n                          └── requests/\n```",
    "tags": ["lambda", "layer", "dependency"],
    "url": "https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html"
  }
]
```

- [ ] **Step 3: コミット**

```bash
git add categories/aws/sections/06-lambda/
git commit -m "feat: add AWS Lambda section data"
```

---

### Task 8: EKS セクションデータ

**Files:**
- Create: `categories/aws/sections/07-eks/commands.json`
- Create: `categories/aws/sections/07-eks/knowledge.json`

- [ ] **Step 1: `categories/aws/sections/07-eks/commands.json` を作成**

```json
[
  {
    "name": "aws eks list-clusters",
    "description": "EKSクラスターの一覧を取得する",
    "syntax": "aws eks list-clusters",
    "example": "aws eks list-clusters",
    "tags": ["eks", "cluster", "list"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/eks/list-clusters.html"
  },
  {
    "name": "aws eks describe-cluster",
    "description": "EKSクラスターの詳細情報を取得する",
    "syntax": "aws eks describe-cluster --name <cluster-name>",
    "example": "aws eks describe-cluster --name my-cluster",
    "tags": ["eks", "cluster", "describe"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/eks/describe-cluster.html"
  },
  {
    "name": "aws eks update-kubeconfig",
    "description": "EKSクラスターへ接続するための kubeconfig を更新する",
    "syntax": "aws eks update-kubeconfig --name <cluster-name> [--region <region>]",
    "example": "aws eks update-kubeconfig --name my-cluster --region ap-northeast-1",
    "tags": ["eks", "kubeconfig", "kubectl"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/eks/update-kubeconfig.html"
  },
  {
    "name": "aws eks list-nodegroups",
    "description": "EKSクラスターのノードグループ一覧を取得する",
    "syntax": "aws eks list-nodegroups --cluster-name <cluster-name>",
    "example": "aws eks list-nodegroups --cluster-name my-cluster",
    "tags": ["eks", "nodegroup", "list"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/eks/list-nodegroups.html"
  },
  {
    "name": "aws eks create-nodegroup",
    "description": "EKSクラスターにマネージドノードグループを作成する",
    "syntax": "aws eks create-nodegroup --cluster-name <cluster> --nodegroup-name <name> --node-role <iam-arn> --subnets <subnet-ids>",
    "example": "aws eks create-nodegroup --cluster-name my-cluster --nodegroup-name workers --node-role arn:aws:iam::123:role/NodeRole --subnets subnet-abc subnet-def",
    "tags": ["eks", "nodegroup", "create"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/eks/create-nodegroup.html"
  },
  {
    "name": "aws eks list-addons",
    "description": "EKSクラスターにインストールされているアドオン一覧を取得する",
    "syntax": "aws eks list-addons --cluster-name <cluster-name>",
    "example": "aws eks list-addons --cluster-name my-cluster",
    "tags": ["eks", "addon", "list"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/eks/list-addons.html"
  }
]
```

- [ ] **Step 2: `categories/aws/sections/07-eks/knowledge.json` を作成**

```json
[
  {
    "title": "EKS（Elastic Kubernetes Service）とは",
    "body": "AWS のマネージド Kubernetes サービス。Kubernetes コントロールプレーン（API Server・etcd）を AWS が管理する。\n\n**特徴：**\n- コントロールプレーンの高可用性を AWS が保証\n- AWS サービス（IAM・VPC・ALB・EBS）と深く統合\n- `kubectl` でそのまま操作できる\n- ワーカーノードの選択肢: **マネージドノードグループ** / **Fargate** / **セルフマネージド**",
    "tags": ["eks", "overview", "kubernetes"],
    "url": "https://docs.aws.amazon.com/eks/index.html"
  },
  {
    "title": "IRSA（IAM Roles for Service Accounts）とは",
    "body": "Kubernetes の **Service Account** に IAM ロールを紐づける仕組み。Pod が AWS サービス（S3・DynamoDB など）にアクセスする際に使用する。\n\n**仕組み：**\n1. IAM OIDC プロバイダーを EKS クラスターに関連付け\n2. IAM ロールの信頼ポリシーに Service Account を指定\n3. Pod の Service Account に IAM ロール ARN をアノテーションで指定\n\n**メリット：** ノード単位でなく Pod 単位で最小権限を付与できる",
    "tags": ["eks", "iam", "irsa", "security"],
    "url": "https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html"
  },
  {
    "title": "EKS マネージドノードグループとは",
    "body": "ワーカーノード（EC2 インスタンス）を AWS が管理する仕組み。ノードのプロビジョニング・更新・ドレインを自動化する。\n\n**特徴：**\n- Auto Scaling Group で管理\n- ノードの更新時はローリングアップデートを自動実施\n- On-Demand / Spot インスタンスを選択可能\n\n**vs Fargate：**\n- マネージドノードグループ → EC2 管理をある程度 AWS に任せる\n- Fargate → サーバーレスで Pod を実行（EC2 不要）",
    "tags": ["eks", "nodegroup", "ec2"],
    "url": "https://docs.aws.amazon.com/eks/latest/userguide/managed-node-groups.html"
  }
]
```

- [ ] **Step 3: コミット**

```bash
git add categories/aws/sections/07-eks/
git commit -m "feat: add AWS EKS section data"
```

---

### Task 9: ECR セクションデータ

**Files:**
- Create: `categories/aws/sections/08-ecr/commands.json`
- Create: `categories/aws/sections/08-ecr/knowledge.json`

- [ ] **Step 1: `categories/aws/sections/08-ecr/commands.json` を作成**

```json
[
  {
    "name": "aws ecr describe-repositories",
    "description": "ECRリポジトリの一覧と情報を取得する",
    "syntax": "aws ecr describe-repositories",
    "example": "aws ecr describe-repositories --query 'repositories[].repositoryName'",
    "tags": ["ecr", "repository", "list"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/ecr/describe-repositories.html"
  },
  {
    "name": "aws ecr create-repository",
    "description": "新しいECRリポジトリを作成する",
    "syntax": "aws ecr create-repository --repository-name <name>",
    "example": "aws ecr create-repository --repository-name my-app",
    "tags": ["ecr", "repository", "create"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/ecr/create-repository.html"
  },
  {
    "name": "aws ecr get-login-password",
    "description": "ECRへのdockerログイン用パスワードを取得する",
    "syntax": "aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com",
    "example": "aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.ap-northeast-1.amazonaws.com",
    "tags": ["ecr", "docker", "login", "push"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/ecr/get-login-password.html"
  },
  {
    "name": "aws ecr list-images",
    "description": "ECRリポジトリ内のイメージ一覧を取得する",
    "syntax": "aws ecr list-images --repository-name <name>",
    "example": "aws ecr list-images --repository-name my-app",
    "tags": ["ecr", "image", "list"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/ecr/list-images.html"
  },
  {
    "name": "aws ecr batch-delete-image",
    "description": "ECRリポジトリからイメージを一括削除する",
    "syntax": "aws ecr batch-delete-image --repository-name <name> --image-ids imageTag=<tag>",
    "example": "aws ecr batch-delete-image --repository-name my-app --image-ids imageTag=old-tag",
    "tags": ["ecr", "image", "delete"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/ecr/batch-delete-image.html"
  },
  {
    "name": "aws ecr put-lifecycle-policy",
    "description": "ECRリポジトリにライフサイクルポリシーを設定する（古いイメージの自動削除）",
    "syntax": "aws ecr put-lifecycle-policy --repository-name <name> --lifecycle-policy-text file://<policy.json>",
    "example": "aws ecr put-lifecycle-policy --repository-name my-app --lifecycle-policy-text file://lifecycle.json",
    "tags": ["ecr", "lifecycle", "cleanup"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/ecr/put-lifecycle-policy.html"
  }
]
```

- [ ] **Step 2: `categories/aws/sections/08-ecr/knowledge.json` を作成**

```json
[
  {
    "title": "ECR（Elastic Container Registry）とは",
    "body": "AWS のマネージドコンテナイメージレジストリ。Docker Hub のような存在だが、AWS IAM と統合しているため安全にイメージを管理できる。\n\n**特徴：**\n- プライベートリポジトリ（デフォルト）\n- イメージの脆弱性スキャン機能あり\n- EKS・ECS・Lambda と深く統合\n- ライフサイクルポリシーで古いイメージを自動削除",
    "tags": ["ecr", "overview", "docker"],
    "url": "https://docs.aws.amazon.com/ecr/index.html"
  },
  {
    "title": "ECR への Docker イメージ push 手順",
    "body": "```bash\n# 1. ECR にログイン\naws ecr get-login-password --region ap-northeast-1 \\\n  | docker login --username AWS --password-stdin \\\n    <ACCOUNT_ID>.dkr.ecr.ap-northeast-1.amazonaws.com\n\n# 2. イメージをビルド\ndocker build -t my-app .\n\n# 3. ECR 用にタグ付け\ndocker tag my-app:latest \\\n  <ACCOUNT_ID>.dkr.ecr.ap-northeast-1.amazonaws.com/my-app:latest\n\n# 4. push\ndocker push \\\n  <ACCOUNT_ID>.dkr.ecr.ap-northeast-1.amazonaws.com/my-app:latest\n```",
    "tags": ["ecr", "docker", "push"],
    "url": "https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html"
  },
  {
    "title": "ECR ライフサイクルポリシーとは",
    "body": "古いイメージを**自動的に削除**するルールを定義する機能。リポジトリのストレージコストを管理する。\n\n**例（直近 10 イメージ以外を削除）：**\n```json\n{\n  \"rules\": [{\n    \"rulePriority\": 1,\n    \"selection\": {\n      \"tagStatus\": \"any\",\n      \"countType\": \"imageCountMoreThan\",\n      \"countNumber\": 10\n    },\n    \"action\": { \"type\": \"expire\" }\n  }]\n}\n```",
    "tags": ["ecr", "lifecycle", "cost"],
    "url": "https://docs.aws.amazon.com/AmazonECR/latest/userguide/LifecyclePolicies.html"
  }
]
```

- [ ] **Step 3: コミット**

```bash
git add categories/aws/sections/08-ecr/
git commit -m "feat: add AWS ECR section data"
```

---

### Task 10: ELB セクションデータ

**Files:**
- Create: `categories/aws/sections/09-elb/commands.json`
- Create: `categories/aws/sections/09-elb/knowledge.json`

- [ ] **Step 1: `categories/aws/sections/09-elb/commands.json` を作成**

```json
[
  {
    "name": "aws elbv2 describe-load-balancers",
    "description": "ロードバランサーの一覧と詳細情報を取得する",
    "syntax": "aws elbv2 describe-load-balancers",
    "example": "aws elbv2 describe-load-balancers --query 'LoadBalancers[].DNSName'",
    "tags": ["elb", "alb", "list"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/elbv2/describe-load-balancers.html"
  },
  {
    "name": "aws elbv2 create-load-balancer",
    "description": "ALB（Application Load Balancer）またはNLBを作成する",
    "syntax": "aws elbv2 create-load-balancer --name <name> --subnets <subnet-ids> --type <application|network>",
    "example": "aws elbv2 create-load-balancer --name my-alb --subnets subnet-abc subnet-def --type application",
    "tags": ["elb", "alb", "create"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/elbv2/create-load-balancer.html"
  },
  {
    "name": "aws elbv2 create-target-group",
    "description": "ターゲットグループを作成する（ルーティング先のグループ）",
    "syntax": "aws elbv2 create-target-group --name <name> --protocol <HTTP|HTTPS> --port <port> --vpc-id <vpc-id>",
    "example": "aws elbv2 create-target-group --name my-targets --protocol HTTP --port 80 --vpc-id vpc-12345678",
    "tags": ["elb", "target-group", "create"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/elbv2/create-target-group.html"
  },
  {
    "name": "aws elbv2 register-targets",
    "description": "ターゲットグループにEC2インスタンスを登録する",
    "syntax": "aws elbv2 register-targets --target-group-arn <arn> --targets Id=<instance-id>",
    "example": "aws elbv2 register-targets --target-group-arn arn:aws:... --targets Id=i-1234567890abcdef0",
    "tags": ["elb", "target-group", "register"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/elbv2/register-targets.html"
  },
  {
    "name": "aws elbv2 create-listener",
    "description": "ロードバランサーにリスナー（受信ルール）を作成する",
    "syntax": "aws elbv2 create-listener --load-balancer-arn <arn> --protocol <HTTP|HTTPS> --port <port> --default-actions Type=forward,TargetGroupArn=<tg-arn>",
    "example": "aws elbv2 create-listener --load-balancer-arn arn:aws:... --protocol HTTP --port 80 --default-actions Type=forward,TargetGroupArn=arn:aws:...",
    "tags": ["elb", "listener", "create"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/elbv2/create-listener.html"
  },
  {
    "name": "aws elbv2 describe-target-health",
    "description": "ターゲットグループ内のターゲットのヘルス状態を確認する",
    "syntax": "aws elbv2 describe-target-health --target-group-arn <arn>",
    "example": "aws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:...",
    "tags": ["elb", "target-group", "health"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/elbv2/describe-target-health.html"
  }
]
```

- [ ] **Step 2: `categories/aws/sections/09-elb/knowledge.json` を作成**

```json
[
  {
    "title": "ELB（Elastic Load Balancing）の種類",
    "body": "AWS には 3 種類のロードバランサーがある。\n\n| 種類 | レイヤー | 用途 |\n|------|---------|------|\n| **ALB**（Application） | L7 | HTTP/HTTPS のパスベース・ホストベースルーティング |\n| **NLB**（Network） | L4 | TCP/UDP の超低レイテンシ・固定 IP |\n| **CLB**（Classic） | L4/L7 | 旧世代、新規利用非推奨 |\n\n**現在の推奨：**\n- Web アプリ・API → ALB\n- 低レイテンシ・固定 IP が必要 → NLB",
    "tags": ["elb", "alb", "nlb", "overview"],
    "url": "https://docs.aws.amazon.com/elasticloadbalancing/index.html"
  },
  {
    "title": "ALB のルーティングルールとは",
    "body": "ALB は L7（アプリケーション層）でルーティングを行う。リクエストの内容に応じてターゲットを振り分けられる。\n\n**パスベースルーティング：**\n- `/api/*` → API サーバーのターゲットグループ\n- `/static/*` → S3 のターゲットグループ\n\n**ホストベースルーティング：**\n- `api.example.com` → API ターゲットグループ\n- `www.example.com` → Web ターゲットグループ\n\n**固定レスポンス：** メンテナンスページを返す",
    "tags": ["elb", "alb", "routing"],
    "url": "https://docs.aws.amazon.com/elasticloadbalancing/latest/application/listener-update-rules.html"
  },
  {
    "title": "ターゲットグループとヘルスチェック",
    "body": "**ターゲットグループ** — ロードバランサーがリクエストを転送するターゲットの集合（EC2・Lambda・IP アドレス）。\n\n**ヘルスチェック** — 定期的にターゲットの死活確認を行う。失敗したターゲットはルーティング対象から外れる。\n\n設定項目：\n- **プロトコル・パス** — `HTTP /health`\n- **チェック間隔** — デフォルト 30 秒\n- **閾値** — 何回連続成功/失敗で healthy/unhealthy にするか",
    "tags": ["elb", "target-group", "health-check"],
    "url": "https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-health-checks.html"
  }
]
```

- [ ] **Step 3: コミット**

```bash
git add categories/aws/sections/09-elb/
git commit -m "feat: add AWS ELB section data"
```

---

### Task 11: CloudWatch セクションデータ

**Files:**
- Create: `categories/aws/sections/10-cloudwatch/commands.json`
- Create: `categories/aws/sections/10-cloudwatch/knowledge.json`

- [ ] **Step 1: `categories/aws/sections/10-cloudwatch/commands.json` を作成**

```json
[
  {
    "name": "aws cloudwatch list-metrics",
    "description": "CloudWatchメトリクスの一覧を取得する",
    "syntax": "aws cloudwatch list-metrics [--namespace <namespace>]",
    "example": "aws cloudwatch list-metrics --namespace AWS/EC2",
    "tags": ["cloudwatch", "metrics", "list"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/cloudwatch/list-metrics.html"
  },
  {
    "name": "aws cloudwatch get-metric-statistics",
    "description": "指定期間のCloudWatchメトリクス統計を取得する",
    "syntax": "aws cloudwatch get-metric-statistics --namespace <ns> --metric-name <name> --start-time <time> --end-time <time> --period <sec> --statistics <stat>",
    "example": "aws cloudwatch get-metric-statistics --namespace AWS/EC2 --metric-name CPUUtilization --start-time 2024-01-01T00:00:00 --end-time 2024-01-01T01:00:00 --period 3600 --statistics Average",
    "tags": ["cloudwatch", "metrics", "statistics"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/cloudwatch/get-metric-statistics.html"
  },
  {
    "name": "aws cloudwatch put-metric-alarm",
    "description": "CloudWatchアラームを作成・更新する",
    "syntax": "aws cloudwatch put-metric-alarm --alarm-name <name> --namespace <ns> --metric-name <name> --threshold <value> --comparison-operator <op> --evaluation-periods <n> --period <sec> --statistic <stat> --alarm-actions <arn>",
    "example": "aws cloudwatch put-metric-alarm --alarm-name HighCPU --namespace AWS/EC2 --metric-name CPUUtilization --threshold 80 --comparison-operator GreaterThanThreshold --evaluation-periods 2 --period 300 --statistic Average",
    "tags": ["cloudwatch", "alarm", "create"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/cloudwatch/put-metric-alarm.html"
  },
  {
    "name": "aws logs describe-log-groups",
    "description": "CloudWatch Logsのロググループ一覧を取得する",
    "syntax": "aws logs describe-log-groups [--log-group-name-prefix <prefix>]",
    "example": "aws logs describe-log-groups --log-group-name-prefix /aws/lambda/",
    "tags": ["cloudwatch", "logs", "log-group"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/logs/describe-log-groups.html"
  },
  {
    "name": "aws logs get-log-events",
    "description": "ログストリームからログイベントを取得する",
    "syntax": "aws logs get-log-events --log-group-name <group> --log-stream-name <stream>",
    "example": "aws logs get-log-events --log-group-name /aws/lambda/my-function --log-stream-name '2024/01/01/[$LATEST]abc123'",
    "tags": ["cloudwatch", "logs", "get"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/logs/get-log-events.html"
  },
  {
    "name": "aws logs filter-log-events",
    "description": "ロググループのログをフィルタリングして検索する",
    "syntax": "aws logs filter-log-events --log-group-name <group> --filter-pattern <pattern>",
    "example": "aws logs filter-log-events --log-group-name /aws/lambda/my-function --filter-pattern 'ERROR'",
    "tags": ["cloudwatch", "logs", "filter", "search"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/logs/filter-log-events.html"
  }
]
```

- [ ] **Step 2: `categories/aws/sections/10-cloudwatch/knowledge.json` を作成**

```json
[
  {
    "title": "CloudWatch とは",
    "body": "AWS リソースとアプリケーションの**監視・観測**サービス。メトリクス・ログ・アラームを一元管理する。\n\n**主な機能：**\n- **メトリクス** — CPU 使用率・リクエスト数などの時系列データ\n- **Logs** — アプリケーション・サービスのログ収集と検索\n- **アラーム** — 閾値を超えたら SNS 通知や Auto Scaling をトリガー\n- **ダッシュボード** — メトリクスを可視化するカスタム画面\n- **Logs Insights** — ログをクエリ言語で分析",
    "tags": ["cloudwatch", "overview", "monitoring"],
    "url": "https://docs.aws.amazon.com/cloudwatch/index.html"
  },
  {
    "title": "CloudWatch メトリクスとアラームの仕組み",
    "body": "**メトリクス** — AWS サービスが自動で収集する時系列データ。ネームスペース・ディメンションで分類される。\n\n例: `AWS/EC2` ネームスペースの `CPUUtilization` メトリクス\n\n**アラームの状態：**\n- `OK` — 閾値以内\n- `ALARM` — 閾値を超えた状態が評価期間を満たした\n- `INSUFFICIENT_DATA` — データが不足\n\n**アクション** — ALARM 時に SNS トピック通知・EC2 アクション・Lambda 実行などを設定できる",
    "tags": ["cloudwatch", "metrics", "alarm"],
    "url": "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html"
  },
  {
    "title": "CloudWatch Logs Insights とは",
    "body": "ロググループのデータをインタラクティブに**クエリ・分析**できる機能。\n\n**クエリ例：**\n```\n# エラーログを最新10件取得\nfields @timestamp, @message\n| filter @message like /ERROR/\n| sort @timestamp desc\n| limit 10\n```\n\n**主なコマンド：**\n- `fields` — 表示するフィールドを選択\n- `filter` — 条件でフィルタリング\n- `stats` — 集計（`count()`, `avg()`, `sum()`）\n- `sort` — ソート\n- `limit` — 件数制限",
    "tags": ["cloudwatch", "logs", "insights", "query"],
    "url": "https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html"
  }
]
```

- [ ] **Step 3: コミット**

```bash
git add categories/aws/sections/10-cloudwatch/
git commit -m "feat: add AWS CloudWatch section data"
```

---

### Task 12: CloudFormation セクションデータ

**Files:**
- Create: `categories/aws/sections/11-cloudformation/commands.json`
- Create: `categories/aws/sections/11-cloudformation/knowledge.json`

- [ ] **Step 1: `categories/aws/sections/11-cloudformation/commands.json` を作成**

```json
[
  {
    "name": "aws cloudformation list-stacks",
    "description": "CloudFormationスタックの一覧を取得する",
    "syntax": "aws cloudformation list-stacks [--stack-status-filter <status>]",
    "example": "aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE",
    "tags": ["cloudformation", "stack", "list"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/cloudformation/list-stacks.html"
  },
  {
    "name": "aws cloudformation create-stack",
    "description": "CloudFormationスタックを作成する",
    "syntax": "aws cloudformation create-stack --stack-name <name> --template-body file://<template.yaml> [--parameters <params>]",
    "example": "aws cloudformation create-stack --stack-name my-stack --template-body file://template.yaml --parameters ParameterKey=Env,ParameterValue=prod",
    "tags": ["cloudformation", "stack", "create"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/cloudformation/create-stack.html"
  },
  {
    "name": "aws cloudformation update-stack",
    "description": "既存のCloudFormationスタックを更新する",
    "syntax": "aws cloudformation update-stack --stack-name <name> --template-body file://<template.yaml>",
    "example": "aws cloudformation update-stack --stack-name my-stack --template-body file://template.yaml",
    "tags": ["cloudformation", "stack", "update"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/cloudformation/update-stack.html"
  },
  {
    "name": "aws cloudformation delete-stack",
    "description": "CloudFormationスタックと作成したリソースを削除する",
    "syntax": "aws cloudformation delete-stack --stack-name <name>",
    "example": "aws cloudformation delete-stack --stack-name my-stack",
    "tags": ["cloudformation", "stack", "delete"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/cloudformation/delete-stack.html"
  },
  {
    "name": "aws cloudformation describe-stack-events",
    "description": "スタックのイベント履歴を取得する（デプロイ状況の確認）",
    "syntax": "aws cloudformation describe-stack-events --stack-name <name>",
    "example": "aws cloudformation describe-stack-events --stack-name my-stack --query 'StackEvents[].{Status:ResourceStatus,Resource:LogicalResourceId}'",
    "tags": ["cloudformation", "stack", "events"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/cloudformation/describe-stack-events.html"
  },
  {
    "name": "aws cloudformation validate-template",
    "description": "CloudFormationテンプレートの構文を検証する",
    "syntax": "aws cloudformation validate-template --template-body file://<template.yaml>",
    "example": "aws cloudformation validate-template --template-body file://template.yaml",
    "tags": ["cloudformation", "template", "validate"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/cloudformation/validate-template.html"
  },
  {
    "name": "aws cloudformation create-change-set",
    "description": "スタックへの変更内容を事前に確認するチェンジセットを作成する",
    "syntax": "aws cloudformation create-change-set --stack-name <name> --change-set-name <cs-name> --template-body file://<template.yaml>",
    "example": "aws cloudformation create-change-set --stack-name my-stack --change-set-name my-changes --template-body file://template.yaml",
    "tags": ["cloudformation", "change-set", "preview"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/cloudformation/create-change-set.html"
  }
]
```

- [ ] **Step 2: `categories/aws/sections/11-cloudformation/knowledge.json` を作成**

```json
[
  {
    "title": "CloudFormation とは",
    "body": "AWS リソースを**テンプレート（YAML/JSON）**で定義し、インフラを自動的にプロビジョニング・管理するサービス（Infrastructure as Code）。\n\n**メリット：**\n- インフラをコードとして管理（バージョン管理・レビュー可能）\n- 繰り返し同じ構成を再現できる\n- 依存関係を自動解決してリソースを作成\n- スタック削除で作成したリソースを一括削除",
    "tags": ["cloudformation", "overview", "iac"],
    "url": "https://docs.aws.amazon.com/cloudformation/index.html"
  },
  {
    "title": "CloudFormation テンプレートの構造",
    "body": "```yaml\nAWSTemplateFormatVersion: '2010-09-09'\nDescription: My Stack\n\nParameters:  # 入力パラメータ\n  EnvName:\n    Type: String\n    Default: dev\n\nResources:   # 作成するリソース（必須）\n  MyBucket:\n    Type: AWS::S3::Bucket\n    Properties:\n      BucketName: !Sub '${EnvName}-my-bucket'\n\nOutputs:     # スタックの出力値\n  BucketName:\n    Value: !Ref MyBucket\n```\n\n**主要セクション：** Parameters / Resources / Outputs / Mappings / Conditions",
    "tags": ["cloudformation", "template", "yaml"],
    "url": "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-anatomy.html"
  },
  {
    "title": "チェンジセットとは",
    "body": "スタックを**実際に更新する前に変更内容をプレビュー**する機能。\n\n**フロー：**\n1. `create-change-set` — 変更セットを作成\n2. `describe-change-set` — 変更内容を確認（追加・変更・削除されるリソース）\n3. `execute-change-set` — 問題なければ実行\n\n**重要な変更種別：**\n- `Add` — 新規リソース作成\n- `Modify` — 既存リソース更新（`Replacement: True` の場合はリソース再作成 → ダウンタイムに注意）\n- `Remove` — リソース削除",
    "tags": ["cloudformation", "change-set", "deployment"],
    "url": "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets.html"
  }
]
```

- [ ] **Step 3: 全セクション確認 & 最終コミット**

```bash
git add categories/aws/sections/11-cloudformation/
git commit -m "feat: add AWS CloudFormation section data"
```

全セクション作成後にディレクトリ構成を確認：

```bash
find categories/aws -name "*.json" | sort
```

Expected 出力（24 ファイル）：
```
categories/aws/meta.json
categories/aws/sections/01-iam/commands.json
categories/aws/sections/01-iam/knowledge.json
categories/aws/sections/01-iam/meta.json
...（11セクション × 3ファイル = 33ファイル + meta.json = 34ファイル）
```

アプリを起動してサイドバーに「AWS」カテゴリが表示され、各セクションのコマンド・ナレッジが表示されることを確認する。
