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

    async gradeAnswers(requests: import('../../src/types').GradeRequest[]): Promise<import('../../src/types').GradeResult[]> {
      if (requests.length === 0) return []

      const questionsText = requests.map((r, i) =>
        `[${i + 1}] ID:${r.id}\n問題: ${r.question}\n正解: ${r.correctAnswer.substring(0, 300)}\n回答: ${r.userAnswer || '（未回答）'}`
      ).join('\n\n')

      const prompt = `あなたは日本語の採点者です。以下の各問題について回答を採点し、JSON配列のみを返してください。

採点基準:
- "correct": 概念を正確に説明できている
- "partial": 部分的に正しいが不完全または不正確な部分がある
- "incorrect": 間違っているか未回答

必ずJSON配列のみを返してください（説明文・Markdownコードブロック不要）:
[{"id": <数値>, "verdict": "correct"|"partial"|"incorrect", "comment": "<採点コメント30文字以内の日本語>"}]

問題:
${questionsText}`

      const body = JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      })
      const raw = await ollamaRequest('/api/chat', body)
      const parsed = JSON.parse(raw)
      const content: string = parsed.message?.content ?? ''

      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (!jsonMatch) throw new Error('採点結果のJSONが取得できませんでした')

      const gradeData: Array<{ id: number; verdict: string; comment: string }> = JSON.parse(jsonMatch[0])

      for (const item of gradeData) {
        const req = requests.find(r => r.id === item.id)
        if (!req) continue
        const status = item.verdict === 'correct' ? 'done' : 'learning'
        db.prepare(`
          INSERT INTO progress (item_type, item_id, status, attempt_count, last_reviewed)
          VALUES (?, ?, ?, 1, datetime('now'))
          ON CONFLICT(item_type, item_id) DO UPDATE SET
            status = excluded.status,
            attempt_count = attempt_count + 1,
            correct_count = correct_count + CASE WHEN excluded.status = 'done' THEN 1 ELSE 0 END,
            last_reviewed = excluded.last_reviewed
        `).run(req.type, req.id, status)
      }

      return gradeData.map(g => ({
        id: g.id,
        verdict: g.verdict as 'correct' | 'partial' | 'incorrect',
        comment: g.comment,
        correctAnswer: requests.find(r => r.id === g.id)?.correctAnswer ?? '',
      }))
    },
  }
}
