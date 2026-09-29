# HP Design System — EIS Mobile

> **Employee Information System (EIS)** — React Native / Expo mobile app.
> Platform: iOS 390×844 (iPhone), Android. Full dark mode support.

---

## Colors

### Brand & Accent

| Token                                        | Hex       | Usage                                                         |
| -------------------------------------------- | --------- | ------------------------------------------------------------- |
| `--primary` / `colors.primary`               | `#024ad8` | HP Electric Blue — primary CTA fill, links, active indicators |
| `--primary-bright` / `colors.primary-bright` | `#296ef9` | Slightly lighter variant for dark slab accents                |
| `--primary-deep` / `colors.primary-deep`     | `#0e3191` | Pressed CTA state, visited links                              |
| `--primary-soft` / `colors.primary-soft`     | `#c9e0fc` | Soft blue chip/card backgrounds                               |

### Surface

| Token                             | Hex       | Usage                                               |
| --------------------------------- | --------- | --------------------------------------------------- |
| `--canvas` / `colors.canvas`      | `#ffffff` | Universal page background (pure white)              |
| `--surface-card` / `colors.paper` | `#ffffff` | Card surfaces (same white, with shadow/border lift) |
| `--secondary` / `colors.cloud`    | `#f7f7f7` | Light gray section band, alternating rows           |
| `--muted` / `colors.fog`          | `#e8e8e8` | Darker gray surface for FAQ panels, header strips   |
| `--input` / `colors.steel`        | `#c2c2c2` | Hairline border for inputs, outlined elements       |
| `--surface-dark` / `colors.ink`   | `#1a1a1a` | Dark navy slab backgrounds                          |

### Text

| Token                            | Hex       | Usage                                             |
| -------------------------------- | --------- | ------------------------------------------------- |
| `--ink` / `colors.ink`           | `#1a1a1a` | Universal text color on white surfaces            |
| `--ink-deep` / `colors.ink-deep` | `#000000` | Pure black for wordmark, 1px hairline strokes     |
| `--ink-soft` / `colors.ink-soft` | `#292929` | Alternate near-black for dark slab textural shift |
| `--foreground` / `colors.on-ink` | `#ffffff` | White text on dark-navy slabs                     |
| `--charcoal` / `colors.charcoal` | `#3d3d3d` | Muted body text, secondary descriptions           |
| `--graphite` / `colors.graphite` | `#636363` | Fine print, timestamps, metadata                  |

### Semantic

| Token                                 | Hex       | Usage                       |
| ------------------------------------- | --------- | --------------------------- |
| `--semantic-up`                       | `#22c55e` | Success, approved status    |
| `--accent-yellow`                     | `#eab308` | Warning, pending status     |
| `--destructive` / `colors.bloom-deep` | `#b3262b` | Errors, destructive actions |
| `--bloom-coral`                       | `#ff5050` | Sale tags, emphasis         |
| `--storm-deep`                        | `#356373` | Neutral status accent       |

---

## Typography

Font: **Forma DJR Micro** (HP bespoke). Closest substitutes: **Inter** or **Manrope** at matching weights.

| Token                      | Size | Weight | Line Ht | Letter Spacing | Use                       |
| -------------------------- | ---- | ------ | ------- | -------------- | ------------------------- |
| `typography.display-md`    | 32px | 500    | 1.0     | 0              | Large screen headers      |
| `typography.display-sm`    | 24px | 500    | 1.17    | 0              | Section titles            |
| `typography.display-xs`    | 20px | 500    | 1.0     | 0              | Card titles               |
| `typography.body-lg`       | 18px | 400    | 1.33    | 0              | Lead paragraphs           |
| `typography.body-md`       | 16px | 400    | 1.38    | 0              | Default body              |
| `typography.body-emphasis` | 16px | 500    | 1.38    | 0              | Bold run-in copy          |
| `typography.caption-md`    | 14px | 400    | 1.5     | 0              | Specs, metadata           |
| `typography.caption-sm`    | 12px | 400    | 1.33    | 0              | Footnotes, legal          |
| `typography.link-md`       | 16px | 500    | 1.38    | 0              | Inline links              |
| `typography.button-md`     | 14px | 600    | 1.4     | 0.7px          | Button labels (uppercase) |

