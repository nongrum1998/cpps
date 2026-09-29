import axios from 'axios';
import { setupInterceptors } from './interceptors';
import { env } from '@utils/env';

/**
 * Creates a configured Axios instance with interceptors and optional encryption.
 *
 * @param options - Configuration options.
 * @param options.encryption - Whether to enable request/response encryption (default `true`).
 * @returns A fully configured Axios instance.
 */
export function createAxiosInstance(options?: { encryption?: boolean }) {
  const instance = axios.create({
    baseURL: env.EXPO_PUBLIC_API_URL,
    withCredentials: true,
    timeout: 10000,
    timeoutErrorMessage: 'Request timed out. Please try again.',
  });

  setupInterceptors(instance, options);

  return instance;
}

const axiosInstance = createAxiosInstance({ encryption: true });

const axiosInstanceWithoutEncryption = createAxiosInstance({ encryption: false });

/**
 * Default Axios instance with encryption enabled.
 */
export default axiosInstance;

/**
 * Axios instance without encryption.
 */
export { axiosInstanceWithoutEncryption };
