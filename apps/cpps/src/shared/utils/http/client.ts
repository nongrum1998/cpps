import { API_BASE_URL } from './constants';
import { createApi } from '@pension/api';
import { createRequestInterceptor, handleRequestToken } from './request-interceptor';
import { decryptRequestResponse } from './decrypt-response';
import { handleErrorResponse } from './response-interceptor';
/**
 * Configured Axios instance for application-wide API requests.
 * Includes base URL, credentials support, default JSON headers,
 * and interceptors for auth token injection and automatic token refresh.
 */
const apiClient = createApi({
  baseURL: API_BASE_URL,
  interceptors: {
    request: [
      {
        onFulfilled: handleRequestToken(),
      },
      {
        onFulfilled: createRequestInterceptor(),
      },
    ],
    response: [
      {
        onFulfilled: decryptRequestResponse,
        onRejected: handleErrorResponse(),
      },
    ],
  },
});

export default apiClient.client;

const http = apiClient.http;

export { apiClient, http };
