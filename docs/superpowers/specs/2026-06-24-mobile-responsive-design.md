# モバイルレスポンシブ対応 設計書

## 概要

GitHub Pages（Web版）をスマホでも使えるようにする。単一ビルドの中で `useMediaQuery` を使いランタイムにモバイル/デスクトップを判定し、UIを出し分ける。

---

## アーキテクチャ方針

- **ビルドは1つ**（Web版ビルドのまま）
- モバイル判定は `useMediaQuery('(max-width: 768px)')` をカスタムフック化して共有
- データ層（`ipc.web.ts`）は変更なし
- Electron版は影響なし

```
useIsMobile() フック
  └─ App.tsx で呼び出し
       ├─ Header に isMobile を渡す
       ├─ Layout に isMobile を渡す（Sidebar表示制御）
       └─ BottomNav（新規）を条件レンダリング
```

---

## コンポーネント別変更方針

### 1. `useIsMobile` フック（新規）

`src/shared/hooks/useIsMobile.ts` を作成。

```ts
import { useMediaQuery } from '@mui/material'
export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)')
}
```

---

### 2. Header（変更）

**PC版（現状維持）**
```
[ロゴ] ── [検索ボックス 280px] ── [設定][通知][ダーク]
```

**モバイル版**
```
[ロゴ] ── [🔍] [設定][ダーク]
         ↓ 🔍タップ時
[← 戻る] [検索ボックス（全幅）]
```

- 検索ボックスは非表示、虫眼鏡アイコンで展開
- 展開時はロゴ・他アイコンを隠し検索バーを全幅表示
- 通知ボタンはモバイルでは省略（disabled かつスペース節約）

---

### 3. Sidebar（変更）

- モバイルでは `display: none`（幅 252px 分もなくなる）
- 代わりに画面下部に **BottomNavigation**（新規コンポーネント）を表示

---

### 4. BottomNavigation（新規）

`src/shared/components/BottomNav.tsx` を作成。

表示する項目：
| アイコン | ラベル | AppView |
|---|---|---|
| StackIcon | フラッシュカード | `{ mode: 'flashcard' }` |
| ProjectRoadmapIcon | ロードマップ | `{ mode: 'roadmap' }` |
| HubIcon | 参考書 | `{ mode: 'reference', ... }` |
| QuestionIcon | ヘルプ | `{ mode: 'help' }` |

- 現在の view に合わせてアクティブタブをハイライト
- 「参考書」タップ時は最後に開いていたカテゴリ/セクションを復元（`lastRefView` 相当のロジックを流用）
- カテゴリ選択は別途モーダルまたはドロワーで対応（フェーズ2）

---

### 5. Layout（変更）

- `isMobile` を受け取り、Sidebar のスロットを条件付きで非表示
- モバイル時は main コンテンツに `paddingBottom: 56px`（BottomNav の高さ分）を追加

---

### 6. コンテンツView（変更最小）

MUI の `sx` ブレークポイントで余白・フォントサイズを調整する程度。
コンポーネント分割は不要（レスポンシブ CSS で対応）。

---

## 実装ファイル一覧

| ファイル | 変更種別 |
|---|---|
| `src/shared/hooks/useIsMobile.ts` | 新規 |
| `src/shared/components/BottomNav.tsx` | 新規 |
| `src/shared/components/Header.tsx` | 変更（モバイル検索展開） |
| `src/shared/components/Sidebar.tsx` | 変更（モバイルで非表示） |
| `src/shared/components/Layout.tsx` | 変更（isMobile 対応） |
| `src/App.tsx` | 変更（useIsMobile、BottomNav 追加） |

---

## スコープ外（フェーズ2）

- モバイルでのカテゴリ/セクション選択UI（ドロワー等）
- 各Viewの細かいモバイル最適化（ReferenceView のカラム数調整など）
- PWA対応（ホーム画面追加）
