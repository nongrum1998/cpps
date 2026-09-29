# Push Notification Registration Deduplication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent duplicate push notification registration when the same user logs in multiple times on the same device, and clean up notification state on logout.

**Architecture:** Add a `registeredEmpCd` field to the existing persisted notification store. Before each registration attempt in `useNotifications`, compare the current user's `emp_cd` against `registeredEmpCd` — skip if they match. Set `registeredEmpCd` after a successful backend registration. On logout, the `notification.reset()` already clears the notification display state; `registeredEmpCd` intentionally persists across logouts so re-login by the same user does not re-register.

**Tech Stack:** Zustand (persisted via expo-secure-store), expo-notifications, existing NotificationService

---

### Task 1: Add `registeredEmpCd` to notification store

**Files:**

- Modify: `src/shared/stores/notification.store.ts`

- [ ] **Step 1: Add `registeredEmpCd` field and `setRegisteredEmpCd` action**

  Change the `UseNotificationStore` type to include `registeredEmpCd` and a setter:

  ```typescript
  type UseNotificationStore = {
    notification: Notification;
    registeredEmpCd: string; // NEW: tracks which user has been registered
    setNotification: (status: NotificationStatus) => void;
    setRegisteredEmpCd: (emp_cd: string) => void; // NEW
    reset: () => void;
  };
  ```

- [ ] **Step 2: Implement the new state and action in the store creator**

  Update the store's initial state and add `setRegisteredEmpCd`:

  ```typescript
  export const useNotificationStore = create<UseNotificationStore>()(
    persist(
      (set) => ({
        notification: {
          emp_cd: '',
          status: 'pending',
        },
        registeredEmpCd: '', // NEW: initially no user registered
        setNotification: (status: NotificationStatus) => {
          const auth = useAuthStore.getState();
          set({ notification: { emp_cd: auth.emp_cd, status } });
        },
        setRegisteredEmpCd: (emp_cd: string) => {
          // NEW
          set({ registeredEmpCd: emp_cd });
        },
        reset: () => {
          set({ notification: { emp_cd: '', status: 'pending' } });
          // NOTE: registeredEmpCd is NOT cleared here intentionally.
          // This prevents re-registration when the same user logs back in.
        },
      })
      // ... persist config unchanged ...
    )
  );
  ```

  > **Key design decision:** `reset()` does **not** clear `registeredEmpCd`. This is called during logout, and clearing it would cause a re-registration when the same user logs back in — defeating the purpose of deduplication. The `reset()` method only clears the notification display state.

- [ ] **Step 3: Verify the file still compiles**

  Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
  Expected: No type errors related to `notification.store.ts`

- [ ] **Step 4: Commit**

  ```bash
  git add src/shared/stores/notification.store.ts
  git commit -m "feat: add registeredEmpCd to notification store for registration dedup"
  ```

---

### Task 2: Add registration guard in `useNotifications`

**Files:**

- Modify: `src/features/notification/hooks/use-notifications.ts`

- [ ] **Step 1: Import `useNotificationStore`**

  Add to the existing imports:

  ```typescript
  import { useNotificationStore } from '@stores/notification.store';
  ```

- [ ] **Step 2: Add the dedup check before registration**

  In the registration effect (lines 76-137), add a guard at the top of the inner `register` function, before the `withRetry` call:

  ```typescript
  const register = async () => {
    // NEW: Skip registration if this user is already registered on this device
    const { registeredEmpCd } = useNotificationStore.getState();
    if (registeredEmpCd === emp_cd) {
      logger.info('NotificationHook: Skipping registration — user already registered', { emp_cd });
      return;
    }

    try {
      await withRetry(
        async () => {
          return await NotificationService.register({
            userId: emp_cd || '',
          });
        },
        {
          maxRetries: 3,
          onRetry: (err) => logger.warn('NotificationHook: Registration attempt failed', err),
        }
      );

      // NEW: Mark this user as registered after successful backend registration
      useNotificationStore.getState().setRegisteredEmpCd(emp_cd || '');

      if (isMounted) {
        await Notifications.getNotificationChannelsAsync();
        logger.info('NotificationHook: Registration & Channel Sync Complete');
      }
    } catch (error) {
      logger.error('NotificationHook: Registration permanently failed.', error);
    }
  };
  ```

  The full updated effect should look like:

  ```typescript
  useEffect(() => {
    if (isExpo() && !emp_cd) return;

    let isMounted = true;

    const register = async () => {
      const { registeredEmpCd } = useNotificationStore.getState();
      if (registeredEmpCd === emp_cd) {
        logger.info('NotificationHook: Skipping registration — already registered', { emp_cd });
        return;
      }

      try {
        await withRetry(
          async () => {
            return await NotificationService.register({
              userId: emp_cd || '',
            });
          },
          {
            maxRetries: 3,
            onRetry: (err) => logger.warn('NotificationHook: Registration attempt failed', err),
          }
        );

        useNotificationStore.getState().setRegisteredEmpCd(emp_cd || '');

        if (isMounted) {
          await Notifications.getNotificationChannelsAsync();
          logger.info('NotificationHook: Registration & Channel Sync Complete');
        }
      } catch (error) {
        logger.error('NotificationHook: Registration permanently failed.', error);
      }
    };

    register();
    // ... rest of effect (listeners) unchanged ...
  }, [emp_cd]);
  ```

- [ ] **Step 3: Verify the file still compiles**

  Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
  Expected: No type errors related to `use-notifications.ts`

- [ ] **Step 4: Commit**

  ```bash
  git add src/features/notification/hooks/use-notifications.ts
  git commit -m "feat: skip push registration when user is already registered on device"
  ```

---

### Verification Checklist

After both tasks are complete, run:

```bash
npx tsc --noEmit --pretty
```

Expected: Zero compilation errors.

**Manual verification (on device/emulator):**

1. Log in as User A → Verify `logger.info('NotificationHook: Registration & Channel Sync Complete')` appears once
2. Log out → Log in as User A again → Verify `NotificationHook: Skipping registration — already registered` appears
3. Log out → Log in as User B → Verify registration fires for User B
4. Log out → Log in as User A again → Verify registration fires for User A (cross-user edge case — acceptable)

---
