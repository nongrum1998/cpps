import type { LogErrorType } from './types';

/**
 * Formats log arguments into a structured string with timestamp and severity.
 *
 * Supports one or two arguments: a single value (logged as-is or JSON-stringified),
 * or a pair consisting of a message and a data object.
 *
 * @param type - The severity level.
 * @param args - One or two arguments: a value, or (message, data) pair.
 * @returns A formatted log line.
 */
export const formatData = (type: LogErrorType, ...args: any[]): string => {
  const timestamp = new Date().toISOString();
  let content: string;

  if (args.length === 1) {
    content = typeof args[0] === 'string' ? args[0] : JSON.stringify(args[0], null, 3);
  } else {
    const [message, data] = args;
    content =
      typeof message === 'string'
        ? `${message} ${data ? JSON.stringify(data, null, 3) : ''}`
        : JSON.stringify(message, null, 3);
  }

  return `[${timestamp}] [${type}]: ${content}`;
};
