/**
 * @file Dedicated Axios instance for sending logs to the server.
 *
 * This client is completely independent from the main apiClient to avoid
 * circular dependencies: logger → http → client → response-interceptor → token-refresher/response → logger
 */

import { create } from 'axios';
import { API_BASE_URL } from '@utils/http/constants';

/**
 * Axios instance used exclusively for sending log entries to the server.
 * Does NOT include any interceptors to prevent circular dependencies.
 */
export const logClient = create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});
