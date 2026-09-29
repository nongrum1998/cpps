import { logger } from '../logger/logger';

/**
 * Options for the retry operation.
 */
export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  onRetry?: (error: any, attempt: number) => void;
}

/**
 * Generic exponential backoff retry wrapper for asynchronous functions.
 * Useful for networking, token registration, or any flaky I/O.
 *
 * @param fn - The asynchronous function to execute.
 * @param options - Configuration for retries (maxRetries, baseDelay, maxDelay).
 * @returns The resolved data of the function.
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000, onRetry } = options;

  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;

      if (attempt > maxRetries) {
        logger.error(`RetryUtility: Max retries (${maxRetries}) reached. Final error:`, error);
        throw error;
      }

      // Calculate exponential backoff delay (2^attempt * baseDelay)
      const delay = Math.min(Math.pow(2, attempt) * baseDelay, maxDelay);

      logger.info(`RetryUtility: Attempt ${attempt} failed. Retrying in ${delay}ms...`);

      if (onRetry) {
        onRetry(error, attempt);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Should logically never reach here due to the while condition and throws
  throw new Error('RetryUtility: Unexpected termination of retry loop.');
}
