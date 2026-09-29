# Move Infrastructure Components to Providers

**Date:** 2026-07-05
**Status:** Approved
**Scope:** Refactoring

## Problem

Three components in `src/shared/components/common/` are infrastructure wrappers — they render no UI of their own (beyond error/modals), manage lifecycle side effects, and are consumed almost exclusively at the composition root in `provider-wrapper.tsx`. They belong in `src/shared/providers/` to match the project's architectural convention.

## Scope

**Move:** `GlobalErrorBoundary` → `src/shared/providers/global-error-boundary.tsx`
**Move:** `UpdateModal` → `src/shared/providers/update-modal.tsx`
**Extract + Move:** `AnimationProvider` (with `AnimationContext`, `useAnimation`, `useAnimationScrollHandler`) → `src/shared/providers/animation-provider.tsx`

**Stays in components:** `FadeInView` — it is a UI component (renders animated views with visual output).

## Design

### AnimationProvider Extraction

`AnimationProvider` currently shares `fade-in-view.tsx` with `FadeInView`, `useAnimation`, and `useAnimationScrollHandler`. The new `animation-provider.tsx` will contain the entire animation context API as a cohesive module:

- `AnimationContext` — raw React context
- `AnimationProvider` — context provider wrapper
- `useAnimation` — consumer hook (throws if used outside provider)
- `useAnimationScrollHandler` — scroll-driven animation helper

`fade-in-view.tsx` will import `useAnimation` from the new provider file and only export `FadeInView`.

### File Changes

| Action | File                                                                                |
| ------ | ----------------------------------------------------------------------------------- |
| Create | `src/shared/providers/global-error-boundary.tsx`                                    |
| Create | `src/shared/providers/update-modal.tsx`                                             |
| Create | `src/shared/providers/animation-provider.tsx`                                       |
| Delete | `src/shared/components/common/global-error-boundary.tsx`                            |
| Delete | `src/shared/components/common/update-modal.tsx`                                     |
| Edit   | `src/shared/components/common/fade-in-view.tsx` — remove extracted code, add import |
| Edit   | `src/shared/components/common/index.ts` — remove two barrel exports                 |
| Edit   | `src/shared/providers/index.ts` — add three barrel exports                          |
| Edit   | `src/shared/providers/provider-wrapper.tsx` — update import paths                   |
| Edit   | `src/app/(dev)/ui-lab.tsx` — split imports                                          |

### Verification

Run `npx tsc --noEmit` to catch any missed import updates. No behavioral changes expected.
