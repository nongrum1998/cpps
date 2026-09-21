import { create } from 'axios';

import { API_BASE_URL } from './constants';
import { createRequestInterceptor } from './request-interceptor';
import { createResponseInterceptor } from './response-interceptor';

/**
 * Configured Axios instance for application-wide API requests.
 * Includes base URL, credentials support, default JSON headers,
 * and interceptors for auth token injection and automatic token refresh.
 */
const apiClient = create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000, //
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

apiClient.interceptors.request.use(createRequestInterceptor());

apiClient.interceptors.response.use(...createResponseInterceptor());

export default apiClient;
