// .github/scripts/generate-from-url.ts
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

const client = new OpenAI({
  baseURL: 'https://models.inference.ai.azure.com',
  apiKey: process.env.GITHUB_TOKEN,
})

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

const url = process.env.INPUT_URL!
const category = process.env.INPUT_CATEGORY!
const section = process.env.INPUT_SECTION!
const contentType = (process.env.INPUT_TYPE ?? 'both') as 'commands' | 'knowledge' | 'both'

async function main() {
  const sectionDir = path.resolve(process.cwd(), 'categories', category, 'sections', section)

  console.log(`Fetching ${url}`)
  const docText = await fetchDocText(url)

  const types: ('commands' | 'knowledge')[] =
    contentType === 'both' ? ['commands', 'knowledge'] : [contentType]

  for (const type of types) {
    await new Promise(r => setTimeout(r, 3000))
    const prompt = type === 'commands'
      ? COMMAND_PROMPT(docText, url)
      : KNOWLEDGE_PROMPT(docText, url)
    console.log(`Generating ${type}...`)
    const raw = await generateWithLLM(prompt)
    const generated = parseJSON<any>(raw)
    const filePath = path.join(sectionDir, `${type}.json`)
    const existing = loadExisting<any>(filePath)
    const { added } = dedup(existing, generated)
    if (added.length > 0) {
      fs.mkdirSync(sectionDir, { recursive: true })
      fs.writeFileSync(filePath, JSON.stringify([...existing, ...added], null, 2))
      console.log(`+${added.length} ${type} added`)
    } else {
      console.log(`0 ${type} added`)
    }
  }
}

main().catch(e => { console.error(e); process.exit(1) })
