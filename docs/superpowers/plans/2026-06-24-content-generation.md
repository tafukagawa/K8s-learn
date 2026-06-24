# 自動コンテンツ生成 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** GitHub Actions で週次に公式ドキュメントから k8s/docker/helm/argocd/kustomize のコマンド・ナレッジ JSON を自動生成し、リポジトリに直接コミットする。

**Architecture:** GitHub Actions の cron で `.github/scripts/generate-content.ts` を実行。公式ドキュメントページを fetch し、GitHub Models (gpt-4o-mini) で JSON を生成。既存エントリと dedup して `categories/**/*.json` に追記。ログを `logs/content-generation/` に出力後、git commit & push。

**Tech Stack:** TypeScript, tsx, openai (npm), GitHub Models (gpt-4o-mini), GitHub Actions

---

## Task 1: 生成スクリプト本体

**Files:**
- Create: `.github/scripts/generate-content.ts`
- Create: `logs/content-generation/.gitkeep`

- [ ] **Step 1: ログディレクトリを作成する**

```bash
mkdir -p .github/scripts logs/content-generation
touch logs/content-generation/.gitkeep
```

- [ ] **Step 2: openai パッケージを確認・追加する**

```bash
npm ls openai 2>/dev/null || npm install openai
```

- [ ] **Step 3: generate-content.ts を作成する**

```ts
// .github/scripts/generate-content.ts
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

const client = new OpenAI({
  baseURL: 'https://models.inference.ai.azure.com',
  apiKey: process.env.GITHUB_TOKEN,
})

interface RawCommand {
  name: string
  description: string
  syntax: string
  example: string
  tags: string[]
  url: string
}

interface RawKnowledge {
  title: string
  body: string
  tags: string[]
  url: string
}

interface Source {
  category: string
  section: string
  url: string
  type: 'commands' | 'knowledge' | 'both'
}

const SOURCES: Source[] = [
  { category: 'k8s', section: '01-pod-management',      url: 'https://kubernetes.io/docs/reference/kubectl/cheatsheet/',                                  type: 'both' },
  { category: 'k8s', section: '02-deployment',           url: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/',                      type: 'both' },
  { category: 'k8s', section: '03-service-networking',   url: 'https://kubernetes.io/docs/concepts/services-networking/service/',                           type: 'both' },
  { category: 'k8s', section: '04-config-secret',        url: 'https://kubernetes.io/docs/concepts/configuration/configmap/',                               type: 'both' },
  { category: 'k8s', section: '05-storage',              url: 'https://kubernetes.io/docs/concepts/storage/persistent-volumes/',                            type: 'both' },
  { category: 'k8s', section: '06-observability',        url: 'https://kubernetes.io/docs/tasks/debug/debug-application/',                                  type: 'both' },
  { category: 'docker', section: '01-image',             url: 'https://docs.docker.com/reference/cli/docker/image/',                                        type: 'commands' },
  { category: 'docker', section: '02-container',         url: 'https://docs.docker.com/reference/cli/docker/container/',                                    type: 'commands' },
  { category: 'docker', section: '03-network-volume',    url: 'https://docs.docker.com/reference/cli/docker/network/',                                      type: 'commands' },
  { category: 'docker', section: '04-compose',           url: 'https://docs.docker.com/reference/cli/docker/compose/',                                      type: 'commands' },
  { category: 'helm', section: '01-chart-management',    url: 'https://helm.sh/docs/helm/helm_install/',                                                    type: 'both' },
  { category: 'helm', section: '02-repository',          url: 'https://helm.sh/docs/helm/helm_repo/',                                                       type: 'both' },
  { category: 'helm', section: '03-release-management',  url: 'https://helm.sh/docs/helm/helm_upgrade/',                                                    type: 'both' },
  { category: 'helm', section: '04-templating',          url: 'https://helm.sh/docs/helm/helm_template/',                                                   type: 'both' },
  { category: 'argocd', section: '01-app-management',    url: 'https://argo-cd.readthedocs.io/en/stable/user-guide/app-overview/',                          type: 'both' },
  { category: 'argocd', section: '02-sync-operations',   url: 'https://argo-cd.readthedocs.io/en/stable/user-guide/sync-flags/',                            type: 'both' },
  { category: 'argocd', section: '03-repo-cluster',      url: 'https://argo-cd.readthedocs.io/en/stable/user-guide/private-repositories/',                  type: 'both' },
  { category: 'kustomize', section: '01-base-overlay',   url: 'https://kubectl.docs.kubernetes.io/references/kustomize/glossary/',                          type: 'both' },
  { category: 'kustomize', section: '02-generators',     url: 'https://kubectl.docs.kubernetes.io/references/kustomize/kustomization/generators/',           type: 'both' },
  { category: 'kustomize', section: '03-transformers',   url: 'https://kubectl.docs.kubernetes.io/references/kustomize/kustomization/transformers/',         type: 'both' },
]

const COMMAND_PROMPT = (docText: string, url: string) => `
以下は公式ドキュメントのテキストです。
このドキュメントから CLIコマンドを抽出し、以下の JSON 配列形式で出力してください。
コードブロックなし、JSON のみ出力してください。

