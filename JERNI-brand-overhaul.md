# JERNI — Brand & UI Overhaul Spec (v1)

Source of truth for the frontend overhaul of `apps/web` (Next.js). Companion to `JERNI-architecture-plan.md`.
Visual reference: https://claude.ai/artifact/S4SHfisXsnmjg3RXLJ7fxi

> **Scope:** presentation layer only. Do not change API contracts, domain logic, DB schema, auth, sockets, or feature-flag behaviour. Every existing user flow must keep working.

---

## 1. Brand in one page

- **Idea:** a hand-drawn scrawl on a tidy grid of blocks. Casual on the surface, precise underneath.
- **Tagline:** *Pick a path. Bring a crew.* (alt: *Journeys are better in company.*)
- **Archetype:** the crew captain. It organises the group, cheers loudest, never nags.
- **Traits:** Warm · Crafted · Communal · Quietly competitive (celebrate, never shame; there is no dislike, by design).
- **Signature shape rule:** **Tile = once, Pill = daily.** A `MILESTONE` task uses a tile (rounded square). A `RECURRING` task uses a pill (circle). This is the one memorable, product-specific idea. Use it consistently.
- **Dark-first product.** Light theme is the same system inverted on cream.

### Voice

| Moment | Say | Never |
|---|---|---|
| Task done | "Nice. 3 of 5 done." | "Achievement unlocked!" |
| Missed day | "New day, fresh tile." | "You broke your streak." |
| Empty board | "No crew yet. Be the first." | "No data." |
| Archive | "Archive it? Members keep their history." | "Are you sure?" |
| Not joined | "Join this journey to track your progress." + a Join button | text only |

Labels use sentence case. No all-caps labels or nav items. No exclamation-mark spam.

---

## 2. Assets

1. Copy the provided logo to `apps/web/public/brand/new-logo.svg` (aspect 844.5 : 545.25, colors `#ac92c1`, `#655a7d`, `#fdf1e4`).
2. Create `apps/web/app/icon.svg` (favicon / avatar mark, four blocks, no text):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 64">
  <rect x="0" y="0" width="62" height="30" rx="15" fill="#ac92c1"/>
  <rect x="66" y="0" width="34" height="30" rx="9" fill="#655a7d"/>
  <rect x="0" y="34" width="38" height="30" rx="9" fill="#655a7d"/>
  <rect x="42" y="34" width="58" height="30" rx="15" fill="#ac92c1"/>
</svg>
```

3. Create `components/brand/Logo.tsx` rendering the SVG via `next/image` (or inline), props `height` (default 48), with `alt="JERNI"`.
4. Remove the old yellow circular badge everywhere.

**Logo rules:** clear space = 25% of logo height on all sides. Minimum width 96px. Never recolor, stretch, outline, add shadows, or retype the wordmark. Never place on a lavender background (the blocks vanish). Use the four-block mark only under 96px.

---

## 3. Design tokens

Put in `app/globals.css` (or the project's existing global stylesheet). Default theme is **dark**.

```css
:root {
  /* brand ramps (static) */
  --lav-50:#f6f1fa; --lav-100:#ebe1f3; --lav-200:#dccbe8; --lav-300:#c6aed8; --lav-400:#ac92c1;
  --lav-500:#9377ab; --lav-600:#7a5f92; --lav-700:#604b75; --lav-800:#473859; --lav-900:#2f2540;
  --dusk-50:#f1eff5; --dusk-100:#dedae8; --dusk-200:#c1bbd1; --dusk-300:#9d95b3; --dusk-400:#7f7597;
  --dusk-500:#655a7d; --dusk-600:#524968; --dusk-700:#413955; --dusk-800:#302a40; --dusk-900:#211d2d;
  --cream:#fdf1e4;
  --ink-950:#120e1a; --ink-900:#1a1524; --ink-800:#241e31; --ink-700:#322a42;

  /* cover pairs: light tone + deep tone */
  --cv-lav-a:#ac92c1; --cv-lav-b:#655a7d;
  --cv-teal-a:#62c1b8; --cv-teal-b:#2e6f6b;
  --cv-sage-a:#a9bb92; --cv-sage-b:#55694a;
  --cv-mar-a:#f0cb5f;  --cv-mar-b:#85622a;
  --cv-rose-a:#e58fa0; --cv-rose-b:#7d4056;

  /* spacing (8px unit, 4px half-step) */
  --s1:4px; --s2:8px; --s3:12px; --s4:16px; --s5:24px; --s6:32px; --s7:48px; --s8:64px; --s9:96px;
  /* radii */
  --r1:8px; --r2:16px; --r3:24px; --r4:32px; --rp:999px;
  /* motion */
  --ease:cubic-bezier(.2,.8,.2,1); --d1:120ms; --d2:200ms;
  /* layout */
  --container:1200px; --gutter:24px; --margin:48px;
  /* fonts (wired via next/font, section 4) */
  --f-display:var(--font-fraunces),'Iowan Old Style',Georgia,serif;
  --f-ui:var(--font-figtree),system-ui,sans-serif;
}

