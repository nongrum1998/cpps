/**
 * @file Axios response and error handlers.
 *
 * Contains the two helper functions used by the HTTP client to transform
 * raw Axios responses and errors into the standardised {@link ApiResponse} shape.
 */

import { TokenStoreManager } from '@stores/token.store';
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '@sharedTypes/api';
import { logger } from '@utils/logger';
import { ENDPOINTS } from '@utils/constants/endpoints';
import { LoginT } from '@sharedTypes/auth';
import { triggerSessionExpired } from './session-expired-handler';
import {
  failedQueue,
  isRefreshing,
  processQueue,
  refreshToken,
  setRefreshing,
} from './token-refresher';
import apiClient from './client';

/** Shape of error bodies the backend may return. */
type BackendErrorBody = {
  message?: string;
  error?: string | Record<string, unknown>;
  errors?: Record<string, unknown>;
  msg?: string;
};

/** Fallback shown when the backend provides no usable message. */
const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';
/** Shown when the request was sent but no response arrived. */
const NETWORK_ERROR_MESSAGE = 'Please check your internet connection.';

/**
 * Detects whether a value is an HTML document string.
 *
 * Heuristic check used to identify proxy/gateway error pages (which are served
 * as HTML) so they are never shown verbatim to users.
 *
 * @param value - The value to inspect (typically a response body or message).
 * @returns `true` when the value is a string that starts an `<html>` document.
 */
const isHtml = (value: unknown): value is string => {
  return typeof value === 'string' && /<html[\s>]/i.test(value);
};

/**
 * Resolves a user-facing error message from a raw backend value.
 *
 * When the value is a non-HTML string it is returned as-is; when it is not a
 * usable string a generic fallback is used. If the value is an HTML document
 * (e.g. a gateway error page) a friendly, status-aware message is returned
 * instead of the raw markup.
 *
 * @param message - The raw backend value (may be HTML, a plain string, or empty).
 * @param status - The HTTP status code used to tailor HTML fallback messages.
 * @returns A safe, human-readable error message string.
 */
const getErrorMessage = (message: unknown, status?: number): string => {
  if (!isHtml(message)) {
    return typeof message === 'string' ? message : 'Something went wrong. Please try again.';
  }

  switch (status) {
    case 502:
      return 'The server is temporarily unavailable. Please try again later.';

    case 503:
      return 'The server is temporarily unavailable. Please try again later.';

    case 504:
      return 'The server took too long to respond. Please try again later.';

    default:
      return 'The server returned an unexpected response. Please try again later.';
  }
};

/**
 * Extracts the most specific human-readable message from a backend body.
 *
 * Handles string bodies, `message`, `msg`, and string-valued `error` keys.
 * Returns `undefined` when nothing usable exists so callers apply defaults.
 */
const extractBackendMessage = (data: unknown): string | undefined => {
  if (typeof data === 'string') {
    return data.trim() || undefined;
  }
  if (!data || typeof data !== 'object') {
    return undefined;
  }

  const body = data as BackendErrorBody;
  return (
    body.msg ??
    body.message ??
    (typeof body.error === 'string' && body.error.trim() ? body.error : undefined) ??
    undefined
  );
};

/**
 * Builds the standard failure-payload fields from a backend body.
 *
 * Always yields a `message`; preserves `errors` (validation map) and
 * object-shaped `error` details when present. When the backend returns a
 * non-JSON (HTML) response body — typically from an upstream proxy or gateway —
 * the message is resolved through {@link getErrorMessage} so the user sees a
 * friendly, status-aware text instead of raw HTML markup.
 *
 * @param data - The raw response body (object, string, or empty).
 * @param status - The HTTP status code, used to tailor HTML fallback messages.
 * @returns The standard failure-payload fields.
 */
const buildErrorFields = (
  data: unknown,
  status?: number
): Pick<ApiResponse<unknown>, 'message' | 'error' | 'errors'> => {
  if (data && typeof data === 'object') {
    const body = data as BackendErrorBody;
    return {
      message: extractBackendMessage(body) || '',
      ...(body.errors && { errors: body.errors }),
      ...(body.error && typeof body.error === 'object' && { error: body.error }),
    };
  }
  return { message: getErrorMessage(data, status) };
};

/**
 * Transforms an unknown error into a standard error {@link ApiResponse}.
 *
 * Handles three error categories:
 * - **AxiosError with response** — includes the HTTP `status` and extracts
 *   the server-provided message/details.
 * - **AxiosError without response (network)** — connection-failure message;
 *   `status` is omitted since no HTTP exchange occurred.
 * - **Generic/unknown errors** — uses the error's own message when available.
 *
 * @param error - The caught error (Axios or otherwise).
 * @returns A standardised error response with `success: false`.
 */
