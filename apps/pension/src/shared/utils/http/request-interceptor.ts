/**
 * @file Axios request interceptor — attaches access token and device headers.
 *
 * Adds a trace ID, device type, association slug, and Bearer token (if available)
 * to every outgoing request.
 */

// import { encryptFields } from '@lib/encryption';
import { encryptFields } from '@lib/encryption';
import { TokenStoreManager } from '@stores/token.store';
import { ENDPOINTS } from '@utils/constants';
import { logger } from '@utils/logger';
import type { InternalAxiosRequestConfig } from 'axios';

/**
 * Creates the request interceptor that attaches the access token and device headers
 * to every outgoing request.
 *
 * Body handling: only plain-object bodies are auto-encrypted and stamped with
 * `version`. Pre-serialized bodies (`string`, `URLSearchParams`, `FormData`) are
 * passed through untouched so callers can control their exact wire format
 * (e.g. `application/x-www-form-urlencoded` login payloads) and to prevent
 * double-encrypting values that are already encrypted.
 *
 * @returns The request interceptor function.
 */
const skipEncUrl: string[] = [
  ENDPOINTS.VERIFICATION.VERIFICATION,
  ENDPOINTS.AUTH.DAT_LOGIN,
  ENDPOINTS.PENSIONER_STATEMENTS.SIX_MONTH_STATEMENTS,
  ENDPOINTS.AUTH.DAT_LOGOUT,
];

const baererTokenUrl: string[] = [
  ENDPOINTS.PENSIONER_STATEMENTS.SIX_MONTH_STATEMENTS,
  ENDPOINTS.AUTH.DAT_LOGOUT,
];

export const createRequestInterceptor = () => {
  return async (config: InternalAxiosRequestConfig) => {
    if (__DEV__) {
      logger.log(`Request: ${config.method} ${config.url}`);
    }
    const accessToken = await TokenStoreManager.getAccessToken();

    const isBaerer: boolean = baererTokenUrl.includes(config.url || '');

    if (accessToken && !isBaerer) {
      config.headers.Authorization = `accessToken ${accessToken}`;
    }

    // Pre-serialized bodies must reach the server byte-for-byte: spreading a
    // URLSearchParams or FormData instance into an object literal yields an
    // empty object (their entries are not own enumerable properties), which
    // silently destroys the payload. Strings would likewise be exploded into
    // indexed character objects by object spread.
    const isPreSerializedBody =
      typeof config.data === 'string' ||
      config.data instanceof URLSearchParams ||
      config.data instanceof FormData;

    if (!skipEncUrl.includes(config?.url || '/login/')) {
      if (!isPreSerializedBody) {
        config.data = {
          ...encryptFields(config.data),
          version: '24',
        };
      }
    }
    return config;
  };
};
