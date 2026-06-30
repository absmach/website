# Styles

This directory contains the global stylesheet and the theme system for the Abstract Machines website.

```
src/styles/
├── global.css        # Layout, typography, components, utilities
├── themes/
│   ├── blueprint.css # Default — white + navy + electric blue
│   ├── parchment.css # Warm cream + near-black + blue/orange
│   ├── ember.css     # Warm ivory + dark brown + terracotta (inviting)
│   ├── aurora.css    # Lavender-white + deep indigo + vivid purple (colorful)
│   └── midnight.css  # Deep navy + cool blue-white + sky blue  (dark)
└── README.md         # This file
```

---

## Switching themes

Open `src/layouts/BaseLayout.astro` and change the theme import (line 5):

```js
// Change this filename to switch the site palette
import "../styles/themes/blueprint.css";
```

That single change updates every color, shadow, and glass overlay across the entire site. No other files need to be touched.

---

## Available themes

### Blueprint _(default)_

Clean white background, deep navy ink, electric blue accent.
Enterprise tech feel — confident and professional.

```
--paper:   #ffffff     --ink:   #073763   --accent:   #2547ff
--paper-2: #f3f6fb     --ink-2: #1e3a5a   --accent-2: #ff7a4a
```

### Parchment

Warm cream background, near-black ink, same blue and orange accents.
Editorial and refined — closer to Stripe Docs or the Linear blog.

```
--paper:   #f6f4ee     --ink:   #14161a   --accent:   #2547ff
--paper-2: #ecebe5     --ink-2: #383a40   --accent-2: #ff7a4a
```

### Ember

Warm ivory background, dark warm-brown ink, terracotta + teal accents.
Inviting and artisan — Substack / Bear / craft editorial energy.

```
--paper:   #fdfaf6     --ink:   #1c110a   --accent:   #c2410c
--paper-2: #f5ede0     --ink-2: #3d2315   --accent-2: #0369a1
```

### Aurora

Soft lavender-white background, deep indigo ink, vivid purple + orange.
Colorful and modern — Linear / Vercel / Raycast gradient energy.

```
--paper:   #fbfaff     --ink:   #1e1b4b   --accent:   #7c3aed
--paper-2: #f2efff     --ink-2: #3730a3   --accent-2: #f97316
```

### Midnight _(dark)_

Deep navy background, cool blue-white text, sky-blue accent.
Developer-first premium dark — GitHub / Vercel dark / Raycast.

```
--paper:   #0d1117     --ink:   #e8f1ff   --accent:   #4d9fff
--paper-2: #161b27     --ink-2: #c4cde8   --accent-2: #ff7a4a
```

---

## Changing fonts

Each theme file declares `--font-sans` and `--font-mono`. To switch fonts:

**Step 1** — update the variables in the active theme file:

```css
--font-sans: "Inter";
--font-mono: "JetBrains Mono";
```

**Step 2** — update the Google Fonts `<link>` in `src/layouts/BaseLayout.astro` (lines 52–63) to load the new family. Each theme file has a comment at the top with example URLs for common alternatives.

Suggested pairings per theme:

| Theme     | Sans-serif        | Monospace      |
| --------- | ----------------- | -------------- |
| Blueprint | Montserrat        | JetBrains Mono |
| Parchment | Plus Jakarta Sans | JetBrains Mono |
| Ember     | Plus Jakarta Sans | JetBrains Mono |
| Aurora    | Inter             | JetBrains Mono |
| Midnight  | Inter             | JetBrains Mono |

---

## Token reference

Every theme file defines the same set of CSS custom properties. `global.css` consumes them exclusively — no hard-coded colours exist in the stylesheet.

### Surfaces

| Variable    | Purpose                                           |
| ----------- | ------------------------------------------------- |
| `--paper`   | Page background                                   |
| `--paper-2` | Slightly elevated surface (nav, callout sections) |
| `--paper-3` | Further elevated surface (hover states, inputs)   |

### Text

| Variable  | Purpose                                    |
| --------- | ------------------------------------------ |
| `--ink`   | Primary text and primary-button background |
| `--ink-2` | Body text, secondary headings              |
| `--ink-3` | Muted labels, kickers, metadata            |
| `--ink-4` | Placeholder text, disabled states          |

### Borders

| Variable   | Purpose                          |
| ---------- | -------------------------------- |
| `--line`   | Strong borders (matches `--ink`) |
| `--line-2` | Standard component borders       |
| `--line-3` | Subtle dividers                  |

### Accent

| Variable        | Purpose                                                       |
| --------------- | ------------------------------------------------------------- |
| `--accent`      | Primary interactive accent (links, focus rings, active chips) |
| `--accent-2`    | Secondary accent (orange highlights, CTA label on dark cards) |
| `--accent-soft` | Tinted background behind accent elements                      |

### Status

| Variable  | Purpose                          |
| --------- | -------------------------------- |
| `--green` | Success states, active badge dot |
| `--warn`  | Warning states, challenge icons  |

### Elevation

| Variable      | Purpose                    |
| ------------- | -------------------------- |
| `--shadow-sm` | Subtle card lift           |
| `--shadow`    | Standard card hover shadow |
| `--shadow-lg` | Modal/hero image shadow    |

### Dark-surface tokens

Used by dark cards (`.card-dark`), the flagship bento tile, SDK code blocks, the contact form, and CTA dark variants.

| Variable              | Purpose                                      |
| --------------------- | -------------------------------------------- |
| `--surface-accent`    | Background of inverted/dark surfaces         |
| `--on-accent`         | Primary text on `--surface-accent`           |
| `--on-accent-dim`     | Body text on dark surfaces (~85% opacity)    |
| `--on-accent-muted`   | Muted labels on dark surfaces (~60% opacity) |
| `--on-accent-subtle`  | Subtle text on dark surfaces (~50% opacity)  |
| `--dark-border`       | Borders on dark section backgrounds          |
| `--dark-input-bg`     | Form input background inside dark forms      |
| `--dark-input-border` | Form input border inside dark forms          |

### Glass overlays

Used by video-background hero sections to blend the video into the page background.

| Variable         | Purpose                                    |
| ---------------- | ------------------------------------------ |
| `--glass-start`  | Horizontal gradient start (88% opacity)    |
| `--glass-mid`    | Horizontal gradient mid (72% opacity)      |
| `--glass-end`    | Horizontal gradient end (40% opacity)      |
| `--glass-top`    | Vertical gradient top (30% opacity)        |
| `--glass-bottom` | Vertical gradient bottom (80% opacity)     |
| `--glass-visual` | Hero visual panel background (60% opacity) |

### System chrome

| Variable            | Purpose                       |
| ------------------- | ----------------------------- |
| `--scrollbar-thumb` | Scrollbar thumb colour        |
| `--backdrop`        | Modal/drawer backdrop overlay |

### Shape & layout

| Variable           | Purpose                              |
| ------------------ | ------------------------------------ |
| `--radius-sm`      | Small border-radius (4 px)           |
| `--radius`         | Default border-radius (8 px)         |
| `--radius-lg`      | Large border-radius (14 px)          |
| `--container`      | Standard content max-width (1200 px) |
| `--container-wide` | Wide content max-width (1320 px)     |