/* semantic, DARK (default) */
:root, :root[data-theme="dark"] {
  color-scheme: dark;
  --bg:#120e1a; --surface:#1a1524; --surface-2:#241e31; --line:#322a42;
  --text:#fdf1e4; --muted:#b7adc7;
  --accent:#ac92c1; --accent-hover:#c6aed8; --on-accent:#120e1a;
  --ok:#a9bb92; --live:#62c1b8; --streak:#f4cf5d; --danger:#ec8a9c;
}
/* semantic, LIGHT */
:root[data-theme="light"] {
  color-scheme: light;
  --bg:#fdf1e4; --surface:#fff9f2; --surface-2:#f6e8d8; --line:#e2d3c1;
  --text:#211d2d; --muted:#5d546d;
  --accent:#604b75; --accent-hover:#473859; --on-accent:#fdf1e4;
  --ok:#4f6b3f; --live:#1f7a72; --streak:#8a6500; --danger:#a8384f;
}
```

**Theme selection:** a tiny inline script in the root layout `<head>` sets `data-theme` before paint: saved choice in `localStorage` → else `prefers-color-scheme` → else `dark`. Add a theme toggle in the avatar menu. Avoid a flash of the wrong theme.

**Tailwind mapping** (adapt to the version in the repo; v4 shown, for v3 put the same values in `theme.extend`):

```css
@theme inline {
  --color-bg: var(--bg);           --color-surface: var(--surface);
  --color-surface-2: var(--surface-2); --color-line: var(--line);
  --color-text: var(--text);       --color-muted: var(--muted);
  --color-accent: var(--accent);   --color-accent-hover: var(--accent-hover);
  --color-on-accent: var(--on-accent);
  --color-ok: var(--ok); --color-live: var(--live); --color-streak: var(--streak); --color-danger: var(--danger);
  --font-display: var(--f-display); --font-ui: var(--f-ui);
  --radius-1: 8px; --radius-2: 16px; --radius-3: 24px; --radius-4: 32px;
}
```

### Color roles

| Role | Dark | Light |
|---|---|---|
| Page / surface | ink-950 / ink-900 | cream / `#fff9f2` |
| Text / muted | cream / `#b7adc7` | dusk-900 / `#5d546d` |
| Primary action | lavender-400, ink text | lavender-700, cream text |
| Border | ink-700 | `#e2d3c1` |
| Complete, joined | sage | `#4f6b3f` |
| Live / real-time | teal | `#1f7a72` |
| Streak, spark | marigold | `#8a6500` |
| Archive, destructive | rose | `#a8384f` |

- Balance on a dark screen: ~70% ink, 15% cream, 10% lavender and dusk, 5% status.
- **Marigold is rare** (streaks and small highlights only). Never use it for nav or primary actions.
- **Contrast:** all text and action pairs must be ≥ 4.5:1 (verified ≥ 6.4:1 for text/muted/accent in both themes; light-theme status colors are 4.6 to 5.6:1). Do not lighten light-theme status colors or darken dark-theme ones without re-checking.

---

## 4. Typography

- **Display:** Fraunces (variable, `opsz` + `wght` 300–600). **UI/body:** Figtree (400–700).
- Load with `next/font/google`, expose as `--font-fraunces` and `--font-figtree`, `display: "swap"`, and use `variable`, not class-level font overrides.

