import { AxiosError, AxiosResponse } from 'axios';
import { ApiResponse } from '../../types';

// ── Error categorization ──────────────────────────────────────────

/**
 * High-level categories for API errors.
 *
 * Consumers can switch on this to show contextual UI, trigger retry logic,
 * or suppress notifications (e.g., cancelled requests).
 */
export enum ErrorCategory {
  /** DNS failure, connection refused, network unreachable */
  NETWORK = 'NETWORK',
  /** Request exceeded the configured timeout threshold */
  TIMEOUT = 'TIMEOUT',
  /** Request was cancelled via AbortController or component unmount */
  CANCEL = 'CANCEL',
  /** Server responded with an error (4xx/5xx excluding auth) */
  SERVER = 'SERVER',
  /** 401 Unauthorized / 403 Forbidden */
  AUTH = 'AUTH',
  /** Non-Axios or unexpected error that doesn't fit other categories */
  UNKNOWN = 'UNKNOWN',
}

/** Structured error info returned by {@link categorizeError}. */
export interface ErrorResult {
  category: ErrorCategory;
  /** User-friendly error message suitable for display. */
  message: string;
  /** HTTP status code when the server responded. */
  statusCode?: number;
}

/**
 * Classifies an unknown error into a structured {@link ErrorResult}.
 *
 * Checks Axios error codes in this order:
 * 1. Cancelled requests (`ERR_CANCELED`)
 * 2. Timeouts (`ECONNABORTED`)
 * 3. Network failures (`ERR_NETWORK`, `ENOTFOUND`, `ECONNREFUSED`, etc.)
 * 4. Auth failures (HTTP 401 / 403)
 * 5. Other server errors
 * 6. Non-Axios errors (falls back to `error.message`)
 *
 * @param error - The caught error of unknown origin.
 * @returns A structured error result with category and user-friendly message.
 */
export const categorizeError = (error: unknown): ErrorResult => {
  if (!(error instanceof AxiosError)) {
    if (error instanceof Error) {
      return { category: ErrorCategory.UNKNOWN, message: error.message };
    }
    return { category: ErrorCategory.UNKNOWN, message: 'Something went wrong. Please try again.' };
  }

  // 1. Cancelled requests — intentional, no user-facing notification needed
  if (error.code === 'ERR_CANCELED') {
    return { category: ErrorCategory.CANCEL, message: 'Request was cancelled.' };
  }

  // 2. Timeout — the request was sent but no response arrived within the time limit
  if (error.code === 'ECONNABORTED') {
    return { category: ErrorCategory.TIMEOUT, message: 'Request timed out. Please try again.' };
  }

  // 3. Network-level failures — no response received from the server
  if (!error.response) {
    if (error.code === 'ERR_NETWORK') {
      return {
        category: ErrorCategory.NETWORK,
        message: 'Unable to connect. Please check your internet connection.',
      };
    }
    // Catch-all for other network codes: ENOTFOUND, ECONNREFUSED, ERR_NAME_NOT_RESOLVED, etc.
    return {
      category: ErrorCategory.NETWORK,
      message: error.message || 'Network error. Please check your connection and try again.',
    };
  }

  // 4. Auth failures
  const status = error.response.status;
  if (status === 401 || status === 403) {
    const serverMsg = (error.response.data as { message?: string })?.message;
    return {
      category: ErrorCategory.AUTH,
      message:
        serverMsg || (status === 401 ? 'Session expired. Please log in again.' : 'Access denied.'),
      statusCode: status,
    };
  }

  // 5. Other server errors (4xx, 5xx)
  const serverMsg = (error.response.data as { message?: string })?.message;
  return {
    category: ErrorCategory.SERVER,
    message: serverMsg || `Server error (${status}). Please try again later.`,
    statusCode: status,
  };
};

/**
 * Normalizes an error object into a standard `ApiResponse` failure payload.
 *
 * Delegates to {@link categorizeError} for message generation, ensuring
 * consistent error categorization across all HTTP methods.
 *
 * @typeParam T - The expected success data type (unused in the error path).
 * @param error - The caught error of unknown origin.
 * @returns A failure `ApiResponse` with `success: false` and a descriptive message.
 */
export const handleError = <T>(error: unknown): ApiResponse<T> => {
  const { message } = categorizeError(error);
  return {
    success: false,
    message: message || 'Failed to fetch data',
  };
};

/**
 * Normalizes a successful Axios response into a standard `ApiResponse` payload.
 *
 * Extracts `data`, `message`, and `success` from the response body, defaulting
 * to sensible fallback values when fields are missing.
 *
 * @typeParam T - The expected shape of the response data.
 * @param response - The Axios response object.
 * @returns A success `ApiResponse` with `success: true` and the extracted data.
 */
export const handleResponse = <T>(response: AxiosResponse<ApiResponse<T>>): ApiResponse<T> => {
  const { message, data, success } = response.data;

  return {
    success: success ?? true,
    message: message || 'Successfully fetched data',
    data: data,
  };
};
