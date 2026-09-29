import { AxiosRequestConfig, isCancel } from 'axios';
import { logger } from '../logger/logger';
import axiosInstance from '@utils/api/axios';
import { ApiResponse } from '@sharedTypes/api';
import { handleResponse, handleError } from './response';
// import { isExpo } from '@utils/helpers/expo';
import { rnFetchBlobClient } from './rn-fetch-blob-client';

// const isAxios = process.env.EXPO_PUBLIC_HTTP_PROVIDER === 'axios';

/**
 * Axios-based HTTP client with get, post, put, and delete methods.
 * Each method handles encryption/decryption, cancellation, and error normalization internally.
 */
export const axiosHttp = {
  /**
   * Sends a GET request.
   *
   * @typeParam T - The expected shape of the response data.
   * @param url - The request URL (relative to the base URL).
   * @param config - Optional Axios request configuration.
   * @returns A normalized API response.
   */
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.get(url, config);
      return handleResponse<T>(response);
    } catch (error) {
      if (isCancel(error)) {
        logger.warn(`GET ${url} — request was cancelled.`);
        return { success: false, message: 'Request cancelled.' } as ApiResponse<T>;
      }
      return handleError<T>(error);
    }
  },

  /**
   * Sends a POST request.
   *
   * @typeParam T - The expected shape of the response data.
   * @param url - The request URL.
   * @param data - The request body (object, FormData, or string).
   * @param config - Optional Axios request configuration.
   * @returns A normalized API response.
   */
  post: async <T>(
    url: string,
    data?: object | FormData | string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.post(url, data, config);
      return handleResponse<T>(response);
    } catch (error) {
      if (isCancel(error)) {
        logger.warn(`POST ${url} — request was cancelled.`);
        return { success: false, message: 'Request cancelled.' } as ApiResponse<T>;
      }
      return handleError<T>(error);
    }
  },

  /**
   * Sends a PUT request.
   *
   * @typeParam T - The expected shape of the response data.
   * @param url - The request URL.
   * @param data - The request body.
   * @param config - Optional Axios request configuration.
   * @returns A normalized API response.
   */
  put: async <T>(
    url: string,
    data?: object,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.put(url, data, config);
      return handleResponse<T>(response);
    } catch (error) {
      if (isCancel(error)) {
        logger.warn(`PUT ${url} — request was cancelled.`);
        return { success: false, message: 'Request cancelled.' } as ApiResponse<T>;
      }
      return handleError<T>(error);
    }
  },

  /**
   * Sends a DELETE request.
   *
   * @typeParam T - The expected shape of the response data.
   * @param url - The request URL.
   * @param config - Optional Axios request configuration.
   * @returns A normalized API response.
   */
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.delete(url, config);
      return handleResponse<T>(response);
    } catch (error) {
      if (isCancel(error)) {
        logger.warn(`DELETE ${url} — request was cancelled.`);
        return { success: false, message: 'Request cancelled.' } as ApiResponse<T>;
      }
      return handleError<T>(error);
    }
  },
};

/**
 * The active HTTP client instance.
 * Uses `axiosHttp` by default, or falls back to `rnFetchBlobClient` on native
 * when the `EXPO_PUBLIC_HTTP_PROVIDER` env var is not set to `'axios'`.
 */
let http = rnFetchBlobClient;

// if (!isAxios && !isExpo()) {
//   console.log(
//     "Warning: 'EXPO_PUBLIC_HTTP_PROVIDER' env var not set to 'axios'. Using 'rnFetchBlobClient' instead."
//   );
//   http = require('./rn-fetch-blob-client').rnFetchBlobClient;
// }

export { http };