```ts
// app/fonts.ts
import { Fraunces, Figtree } from "next/font/google";
export const fraunces = Fraunces({ subsets:["latin"], variable:"--font-fraunces", axes:["opsz"], weight:"variable", display:"swap" });
export const figtree  = Figtree({ subsets:["latin"], variable:"--font-figtree", weight:"variable", display:"swap" });
```

| Token | Size / line | Font & weight | Use |
|---|---|---|---|
| Display | 72/76 (clamp down to 40 on mobile) | Fraunces 300, -0.02em | page titles ("Discover Journeys") |
| H1 | 48/54 | Fraunces 300 | journey title |
| H2 | 36/42 | Fraunces 400 | section titles ("Journey Stats") |
| H3 | 28/34 | Fraunces 400 | card titles |
| Body L | 20/30 | Figtree 500 | descriptions |
| Body | 16/26 | Figtree 400 | default |
| Label | 14/20 | Figtree 600 | buttons, tags, nav |
| Caption | 12/16 | Figtree 600, +0.02em | meta |

Rules: numbers use `font-variant-numeric: tabular-nums`. Line length ≤ 65ch for body. Serif body copy gets slightly more line-height than sans. Replace all-caps eyebrows ("BROWSE", "TASKS") with sentence case, or delete them if they add nothing.

---

## 5. Grid, spacing, layout

- **Unit:** 8px, half-step 4px. Only use `--s*` values. No arbitrary pixel spacing.
- **Columns:** mobile < 640: 4 col, 16 gutter, 16 margin · tablet 640–1023: 8 col, 20 gutter, 32 margin · desktop ≥ 1024: 12 col, 24 gutter, 48 margin, max 1200.
- **Discover grid:** 1 / 2 / 3 columns (span 12 / 6 / 4).
- **Journey detail:** main column span 8, sticky side column span 4 (status, task count, like, join). The side column drops below the title on mobile.
- **Tessellation rule:** blocks are 8px apart. Heights are multiples of 8 (48, 64, 96...). Rows alternate pill (radius = ½ height) and tile (radius 24–32). Never nest a pill inside a pill.
- **Depth:** no drop shadows. Elevation = one lighter surface step (`--surface` → `--surface-2`) plus a 1px `--line` border.
- **Focus:** `outline: 2px solid var(--accent); outline-offset: 3px` on every interactive element (`:focus-visible`). Never remove it.
- **Bottom safe space:** pages with the curator bar reserve `padding-bottom: 96px`.

---

## 6. Components

Build under `components/ui` and `components/brand`. Reuse existing components; restyle rather than duplicating.

### 6.1 Navigation
- Floating pill bar, top-center, sticky. Logo lockup (48px high) sits **inside the same fixed container** as the pill, so both hide/show together on scroll. (The old logo stayed pinned over content while the nav hid.)
- Items: **Discover**, **Dashboard**. Current page = lavender fill with `--on-accent` text. Others transparent with a surface hover.
- **Sign out is not a nav item.** Move it into an avatar menu (with the theme toggle). Signed-out users see a "Sign in" primary button instead.
- Respect `env(safe-area-inset-top)`.

### 6.2 Buttons (pill, 48px primary / 40px secondary, Figtree 600)
- **Primary:** `--accent` fill, `--on-accent` text (Join journey, Continue, Publish). Hover `--accent-hover`.
- **Secondary:** 1px `--line` border, transparent.
- **Ghost:** no border (Sign out, Cancel).
- **Danger:** 1px `--danger` border and text (Archive). Always confirm with a dialog.
- Disabled: 50% opacity, `aria-disabled`. Loading: keep the width, swap the label for a small spinner.

### 6.3 Tags
Pill, 1px `--line` border, 13px Figtree 600, `--muted` text, 2px × 12px padding. Interactive tags (filters) get `--surface-2` on hover and lavender when selected.

### 6.4 JourneyCover (generated, replaces gradients)
A 2×2 tessellation: top-left pill, top-right tile, bottom-left tile, bottom-right pill. Pills use the pair's light tone (`-a`), tiles use the deep tone (`-b`). The glyph is one large Fraunces 300 letter in cream, `aria-hidden`.

- **Tone** = first tag that matches, in journey tag order, else lavender:
  - teal: programming, data, sql, coding, learning, tech, science, language
  - sage: gardening, nature, hobby, outdoors, food, cooking, home
  - marigold: productivity, career, business, finance
  - rose: creative, art, music, wellness, health, fitness, design
