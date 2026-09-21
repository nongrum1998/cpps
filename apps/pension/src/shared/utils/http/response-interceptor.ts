/**
 * @file Axios response interceptor — handles 401 errors with token refresh.
 *
 * On a 401 response, the interceptor attempts to refresh the access token
 * transparently and retry the original request. Auth-path errors bypass the
 * refresh flow and return directly to the caller.
 */

import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { isAuthPath } from './constants';
import { handleLoginResponse, handleRefreshTokenResponse } from './response';

/**
 * Creates the response interceptor that handles 401 errors by attempting
 * to refresh the access token and retrying the failed request.
 *
 * Auth-path errors are returned directly to the caller without triggering
 * the refresh flow.
 *
 * @param apiClient - The Axios instance used to retry failed requests.
 * @returns A pair of [onFulfilled, onRejected] handlers for `axios.interceptors.response.use()`.
 */

export const createResponseInterceptor = () => {
  return [
    async (response: AxiosResponse) => {
      await handleLoginResponse(response);
      // Capture the return value - it may be the retried response after token refresh
      const refreshedResponse = await handleRefreshTokenResponse(response);

      // Return the refreshed response if token was refreshed, otherwise original
      return refreshedResponse;
    },

    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      if (!originalRequest) {
        return Promise.reject(error);
      }

      const requestPath = originalRequest.url ?? '';

      if (isAuthPath(requestPath)) {
        if (error.response) return Promise.resolve(error.response);
        return Promise.reject(error);
      }

      return Promise.reject(error);
    },
  ] as const;
};
