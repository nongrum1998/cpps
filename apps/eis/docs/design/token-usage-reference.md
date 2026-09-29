# HP Design Token Usage Reference

> **Purpose:** A living document mapping all HP Design System tokens to their Tailwind classes and usage rules. Ensures visual and code consistency across all EIS mobile screens.

---

## Colors — Surface

| Token                 | Tailwind Class             | Hex (Light) | When to Use                                          |
| --------------------- | -------------------------- | ----------- | ---------------------------------------------------- |
| canvas                | `bg-background`            | `#ffffff`   | Page backgrounds — **never use `bg-white`**          |
| card                  | `bg-card`                  | `#ffffff`   | Card surfaces — **never use `bg-white`**             |
| surface-soft          | `bg-surface-soft`          | `#f7f7f7`   | Section bands, accent rows, table header rows        |
| surface-strong        | `bg-muted`                 | `#e8e8e8`   | Header strips, FAQ panels, darker gray surfaces      |
| surface-dark          | `bg-surface-dark`          | `#1a1a1a`   | Dark slab backgrounds (testimonials, footer prelude) |
| surface-dark-elevated | `bg-surface-dark-elevated` | `#292929`   | Elevated dark surfaces                               |

## Colors — Text

| Token                  | Tailwind Class                  | Hex (Light) | When to Use                                        |
| ---------------------- | ------------------------------- | ----------- | -------------------------------------------------- |
| ink (primary text)     | `text-foreground` or `text-ink` | `#1a1a1a`   | Primary body text — **never use `text-gray-900`**  |
| charcoal               | `text-charcoal`                 | `#3d3d3d`   | Secondary descriptions, muted body text            |
| graphite               | `text-graphite`                 | `#636363`   | Fine print, timestamps, metadata, placeholder text |
| on-ink (white on dark) | `text-primary-foreground`       | `#ffffff`   | White text on dark surfaces / blue buttons         |
| ink-deep               | `text-ink-deep`                 | `#000000`   | Wordmark, hairline strokes (rare)                  |
| ink-soft               | `text-ink-soft`                 | `#292929`   | Textural shift on dark slabs                       |

## Colors — Border / Hairline

| Token         | Tailwind Class         | Hex (Light) | When to Use                                                                          |
| ------------- | ---------------------- | ----------- | ------------------------------------------------------------------------------------ |
| hairline      | `border-border`        | `#e8e8e8`   | Default borders, card borders — **never use `border-gray-100` or `border-gray-200`** |
| hairline-soft | `border-hairline-soft` | `#f7f7f7`   | Subtle dividers                                                                      |
| input         | `border-input`         | `#c2c2c2`   | Input borders                                                                        |

## Colors — Interactive / Brand

| Token                  | Tailwind Class                              | Hex (Light) | When to Use                            |
| ---------------------- | ------------------------------------------- | ----------- | -------------------------------------- |
| primary (HP Blue)      | `bg-primary` / `text-primary`               | `#024ad8`   | Primary CTAs, links, active indicators |
| primary-bright         | `bg-primary-bright` / `text-primary-bright` | `#296ef9`   | Accent on dark slabs                   |
| primary-deep           | `bg-[var(--primary-deep)]`                  | `#0e3191`   | Pressed CTA state                      |
| primary-soft           | `bg-primary-soft`                           | `#c9e0fc`   | Soft blue chip/card backgrounds        |
| primary-foreground     | `text-primary-foreground`                   | `#ffffff`   | Text on primary buttons                |
| destructive            | `bg-destructive` / `text-destructive`       | `#b3262b`   | Errors, destructive actions            |
| destructive-foreground | `text-destructive-foreground`               | `#ffffff`   | Text on destructive buttons            |

## Colors — Semantic / Status

| Token                   | Tailwind Class                        | Hex (Light) | When to Use              |
| ----------------------- | ------------------------------------- | ----------- | ------------------------ |
| semantic-up (success)   | `text-semantic-up` / `bg-semantic-up` | `#22c55e`   | Approved, success status |
| accent-yellow (warning) | `text-[var(--accent-yellow)]`         | `#eab308`   | Warning, pending status  |
| destructive (error)     | `text-destructive`                    | `#b3262b`   | Rejected, error status   |

> **Note for status badges:** Use the `getStatusColor()` utility from `@utils/helpers/get-status-color` which returns `bg`, `text`, `icon`, `iconName`, and `border` classes for 'Verified', 'Pending', 'Rejected', 'PAID', and 'Entry' statuses. Do not hardcode status colors.

---

## Border Radius

| Token         | Tailwind Class | Value  | When to Use                                            |
| ------------- | -------------- | ------ | ------------------------------------------------------ |
| card radius   | `rounded-md`   | 16px   | Cards, section containers — **never use `rounded-md`** |
| button radius | `rounded-md`   | 4px    | All buttons, text inputs                               |
| lg            | `rounded-lg`   | 8px    | Badge pills, category cards                            |
| pill          | `rounded-md`   | 9999px | Status badges, chips, filter tags                      |

## Shadow / Elevation

| Level     | Tailwind Class         | When to Use                       |
| --------- | ---------------------- | --------------------------------- |
| Flat      | (none)                 | Section bands, full-bleed content |
| Hairline  | `border border-border` | Outlined elements                 |
| Soft Lift | `shadow-sm`            | Default card elevation            |
| Floating  | `shadow-lg`            | Modals, drawers, FAB              |

---

## Typography — Common Patterns

