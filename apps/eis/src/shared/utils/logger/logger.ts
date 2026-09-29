import type { LogErrorType } from './types';
import { formatData } from './format';
import { logTransporter } from './transport';
import { env } from '@utils/env';

/**
 * Core logging method that dispatches to both the console and the remote server.
 *
 * - In **development**, logs are written to the console.
 * - In **production**, only non-`LOG` levels (`ERROR`, `INFO`, `WARN`) are sent
 *   to the remote logging server.
 *
 * @param type - The severity level.
 * @param args - Arguments forwarded from the public logger methods.
 */
const logMethod = async (type: LogErrorType, ...args: any[]): Promise<void> => {
  if (env.NODE_ENV === 'development') {
    console.log(formatData(type, ...args));
    return;
  }

  if (env.NODE_ENV === 'production' && type !== 'LOG') {
    try {
      let message: string;
      let content: string;

      if (args.length === 0) {
        message = '';
        content = '';
      } else if (args.length === 1) {
        if (typeof args[0] === 'string') {
          message = args[0];
          content = args[0];
        } else {
          const json = JSON.stringify(args[0]);
          message = json;
          content = json;
        }
      } else {
        const [msg, data] = args;
        message = typeof msg === 'string' ? msg : JSON.stringify(msg);
        content = JSON.stringify(data);
      }

      await logTransporter(type, message, content);
      return;
    } catch {
      console.log(`Failed to send ${type.toLowerCase()} logs to server`);
      return;
    }
  }
};

/**
 * Application-wide logger with remote server support.
 *
 * Provides `error`, `info`, `warn`, and `log` methods. In development mode
 * output goes to the console; in production, `ERROR`, `INFO`, and `WARN`
 * entries are also sent to the remote logging endpoint.
 *
 * @example
 * ```ts
 * logger.error('Payment failed', { orderId: '123' });
 * logger.info('User logged in', userId);
 * ```
 */
export const logger = {
  /** Logs an error-level message. */
  error: (...args: any[]) => logMethod('ERROR', ...args),
  /** Logs an info-level message. */
  info: (...args: any[]) => logMethod('INFO', ...args),
  /** Logs a warning-level message. */
  warn: (...args: any[]) => logMethod('WARN', ...args),
  /** Logs a debug-level message (console-only in development). */
  log: (...args: any[]) => logMethod('LOG', ...args),
};
