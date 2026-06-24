import { useState } from 'react'

const OWNER = 'tafukagawa'
const REPO = 'K8s-learn'
const WORKFLOW = 'generate-from-url.yml'

export type PollingStatus = 'idle' | 'polling' | 'done' | 'error'

async function pollForCompletion(token: string, dispatchedAt: string) {
  const maxAttempts = 60
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 10000))
    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/actions/runs?workflow_id=${WORKFLOW}&per_page=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    )
    if (!res.ok) continue
    const data = await res.json()
    const run = data.workflow_runs?.[0]
    if (!run) continue
    if (new Date(run.created_at) < new Date(dispatchedAt)) continue
    if (run.status === 'completed') {
      if (run.conclusion !== 'success') throw new Error(`ワークフローが失敗しました: ${run.conclusion}`)
      return
    }
  }
  throw new Error('タイムアウト: ワークフローの完了を確認できませんでした')
}

export function useWorkflowPolling() {
  const [status, setStatus] = useState<PollingStatus>('idle')
  const [message, setMessage] = useState<string | null>(null)

  function startPolling(token: string, dispatchedAt: string) {
    setStatus('polling')
    setMessage(null)
    pollForCompletion(token, dispatchedAt)
      .then(() => {
        setStatus('done')
        setMessage('生成完了！リロードすると反映されます。')
      })
      .catch(err => {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : String(err))
      })
  }

  function dismiss() {
    setStatus('idle')
    setMessage(null)
  }

  return { status, message, startPolling, dismiss }
}
