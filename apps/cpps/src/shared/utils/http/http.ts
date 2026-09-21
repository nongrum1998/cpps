/**
 * @file Axios HTTP client wrapper with typed responses and request cancellation support.
 *
 * Provides a thin wrapper around `axios` with standardised error handling
 * and typed response shapes. Each method returns a consistent {@link ApiResponse} shape.
 */

import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiResponse } from '@sharedTypes/api';

import apiClient from './client';
import { handleAxiosError, handleResponse } from './normalize';

/**
 * Executes an Axios call and maps the result into the standard {@link ApiResponse}.
 * Centralises the try/catch every method used to repeat.
 *
 * @param executor - Thunk performing the Axios call for one HTTP method.
 * @returns A promise resolving to a typed {@link ApiResponse}.
 */
const request = async <T>(executor: () => Promise<AxiosResponse<T>>): Promise<ApiResponse<T>> => {
  try {
    return handleResponse<T>(await executor());
  } catch (error) {
    return handleAxiosError<T>(error);
  }
};

/**
 * Typed HTTP client with `get`, `post`, `put`, and `delete` methods.
 *
 * All methods return a standardised {@link ApiResponse} and handle errors
 * uniformly through {@link handleAxiosError}. Cancelled requests are logged
 * using the client logger.
 *
 * @example
 * ```ts
 * const res = await http.get<User[]>("/users");
 * if (res.success) {
 *   console.log(res.data);
 * }
 * ```
 */

export const http = {
  /**
   * Sends a GET request.
   *
   * @param url    - The request URL.
   * @param config - Optional Axios request config.
   * @returns A promise resolving to a typed {@link ApiResponse}.
   */
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    request(() => apiClient.get<T>(url, config)),

  /**
   * Sends a POST request.
   *
   * @param url    - The request URL.
   * @param data   - Optional payload. Plain objects are auto-encrypted by the
   *                 request interceptor; pre-serialized bodies (`string`,
   *                 `URLSearchParams`, `FormData`) are sent as-is.
   * @param config - Optional Axios request config.
   * @returns A promise resolving to a typed {@link ApiResponse}.
   */
  post: <T>(
    url: string,
    data?: object | string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => request(() => apiClient.post<T>(url, data, config)),

  /**
   * Sends a PUT request.
   *
   * @param url    - The request URL.
   * @param data   - Optional payload object.
   * @param config - Optional Axios request config.
   * @returns A promise resolving to a typed {@link ApiResponse}.
   */
  put: <T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    request(() => apiClient.put<T>(url, data, config)),

  /**
   * Sends a DELETE request.
   *
   * @param url    - The request URL.
   * @param config - Optional Axios request config.
   * @returns A promise resolving to a typed {@link ApiResponse}.
   */
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    request(() => apiClient.delete<T>(url, config)),
};
