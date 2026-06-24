# Autoplay Carousel — Reference View Design Spec

## Overview

Add a compact autoplay carousel above the tabs in ReferenceView that cycles through the current section's knowledge and command items every 5 seconds.

---

## Placement

Above the `<Tabs>` in `src/features/reference/ReferenceView.tsx`, rendered only when the section has 2+ items.

```
┌─────────────────────────────────────────────────────────────┐
│  [ナレッジ]  kubectl get pods は Pod の一覧を表示します  2/8  │  ← AutoplayCarousel (56px)
└─────────────────────────────────────────────────────────────┘
[ ナレッジ ]  [ コマンド ]                                        ← existing Tabs
─────────────────────────────────────────────────────────────
  ... list content ...
```

---

## New Component: `AutoplayCarousel`

**File:** `src/features/reference/AutoplayCarousel.tsx`

### Props

```ts
interface AutoplayCarouselProps {
  categoryId: number
  sectionId: number
}
```

### Behavior

- Fetches `api.commands.list(categoryId, sectionId)` and `api.knowledge.list(categoryId, sectionId)` in parallel on mount and when `categoryId`/`sectionId` change.
- Merges results into a single `items` array: knowledge items first, then commands. Each item has a `type: 'knowledge' | 'command'` discriminator.
- Renders nothing if `items.length < 2`.
- Auto-advances every **5 seconds** using `setInterval`.
- **Pauses on hover** (`onMouseEnter` → `clearInterval`, `onMouseLeave` → restart).
- Slide animation: outgoing item exits left (`translateX(-100%)`), incoming item enters from right (`translateX(0%)`), `transition: transform 0.35s ease`.

### Layout (56px height)

```
┌──────────────────────────────────────────────────────┐
│ [badge]  Title — description truncated to 1 line  N/M │
└──────────────────────────────────────────────────────┘
```

- **Left badge**: `ナレッジ` (primary color) / `コマンド` (success/green color) — MUI `Chip` size="small"
- **Center**: `Typography` with `noWrap` — title bold, description muted
- **Right**: `N / M` counter in muted text

### Animation Implementation

Use two absolutely-positioned slots inside an `overflow: hidden` container. On each tick, the next item slides in from the right while the current item slides out to the left. After the transition completes, swap state cleanly (no jank on re-render).

---

## Modified File: `ReferenceView.tsx`

- Import `AutoplayCarousel`
- Insert `<AutoplayCarousel categoryId={categoryId} sectionId={sectionId} />` before the `<Tabs>` element
- No other changes

---

## Data Types

```ts
type CarouselItem =
  | { type: 'knowledge'; id: number; title: string; body: string }
  | { type: 'command'; id: number; name: string; description: string }
```

The display title is `item.title` for knowledge, `item.name` for commands.
The display subtitle is `item.body` for knowledge, `item.description` for commands.

---

## Files Changed

| File | Action |
|---|---|
| `src/features/reference/AutoplayCarousel.tsx` | New |
| `src/features/reference/ReferenceView.tsx` | Add `<AutoplayCarousel>` above `<Tabs>` |
