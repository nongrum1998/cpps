// import { http } from '@utils/api';
import type { LogErrorType } from './types';

/**
 * Sends a log entry to the remote logging server.
 *
 * The entry includes the severity type, message, serialised content, and a
 * timestamp. Failures are silently caught to avoid disrupting the app flow.
 *
 * @param type    - The severity level.
 * @param message - A short identifier or summary for the log entry.
 * @param content - The serialised log data (JSON string).
 */
export const logTransporter = async (type: LogErrorType, message: string, content: string) => {
  const logEntry = {
    type,
    message,
    content,
    timestamp: new Date().toISOString(),
  };

  try {
    console.log(logEntry);
    // await http.post('/logs', logEntry);
  } catch (error) {
    console.log('Failed to send logs to server', error);
  }
};
