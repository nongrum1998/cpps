/**
 * @file Dedicated Axios instance for token refresh requests.
 *
 * This client is completely independent from the main apiClient to avoid
 * circular dependencies. It has minimal configuration - only what's needed
 * for the token refresh endpoint.
 */

import { create } from 'axios';
import { API_BASE_URL } from './constants';

/**
 * Axios instance used exclusively for token refresh requests.
 * Does NOT include request/response interceptors from the main client
 * to prevent circular dependency: client → response-interceptor → token-refresher → client
 */
export const tokenRefreshClient = create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/json',
  },
});