- **Glyph** = first letter of the last non-stopword of the title (Master Excel → E, Grow a Vegetable Garden → G, Learn SQL → S). Stopwords: a, an, the, to, of, and, for, in.
- **If a cover image exists and `media_uploads` is enabled**, show the image instead. When the flag is off, or there is no image, always show the generated cover. It is a first-class state, not a fallback error.
- No backend change in this pass. A curator-chosen tone/glyph override is a future item.

```tsx
// components/brand/JourneyCover.tsx (sketch)
const TONES = { teal:["programming","data","sql","coding","learning","tech","science","language"],
  sage:["gardening","nature","hobby","outdoors","food","cooking","home"],
  mar:["productivity","career","business","finance"],
  rose:["creative","art","music","wellness","health","fitness","design"] } as const;
export const toneFor = (tags: string[]) =>
  tags.map(t => (Object.keys(TONES) as (keyof typeof TONES)[]).find(k => TONES[k].includes(t as never))).find(Boolean) ?? "lav";
const STOP = new Set(["a","an","the","to","of","and","for","in"]);
export const glyphFor = (title: string) =>
  (title.split(/\s+/).filter(w => !STOP.has(w.toLowerCase())).pop() ?? title)[0]?.toUpperCase() ?? "J";
// render: <div style={{"--a":`var(--cv-${tone}-a)`,"--b":`var(--cv-${tone}-b)`}}>4 blocks + glyph</div>
```

Card cover: 150px high with 8px inner padding and 8px gap. Detail-page cover band: max 240px high, full width, same tessellation scaled up.

### 6.5 JourneyCard
`--surface`, 1px `--line`, radius `--r4`, overflow hidden. Order: cover → tags → title (H3) → description (Body, muted, 2 lines max) → stats row. Stats row is separated by a 1px top border and labelled in text: "3 tasks", "♥ 2", "2 members". No unlabeled icons. The whole card is one link with a visible focus ring.

### 6.6 TaskRow and the shape rule
Row: `--surface`, 1px `--line`, radius `--r3`, 12px 16px padding. Left: **28px checkbox**. Right: kind tag ("once" / "daily").
- `MILESTONE` → **tile** checkbox (radius 8).
- `RECURRING` → **pill** checkbox (circle).
- Unchecked: 2px `--muted` border. Checked: `--accent` fill, cream check, scale 1.06 over 200ms.
- Use `<button role="checkbox" aria-checked>` or a native checkbox styled with `appearance:none`. Label is the task title. Keyboard: Space toggles.
- Not a member: checkboxes are read-only (`aria-disabled`) and a **Join journey** button appears in the empty-state line ("Join this journey to track your progress.").
- Real-time: when another member completes a task, their tile in the crew board fills once (200ms). Under `prefers-reduced-motion` the change is instant.

### 6.7 Crew board / Journey Stats
Card with a Today / All time segmented control (pill). Rows: rank, avatar, name, completed count (diamond), streak (marigold). Live indicator: 8px teal dot with a "Live" label (text, not color only). Own row gets a lavender left border.

### 6.8 Curator bar
Docked to the bottom edge, only for the curator: **Live on Discover** (teal dot), **Archive** (danger), **Dashboard**. Pill container. Pages reserve 96px of bottom padding so it never covers content (it used to overlap the stats row). Archive opens a confirm dialog.

### 6.9 Empty, loading, error
- Empty: one sentence + one primary button. Never "No data."
- Loading: skeletons using the tessellation shapes (pill and tile blocks pulsing at 60% → 100% opacity, 1.2s). Reduced motion: static.
- Error: neutral tone, `--danger` only for the icon/border, with a retry button. No blame.

### 6.10 Motion
Only two easings/durations: `--d1` (hover, 120ms) and `--d2` (state change, 200ms), both `--ease`. One signature interaction: the checkbox fill. No entrance animations on sections, no hover lift on every card. Wrap all non-essential motion in `@media (prefers-reduced-motion: no-preference)`.

---

## 7. Screens

### 7.1 Discover
- Compact header (not a full-screen hero): Display title "Discover Journeys", Body L subtitle "30 curated paths from the community" (use the real count), sort select on the right (pill).
- Filter tags row (optional, can wait for search in Phase 7).
- Card grid per section 5. Keep the existing data fetch and sort behaviour.