Always use the `Text` component with its `variant` prop. **Never use raw `className` for font sizing.**

| Usage          | Variant Pattern                                          | Example                 |
| -------------- | -------------------------------------------------------- | ----------------------- |
| Page heading   | `<Text variant="heading" size="3xl">`                    | Screen top heading      |
| Section title  | `<Text variant="heading" size="lg">`                     | Section header title    |
| Card title     | `<Text variant="display-xs">`                            | Title inside a card     |
| Body default   | `<Text variant="default">` or `<Text variant="body-md">` | General paragraph text  |
| Body lead      | `<Text variant="body-lg">`                               | Lead paragraph          |
| Body emphasis  | `<Text variant="body-emphasis">`                         | Bold run-in copy        |
| Secondary info | `<Text variant="subtext">`                               | Descriptions, help text |
| Fine print     | `<Text variant="subtext" size="xs">`                     | Metadata, timestamps    |
| Labels         | `<Text variant="label">`                                 | Form field labels       |
| Error text     | `<Text variant="error">`                                 | Validation errors       |
| Link           | `<Text variant="link">`                                  | Clickable links         |
| Button labels  | `Button` component (handles internally)                  | All button text         |

---

## Spacing

| Token   | Tailwind Class | Value | When to Use                                |
| ------- | -------------- | ----- | ------------------------------------------ |
| xxs     | `p-1`          | 4px   | Minimal spacing                            |
| xs      | `p-2`          | 8px   | Tight padding, gap between inline elements |
| sm      | `p-3`          | 12px  | Compact vertical spacing                   |
| md      | `p-4`          | 16px  | Default card padding, list item margins    |
| xl      | `p-6`          | 24px  | Generous card padding, section spacing     |
| xxl     | `p-8`          | 32px  | Large section separation                   |
| section | `p-section`    | 80px  | Major section gaps (page-level)            |

**Card padding standard:** Use `p-4` (16px) for compact card variants and `p-6` (24px) for generous card variants.

**List item margin standard:** Use `mb-4` (16px) for all list item bottom spacing.

---

## Status Badge Pattern

Standard padding for status badges across the entire app:

```tsx
<View className={cn('rounded-md px-3 py-1', statusStyle.bg)}>
  <Text className={cn('text-xs font-semibold', statusStyle.text)}>{status}</Text>
</View>
```

Always use the `getStatusColor()` utility from `@utils/helpers/get-status-color`.

---

## Card Pattern

**Preferred:** Use the shared `Card` component from `@components/ui/card`:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';

<Card variant="bordered">
  <CardHeader>
    <CardTitle>Section Title</CardTitle>
  </CardHeader>
  <CardContent>{/* content */}</CardContent>
</Card>;
```

**Fallback** (when Card layout doesn't work):

```tsx
<View className="rounded-md border border-border bg-card p-6 shadow-sm">{/* content */}</View>
```

Card variants available:

- `default` — no border, `shadow-sm` elevation
- `bordered` — `border border-border`, `shadow-sm` elevation
- `elevated` — no border, `shadow-lg` elevation
- `flat` — no border, no shadow

---

## Dark Mode Rule

**CSS variables in `global.css` handle dark mode automatically.** Do NOT add explicit `dark:` classes for background, text, or border colors when using design tokens:

| ✅ Do This        | ❌ Don't Do This                       |
| ----------------- | -------------------------------------- |
| `bg-background`   | `bg-white dark:bg-gray-900`            |
| `text-foreground` | `text-gray-900 dark:text-white`        |
| `border-border`   | `border-gray-100 dark:border-gray-800` |
| `bg-card`         | `bg-white dark:bg-gray-900`            |
| `text-charcoal`   | `text-gray-500 dark:text-gray-400`     |
| `bg-muted`        | `bg-gray-100 dark:bg-gray-800`         |

**Exceptions** — explicitly add `dark:` only when:

- Using opacity variants not covered by CSS vars (`/50`, `/20`, etc.)
- Using custom colors that don't have corresponding CSS variables
- Applying theme-specific icon colors (icons are not theme-aware)

---

## List Item Card Pattern

Standard card used in FlatList items:

```tsx
<Card variant="bordered" className="mb-4">
  <CardContent className="p-4">{/* List item content */}</CardContent>
</Card>
```

Use `mb-4` for consistent list item spacing.

---

## Summary of "Never Use"

| ❌ Never Use                                | ✅ Replace With                                                |
| ------------------------------------------- | -------------------------------------------------------------- |
| `text-gray-900`                             | `text-foreground` or `text-ink`                                |
| `text-gray-500`                             | `text-charcoal`                                                |
| `text-gray-400`                             | `text-graphite`                                                |
| `bg-white`                                  | `bg-background` or `bg-card`                                   |
| `bg-gray-50`                                | `bg-surface-soft`                                              |
| `bg-gray-100`                               | `bg-muted`                                                     |
| `border-gray-100` / `border-gray-200`       | `border-border`                                                |
| `text-blue-600` / `text-blue-700`           | `text-primary`                                                 |
| `rounded-md`                                | `rounded-md`                                                   |
| `text-xs font-bold uppercase text-gray-400` | `<Text variant="subtext" size="xs">`                           |
| `text-lg font-bold`                         | `<Text variant="heading" size="lg">`                           |
| `text-sm font-semibold`                     | `<Text variant="body-emphasis">` or `<Text weight="semibold">` |
| `slate` color palette                       | `ink`/`charcoal`/`graphite` design tokens                      |