export const handleAxiosError = <T>(error: unknown): ApiResponse<T> => {
  if (error instanceof AxiosError) {
    // Server responded with an error status
    if (error.response) {
      return {
        success: false,
        status: error.response.status,
        ...buildErrorFields(error.response.data, error.response.status),
      };
    }

    // Request was made but no response was received
    if (error.request) {
      return { success: false, message: NETWORK_ERROR_MESSAGE };
    }

    // Something went wrong while setting up the request
    return {
      success: false,
      message: error.message || DEFAULT_ERROR_MESSAGE,
    };
  }

  // Normal JavaScript Error
  if (error instanceof Error) {
    return { success: false, message: error.message || DEFAULT_ERROR_MESSAGE };
  }

  // Unknown error type
  return { success: false, message: DEFAULT_ERROR_MESSAGE };
};

/** Fallback message when a successful body carries no usable message. */
const DEFAULT_SUCCESS_MESSAGE = 'Success';

/**
 * Transforms a successful Axios response into a standard {@link ApiResponse}.
 *
 * Marks the response as successful for any 2xx status (200–299). Non-2xx
 * statuses also reach this handler for auth endpoints, because the response
 * interceptor resolves those error responses directly to callers — they are
 * remapped here with the same extraction logic as {@link handleAxiosError}.
 *
 * @param response - The Axios response object.
 * @returns A standardised response with `status` always populated.
 */
export const handleResponse = <T>(response: AxiosResponse<T>): ApiResponse<T> => {
  const { status, data } = response;
  const isSuccess = status === 200;

  if (isSuccess) {
    const message = extractBackendMessage(data);
    return {
      success: true,
      status,
      // Use the status-aware HTML fallback only when the body is an HTML page;
      // otherwise keep the normal "Success" default for JSON bodies.
      message: isHtml(message)
        ? getErrorMessage(message, status)
        : message ?? DEFAULT_SUCCESS_MESSAGE,
      data,
    };
  }

  // Non-2xx resolved by the auth-path branch of the response interceptor.
  return {
    success: false,
    status,
    ...buildErrorFields(data, status),
  };
};

interface LoginResponseT extends LoginT {
  renew_token: string;
  token: string;
}

export const handleLoginResponse = async (response: AxiosResponse) => {
  const requestUrl = response.config.url || '';

  if (response.status !== 200) return response;
  // Safely check if the request path matches the login endpoint, ignoring query parameters
  const isLoginEndpoint = requestUrl.split('?')[0].endsWith(ENDPOINTS.AUTH.LOGIN);
  const isDatLogin = requestUrl.split('?')[0].endsWith(ENDPOINTS.AUTH.DAT_LOGIN);

  // handle dat login
  if (isDatLogin && response.data) {
    const data = response.data.data as Omit<LoginResponseT, 'renew_token'>;
    try {
      if (data.token) {
        logger.info('Setting DAT Token');
        await TokenStoreManager.addDatAccessToken(data.token);
        logger.info('Token DAT Set');
      }
    } catch (error) {
      logger.error('Failed to save dat tokens to store', error);
      return Promise.reject(error);
    }
  }

  // Axios only passes 2xx status codes to this handler by default
  if (isLoginEndpoint && response.data) {
    const data = response.data as LoginResponseT;

    try {
      if (data.token) {
        logger.info('Setting Token');
        await TokenStoreManager.addAccessToken(data.token);
        logger.info('Token Set');
      }

      if (data.renew_token) {
        logger.info('Setting Refresh Token');
        await TokenStoreManager.addRefreshToken(data.renew_token);
        logger.info('Refresh Token Set');
      }
    } catch (error) {
      logger.error('Failed to save tokens to store', error);
      return Promise.reject(error);
    }

    // Strip tokens from the response payload returned to callers
    const { token, renew_token, ...userData } = data;
    response.data = userData;
  }

  return response;
};

export const handleRefreshTokenResponse = async (
  response: AxiosResponse
): Promise<AxiosResponse> => {
  const originalRequest = response.config as InternalAxiosRequestConfig & {
    _retry?: boolean;
  };

  const refreshResponseStatus = response?.status === 202;

  if (refreshResponseStatus && !originalRequest._retry) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `accessToken ${token}`;
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    setRefreshing(true);

    try {
      const newToken = await refreshToken();
      processQueue(null, newToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `accessToken ${newToken}`;
      }
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      await TokenStoreManager.removeTokens();

      triggerSessionExpired();

      if (response) return response;

      return response;
    } finally {
      setRefreshing(false);
    }
  }
  return response;
};
