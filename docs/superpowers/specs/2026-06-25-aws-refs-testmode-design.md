# AWS Section + 参考リンク + テストモード 設計スペック

Date: 2026-06-25

## Overview

3つの機能を追加する：
1. **AWSセクション** — AWS を新カテゴリとして追加（11セクション）
2. **参考リンク（refs）** — Knowledge/Command に公式ドキュメント以外のリンクを複数追加できる
3. **フラッシュカード テストモード** — フリップカードを廃止し、テスト用紙＋AI採点に刷新

---

## Feature 1: 参考リンク（refs）

### データモデル

`commands` および `knowledge` テーブルに以下のカラムを追加する：

```sql
ALTER TABLE commands  ADD COLUMN refs TEXT NOT NULL DEFAULT '[]';
ALTER TABLE knowledge ADD COLUMN refs TEXT NOT NULL DEFAULT '[]';
```

型定義（TypeScript）：
```ts
interface RefLink {
  label: string  // 自由入力（例: "Qiita記事", "わかりやすい解説"）
  url: string
}

// Command / Knowledge に追加
refs: RefLink[]
```

### 既存 `url` フィールドとの関係

- `url` は「公式ドキュメント」として引き続き独立して存在する
- `refs` は公式ドキュメント以外の参考リンクを自由に追加するフィールド
- 統合しない（分離）

### UI変更

**編集フォーム（KnowledgeForm / CommandForm）**
- 「参考リンク」セクションを追加
- {ラベル入力} + {URL入力} のペアを行として表示
- `+追加` ボタンで行を増やせる
- 各行に `×` ボタンで削除できる
- ラベル・URLは任意入力（バリデーションなし）

**詳細モーダル（KnowledgeDetail / CommandDetail）**
- 公式ドキュメントボタン（既存）の下に `refs` のリンクボタンを一覧表示
- 各ボタンに label を表示し、クリックで `shell.openExternal(url)` を呼ぶ
- `refs` が空の場合は何も表示しない

### IPC変更

- `knowledge.create` / `knowledge.update`: `refs` フィールドを受け取りJSONとして保存
- `commands.create` / `commands.update`: 同上

---

## Feature 2: AWSセクション

### ディレクトリ構成

```
categories/aws/
  meta.json              { "name": "AWS", "icon": "Cloud" }
  sections/
    01-iam/
      meta.json          { "title": "IAM" }
      commands.json
      knowledge.json
    02-ec2/
    03-s3/
    04-vpc/
    05-rds/
    06-lambda/
    07-eks/
    08-ecr/
    09-elb/
    10-cloudwatch/
    11-cloudformation/
```

### セクション一覧

| slug | タイトル | 内容 |
|------|---------|------|
| 01-iam | IAM | ユーザー・ロール・ポリシー管理 |
| 02-ec2 | EC2 | インスタンス・AMI・セキュリティグループ |
| 03-s3 | S3 | バケット・オブジェクト・アクセス制御 |
| 04-vpc | VPC | サブネット・ルートテーブル・ゲートウェイ |
| 05-rds | RDS | DBインスタンス・スナップショット |
| 06-lambda | Lambda | 関数・レイヤー・トリガー |
| 07-eks | EKS | クラスター・ノードグループ・kubectl連携 |
| 08-ecr | ECR | リポジトリ・push/pull・ライフサイクル |
| 09-elb | ELB/ALB | ロードバランサー・ターゲットグループ |
| 10-cloudwatch | CloudWatch | メトリクス・ログ・アラーム |
| 11-cloudformation | CloudFormation | スタック・テンプレート・チェンジセット |

### sectionUrls.ts

`aws` エントリを追加。各セクションに AWS 公式ドキュメントの URL を設定。

### データ形式

既存カテゴリと同じ JSON 形式：

```json
// commands.json
[
  {
    "name": "aws iam list-users",
    "description": "IAMユーザーの一覧を取得する",
    "syntax": "aws iam list-users [--max-items <n>]",
    "example": "aws iam list-users --max-items 10",
    "tags": ["iam", "users", "list"],
    "url": "https://docs.aws.amazon.com/cli/latest/reference/iam/list-users.html"
  }
]

// knowledge.json
[
  {
    "title": "IAM ロールとは",
    "body": "...",
    "tags": ["iam", "role"],
    "url": "https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html"
  }
]
```

---

## Feature 3: フラッシュカード テストモード

### 概要

現在のフリップカード（FlashCard.tsx / FlashcardView.tsx）を廃止し、テスト用紙 + AI採点スタイルに全面刷新する。

### フロー

```
① テスト画面（TestView）
   ↓ 「AIで採点する」ボタン
② ローディング（Ollamaへリクエスト中）
   ↓
③ 採点結果画面（TestResultView）
   ↓ 「もう一度」
① テスト画面（リセット）
```

### テスト画面（TestView.tsx）

- 全問題をスクロール可能なリストで表示
- フィルター（全件 / 未学習 / 学習中）は既存のまま
- 問題タイプ別表示：

| タイプ | 表示 |
|--------|------|
| Command | コマンド名（monospace）+ 「このコマンドの説明を書いてください」+ textarea |
| Knowledge（穴埋め） | 穴埋め文 + inline テキスト入力（既存ClozeQuestionコンポーネント流用） |
| Knowledge（自由記述） | タイトル + 「この概念を説明してください」+ textarea |

- 下部に「AIで採点する」ボタン（MUIスタイル）
- Ollamaが未起動の場合はボタンを disabled + 警告表示

### 採点結果画面（TestResultView.tsx）

- 上部：スコア表示（例: 7 / 10）
- 各問題：
  - verdict バッジ（正解🟢 / 部分点🟡 / 不正解🔴）
  - ユーザーの回答
  - AI一言コメント
  - 正解（模範解答）
- 下部：「もう一度」ボタン

### バックエンド（IPC）

新規 `ai.gradeAnswers()` を追加：

```ts
// 入力
interface GradeRequest {
  type: 'command' | 'knowledge'
  id: number
  question: string      // 問題文
  userAnswer: string    // ユーザーの回答
  correctAnswer: string // 正解（description / body / cloze.a）
}

// 出力
interface GradeResult {
  id: number
  verdict: 'correct' | 'partial' | 'incorrect'
  comment: string       // AI一言コメント（日本語）
  correctAnswer: string
}
```

Ollama へのプロンプト：JSON形式で verdict + comment を返すよう指示。

### progress 自動更新

| verdict | progress |
|---------|---------|
| correct | `done` |
| partial | `learning` |
| incorrect | `learning` |

### 既存ファイルへの影響

- `FlashcardView.tsx` → `TestView.tsx` に置き換え
- `FlashCard.tsx` → 廃止
- `electron/ipc/ai.ts` → `gradeAnswers` ハンドラー追加
- `electron/preload.ts` → `ai.gradeAnswers` を window.api に公開
- `src/types/index.ts` → `RefLink` 型 / `refs` フィールド追加 / `GradeRequest` / `GradeResult` 追加 / `IpcApi.ai` に `gradeAnswers` を追加
- `electron/db/migrate.ts` → `refs` カラム追加マイグレーション
- `src/data/sectionUrls.ts` → `aws` エントリ追加

---

## 実装対象外

- タイマー機能
- AWS データの手動編集（isCustom=false のため削除不可、既存ルール通り）
- テストの問題数上限・ページング（スクロールで対応）
