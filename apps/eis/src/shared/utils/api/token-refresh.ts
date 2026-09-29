import axios, { AxiosError, InternalAxiosRequestConfig, AxiosInstance } from 'axios';
import { TokenStoreManager } from '@stores/token.store';
import { queryClient } from '../react-query';
import { cleanupSession } from './session-cleanup';
import { env } from '@utils/env';

/** Tracks whether a token refresh is already in-flight to prevent concurrent calls. */
let isRefreshing = false;

/**
 * Queue of pending requests that arrived while a token refresh was in progress.
 * Each entry holds resolve/reject callbacks so they can be retried once the
 * new token is obtained.
 */
type PendingQueueT = {
  resolve: (token: string) => void;
  reject: (err: any) => void;
};

let pendingQueue: PendingQueueT[] = [];

/**
 * Drains the pending request queue, resolving or rejecting each entry.
 *
 * @param error - The error to reject with, or `null` if a token was obtained.
 * @param token - The new access token, or `null` on failure.
 */
function processQueue(error: any, token: string | null = null) {
  pendingQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else if (token) prom.resolve(token);
  });
  pendingQueue = [];
}

/**
 * Determines whether the given URL should skip automatic token refresh.
 *
 * Auth-related endpoints (login, sign-up, refresh, logout, forgot-password,
 * OTP flows) are excluded from the refresh logic to avoid recursive loops.
 *
 * @param url - The request URL to check.
 * @returns `true` if the URL should skip refresh, `false` otherwise.
 */
export function shouldSkipRefresh(url?: string) {
  if (!url) return true;
  const skipUrls = [''];
  return skipUrls.some((path) => url.includes(path));
}

/**
 * Performs a full sign-out: clears stored tokens, resets the auth store,
 * clears the React Query cache, and redirects to the login page.
 *
 * Delegates to the shared {@link cleanupSession} which uses its own
 * debounce guard to prevent rapid concurrent invocations.
 */
async function handleUnauthorizedExit() {
  await cleanupSession();
}

/**
 * Attempts to refresh the access token using the stored refresh token.
 *
 * If a refresh is already in-flight, the original request is queued and
 * retried once the new token is available. On success, the queued requests
 * are replayed with the updated authorization header. On failure (invalid
 * or expired refresh token), the user is signed out.
 *
 * @param error - The original 401 Axios error that triggered the refresh.
 * @param originalRequest - The failed request configuration, augmented with a `_retry` flag.
 * @param axiosInstance - The Axios instance used to retry the request.
 * @returns A promise resolving to the retried request response or rejecting with the error.
 */
export async function attemptTokenRefresh(
  error: AxiosError,
  originalRequest: InternalAxiosRequestConfig & { _retry?: boolean },
  axiosInstance: AxiosInstance
) {
  if (originalRequest._retry) {
    await handleUnauthorizedExit();
    return Promise.reject(error);
  }

  originalRequest._retry = true;

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      pendingQueue.push({
        resolve: (token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(axiosInstance(originalRequest));
        },
        reject: (err: any) => reject(err),
      });
    });
  }

  isRefreshing = true;

  try {
    const refreshToken = await TokenStoreManager.getRefreshToken();

    if (!refreshToken) {
      throw new Error('MISSING_REFRESH_TOKEN');
    }

    const res = await axios.post(`${env.EXPO_PUBLIC_API_URL}${''}`, {
      refresh_token: refreshToken,
    });

    const payload: any = res.data;
    const access_token = payload?.data?.access_token ?? payload?.access_token;
    const new_refresh_token = payload?.data?.refresh_token ?? payload?.refresh_token;

    if (!access_token) {
      throw new Error('Invalid refresh response');
    }

    await TokenStoreManager.addAccessToken(access_token);
    if (new_refresh_token) {
      await TokenStoreManager.addRefreshToken(new_refresh_token);
    }

    processQueue(null, access_token);
    queryClient.invalidateQueries();

    originalRequest.headers.Authorization = `Bearer ${access_token}`;
    return axiosInstance(originalRequest);
  } catch (refreshError: any) {
    processQueue(refreshError, null);

    const status = refreshError?.response?.status;
    if (status === 400 || status === 401 || refreshError.message === 'MISSING_REFRESH_TOKEN') {
      await handleUnauthorizedExit();
    }

    return Promise.reject(refreshError);
  } finally {
    isRefreshing = false;
  }
}
