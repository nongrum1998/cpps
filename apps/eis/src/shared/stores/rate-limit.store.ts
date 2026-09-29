import { create } from 'zustand';

/**
 * Maximum age (in ms) to retain stale window call entries during cleanup.
 * Prevents unbounded memory growth in the windowCalls map.
 */
const WINDOW_CLEANUP_THRESHOLD_MS = 60_000;

type RateLimitState = {
  /** Maps rate-limit keys to their cooldown expiry timestamps (legacy). */
  cooldowns: Record<string, number>;

  /** Maps rate-limit keys to an array of call timestamps for sliding-window tracking. */
  windowCalls: Record<string, number[]>;

  /** Starts a cooldown for the given key that expires after durationMs. */
  startCooldown: (key: string, durationMs: number) => void;

  /**
   * Clears both the cooldown and the window-call history for the given key.
   * This effectively resets the rate limit state for that key.
   */
  clearCooldown: (key: string) => void;

  /**
   * Records a new call timestamp for the given key.
   * Used by the sliding-window rate limiter to track call frequency.
   */
  recordCall: (key: string) => void;
};

export const useRateLimitStore = create<RateLimitState>()((set) => ({
  cooldowns: {},
  windowCalls: {},

  startCooldown: (key, durationMs) => {
    const expiresAt = Date.now() + durationMs;
    set((state) => {
      const now = Date.now();
      const cleaned = Object.fromEntries(
        Object.entries(state.cooldowns).filter(([, v]) => v > now)
      );
      return { cooldowns: { ...cleaned, [key]: expiresAt } };
    });
  },

  clearCooldown: (key) => {
    set((state) => {
      const { [key]: _cooldown, ...restCooldowns } = state.cooldowns;
      const { [key]: _calls, ...restCalls } = state.windowCalls;
      return { cooldowns: restCooldowns, windowCalls: restCalls };
    });
  },

  recordCall: (key) => {
    const now = Date.now();
    set((state) => {
      const existing = state.windowCalls[key] ?? [];
      // Prune stale entries to keep memory bounded
      const cleaned = existing.filter((t) => now - t < WINDOW_CLEANUP_THRESHOLD_MS);
      return {
        windowCalls: { ...state.windowCalls, [key]: [...cleaned, now] },
      };
    });
  },
}));
