# Snackbar Toast — Design Spec

> A lightweight, custom-built snackbar banner component for the employee app.
> Designed to sit alongside the existing `sonner-native` Toaster.

## UI Design

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              screen content                     │
│                                                 │
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │     Profile updated successfully         │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
│              tab bar / bottom of screen           │
└─────────────────────────────────────────────────┘
```

- **Position:** 16px above the bottom safe-area edge, horizontally centered
- **Shape:** Pill/fully rounded (`rounded-md`), padding ~12px vertical × 16px horizontal
- **Max width:** 90% of screen width; text truncated with ellipsis if too long
- **Light theme:** Dark background (`bg-ink` / `#1a1a1a`), white text
- **Dark theme:** White background (`bg-white`), dark text
- **Shadow:** Subtle elevation for visual depth
- **Animation:** Slides up from below screen edge (~250ms); slides down on dismiss
- **Timer:** Auto-dismisses after 4 seconds
- **Interaction:** Tap anywhere on banner → dismiss immediately + cancel timer
- **Icon:** Optional (passed as argument; no icon by default)

## Architecture

- **Store:** `snackbar.store.ts` (Zustand) — holds `message`, `visible`, `icon`
- **Provider:** `snackbar-provider.tsx` — renders the animated `Animated.View` banner
- **Hook:** `use-snackbar.ts` — convenience hook returning `showSnackbar`, `dismissSnackbar`
- **Integration:** SnackbarProvider rendered in root `_layout.tsx` next to `<Toaster />`

## States

| State      | Behavior                                                  |
| ---------- | --------------------------------------------------------- |
| Hidden     | `message: null`, `visible: false` — nothing rendered      |
| Visible    | Banner slides in, 4s timer starts                         |
| Dismissing | Banner slides out, then `visible: false`, `message: null` |
| Tapped     | Timer cancelled, banner slides out immediately            |