出力形式:
[
  {
    "name": "コマンド名（例: kubectl get pods）",
    "description": "1行の日本語説明",
    "syntax": "コマンド構文（例: kubectl get pods [-n <namespace>]）",
    "example": "具体的な使用例（改行区切りで複数可）",
    "tags": ["タグ1", "タグ2"],
    "url": "${url}"
  }
]

ドキュメント:
${docText.slice(0, 6000)}
`

const KNOWLEDGE_PROMPT = (docText: string, url: string) => `
以下は公式ドキュメントのテキストです。
このドキュメントから重要な概念・知識を抽出し、以下の JSON 配列形式で出力してください。
コードブロックなし、JSON のみ出力してください。

出力形式:
[
  {
    "title": "概念名（日本語）",
    "body": "Markdown形式の説明（2〜5文程度）",
    "tags": ["タグ1", "タグ2"],
    "url": "${url}"
  }
]

ドキュメント:
${docText.slice(0, 6000)}
`

async function fetchDocText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'k8s-learning-app/1.0 (github-actions)' },
  })
  if (!res.ok) throw new Error(`fetch failed: ${res.status} ${url}`)
  const html = await res.text()
  // HTML タグを除去してプレーンテキストに変換
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function generateWithLLM(prompt: string): Promise<string> {
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  })
  return response.choices[0].message.content ?? '[]'
}

function parseJSON<T>(raw: string): T[] {
  try {
    const trimmed = raw.trim().replace(/^```json?\n?/, '').replace(/\n?```$/, '')
    return JSON.parse(trimmed)
  } catch {
    console.warn('JSON parse failed:', raw.slice(0, 200))
    return []
  }
}

function loadExisting<T extends { name?: string; title?: string }>(filePath: string): T[] {
  if (!fs.existsSync(filePath)) return []
  try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')) } catch { return [] }
}

function dedup<T extends { name?: string; title?: string }>(existing: T[], generated: T[]): { added: T[]; skipped: number } {
  const existingKeys = new Set(existing.map(e => (e.name ?? e.title ?? '').toLowerCase()))
  const added = generated.filter(g => !existingKeys.has((g.name ?? g.title ?? '').toLowerCase()))
  return { added, skipped: generated.length - added.length }
}

interface LogEntry {
  date: string
  category: string
  section: string
  type: 'commands' | 'knowledge'
  added: number
  skipped: number
  items: { name: string; action: 'added' | 'skipped' }[]
}

async function processSource(source: Source, date: string): Promise<LogEntry[]> {
  const logs: LogEntry[] = []
  const categoriesDir = path.resolve(process.cwd(), 'categories')
  const sectionDir = path.join(categoriesDir, source.category, 'sections', source.section)

  console.log(`\n[${source.category}/${source.section}] Fetching ${source.url}`)
  const docText = await fetchDocText(source.url)

  const types: ('commands' | 'knowledge')[] =
    source.type === 'both' ? ['commands', 'knowledge'] : [source.type]

  for (const type of types) {
    await new Promise(r => setTimeout(r, 5000)) // rate limit: 5秒スリープ

    const prompt = type === 'commands'
      ? COMMAND_PROMPT(docText, source.url)
      : KNOWLEDGE_PROMPT(docText, source.url)

    console.log(`  Generating ${type}...`)
    const raw = await generateWithLLM(prompt)
    const generated = parseJSON<any>(raw)

    const filePath = path.join(sectionDir, `${type}.json`)
    const existing = loadExisting<any>(filePath)
    const { added, skipped } = dedup(existing, generated)

    if (added.length > 0) {
      fs.mkdirSync(sectionDir, { recursive: true })
      fs.writeFileSync(filePath, JSON.stringify([...existing, ...added], null, 2))
      console.log(`  +${added.length} added, ${skipped} skipped`)
    } else {
      console.log(`  0 added, ${skipped} skipped`)
    }

    logs.push({
      date,
      category: source.category,
      section: source.section,
      type,
      added: added.length,
      skipped,
      items: [
        ...added.map(i => ({ name: i.name ?? i.title ?? '', action: 'added' as const })),
        ...existing.slice(0, skipped).map(i => ({ name: i.name ?? i.title ?? '', action: 'skipped' as const })),
      ],
    })
  }

  return logs
}

async function main() {
  const date = new Date().toISOString().split('T')[0]
  const allLogs: LogEntry[] = []

  for (const source of SOURCES) {
    try {
      const logs = await processSource(source, date)
      allLogs.push(...logs)
    } catch (err) {
      console.error(`Error processing ${source.category}/${source.section}:`, err)
    }
  }

  const logPath = path.resolve(process.cwd(), `logs/content-generation/${date}.json`)
  fs.mkdirSync(path.dirname(logPath), { recursive: true })
  fs.writeFileSync(logPath, JSON.stringify(allLogs, null, 2))
  console.log(`\nLog saved to ${logPath}`)

  const totalAdded = allLogs.reduce((s, l) => s + l.added, 0)
  console.log(`\nTotal added: ${totalAdded} items`)
}

main().catch(e => { console.error(e); process.exit(1) })
```

- [ ] **Step 4: ローカルでスクリプトの構文チェックをする**

```bash
npx tsc --noEmit .github/scripts/generate-content.ts 2>&1 | head -20
```

型エラーがあれば修正する。`openai` が未インストールなら `npm install openai`。

- [ ] **Step 5: コミットする**

```bash
git add .github/scripts/generate-content.ts logs/content-generation/.gitkeep
git commit -m "feat: add content generation script using GitHub Models"
```

---

## Task 2: GitHub Actions ワークフロー

**Files:**
- Create: `.github/workflows/generate-content.yml`

- [ ] **Step 1: generate-content.yml を作成する**

```yaml
# .github/workflows/generate-content.yml
name: Generate Content

on:
  schedule:
    - cron: '0 0 * * 0'  # 毎週日曜 00:00 UTC
  workflow_dispatch:       # 手動実行も可能

jobs:
  generate:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      models: read

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run content generation
        run: npx tsx .github/scripts/generate-content.ts
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Commit and push if changed
        run: |
          git config user.name 'github-actions[bot]'
          git config user.email 'github-actions[bot]@users.noreply.github.com'
          git add categories/ logs/
          git diff --staged --quiet && echo "No changes to commit" || (
            git commit -m "chore: auto-update content [$(date +%Y-%m-%d)]" &&
            git push
          )
```

- [ ] **Step 2: ワークフローをコミットしてプッシュする**

```bash
git add .github/workflows/generate-content.yml
git commit -m "ci: add weekly content generation workflow"
git push origin main
```

- [ ] **Step 3: GitHub Actions で手動実行して確認する**

GitHub リポジトリ → Actions タブ → `Generate Content` → `Run workflow` ボタンをクリック。

確認事項:
- ワークフローが正常に完了する（緑チェック）
- `logs/content-generation/YYYY-MM-DD.json` が新規コミットされる
- 新規アイテムがあれば `categories/**/*.json` が更新される
- エラーがあればログを確認して `generate-content.ts` を修正する

---

## Task 3: 動作確認とログ検証

**Files:** なし（確認のみ）

- [ ] **Step 1: 生成ログを確認する**

```bash
cat logs/content-generation/$(ls logs/content-generation/ | tail -1)
```

Expected: 各カテゴリ・セクションの `added` / `skipped` 件数が記録されている。

- [ ] **Step 2: 追加されたコンテンツを確認する**

```bash
git log --oneline -5
git show --stat HEAD
```

Expected: `chore: auto-update content [YYYY-MM-DD]` のコミットが存在し、`categories/` 内の JSON が更新されている。

- [ ] **Step 3: Web版をリビルドして新コンテンツが反映されることを確認する**

```bash
npm run build:web
npx serve dist/web
```

ブラウザで確認：新しく追加されたコマンド/ナレッジが表示されること。
