# Splash Design Unification — Favicon, Header Icon, Tab Order

## Overview

Unify the app's visual identity by applying the SplashScreen's icon design to the favicon and the Header, and reorder the ReferenceView tabs so Knowledge appears on the left.

---

## Changes

### 1. Favicon — `public/favicon.svg` (new) + `index.html`

Create `public/favicon.svg` using the same blue gradient rounded-square + Hub icon as SplashScreen.

- SVG viewBox: `0 0 32 32`
- Background: rounded rect, `rx="7"`, fill via `<linearGradient>` from `#2563EB` → `#1D4ED8` at 135°
- Icon: MUI HubIcon SVG path (`viewBox 0 0 24 24`), scaled to 20×20 and centered at (6, 6), filled white

Add to `index.html` `<head>`:
```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
```

### 2. Header Icon — `src/shared/components/Header.tsx`

Replace `MarkGithubIcon` (Primer Octicons) with a mini version of the SplashScreen badge.

- Remove: `MarkGithubIcon` import from `@primer/octicons-react`
- Add: `HubIcon` import from `@mui/icons-material/Hub`
- Replace the icon `<Box>` with a 24×24 rounded square badge:
  - `background: 'linear-gradient(135deg, #2563EB, #1D4ED8)'`
  - `borderRadius: '6px'`
  - White `HubIcon` at `fontSize: 14`

### 3. Tab Order — `src/features/reference/ReferenceView.tsx`

- Move "ナレッジ" `<Tab>` before "コマンド" `<Tab>` (left → right order)
- Change default state: `useState<'commands' | 'knowledge'>('knowledge')`

---

## Files Changed

| File | Action |
|---|---|
| `public/favicon.svg` | New |
| `index.html` | Add `<link rel="icon">` |
| `src/shared/components/Header.tsx` | Replace icon |
| `src/features/reference/ReferenceView.tsx` | Swap tab order + default state |

## Design Tokens (matching SplashScreen)

| Token | Value |
|---|---|
| Gradient start | `#2563EB` |
| Gradient end | `#1D4ED8` |
| Gradient angle | `135deg` |
| Icon | MUI `HubIcon` |
| Badge border-radius (header) | `6px` (scaled from splash's `22px` / `88px`) |
