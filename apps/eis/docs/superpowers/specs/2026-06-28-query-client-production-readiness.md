# Query Client Production Readiness

**Date:** 2026-06-28
**Status:** Draft
**Approach:** B — Offline-Capable Reads

## Overview

Production-hardening of the React Query infrastructure for a read-heavy mobile app.
The app currently has no mutations — all data fetching is read-only. The design focuses
on resilience, offline data availability, and user feedback, without building mutation
infrastructure that doesn't yet have consumers.

## 1. Query Client Configuration

**File:** `src/shared/utils/react-query/index.ts`

Upgrade the singleton `QueryClient` with production defaults:

| Option                  | Current         | New             | Rationale                                                        |
| ----------------------- | --------------- | --------------- | ---------------------------------------------------------------- |
| `staleTime`             | 5 min           | 5 min           | No change — good default for most data                           |
| `gcTime`                | default (5 min) | 30 min          | Give persistence time to serialize before eviction               |
| `retry`                 | 3               | 3               | No change                                                        |
| `refetchOnReconnect`    | default (true)  | true (explicit) | Refetch stale queries when network returns                       |
| `refetchOnWindowFocus`  | default (true)  | false           | Mobile uses AppState-based focus manager, not `visibilitychange` |
| `QueryCache.onError`    | none            | toast + logger  | Global safety net for query failures                             |
| `MutationCache.onError` | toast + logger  | unchanged       | Already implemented                                              |

Add `meta.silent` support to `QueryCache.onError` so individual queries can opt out
of the global error toast (e.g., background refetches).

## 2. Focus & Online Manager Initialization

**Files:** `src/shared/utils/react-query/focus-manager.ts`, `src/shared/utils/react-query/online-manager.ts`

These are already implemented but **never called**. Wire them into `TQueryProvider`
so they activate when the provider mounts:

- **Focus manager:** Listens to React Native `AppState` changes; sets React Query as focused when app enters foreground → triggers refetch of stale queries.
- **Online manager:** Reads initial network state via `expo-network`; subscribes to changes; pauses retries when offline, resumes when online.

**Change:** Call `setupFocusManager()` and `setupOnlineManager()` in a `useEffect`
inside `TQueryProvider`. Return the cleanup functions to unsubscribe on unmount.

## 3. Query Cache Persistence

**New dependency:** `@tanstack/react-query-persist-client` + `@react-native-async-storage/async-storage`

Persist the full query cache to AsyncStorage so data survives app restarts and
cold boots. This is the key feature that prevents blank screens when offline.

### Architecture

```
TQueryProvider
  └─ PersistQueryClientProvider       ← wraps QueryClientProvider
       ├─ persister = createAsyncStoragePersister(...)
       └─ onHydrate / onPersist logging
```

### Persister Configuration

- **Storage:** AsyncStorage (not SecureStore — query cache is not sensitive, can be large)
- **Key:** `@employee/query-cache`
- **Max age:** 24 hours — data older than this is discarded on hydration
- **Serialize:** JSON via `JSON.stringify` / `JSON.parse`
- **Throttle:** 1,000 ms debounce on persist writes

### Hydration Strategy

- On app launch, load persisted cache from AsyncStorage
- Hydrate the `QueryClient` with saved data (instant UI from cache)
- Queries whose `staleTime` has elapsed will refetch in background
- If the persisted data is older than `maxAge`, discard it entirely

### Cache Invalidation on Logout

Already implemented in `auth.store.ts` (`queryClient.clear()`) and `token-refresh.ts` — no change needed.

## 4. Network Status Banner

**New directory:** `src/shared/components/network/`

A subtle banner that appears when the device loses connectivity:

- **Position:** Fixed at the top of the screen, below the status bar
- **Visual:** Slim bar (≤ 32px), amber/orange background, "You are offline" text, animated slide-in/out
- **Behavior:** Shows on disconnect, hides on reconnect (with a 1-second debounce to avoid flickering on flaky connections)
- **Data source:** Reads from React Query's `onlineManager` via a custom hook (`useOnlineStatus`)
- **Implementation:** Uses `react-native-reanimated` for smooth animation (already a dependency)

### Custom Hook: `useOnlineStatus`

Returns `{ isOnline: boolean }` — subscribes to `onlineManager.isOnline()` changes.

## 5. Per-Query Stale Time Strategy

Different data domains have different freshness requirements. Define per-query stale
times via the query key factory:

| Domain             | Stale Time            | Rationale                          |
| ------------------ | --------------------- | ---------------------------------- |
| Auth (`['me']`)    | 0 (stale immediately) | Session changes need instant check |
| Leave statuses     | 30 seconds            | Fast-changing approval states      |
| Leave list         | 1 minute              | Balance of freshness vs caching    |
| Salary / Payslips  | 15 minutes            | Slow-changing reference data       |
| Employee directory | 30 minutes            | Rarely changes                     |
| Announcements      | 5 minutes             | Moderate cadence                   |

**Implementation:** Do NOT change `queryClient` defaults. Instead, set per-query
`staleTime` at the query call site, or export constant presets from `query-keys.ts`
for convenience.

## 6. Integration

### File Changes Summary

| File                                                 | Action                                                                                          |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `package.json`                                       | Add `@tanstack/react-query-persist-client`, `@react-native-async-storage/async-storage`         |
| `src/shared/utils/react-query/index.ts`              | Add `QueryCache.onError`, `gcTime`, explicit `refetchOnWindowFocus: false`                      |
| `src/shared/providers/query-provider.tsx`            | Switch to `PersistQueryClientProvider`, init focus/online managers, wrap in `useEffect` cleanup |
| `src/shared/components/network/network-banner.tsx`   | **New** — offline banner component                                                              |
| `src/shared/components/network/use-online-status.ts` | **New** — online status hook                                                                    |
| `src/shared/components/network/index.ts`             | **New** — barrel exports                                                                        |
| `src/app/_layout.tsx`                                | Import and render `<NetworkBanner />`                                                           |
| `src/shared/utils/constants/query-keys.ts`           | Add stale time presets / docs                                                                   |

### Provider Hierarchy (updated)

```
GlobalErrorBoundary
  └─ GestureHandlerRootView
       └─ SafeAreaProvider
            └─ TQueryProvider                ← now PersistQueryClientProvider
                 └─ QueryErrorResetBoundary
                      └─ ThemeProvider
                           └─ AuthInitializer
                                └─ ...
                                     └─ children
<NetworkBanner />                            ← rendered at root layout level
```

### Dependencies to Install

```
npx expo install @react-native-async-storage/async-storage
npm install @tanstack/react-query-persist-client
```

## Non-Goals (explicitly out of scope)

- Mutation retry queue — no mutations exist yet
- Optimistic update infrastructure — no mutations exist yet
- Sync status indicator — no mutations to sync
- Request deduplication layer — React Query handles this natively
- SecureStore for query cache — AsyncStorage is sufficient for non-sensitive data
