import { AxiosError, AxiosInstance, InternalAxiosRequestConfig, isCancel } from 'axios';
import { TokenStoreManager } from '@stores/token.store';
import { logger } from '../logger/logger';
import { attemptTokenRefresh, shouldSkipRefresh } from './token-refresh';
import { decrypt, encrypt } from '@lib/encryption';
import { cleanupSession } from './session-cleanup';
import { randomUUID } from 'expo-crypto';
import { env } from '@utils/env';

const APP_ID = env.EXPO_PUBLIC_APP_ID;

/**
 * Shape of a decrypted backend response envelope.
 *
 * The backend wraps all responses in a standard envelope containing a status
 * code, a human-readable message, a success flag, and optional payload data.
 * After decryption the envelope is unwrapped and the inner data (if any) is
 * passed through as-is.
 */
type DecryptedData = {
  status_code: string;
  message: string;
  success_flag: boolean;
  data?: any;
};

/**
 * Attaches request and response interceptors to an Axios instance.
 *
 * **Request interceptor** (fulfilled handler):
 * - Reads the access token from secure storage and injects it as a `Bearer`
 *   Authorization header.
 * - Encrypts the outgoing payload body using the app's encryption key, wrapping
 *   it in a `{ request_data, app_id }` envelope. Encryption is skipped when
 *   `options.encryption` is explicitly `false`.
 * - Tags the config with `_startTime` for end-to-end latency tracking.
 * - Logs the HTTP method and path at the `log` level.
 *
 * **Response interceptor — fulfilled handler:**
 * - Decrypts the backend envelope (`res.data.response`) using the app's
 *   decryption key.
 * - If the decrypted envelope contains a `status_code` of `'401'`, clears the
 *   session (token + persisted state) to force re-authentication.
 * - Unwraps the envelope into `{ success, message, data }` and replaces
 *   `res.data` with the unwrapped shape.
 * - Logs the decrypted status, HTTP status, and success flag.
 *
 * **Response interceptor — rejected handler:**
 * - Passes through cancelled requests (`isCancel`) without further processing.
 * - Distinguishes **network-level failures** (no `error.response`) from
 *   **server HTTP errors** and logs them separately at the `warn` level with
 *   diagnostic context (method, path, status, trace ID, duration).
 * - On **401 responses**, attempts an automatic token refresh via
 *   `attemptTokenRefresh`. Non-401 errors, missing configs, and URLs that
 *   should skip refresh (e.g. the refresh endpoint itself) are re-thrown.
 *
 * @param instance - The Axios instance to attach request and response
 *   interceptors to. The instance is mutated in place.
 * @param options - Optional configuration object.
 * @param options.encryption - Toggles encryption of request payloads and
 *   decryption of response data. Pass `false` to disable. Defaults to `true`.
 */
export function setupInterceptors(instance: AxiosInstance, options?: { encryption?: boolean }) {
  instance.interceptors.request.use(async (config) => {
    const token = await TokenStoreManager.getAccessToken();
    const traceId = randomUUID();

    if (traceId) {
      config.headers['x-trace-id'] = traceId;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data && options?.encryption !== false) {
      config.data = {
        request_data: encrypt(JSON.stringify(config.data)),
        app_id: APP_ID,
      };
    }

    (config as any)._startTime = Date.now();

    logger.log({ method: `${config.method?.toUpperCase()} =>`, path: config.url });

    return config;
  });

  instance.interceptors.response.use(
    async (res) => {
      if (res.data?.response && options?.encryption !== false) {
        const decrypted = decrypt<DecryptedData>(res.data?.response);

        let data = decrypted.data;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch {}
        }

        if (parseInt(decrypted.status_code) === 401) {
          logger.log('Unauthorized Removing Token');
          await cleanupSession();
        }

        logger.log('Decrypted Response', {
          success: decrypted.success_flag,
          message: decrypted.message,
          response_status: decrypted.status_code,
          http_status: res.status,
        });

        res.data = {
          success: decrypted.success_flag,
          message: decrypted.message,
          data: data,
        };
      }
      return res;
    },
    async (error: AxiosError) => {
      logger.log('INTERCEPTOR ERROR', error);
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      const duration = Date.now() - ((originalRequest as any)?._startTime || Date.now());
      const traceId =
        error.response?.headers?.['x-trace-id'] ||
        ((originalRequest?.headers as any)?.['x-trace-id'] as string) ||
        'unknown';
      logger.log({
        method: `${originalRequest?.method?.toUpperCase()} <=`,
        path: originalRequest?.url,
        traceId,
        duration: `${duration}ms`,
        status: error.response?.status,
      });

      // Cancelled requests are intentional — let http.ts handle the logging
      if (isCancel(error)) {
        return Promise.reject(error);
      }

      // Distinguish network-level failures from server responses for clearer diagnostics
      if (!error.response) {
        logger.warn('NETWORK_ERROR', {
          code: error.code,
          message: error.message,
          method: originalRequest?.method?.toUpperCase(),
          path: originalRequest?.url,
        });
      } else {
        logger.warn('HTTP_ERROR', {
          status: error.response.status,
          statusText: error.response.statusText,
          method: originalRequest?.method?.toUpperCase(),
          path: originalRequest?.url,
        });
      }

      if (
        !error.response ||
        error.response.status !== 401 ||
        !originalRequest ||
        shouldSkipRefresh(originalRequest.url)
      ) {
        return Promise.reject(error);
      }

      return attemptTokenRefresh(error, originalRequest, instance);
    }
  );
}
