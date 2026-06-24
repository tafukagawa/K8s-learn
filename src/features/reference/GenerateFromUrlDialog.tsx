import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Select, MenuItem, FormControl, InputLabel,
  Box, Typography, CircularProgress, Alert,
} from '@mui/material'
import { api } from '../../shared/ipc'
import { getGithubToken } from '../settings/githubToken'
import type { Category, Section } from '../../types'

const OWNER = 'tafukagawa'
const REPO = 'K8s-learn'
const WORKFLOW = 'generate-from-url.yml'

interface Props {
  open: boolean
  defaultCategoryId?: number
  defaultSectionId?: number
  onClose: () => void
}

type Status = 'idle' | 'dispatching' | 'polling' | 'done' | 'error'

export function GenerateFromUrlDialog({ open, defaultCategoryId, defaultSectionId, onClose }: Props) {
  const [url, setUrl] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [sectionId, setSectionId] = useState<number | ''>('')
  const [contentType, setContentType] = useState<'both' | 'knowledge' | 'commands'>('both')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    api.categories.list().then(cats => {
      setCategories(cats)
      if (defaultCategoryId) setCategoryId(defaultCategoryId)
    })
  }, [open, defaultCategoryId])

  useEffect(() => {
    if (!categoryId) return
    api.sections.list(Number(categoryId)).then(secs => {
      setSections(secs)
      if (defaultSectionId) setSectionId(defaultSectionId)
    })
  }, [categoryId, defaultSectionId])

  const selectedCategory = categories.find(c => c.id === categoryId)
  const selectedSection = sections.find(s => s.id === sectionId)

  async function pollForCompletion(token: string, dispatchedAt: string) {
    const maxAttempts = 30
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

  async function handleGenerate() {
    const token = getGithubToken()
    if (!token) {
      setError('GitHub トークンが設定されていません。ヘッダーの設定アイコンから入力してください。')
      setStatus('error')
      return
    }
    if (!url || !selectedCategory || !selectedSection) return

    setStatus('dispatching')
    setError(null)

    const dispatchedAt = new Date().toISOString()

    try {
      const res = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ref: 'main',
            inputs: {
              url,
              category: selectedCategory.slug,
              section: selectedSection.slug,
              type: contentType,
            },
          }),
        }
      )

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message ?? `HTTP ${res.status}`)
      }

      setStatus('polling')
      await pollForCompletion(token, dispatchedAt)
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setStatus('error')
    }
  }

  const isLoading = status === 'dispatching' || status === 'polling'

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>URLからナレッジを生成</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        {status === 'done' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
            <Alert severity="success" sx={{ width: '100%' }}>
              生成完了！GitHub Pages のデプロイ後（約1〜2分）にリロードすると反映されます。
            </Alert>
            <Button variant="contained" onClick={() => window.location.reload()}>
              今すぐリロード
            </Button>
          </Box>
        ) : isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 3 }}>
            <CircularProgress size={40} />
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {status === 'dispatching' ? 'GitHub Actions を起動中...' : 'コンテンツを生成中... (最大5分)'}
            </Typography>
            {status === 'polling' && (
              <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                GitHub Actions でドキュメントを解析しています
              </Typography>
            )}
          </Box>
        ) : (
          <>
            <TextField
              label="公式ドキュメント URL"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://kubernetes.io/docs/..."
              fullWidth
              size="small"
            />
            <FormControl size="small" fullWidth>
              <InputLabel>カテゴリ</InputLabel>
              <Select
                value={categoryId}
                onChange={e => { setCategoryId(Number(e.target.value)); setSectionId('') }}
                label="カテゴリ"
              >
                {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth disabled={!categoryId}>
              <InputLabel>セクション</InputLabel>
              <Select
                value={sectionId}
                onChange={e => setSectionId(Number(e.target.value))}
                label="セクション"
              >
                {sections.map(s => <MenuItem key={s.id} value={s.id}>{s.title}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>生成タイプ</InputLabel>
              <Select
                value={contentType}
                onChange={e => setContentType(e.target.value as 'both' | 'knowledge' | 'commands')}
                label="生成タイプ"
              >
                <MenuItem value="both">ナレッジ + コマンド</MenuItem>
                <MenuItem value="knowledge">ナレッジのみ</MenuItem>
                <MenuItem value="commands">コマンドのみ</MenuItem>
              </Select>
            </FormControl>
            {error && <Alert severity="error" sx={{ fontSize: 12 }}>{error}</Alert>}
          </>
        )}
      </DialogContent>
      {!isLoading && status !== 'done' && (
        <DialogActions>
          <Button onClick={onClose}>キャンセル</Button>
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={!url || !categoryId || !sectionId}
          >
            生成
          </Button>
        </DialogActions>
      )}
      {status === 'done' && (
        <DialogActions>
          <Button onClick={onClose}>閉じる</Button>
        </DialogActions>
      )}
    </Dialog>
  )
}
