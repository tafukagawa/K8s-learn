# Splash Design Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify the app's visual identity by applying the SplashScreen icon (blue gradient HubIcon badge) to the favicon and Header, and reorder ReferenceView tabs so Knowledge is on the left.

**Architecture:** Four isolated file changes with no shared state or inter-task dependencies — favicon SVG creation, HTML link injection, Header icon swap, and ReferenceView tab reorder. Each task can be done and committed independently.

**Tech Stack:** React 18, MUI v6, Vite, SVG (inline path from `@mui/icons-material/Hub`)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `public/favicon.svg` | Create | Blue gradient rounded-square + Hub icon as SVG |
| `index.html` | Modify | Add `<link rel="icon">` pointing to favicon |
| `src/shared/components/Header.tsx` | Modify | Replace `MarkGithubIcon` with mini HubIcon badge |
| `src/features/reference/ReferenceView.tsx` | Modify | Swap tab order + change default state |

---

### Task 1: Create favicon SVG

**Files:**
- Create: `public/favicon.svg`

The Hub icon SVG path (from `node_modules/@mui/icons-material/Hub.js`, viewBox `0 0 24 24`):
```
M8.4 18.2c.38.5.6 1.12.6 1.8 0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3c.44 0 .85.09 1.23.26l1.41-1.77c-.92-1.03-1.29-2.39-1.09-3.69l-2.03-.68c-.54.83-1.46 1.38-2.52 1.38-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3c0 .07 0 .14-.01.21l2.03.68c.64-1.21 1.82-2.09 3.22-2.32V5.91C9.96 5.57 9 4.4 9 3c0-1.66 1.34-3 3-3s3 1.34 3 3c0 1.4-.96 2.57-2.25 2.91v2.16c1.4.23 2.58 1.11 3.22 2.32L18 9.71V9.5c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3c-1.06 0-1.98-.55-2.52-1.37l-2.03.68c.2 1.29-.16 2.65-1.09 3.69l1.41 1.77Q17.34 17 18 17c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3c0-.68.22-1.3.6-1.8l-1.41-1.77c-1.35.75-3.01.76-4.37 0z
```

- [ ] **Step 1: Create `public/favicon.svg`**

