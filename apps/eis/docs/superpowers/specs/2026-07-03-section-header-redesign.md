# SectionHeader Redesign — Unified "Layered Floating" Component

**Date:** 2026-07-03
**Status:** Approved Design

## 1. Overview

Redesign the `SectionHeader` component into a single, unified component with a modern "layered floating" depth-forward aesthetic. Ditch the `splash` variant, drop `children`, and use the HP Design System tokens throughout.

## 2. Visual Architecture

Two-layer depth effect:

```
                       ← bg-surface-soft (background wash)
┌───────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────┐  │
│  │    ┃  🌊 Title                    [→]       │  │  ← floating card
│  │    ┃  Subtitle                             │  │     with shadow/elevation
│  └─────────────────────────────────────────────┘  │
│  ─────────────────────────────────────────────────  │  ← hairline separator
└───────────────────────────────────────────────────┘
```

| Layer           | Implementation                                   | Optional?                              |
| --------------- | ------------------------------------------------ | -------------------------------------- |
| Background wash | `bg-surface-soft rounded-md`                     | Yes — `background={false}` disables it |
| Floating card   | `bg-white dark:bg-gray-900 rounded-md shadow-sm` | Always present                         |

## 3. Props API

```ts
interface SectionHeaderProps {
  /** The heading text. */
  title: string;
  /** Optional emoji / icon character displayed in a rounded container. */
  icon?: string;
  /** Optional subtitle shown below the title. */
  subtitle?: string;
  /** Optional element rendered on the right side of the header row. */
  rightElement?: React.ReactNode;
  /** When true, renders the background wash layer behind the floating card. */
  background?: boolean;
  /** Additional classes for the outer container. */
  className?: string;
}
```

**Default:** `background = true`

## 4. Layout & Styling

### Structure

```
<View className={cn(background && 'bg-surface-soft rounded-md', className)}>
  <View className="mx-4 pt-4">                              ← spacing for wash padding
    <View className="bg-white dark:bg-gray-900 rounded-md
                    px-4 py-3 shadow-sm elevation-2">        ← floating card
      <View className="flex-row items-center gap-x-4">
        [Accent Bar] [Icon] [Title + Subtitle] [rightElement]
      </View>
      <View className="h-[1px] mt-3 ..." />                 ← separator
    </View>
  </View>
</View>
```

### Element Details

**Accent bar:**

- 4px wide, `h-10`, `rounded-md`
- Color: `bg-bloom-coral` (solid — no gradient library)
- A 1px shadow for 3D depth effect

**Icon container:**

- 44×44, `rounded-md` (12px)
- Background: `bg-surface-soft dark:bg-gray-800`
- Inset depth: `border border-hairline` + `shadow-sm` for a recessed look

**Typography:**

- Title: `variant="display-sm" weight="semibold"` → `text-ink dark:text-white`
- Subtitle: `variant="body-md"` → `text-graphite dark:text-gray-400` with `mt-0.5`

**Separator:**

- 1px height, full width (no indentation), `mt-3`
- Color: `bg-hairline` (solid)

**Shadow (cross-platform):**

- iOS: `shadow-sm` (shadowColor, shadowOffset, shadowOpacity, shadowRadius)
- Android: `elevation-2`

### Spacing

- Floating card: `px-4 py-3`
- Gap between accent bar/icon/text: `gap-x-4`
- Between card and separator: `mt-3`
- Outer wash: `mx-4 pt-4` to show wash background peeking around card

## 5. Color Tokens Used

| Token                                  | Usage                 |
| -------------------------------------- | --------------------- |
| `bg-surface-soft`                      | Background wash layer |
| `bg-white` / `dark:bg-gray-900`        | Floating card surface |
| `bg-bloom-coral`                       | Accent bar            |
| `bg-surface-soft` / `dark:bg-gray-800` | Icon container        |
| `text-ink` / `dark:text-white`         | Title text            |
| `text-graphite` / `dark:text-gray-400` | Subtitle text         |
| `bg-hairline`                          | Separator line        |
| `border-hairline`                      | Icon container border |

## 6. Migration Notes

### Per-file changes

| File                                                  | Change                                                                        |
| ----------------------------------------------------- | ----------------------------------------------------------------------------- |
| `home/components/home-header.tsx`                     | Remove `variant="section"`                                                    |
| `leave/screens/leave-screen.tsx`                      | No changes                                                                    |
| `leave/screens/create-leave-screen.tsx`               | No changes                                                                    |
| `leave/screens/update-leave-screen.tsx`               | No changes                                                                    |
| `employee/screens/employee-list-screen.tsx`           | Remove `variant`, move `<SearchInput>` / `<FilterCard>` outside SectionHeader |
| `salary/screens/salary-statements-screen.tsx`         | No changes                                                                    |
| `salary/screens/salary-statements-details-screen.tsx` | No changes                                                                    |
| `settings/screens/settings-screen.tsx`                | Add `background={false}` to both SectionHeader usages                         |
| `pension/screens/pension-screen.tsx`                  | Remove `variant="section"`                                                    |
| `pension/screens/pension-detail-screen.tsx`           | No changes                                                                    |

### Things to remove

- `variant` prop and all `splash` code
- `children` prop and rendering
- `icon` container classes repurposed for new design

## 7. Edge Cases

- **Long titles:** `flex-1` on title container ensures truncation via `numberOfLines` if needed
- **No icon but accent bar present:** Bar always renders + separator always renders
- **`background={false}`:** No wash layer, just the floating card. The card itself stays `mb-7` for spacing context
- **Dark mode:** All tokens have `dark:` counterparts

## 8. Success Criteria

- [ ] Component renders in all 17 current call sites without visual regressions
- [ ] `employee-list-screen.tsx` children are properly moved outside
- [ ] Settings screens use `background={false}` for inline usage
- [ ] Dark mode renders correctly across all usages
- [ ] No breaking changes (only removed props — no rename conflicts)
