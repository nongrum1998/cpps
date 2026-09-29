# StackHeader — Auto-Detecting Page-Level Header

**Date:** 2026-06-25
**Status:** Draft
**Feature:** Centralized, config-driven navigation header for stack/detail pages

---

## 1. Problem

The codebase has two header patterns:

- `ScreenHeader` — decorative splash header for tab/dashboard screens
- `Header` / `HeaderStack` — navigation header with back button, used for stack/detail screens

Each screen currently configures its header individually (`HeaderStack` in route files or `Header` inline). This creates duplication and makes global header changes tedious.

## 2. Goal

A single config-driven navigation header that:

- Reads its configuration from a central map keyed by route path
- Auto-detects the current route and renders the correct header
- Requires **zero per-screen code** — no header imports or JSX in screen files
- Supports: title, subtitle, back button, left/right action slots, bottom content, custom background
- Replaces `Header` / `HeaderStack` for all stack/detail screens
- Does NOT affect tab/dashboard screens (they keep `ScreenHeader`)

## 3. Architecture

### 3.1 Files to Create

| File                                                   | Purpose                                              |
| ------------------------------------------------------ | ---------------------------------------------------- |
| `src/shared/config/page-headers.ts`                    | Central config map of route → header config          |
| `src/shared/components/layout/stack-header.tsx`        | The auto-detecting header component                  |
| `src/shared/components/layout/stack-header-layout.tsx` | Layout wrapper that conditionally renders the header |

### 3.2 Config Map — `page-headers.ts`

```typescript
export interface PageHeaderConfig {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  bottomContent?: React.ReactNode;
  background?: string;
}

export const PAGE_HEADERS: Record<string, PageHeaderConfig> = {
  '/settings': { title: 'Settings', showBackButton: true },
  '/announcements': { title: 'Announcements', showBackButton: true },
  '/employees': { title: 'Employees', showBackButton: true },
  '/employees/[id]': { title: 'Employee Details', showBackButton: true },
  '/employees/[id]/salary/[paySlipId]': { title: 'Pay Slip', showBackButton: true },
  '/pension/[id]': { title: 'Pension Slip', showBackButton: true },
};
```

Key design decisions:

- Keys are route path patterns (with `[param]` placeholders)
- Lookup: try exact match first, then pattern match against all param-based keys
- Routes not in the map render no header (e.g. auth screens)

### 3.3 StackHeader Component

**Auto-detection:**

- Uses `useSegments()` from expo-router to build the current path string
- Matches against `PAGE_HEADERS`: exact match, then param-pattern fallback
- If no match → returns `null`

**Rendering:**

- SafeAreaView wrapper for notched devices
- Back button (calls `router.canGoBack()` / `router.back()`) — only shown when `showBackButton: true`
- Title and optional subtitle
- Left/right slot positions for custom elements
- Bottom content area for search inputs, filters, etc.
- Custom background support

**Edge cases:**

- No config match → renders nothing (null)
- No title in config → empty title (fallback to screen name)
- `canGoBack()` is false → back button hidden even if `showBackButton: true`

### 3.4 Layout Integration

A `StackHeaderLayout` wrapper component:

```typescript
const StackHeaderLayout = () => {
  const path = useRoutePath(); // builds path from useSegments()
  const config = matchRoute(PAGE_HEADERS, path);
  return (
    <>
      {config && <StackHeader config={config} />}
      <Slot />
    </>
  );
};
```

Applied in relevant `_layout.tsx` files:

- `app/(admin)/_layout.tsx` — wrap `<Slot />` with `<StackHeaderLayout />`
- `app/settings/_layout.tsx` — same
- `app/announcements/_layout.tsx` — same
- `app/pension/_layout.tsx` (if exists) — same

Tab layout and auth layout are NOT affected.

## 4. Route Matching Algorithm

```
1. Build path from useSegments(): '/' + segments.join('/')
2. Check PAGE_HEADERS[path] for exact match → return if found
3. For each key containing [param], compile to regex and test path
4. First match wins (order keys by specificity, desc)
5. No match → return null (no header)
```

## 5. Existing Components Not Affected

- `ScreenHeader` — stays for tab/dashboard screens
- `Header` / `HeaderStack` — remain for backward compat, but unused by new screens

## 6. Future Considerations

- Animated header variants (scroll-based hide/show) are out of scope for v1
- Deep linking and modal detection can be added later

## 7. Out of Scope

- Animated/scroll-aware headers
- Tab/dashboard splash header replacement
- Auth screen headers
- Drawer menu integration
