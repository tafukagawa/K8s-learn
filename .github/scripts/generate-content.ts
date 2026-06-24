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
    await new Promise(r => setTimeout(r, 5000))

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
        ...existing.slice(0, skipped).map((i: any) => ({ name: i.name ?? i.title ?? '', action: 'skipped' as const })),
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