### 7.2 Journey detail
- Cover band ≤ 240px, then breadcrumb ("← Back to Discover", Label style), H1, Body L description, tags.
- Side column (sticky): status chip (Published / Draft / Archived), task count, Like button, **Join journey** primary (becomes "Joined" in sage with a check once a member; Leave lives in a secondary menu).
- Tasks section: H2 "3 tasks in this journey", rows per 6.6. "Add a new task" dashed row only for the curator.
- Crew board (6.7) below the tasks.
- Curator bar (6.8).

### 7.3 Dashboard
Greeting ("Good morning, {name}") in H1, then **Today** (recurring tasks due, pill checkboxes first), then **In progress** journey cards with a progress line, then **Milestones** ahead. Empty state links to Discover.

### 7.4 Onboarding (Gemini recommendations)
Interest chips (tags), then 3–5 recommended journey cards with Join, and a **Skip for now** button as visible as Continue (skipping must never block account creation). If the recommendation call fails, show the popular-journeys fallback silently, with no error banner.

### 7.5 Auth
Centered card, logo lockup on top, one primary button, neutral error text below the field.

---

## 8. UX rules (apply everywhere)

1. Skipping never blocks. Optional steps are visibly skippable.
2. Show the crew, not just the score.
3. Shape carries rhythm (tile vs pill); the "once/daily" tag only backs it up.
4. Live, then calm: real-time updates animate once.
5. Never shame: no dislikes, no red for misses.
6. Empty states always offer the next step.
7. One layout for guest / member / curator; only the action column and curator bar change.
8. Sockets are for freshness, REST is truth. Do not restyle in a way that hides reconnect/refetch states.

---

## 9. Audit → fix map (from the current screenshots)

| Found | Fix |
|---|---|
| Logo stays over content on scroll while the nav hides | One fixed container for logo + nav (6.1) |
| Sign out shown as the highlighted item, with a stray dot | Ghost action in avatar menu; lavender = current page |
| Covers are muddy gradients; two-letter initials like "LE" | Generated tessellation + one glyph (6.4) |
| Detail hero fills a whole screen; tasks below the fold | Cover band ≤ 240px (7.2) |
| Unlabeled card stat icons | Text labels (6.5) |
| Tiny square/circle task markers | 28px tile/pill checkboxes (6.6) |
| Curator bar overlaps the stats row | Dock + 96px bottom padding (6.8) |
| Sage Join button competes with completion color | Lavender primary; sage reserved for complete/joined |

---

## 10. Implementation phases (one commit each; app must build and run after every phase)

1. **Foundation:** tokens, fonts, theme script, Tailwind mapping, `Logo`, favicon. No visual page changes beyond the base colors.
2. **Primitives:** Button, Tag, Card, Input/Select, Dialog, Skeleton, focus styles.
3. **Shell:** nav, avatar menu, theme toggle, layout container, curator bar.
4. **Journey components:** JourneyCover, JourneyCard, TaskRow, CrewBoard, stat labels.
5. **Screens:** Discover → Journey detail → Dashboard → Onboarding → Auth.
6. **Polish and QA:** motion, empty/loading/error states, a11y pass, cleanup of dead styles.

## 11. Definition of done

- [ ] No hard-coded hex colors or arbitrary px spacing outside `globals.css` tokens.
- [ ] Old yellow badge and gradient covers fully removed.
- [ ] Dark and light themes both correct, with no flash on load.
- [ ] All text and controls ≥ 4.5:1 in both themes; keyboard focus visible everywhere; tap targets ≥ 40px.
- [ ] Works at 360px, 768px, 1280px, 1440px with no horizontal scroll.
- [ ] `prefers-reduced-motion` respected.
- [ ] Guest, member and curator states each checked on Discover and Journey detail.
- [ ] `media_uploads` **off** → generated covers, no upload UI, no broken images. **On** → uploaded image replaces the cover.
- [ ] Real-time updates (join, complete) still render and animate once.
- [ ] Existing unit/e2e tests pass. Critical flows still covered: join journey, complete task, skip onboarding, upload widget hidden when `media_uploads` is disabled. Add Playwright screenshots for Discover and Journey detail in both themes if Playwright exists in the repo.
- [ ] `lint`, `typecheck`, `build` are green.