The icon is scaled from 24×24 → 20×20 (`scale(0.833)`) and offset by 6px on each side to center it in the 32×32 canvas.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2563EB"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="7" fill="url(#g)"/>
  <g transform="translate(6 6) scale(0.833)" fill="white">
    <path d="M8.4 18.2c.38.5.6 1.12.6 1.8 0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3c.44 0 .85.09 1.23.26l1.41-1.77c-.92-1.03-1.29-2.39-1.09-3.69l-2.03-.68c-.54.83-1.46 1.38-2.52 1.38-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3c0 .07 0 .14-.01.21l2.03.68c.64-1.21 1.82-2.09 3.22-2.32V5.91C9.96 5.57 9 4.4 9 3c0-1.66 1.34-3 3-3s3 1.34 3 3c0 1.4-.96 2.57-2.25 2.91v2.16c1.4.23 2.58 1.11 3.22 2.32L18 9.71V9.5c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3c-1.06 0-1.98-.55-2.52-1.37l-2.03.68c.2 1.29-.16 2.65-1.09 3.69l1.41 1.77Q17.34 17 18 17c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3c0-.68.22-1.3.6-1.8l-1.41-1.77c-1.35.75-3.01.76-4.37 0z"/>
  </g>
</svg>
```

- [ ] **Step 2: Commit**

```bash
git add public/favicon.svg
git commit -m "feat: add SVG favicon matching splash screen design"
```

---

### Task 2: Wire favicon into index.html

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add `<link rel="icon">` to `index.html`**

Current `<head>`:
```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>k8s Learning</title>
</head>
```

After:
```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <title>k8s Learning</title>
</head>
```

- [ ] **Step 2: Verify favicon appears**

Run: `npm run dev:web` (or `npm run dev`)
Open the app in a browser. The browser tab should show the blue gradient Hub icon.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: wire SVG favicon into index.html"
```

---

### Task 3: Replace header icon with mini HubIcon badge

**Files:**
- Modify: `src/shared/components/Header.tsx`

- [ ] **Step 1: Update imports in `Header.tsx`**

Remove `MarkGithubIcon` from the octicons import; add `HubIcon` from MUI.

Change:
```tsx
import { MarkGithubIcon, SearchIcon, BellIcon, MoonIcon, SunIcon } from '@primer/octicons-react'
```

To:
```tsx
import { SearchIcon, BellIcon, MoonIcon, SunIcon } from '@primer/octicons-react'
import HubIcon from '@mui/icons-material/Hub'
```

- [ ] **Step 2: Replace icon Box in the Toolbar**

Find this block (lines 25–32):
```tsx
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
  <Box sx={{ color: 'text.primary', display: 'flex', alignItems: 'center' }}>
    <MarkGithubIcon size={24} />
  </Box>
  <Typography sx={{ color: 'text.primary', fontWeight: 600, whiteSpace: 'nowrap', fontSize: 14 }}>
    k8s Learn
  </Typography>
</Box>
```

Replace with:
```tsx
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
  <Box sx={{
    width: 24, height: 24,
    borderRadius: '6px',
    background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  }}>
    <HubIcon sx={{ fontSize: 14, color: '#fff' }} />
  </Box>
  <Typography sx={{ color: 'text.primary', fontWeight: 600, whiteSpace: 'nowrap', fontSize: 14 }}>
    k8s Learn
  </Typography>
</Box>
```

- [ ] **Step 3: Verify visually**

App should be running from Task 2. Reload — the header left section should show a small blue badge with a white Hub icon, then "k8s Learn" text.

- [ ] **Step 4: Commit**

```bash
git add src/shared/components/Header.tsx
git commit -m "feat: replace GitHub octocat with HubIcon badge in header"
```

---

### Task 4: Swap ReferenceView tab order and default

**Files:**
- Modify: `src/features/reference/ReferenceView.tsx`

- [ ] **Step 1: Change default tab state**

Line 16:
```tsx
const [tab, setTab] = useState<'commands' | 'knowledge'>('commands')
```

Change to:
```tsx
const [tab, setTab] = useState<'commands' | 'knowledge'>('knowledge')
```

- [ ] **Step 2: Swap the two `<Tab>` elements**

Current order (lines 25–38):
```tsx
<Tab
  value="commands"
  label="コマンド"
  icon={<TerminalIcon fontSize="small" />}
  iconPosition="start"
  sx={{ fontSize: 13, fontWeight: 700, minHeight: 44 }}
/>
<Tab
  value="knowledge"
  label="ナレッジ"
  icon={<LightbulbIcon fontSize="small" />}
  iconPosition="start"
  sx={{ fontSize: 13, fontWeight: 700, minHeight: 44 }}
/>
```

Swap to:
```tsx
<Tab
  value="knowledge"
  label="ナレッジ"
  icon={<LightbulbIcon fontSize="small" />}
  iconPosition="start"
  sx={{ fontSize: 13, fontWeight: 700, minHeight: 44 }}
/>
<Tab
  value="commands"
  label="コマンド"
  icon={<TerminalIcon fontSize="small" />}
  iconPosition="start"
  sx={{ fontSize: 13, fontWeight: 700, minHeight: 44 }}
/>
```

- [ ] **Step 3: Verify visually**

Reload the app. On the Reference screen:
- "ナレッジ" tab is on the left and selected by default
- "コマンド" tab is on the right
- Switching tabs works correctly in both directions

- [ ] **Step 4: Commit**

```bash
git add src/features/reference/ReferenceView.tsx
git commit -m "feat: move Knowledge tab to left and set as default in ReferenceView"
```
