import http from 'http'
import Database from 'better-sqlite3'

export interface ClozeItem {
  q: string
  a: string
}

const DEFAULT_MODEL = 'qwen2.5:3b'

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*|__|\*|_|`{1,3}/g, '')
    .replace(/\|[^\n]+\|/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '')
    .replace(/^\s*[-*+]\s/gm, '')
    .replace(/^\s*\d+\.\s/gm, '')
    .trim()
}

function ollamaRequest(path: string, body?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const options: http.RequestOptions = {
      hostname: 'localhost',
      port: 11434,
      path,
      method: body ? 'POST' : 'GET',
      headers: body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } : undefined,
    }
    const req = http.request(options, res => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => resolve(data))
    })
    req.on('error', reject)
    req.setTimeout(90000, () => { req.destroy(); reject(new Error('timeout')) })
    if (body) req.write(body)
    req.end()
  })
}

export async function checkOllama(): Promise<{ ok: boolean; models: string[] }> {
  try {
    const data = await ollamaRequest('/api/tags')
    const parsed = JSON.parse(data)
    const models = (parsed.models ?? []).map((m: any) => m.name as string)
    return { ok: true, models }
  } catch {
    return { ok: false, models: [] }
  }
}

export function createAiHandlers(db: Database.Database) {
  return {
    checkOllama,

    async generateCloze(knowledgeId: number): Promise<ClozeItem[]> {
      const row = db.prepare('SELECT title, body FROM knowledge WHERE id = ?').get(knowledgeId) as
        | { title: string; body: string }
        | undefined
      if (!row) throw new Error('Knowledge not found')

      const plainText = stripMarkdown(row.body).slice(0, 1200)
      const prompt = `あなたは日本語の穴埋め問題作成者です。
以下のナレッジから、重要な概念・用語を（）で空欄にした穴埋め問題を4〜6個作成してください。

タイトル: ${row.title}
内容:
${plainText}

ルール:
- 各問題文に空欄（）は1つだけ
- 答えは短い単語・フレーズ（10文字以内）
- JSON配列のみを返す（説明文不要）

形式: [{"q":"Git の（）プロセスで変更を管理", "a":"プル"}]`

      const body = JSON.stringify({ model: DEFAULT_MODEL, messages: [{ role: 'user', content: prompt }], stream: false })
      const raw = await ollamaRequest('/api/chat', body)
      const parsed = JSON.parse(raw)
      const content: string = parsed.message?.content ?? ''

      const jsonMatch = content.match(/\[[\s\S]*?\]/)
      if (!jsonMatch) throw new Error('モデルからJSON配列が返されませんでした')

      const cloze: ClozeItem[] = JSON.parse(jsonMatch[0])
      db.prepare('UPDATE knowledge SET cloze = ? WHERE id = ?').run(JSON.stringify(cloze), knowledgeId)
      return cloze
    },
  }
}
