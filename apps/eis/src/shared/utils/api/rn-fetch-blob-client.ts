import { encrypt, decrypt } from '@lib/encryption';
import { TokenStoreManager } from '@stores/token.store';
import { logger } from '../logger/logger';
import RNFetchBlob from 'rn-fetch-blob';
import { METHODS } from '@utils/constants';
import { HttpClient } from '@sharedTypes/api';
import { cleanupSession } from './session-cleanup';
import { env } from '@utils/env';

const APP_ID = env.EXPO_PUBLIC_APP_ID;
const API_URL = env.EXPO_PUBLIC_API_URL;

const BASE_CONFIG = {
  trusty: true,
};

/** Raw shape of the decrypted backend envelope. */
type DecryptedBackendResponse<T> = {
  status_code: string;
  message: string;
  success_flag: boolean;
  data?: T;
};

/** Normalised API response shape used by the native blob client. */
type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

/**
 * Converts the raw decrypted backend payload into the standardised `ApiResponse` shape.
 *
 * @typeParam T - The type of the response data.
 * @param data - The decrypted backend response envelope.
 * @returns A normalised API response.
 */
function backendResponse<T>(data: DecryptedBackendResponse<T>): ApiResponse<T> {
  return {
    success: data.success_flag,
    message: data.message,
    data: data.data as T,
  };
}

/**
 * Core native HTTP request function using `RNFetchBlob`.
 *
 * Handles encryption of the request body, Bearer token injection, response
 * decryption, and 401 response handling (token removal). Logs encrypted
 * payloads, request duration, and decrypted responses for debugging.
 *
 * @typeParam T - The expected shape of the response data.
 * @param method - The HTTP method.
 * @param url - The request path (relative to `EXPO_PUBLIC_API_URL`).
 * @param headers - Additional request headers.
 * @param body - Optional request body (will be encrypted if provided).
 * @returns A promise resolving to the normalised API response.
 */
async function request<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  headers: Record<string, string> = {},
  body?: any
): Promise<ApiResponse<T>> {
  const token = await TokenStoreManager.getAccessToken();
  const startTime = Date.now();

  let newBody;

  if (body) {
    const data = JSON.stringify(body);
    newBody = JSON.stringify({
      request_data: encrypt(data),
      app_id: APP_ID,
    });

    logger.log('Encrypted Body', {
      encrypted: JSON.parse(newBody),
      unencrypted: body,
    });
  }

  const uri = `${API_URL}${url}`;

  logger.log({
    method: `${method} =>`,
    path: uri,
    functionName: body.functionName,
  });

  try {
    const response = await RNFetchBlob.config(BASE_CONFIG).fetch(
      method,
      uri,
      {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...headers,
      },
      newBody
    );

    const duration = Date.now() - startTime;

    logger.log({
      method: `${method} <=`,
      path: uri,
      duration: `${duration}ms`,
      status: response.respInfo?.status,
    });

    if (!response.data) {
      return backendResponse<T>({
        message: 'Something went wrong. Please try again.',
        success_flag: false,
        status_code: response.respInfo.status.toString() || '500',
      });
    }

    const parsed = JSON.parse(response.data);
    // Encrypted backend response
    if (response.respInfo.status === 401) {
      logger.warn('401 Response', {
        message: parsed.message,
        status_code: parsed.status_code,
      });

      await cleanupSession();

      return backendResponse<T>({
        message: parsed.message || 'Unauthorized',
        success_flag: false,
        status_code: '401',
      });
    }

    const decrypted = decrypt<DecryptedBackendResponse<T>>(parsed.response);

    logger.log('Decrypted Response', {
      success: decrypted.success_flag,
      message: decrypted.message,
      method: body.functionName,
      response_status: decrypted.status_code,
      http_status: response.respInfo.status,
    });

    if (decrypted.status_code === '401' && body?.functionName !== METHODS.EMP_LOGIN) {
      await cleanupSession();
    }

    const data = typeof decrypted.data === 'string' ? JSON.parse(decrypted.data) : decrypted.data;

    return backendResponse<T>({
      success_flag: decrypted.success_flag,
      message: decrypted.message,
      data: data as T,
      status_code: decrypted.status_code,
    });
  } catch (error: any) {
    throw error;
  }
}

/**
 * Native HTTP client implementation using `RNFetchBlob`.
 *
 * Provides `get`, `post`, `put`, and `delete` methods that delegate to the
 * internal encrypted `request` function. Used as a drop-in replacement for
 * the Axios-based client when running outside Expo.
 */
export const rnFetchBlobClient: HttpClient = {
  get: (url, config) => request('GET', url, config?.headers as Record<string, string>),

  post: (url, data, config) =>
    request('POST', url, config?.headers as Record<string, string>, data),

  put: (url, data, config) => request('PUT', url, config?.headers as Record<string, string>, data),

  delete: (url, config) => request('DELETE', url, config?.headers as Record<string, string>),
};
