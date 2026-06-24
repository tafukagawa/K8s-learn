import { useState } from 'react'
import {
  Box, Typography, Accordion, AccordionSummary, AccordionDetails,
  Chip, Divider,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined'
import StyleIcon from '@mui/icons-material/Style'
import RouteIcon from '@mui/icons-material/Route'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import KeyboardIcon from '@mui/icons-material/Keyboard'

interface Section {
  id: string
  icon: React.ReactNode
  title: string
  content: React.ReactNode
}

function Kbd({ children }: { children: string }) {
  return (
    <Box
      component="kbd"
      sx={theme => ({
        display: 'inline-block',
        px: 0.75, py: 0.25,
        fontSize: 12, fontFamily: 'monospace',
        bgcolor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f0f0f0',
        border: '1px solid', borderColor: 'divider',
        borderRadius: 0.75,
        lineHeight: 1.5,
      })}
    >
      {children}
    </Box>
  )
}

function Row({ label, desc }: { label: React.ReactNode; desc: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75 }}>
      <Box sx={{ minWidth: 120 }}>{label}</Box>
      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{desc}</Typography>
    </Box>
  )
}

const SECTIONS: Section[] = [
  {
    id: 'flashcard',
    icon: <StyleIcon fontSize="small" />,
    title: 'フラッシュカード',
    content: (
      <Box>
        <Typography sx={{ fontSize: 13, mb: 1.5, lineHeight: 1.8 }}>
          コマンドとナレッジをカード形式で学習できます。カードをクリックまたは
          <Kbd>Space</Kbd> でめくり、覚えていたか答えます。
        </Typography>
        <Divider sx={{ my: 1.5 }} />
        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1 }}>カードの種類</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Row label={<Chip label="Command" size="small" color="primary" variant="outlined" sx={{ fontSize: 11 }} />} desc="コマンド名・構文・使用例を学習" />
          <Row label={<Chip label="Knowledge" size="small" color="secondary" variant="outlined" sx={{ fontSize: 11 }} />} desc="概念・仕組みを学習。AI生成した穴埋め問題に対応" />
        </Box>
        <Divider sx={{ my: 1.5 }} />
        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1 }}>フィルター</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Row label={<Chip label="すべて" size="small" sx={{ fontSize: 11 }} />} desc="全アイテムを出題" />
          <Row label={<Chip label="未学習" size="small" sx={{ fontSize: 11 }} />} desc="まだ一度も答えていないアイテム" />
          <Row label={<Chip label="学習中" size="small" sx={{ fontSize: 11 }} />} desc="「まだ」と答えたアイテム" />
        </Box>
      </Box>
    ),
  },
  {
    id: 'reference',
    icon: <AutoStoriesIcon fontSize="small" />,
    title: 'リファレンス',
    content: (
      <Box>
        <Typography sx={{ fontSize: 13, mb: 1.5, lineHeight: 1.8 }}>
          カテゴリ・セクション別にコマンドとナレッジを参照できます。
          サイドバーのカテゴリツリーからセクションを選んでください。
        </Typography>
        <Divider sx={{ my: 1.5 }} />
        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1 }}>タブ</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Row label={<Chip label="コマンド" size="small" sx={{ fontSize: 11 }} />} desc="CLI コマンドの一覧・詳細" />
          <Row label={<Chip label="ナレッジ" size="small" sx={{ fontSize: 11 }} />} desc="概念・仕組みの解説（Markdown対応）" />
        </Box>
        <Divider sx={{ my: 1.5 }} />
        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1 }}>進捗ステータス</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Row label={<Box component="span" sx={{ fontSize: 11, bgcolor: 'rgba(148,163,184,0.16)', color: '#a8b3c7', px: 1, py: 0.35, borderRadius: 999, fontWeight: 850 }}>未学習</Box>} desc="まだ学習していない" />
          <Row label={<Box component="span" sx={{ fontSize: 11, bgcolor: 'rgba(241,194,50,0.16)', color: '#f1c232', px: 1, py: 0.35, borderRadius: 999, fontWeight: 850 }}>学習中</Box>} desc="学習中（フラッシュカードで「まだ」）" />
          <Row label={<Box component="span" sx={{ fontSize: 11, bgcolor: 'rgba(32,201,151,0.16)', color: '#20c997', px: 1, py: 0.35, borderRadius: 999, fontWeight: 850 }}>完了</Box>} desc="習得済み（フラッシュカードで「覚えてた」）" />
        </Box>
      </Box>
    ),
  },
  {
    id: 'roadmap',
    icon: <RouteIcon fontSize="small" />,
    title: 'ロードマップ',
    content: (
      <Box>
        <Typography sx={{ fontSize: 13, mb: 1.5, lineHeight: 1.8 }}>
          全体の学習進捗とカテゴリ別の進捗を確認できます。
          各カテゴリカードの「リファレンス →」ボタンで、そのカテゴリのリファレンスに直接ジャンプできます。
        </Typography>
        <Divider sx={{ my: 1.5 }} />
        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1 }}>表示内容</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Row label={<Typography sx={{ fontSize: 13, fontWeight: 700 }}>全体進捗</Typography>} desc="全カテゴリの完了アイテム数と完了率" />
          <Row label={<Typography sx={{ fontSize: 13, fontWeight: 700 }}>カテゴリ別</Typography>} desc="カテゴリごとの完了率バー" />
        </Box>
      </Box>
    ),
  },
  {
    id: 'ai',
    icon: <AutoFixHighIcon fontSize="small" />,
    title: 'AI 穴埋め生成（Ollama）',
    content: (
      <Box>
        <Typography sx={{ fontSize: 13, mb: 1.5, lineHeight: 1.8 }}>
          ナレッジカードの <strong>「AI生成」</strong> ボタンを押すと、ローカルAI（Ollama）が
          そのナレッジから穴埋め問題を自動生成します。生成した問題はフラッシュカードに反映されます。
        </Typography>
        <Divider sx={{ my: 1.5 }} />
        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1 }}>必要な環境</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Row label={<Typography sx={{ fontSize: 13, fontWeight: 700 }}>Ollama</Typography>} desc="https://ollama.com からインストール" />
          <Row label={<Typography sx={{ fontSize: 13, fontWeight: 700 }}>モデル</Typography>} desc="qwen2.5:3b（ollama pull qwen2.5:3b）" />
        </Box>
        <Divider sx={{ my: 1.5 }} />
        <Typography sx={{ fontSize: 13, lineHeight: 1.8, color: 'text.secondary' }}>
          Ollama が起動していない場合はインストール案内ダイアログが表示されます。
          生成済みのナレッジには「穴埋め✓」チップが表示されます。
        </Typography>
      </Box>
    ),
  },
  {
    id: 'shortcuts',
    icon: <KeyboardIcon fontSize="small" />,
    title: 'キーボードショートカット',
    content: (
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Row label={<Box sx={{ display: 'flex', gap: 0.5 }}><Kbd>Space</Kbd></Box>} desc="フラッシュカードをめくる" />
        <Row label={<Box sx={{ display: 'flex', gap: 0.5 }}><Kbd>Y</Kbd></Box>} desc="「覚えてた」（カード裏面のとき）" />
        <Row label={<Box sx={{ display: 'flex', gap: 0.5 }}><Kbd>N</Kbd></Box>} desc="「まだ」（カード裏面のとき）" />
        <Row label={<Box sx={{ display: 'flex', gap: 0.5 }}><Kbd>←</Kbd><Kbd>→</Kbd></Box>} desc="前後のカードに移動" />
      </Box>
    ),
  },
]

export function HelpView() {
  const [expanded, setExpanded] = useState<string | false>('flashcard')

  return (
    <Box sx={{ p: 3, maxWidth: 760, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <HelpOutlineIcon sx={{ color: 'primary.light' }} />
        <Typography variant="h5" sx={{ fontWeight: 850 }}>ヘルプ</Typography>
      </Box>

      {SECTIONS.map(sec => (
        <Accordion
          key={sec.id}
          expanded={expanded === sec.id}
          onChange={(_, open) => setExpanded(open ? sec.id : false)}
          disableGutters
          elevation={0}
          sx={{
            mb: 1,
            border: '1px solid',
            borderColor: expanded === sec.id ? 'primary.main' : 'divider',
            borderRadius: '8px !important',
            bgcolor: 'background.paper',
            '&:before': { display: 'none' },
            transition: 'border-color 0.15s',
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ borderRadius: 2, minHeight: 52, px: 2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: expanded === sec.id ? 'primary.light' : 'text.primary' }}>
              {sec.icon}
              <Typography sx={{ fontSize: 14, fontWeight: 800 }}>{sec.title}</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
            {sec.content}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  )
}
