import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRateLimitStore } from '../stores/rate-limit.store';

/** Options for configuring the rate limiter. */
export type UseRateLimitOptions = {
  /** Maximum number of allowed calls within the rolling time window. */
  limit: number;
  /** Duration of the rolling time window in milliseconds. */
  ms: number;
};

/** Shape of the object returned by {@link useRateLimit}. */
export type UseRateLimitReturn = {
  /** Whether the rate limit has been exceeded for the given key. */
  isLimited: boolean;
  /** Number of seconds until the oldest call in the window expires. */
  secondsRemaining: number;
  /** The number of calls recorded within the current time window. */
  callCount: number;
  /**
   * Records a new call for this key and checks the rate limit.
   * Call this when the guarded action is performed.
   */
  startCooldown: () => void;
  /** Clears the rate-limit history for this key, resetting the limiter. */
  reset: () => void;
};

/**
 * A sliding-window rate limiter hook.
 *
 * Tracks the number of calls made for a given `key` within a rolling time
 * window defined by `options.ms`. Once the count reaches `options.limit`,
 * `isLimited` becomes `true` until the oldest call falls outside the window.
 *
 * @param key - A unique identifier for the rate-limited action.
 * @param options - Configuration object specifying the maximum `limit` of
 *                  calls and the rolling window duration in `ms`.
 *
 * @example
 * ```tsx
 * const { isLimited, secondsRemaining, startCooldown } = useRateLimit(
 *   'LOGIN_BUTTON',
 *   { limit: 5, ms: 1000 },
 * );
 *
 * const handlePress = () => {
 *   if (!isLimited) startCooldown();
 * };
 * ```
 */
export const useRateLimit = (key: string, options: UseRateLimitOptions): UseRateLimitReturn => {
  const { limit, ms } = options;

  const recordCall = useRateLimitStore((s) => s.recordCall);
  const clearCooldown = useRateLimitStore((s) => s.clearCooldown);
  const windowCalls = useRateLimitStore((s) => s.windowCalls[key] ?? []);

  // Refresh "now" every second so the countdown display stays current
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Derive the limiter state from the raw call timestamps
  const { isLimited, secondsRemaining, callCount } = useMemo(() => {
    const windowStart = now - ms;
    const recentCalls = windowCalls.filter((t) => t > windowStart);
    const count = recentCalls.length;
    const oldestCall = recentCalls[0];

    return {
      isLimited: count >= limit,
      secondsRemaining: oldestCall ? Math.max(0, Math.ceil((ms - (now - oldestCall)) / 1000)) : 0,
      callCount: count,
    };
  }, [windowCalls, now, ms, limit]);

  /** Records a new call, advancing the sliding window. */
  const start = useCallback(() => {
    recordCall(key);
  }, [key, recordCall]);

  /** Resets the rate-limit history for this key. */
  const reset = useCallback(() => {
    clearCooldown(key);
  }, [key, clearCooldown]);

  return {
    isLimited,
    secondsRemaining,
    callCount,
    startCooldown: start,
    reset,
  };
};