---

## Shapes & Spacing

- **Base unit**: 8px
- **Card radius**: 16px (`rounded-md`)
- **Button radius**: 4px (`rounded-md`)
- **Button height**: 44px
- **Card padding**: 16–24px
- **Section gap**: 80px desktop, ~48px mobile

### Border Radius Scale

| Token          | Value  | Usage                                           |
| -------------- | ------ | ----------------------------------------------- |
| `rounded.md`   | 4px    | Primary buttons, secondary buttons, text inputs |
| `rounded.lg`   | 8px    | Badge pills, category cards                     |
| `rounded.xl`   | 16px   | Product cards, photo frames, section containers |
| `rounded.pill` | 9999px | Chips, filter tags                              |

### Spacing Tokens

| Token             | Value |
| ----------------- | ----- |
| `spacing.xxs`     | 4px   |
| `spacing.xs`      | 8px   |
| `spacing.sm`      | 12px  |
| `spacing.md`      | 16px  |
| `spacing.lg`      | 20px  |
| `spacing.xl`      | 24px  |
| `spacing.xxl`     | 32px  |
| `spacing.section` | 80px  |

---

## Elevation

| Level     | Treatment                        | Use                           |
| --------- | -------------------------------- | ----------------------------- |
| Flat      | None                             | Section bands, full-bleed     |
| Hairline  | 1px solid `#e8e8e8`              | Outlined buttons, table cells |
| Soft Lift | `0 2px 8px rgba(26,26,26,0.08)`  | Cards                         |
| Floating  | `0 8px 24px rgba(26,26,26,0.12)` | Modals, drawers               |

---

## Components

### Buttons

- **Primary button**: bg `#024ad8`, text white, 44px height, 12×24 padding, 4px radius, uppercase 14px/600/0.7px tracking
- **Pressed**: bg `#0e3191`
- **Disabled**: bg `#c2c2c2`, white text
- **Outline button**: bg white, text `#024ad8`, 1px `#024ad8` border, 44px, 4px radius
- **Text link**: bg transparent, text `#024ad8`, 16px/500

### Inputs

- **Text input**: bg white, text `#1a1a1a`, 4px radius, 12×16 padding, 44px height
- **Default border**: 1px `#c2c2c2`
- **Focused border**: 1px `#1a1a1a` (no halo)
- **Error**: 1px `#b3262b`

### Cards

- **Default card**: bg white, 16px radius, 16–24px padding, Soft Lift shadow
- **Section header card**: bg `#f7f7f7`, flat, section title + optional action link

### Lists

- **FlatList** with `RefreshControl` pull-to-refresh
- **Empty state**: centered icon + title + message + optional refresh button
- **Loading state**: shimmer skeleton matching card/list layout

### Navigation

- **Bottom tab bar**: 5 tabs (Home, Leaves, Salary, Tax, More)
- **Stack header**: back arrow + title
- **FAB**: floating action button (40px circle, `#024ad8`, white icon)

---

## Dark Mode

| Token                    | Dark Value     |
| ------------------------ | -------------- |
| Canvas (`--canvas`)      | `#1a1a1a`      |
| Card (`--surface-card`)  | `#292929`      |
| Text (`--foreground`)    | `#ffffff`      |
| Muted (`--muted`)        | `#292929`      |
| Border (`--border`)      | `#3d3d3d`      |
| Input border (`--input`) | `#636363`      |
| Primary                  | Same `#024ad8` |
| Primary-bright           | Same `#296ef9` |

All prompts below reference this design system. Use these tokens as exact values — do not invent colors, spacing, or radii.
