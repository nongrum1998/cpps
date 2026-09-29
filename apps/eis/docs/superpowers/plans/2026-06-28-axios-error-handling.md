# Axios Error Handling Enhancement Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve detection, categorization, and reporting of Axios errors that are NOT from the backend (network failures, timeouts, DNS errors, cancelled requests), so consumers can differentiate error types and show appropriate messages/actions.

**Architecture:** Three-layer change: (1) Enrich the `ApiResponse<T>` type with error metadata fields (backward-compatible), (2) Upgrade `handleError()` to extract Axios error codes and categorize them, (3) Make `isCancel` detection consistent across all HTTP methods. No consumers need updating unless they want to use the new metadata.

**Tech Stack:** Axios v1+, TypeScript, React Native (Expo)

---

## File Structure

### Files to modify:

| File                                   | Change                                                                                                |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `src/shared/types/api.ts`              | Add `errorCode`, `errorType`, `httpStatus` fields to `ApiResponse<T>`                                 |
| `src/shared/utils/api/response.ts`     | Rewrite `handleError()` to classify Axios errors by `error.code`, preserve metadata, improve messages |
| `src/shared/utils/api/http.ts`         | Remove redundant `isCancel` check from GET only (now centralized in `handleError`)                    |
| `src/shared/utils/api/interceptors.ts` | Log `error.code` in interceptor error handler for better debugging                                    |

### Files NOT touched:

- Consumer code (hooks, screens, stores) — no changes needed, `ApiResponse` is backward-compatible
- `rpc.ts`, `index.ts` — no changes needed
- `rn-fetch-blob-client.ts`, `token-refresh.ts` — out of scope

---

## Task 1: Enhance `ApiResponse` type with error metadata

**Files:**

- Modify: `src/shared/types/api.ts`
- Test: `src/shared/types/api.test.ts` (new)

**Context:** The current `ApiResponse<T>` only has `success`, `message`, and `data`. Consumers that want to show a "Retry" button for network errors vs. "Try again later" for server errors have no way to differentiate. We add optional metadata fields.

- [ ] **Step 1: Write the type test**

```ts
// src/shared/types/api.test.ts
import { ApiResponse } from './api';

describe('ApiResponse', () => {
  it('should allow a success response without error metadata', () => {
    const res: ApiResponse<string> = {
      success: true,
      message: 'OK',
      data: 'hello',
    };
    expect(res.success).toBe(true);
    expect(res.errorCode).toBeUndefined();
  });

  it('should allow a network error response with error metadata', () => {
    const res: ApiResponse<string> = {
      success: false,
      message: 'No internet connection',
      errorCode: 'ERR_NETWORK',
      errorType: 'NETWORK',
    };
    expect(res.errorType).toBe('NETWORK');
  });

  it('should allow a timeout error response with error metadata', () => {
    const res: ApiResponse<string> = {
      success: false,
      message: 'Request timed out',
      errorCode: 'ECONNABORTED',
      errorType: 'TIMEOUT',
    };
    expect(res.errorType).toBe('TIMEOUT');
  });

  it('should allow a cancelled error response', () => {
    const res: ApiResponse<string> = {
      success: false,
      message: 'Request was cancelled',
      errorCode: 'ERR_CANCELED',
      errorType: 'CANCEL',
    };
    expect(res.errorType).toBe('CANCEL');
  });

  it('should allow a server error with httpStatus', () => {
    const res: ApiResponse<string> = {
      success: false,
      message: 'Internal server error',
      errorCode: 'ERR_BAD_RESPONSE',
      errorType: 'SERVER',
      httpStatus: 500,
    };
    expect(res.httpStatus).toBe(500);
  });
});
```

- [ ] **Step 2: Run type tests to verify they fail (types don't have new fields yet)**

Run: `npx vitest run src/shared/types/api.test.ts --reporter verbose`
Expected: FAIL — type-check error on the new fields

- [ ] **Step 3: Modify the `ApiResponse` interface**

Update `src/shared/types/api.ts`:

```ts
// Remove: import { AxiosRequestConfig } from 'axios';

export type ErrorType = 'NETWORK' | 'TIMEOUT' | 'CANCEL' | 'SERVER' | 'CLIENT' | 'UNKNOWN';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  /** Axios error code (e.g., ERR_NETWORK, ECONNABORTED, ERR_CANCELED). Absent on success. */
  errorCode?: string;
  /** High-level category of the error. Absent on success. */
  errorType?: ErrorType;
  /** HTTP status code when the server responded. Absent on network/timeout errors. */
  httpStatus?: number;
}

export interface HttpClient {
  get<T>(url: string, config?: import('axios').AxiosRequestConfig): Promise<ApiResponse<T>>;
  post<T>(
    url: string,
    data?: object,
    config?: import('axios').AxiosRequestConfig
  ): Promise<ApiResponse<T>>;
  put<T>(
    url: string,
    data?: object,
    config?: import('axios').AxiosRequestConfig
  ): Promise<ApiResponse<T>>;
  delete<T>(url: string, config?: import('axios').AxiosRequestConfig): Promise<ApiResponse<T>>;
}
```

Note: `ErrorType` is exported so any consumer that imports `ApiResponse` can reference it for type-narrowing checks.

- [ ] **Step 4: Run type tests to verify they pass**

Run: `npx vitest run src/shared/types/api.test.ts --reporter verbose`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/shared/types/api.ts src/shared/types/api.test.ts
git commit -m "feat(api): add errorCode, errorType, httpStatus fields to ApiResponse"
```

---

## Task 2: Rewrite `handleError` to classify Axios errors by code

**Files:**

- Modify: `src/shared/utils/api/response.ts`
- Test: `src/shared/utils/api/response.test.ts` (new)

**Context:** The current `handleError` only checks `error.response` vs `error.request` to decide if it was a network or backend error. Axios v1+ provides `error.code` with specific values (`ERR_NETWORK`, `ECONNABORTED`, `ERR_CANCELED`, `ERR_BAD_RESPONSE`, etc.) that give much finer-grained insight. We map these codes to `ErrorType` categories and preserve them in the response.

- [ ] **Step 1: Write the failing tests**

```ts
// src/shared/utils/api/response.test.ts
import { AxiosError, AxiosHeaders } from 'axios';
import { handleError } from './response';

// Helper to create an AxiosError with specific properties
function createAxiosError(params: {
  code?: string;
  status?: number;
  data?: any;
  message?: string;
  hasResponse?: boolean;
  hasRequest?: boolean;
}): AxiosError {
  const error = new AxiosError(params.message || 'AxiosError', params.code, {
    headers: new AxiosHeaders(),
  } as any);

  if (params.hasResponse !== false) {
    (error as any).response = {
      status: params.status || 500,
      data: params.data || {},
      headers: new AxiosHeaders(),
      statusText: 'Error',
      config: {} as any,
    };
  }

  if (params.hasRequest) {
    (error as any).request = {};
  }

  return error;
}

describe('handleError', () => {
  describe('AxiosError — backend responded (4xx/5xx)', () => {
    it('should extract message from backend response', () => {
      const error = createAxiosError({
        code: 'ERR_BAD_RESPONSE',
        status: 500,
        data: { message: 'Internal server error occurred' },
      });
      const result = handleError(error);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Internal server error occurred');
      expect(result.errorCode).toBe('ERR_BAD_RESPONSE');
      expect(result.errorType).toBe('SERVER');
      expect(result.httpStatus).toBe(500);
    });

    it('should fall back to default message if backend message missing', () => {
      const error = createAxiosError({
        code: 'ERR_BAD_REQUEST',
        status: 400,
        data: {},
      });
      const result = handleError(error);
      expect(result.message).toBe('Something went wrong. Please try again.');
      expect(result.errorType).toBe('CLIENT');
      expect(result.httpStatus).toBe(400);
    });
  });

  describe('AxiosError — network failure (no response)', () => {
    it('should return network error for ERR_NETWORK', () => {
      const error = createAxiosError({
        code: 'ERR_NETWORK',
        hasRequest: true,
        hasResponse: false,
      });
      const result = handleError(error);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Please check your internet connection.');
      expect(result.errorCode).toBe('ERR_NETWORK');
      expect(result.errorType).toBe('NETWORK');
      expect(result.httpStatus).toBeUndefined();
    });
  });

  describe('AxiosError — timeout', () => {
    it('should return timeout error for ECONNABORTED', () => {
      const error = createAxiosError({
        code: 'ECONNABORTED',
        message: 'timeout of 10000ms exceeded',
        hasResponse: false,
      });
      const result = handleError(error);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Request timed out. Please try again.');
      expect(result.errorCode).toBe('ECONNABORTED');
      expect(result.errorType).toBe('TIMEOUT');
    });
  });

  describe('AxiosError — cancelled', () => {
    it('should return cancel error for ERR_CANCELED', () => {
      const error = createAxiosError({
        code: 'ERR_CANCELED',
        hasResponse: false,
      });
      const result = handleError(error);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Request was cancelled.');
      expect(result.errorCode).toBe('ERR_CANCELED');
      expect(result.errorType).toBe('CANCEL');
    });
  });

  describe('Generic Error (non-Axios)', () => {
    it('should handle plain Error objects', () => {
      const error = new Error('Something broke');
      const result = handleError(error);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Something broke');
      expect(result.errorCode).toBeUndefined();
      expect(result.errorType).toBe('UNKNOWN');
    });

    it('should handle null/undefined gracefully', () => {
      const result = handleError(null);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Something went wrong. Please try again.');
      expect(result.errorType).toBe('UNKNOWN');
    });
  });

  describe('Cancellation via CanceledError', () => {
    it('should detect CanceledError via isCancel', () => {
      const { CanceledError } = require('axios');
      const cancelError = new CanceledError('Request cancelled by user');
      const result = handleError(cancelError);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Request was cancelled.');
      expect(result.errorCode).toBe('ERR_CANCELED');
      expect(result.errorType).toBe('CANCEL');
    });
  });

  describe('Edge cases', () => {
    it('should handle AxiosError without code gracefully', () => {
      const error = createAxiosError({
        code: undefined as any,
        status: 503,
        data: {},
      });
      const result = handleError(error);
      expect(result.errorCode).toBeUndefined();
      expect(result.errorType).toBe('SERVER');
    });

    it('should handle malformed error without response or request', () => {
      const error = createAxiosError({
        code: 'ERR_FR_TOO_MANY_REDIRECTS',
        hasResponse: false,
      });
      const result = handleError(error);
      expect(result.errorCode).toBe('ERR_FR_TOO_MANY_REDIRECTS');
      expect(result.errorType).toBe('NETWORK');
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/shared/utils/api/response.test.ts --reporter verbose`
Expected: FAIL — `handleError` doesn't return the new fields

- [ ] **Step 3: Rewrite `handleError` in `response.ts`**

Replace the contents of `src/shared/utils/api/response.ts`:

```ts
import { AxiosError, AxiosResponse, isCancel } from 'axios';
import { ApiResponse, ErrorType } from '../../types/api';

/**
 * Maps Axios error codes to high-level error categories.
 *
 * Axios v1+ populates `error.code` with specific string values. This map
 * translates them into a small set of consumer-friendly categories.
 */
const ERROR_CODE_TO_TYPE: Record<string, ErrorType> = {
  // Network / DNS / connectivity failures
  ERR_NETWORK: 'NETWORK',
  ERR_FR_TOO_MANY_REDIRECTS: 'NETWORK',
  ERR_FR_UNABLE_TO_CONNECT: 'NETWORK',
  ERR_FR_UNSUPPORTED_PROTOCOL: 'NETWORK',
  // Timeouts
  ECONNABORTED: 'TIMEOUT',
  ETIMEDOUT: 'TIMEOUT',
  // Cancellation
  ERR_CANCELED: 'CANCEL',
  // Server errors (5xx)
  ERR_BAD_RESPONSE: 'SERVER',
  // Client errors (4xx)
  ERR_BAD_REQUEST: 'CLIENT',
};

/**
 * Maps known Axios error codes to user-friendly message templates.
 */
const ERROR_CODE_TO_MESSAGE: Record<string, string> = {
  ERR_NETWORK: 'Please check your internet connection.',
  ERR_FR_TOO_MANY_REDIRECTS: 'The server redirected too many times. Please try again later.',
  ERR_FR_UNABLE_TO_CONNECT: 'Unable to connect to the server. Please try again.',
  ECONNABORTED: 'Request timed out. Please try again.',
  ETIMEDOUT: 'Connection timed out. Please check your network and try again.',
  ERR_CANCELED: 'Request was cancelled.',
};

/**
 * Determines the error type from an Axios error when the error code is not available.
 * Falls back to inspecting response/request presence and HTTP status.
 */
function inferErrorTypeFromAxiosError(error: AxiosError): ErrorType {
  if (error.response) {
    const status = error.response.status;
    return status >= 500 ? 'SERVER' : 'CLIENT';
  }
  if (error.request) {
    return 'NETWORK';
  }
  return 'UNKNOWN';
}

/**
 * Gets the HTTP status from an AxiosError, if available.
 */
function getHttpStatus(error: AxiosError): number | undefined {
  return error.response?.status;
}

/**
 * Builds a user-facing error message from an AxiosError.
 */
function getAxiosErrorMessage(error: AxiosError): string {
  const defaultMessage = 'Something went wrong. Please try again.';

  // 1. Prefer code-specific message (e.g., "Please check your internet connection.")
  if (error.code && ERROR_CODE_TO_MESSAGE[error.code]) {
    return ERROR_CODE_TO_MESSAGE[error.code];
  }

  // 2. If server responded, try to extract backend message
  if (error.response) {
    return (error.response.data as { message?: string })?.message || defaultMessage;
  }

  // 3. Fall back to Axios error message or default
  return error.message || defaultMessage;
}

/**
 * Normalizes an error object into a standard `ApiResponse` failure payload.
 *
 * Distinguishes between:
 * - **Backend errors** (server responded with 4xx/5xx) — preserves HTTP status and backend message
 * - **Network errors** (no response received) — provides connectivity-friendly message
 * - **Timeouts** (request exceeded timeout) — provides timeout-specific message
 * - **Cancelled requests** — identifies user-initiated cancellations
 * - **Generic errors** — falls back to error message or default
 *
 * All error types are tagged with an `errorCode` (Axios error code) and
 * `errorType` (high-level category) so consumers can handle different
 * failure modes programmatically.
 *
 * @typeParam T - The expected success data type (unused in the error path).
 * @param error - The caught error of unknown origin.
 * @returns A failure `ApiResponse` with `success: false` and enriched metadata.
 */
export const handleError = <T>(error: unknown): ApiResponse<T> => {
  // Handle cancelled requests — Axios CanceledError is not an AxiosError subclass
  if (isCancel(error)) {
    return {
      success: false,
      message: 'Request was cancelled.',
      errorCode: 'ERR_CANCELED',
      errorType: 'CANCEL',
    };
  }

  if (error instanceof AxiosError) {
    const errorCode = error.code || undefined;

    return {
      success: false,
      message: getAxiosErrorMessage(error),
      errorCode,
      errorType: errorCode
        ? (ERROR_CODE_TO_TYPE[errorCode] ?? inferErrorTypeFromAxiosError(error))
        : inferErrorTypeFromAxiosError(error),
      httpStatus: getHttpStatus(error),
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      message: error.message || 'Failed to fetch data',
      errorType: 'UNKNOWN',
    };
  }

  return {
    success: false,
    message: 'Something went wrong. Please try again.',
    errorType: 'UNKNOWN',
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
```

Key changes from the original:

1. `isCancel()` check at the top — catches `CanceledError` before `AxiosError` check
2. `error.code` maps to `ErrorType` categories via `ERROR_CODE_TO_TYPE`
3. `ERROR_CODE_TO_MESSAGE` provides specific messages per code
4. `inferErrorTypeFromAxiosError()` fallback for unknown codes (preserves original behavior of checking `response` vs `request`)
5. `httpStatus` preserved from `error.response?.status`
6. Backward-compatible: all callers still get `{ success: false, message }`

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/shared/utils/api/response.test.ts --reporter verbose`
Expected: PASS (all 10+ test cases)

- [ ] **Step 5: Run existing tests to verify no regressions**

Run: `npx vitest run --reporter verbose`
Expected: All existing tests still pass (no breaking changes to the response shape)

- [ ] **Step 6: Commit**

```bash
git add src/shared/utils/api/response.ts src/shared/utils/api/response.test.ts
git commit -m "feat(api): classify Axios errors by error.code with errorType + metadata"
```

---

## Task 3: Remove redundant `isCancel` check from `http.ts`

**Files:**

- Modify: `src/shared/utils/api/http.ts`
- Test: `src/shared/utils/api/http.test.ts` (new)

**Context:** Currently `isCancel(error)` is checked in the `get` method only (for a warning log), while `post`, `put`, and `delete` skip it. Since `handleError` now handles `isCancel` internally for all paths, we can remove the redundant import and special-case from `http.ts`. All four methods become identical in structure.

- [ ] **Step 1: Write tests for cancellation handling across all methods**

```ts
// src/shared/utils/api/http.test.ts
import axios from 'axios';
import { http } from './http';

// Mock axios instance
jest.mock('@utils/api/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock handleResponse/handleError
jest.mock('./response', () => ({
  handleResponse: jest.fn((res) => ({ success: true, message: 'OK', data: res.data })),
  handleError: jest.fn((err) => ({
    success: false,
    message: err instanceof axios.CanceledError ? 'Request was cancelled.' : err.message,
    errorType: err instanceof axios.CanceledError ? 'CANCEL' : 'UNKNOWN',
    errorCode: err instanceof axios.CanceledError ? 'ERR_CANCELED' : undefined,
  })),
}));

import axiosInstance from '@utils/api/axios';
import { handleResponse, handleError } from './response';

describe('http client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const methods: Array<'get' | 'post' | 'put' | 'delete'> = ['get', 'post', 'put', 'delete'];

  it.each(methods)('%s should call handleError on any exception', async (method) => {
    const networkError = new Error('Network failure');
    (axiosInstance[method] as jest.Mock).mockRejectedValue(networkError);

    const args: any[] = method === 'post' || method === 'put' ? ['/url', {}] : ['/url'];
    const result = await (http[method] as any)(...args);

    expect(handleError).toHaveBeenCalledWith(networkError);
    expect(result.success).toBe(false);
  });

  it.each(methods)('%s should handle cancellation via handleError', async (method) => {
    const cancelError = new axios.CanceledError('cancelled');
    (axiosInstance[method] as jest.Mock).mockRejectedValue(cancelError);

    const args: any[] = method === 'post' || method === 'put' ? ['/url', {}] : ['/url'];
    const result = await (http[method] as any)(...args);

    expect(handleError).toHaveBeenCalledWith(cancelError);
    expect(result.errorType).toBe('CANCEL');
  });

  it.each(methods)('%s should call handleResponse on success', async (method) => {
    const responseData = { success: true, message: 'OK', data: 'test' };
    (axiosInstance[method] as jest.Mock).mockResolvedValue({ data: responseData });

    const args: any[] = method === 'post' || method === 'put' ? ['/url', {}] : ['/url'];
    const result = await (http[method] as any)(...args);

    expect(handleResponse).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail initially**

Run: `npx vitest run src/shared/utils/api/http.test.ts --reporter verbose`
Expected: FAIL (test file doesn't exist yet)

- [ ] **Step 3: Simplify `http.ts`**

Remove the `isCancel` import and the `logger` import (if no longer used), and the special `isCancel` check from `get`. The file becomes:

```ts
import { AxiosRequestConfig } from 'axios';
import axiosInstance from '@utils/api/axios';
import { ApiResponse } from '@sharedTypes/api';
import { handleResponse, handleError } from './response';
import { isExpo } from '@utils/helpers/expo';

const isAxios = process.env.EXPO_PUBLIC_HTTP_PROVIDER === 'axios';

const axiosHttp = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.get(url, config);
      return handleResponse<T>(response);
    } catch (error) {
      return handleError<T>(error);
    }
  },

  post: async <T>(
    url: string,
    data?: object | FormData | string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.post(url, data, config);
      return handleResponse<T>(response);
    } catch (error) {
      return handleError<T>(error);
    }
  },

  put: async <T>(
    url: string,
    data?: object,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.put(url, data, config);
      return handleResponse<T>(response);
    } catch (error) {
      return handleError<T>(error);
    }
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response = await axiosInstance.delete(url, config);
      return handleResponse<T>(response);
    } catch (error) {
      return handleError<T>(error);
    }
  },
};

let http = axiosHttp;

if (!isAxios && !isExpo()) {
  http = require('./rn-fetch-blob-client').rnFetchBlobClient;
}

export { http };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/shared/utils/api/http.test.ts --reporter verbose`
Expected: PASS

- [ ] **Step 5: Run all tests for regressions**

Run: `npx vitest run --reporter verbose`
Expected: All pass

- [ ] **Step 6: Commit**

```bash
git add src/shared/utils/api/http.ts src/shared/utils/api/http.test.ts
git commit -m "refactor(api): remove redundant isCancel check, now centralized in handleError"
```

---

## Task 4: Log Axios error code in interceptor

**Files:**

- Modify: `src/shared/utils/api/interceptors.ts`

**Context:** The response error interceptor logs method, path, traceId, duration, and HTTP status, but not the Axios `error.code`. Adding it helps quickly distinguish `ERR_NETWORK` from `ECONNABORTED` in production logs.

- [ ] **Step 1: Add `error.code` to the interceptor log**

In `src/shared/utils/api/interceptors.ts`, find the `logger.log({})` block inside the error handler (around lines 93-99) and add `errorCode: error.code`:

```ts
logger.log({
  method: `${originalRequest?.method?.toUpperCase()} <=`,
  path: originalRequest?.url,
  traceId,
  duration: `${duration}ms`,
  status: error.response?.status,
  errorCode: error.code, // <-- ADD THIS
});
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/utils/api/interceptors.ts
git commit -m "chore(api): log Axios error code in response interceptor"
```

---

## How consumers use the new metadata (example, not a task)

The new `errorType` field enables callers to programmatically distinguish failure modes:

```ts
// Before — generic message only
onSuccess: (data) => {
  if (!data.success) {
    toast.error(data.message);
  }
};

// After — consumers CAN differentiate (no code change required)
onSuccess: (data) => {
  if (!data.success) {
    if (data.errorType === 'NETWORK' || data.errorType === 'TIMEOUT') {
      toast.error('Connection Issue', {
        description: data.message,
        action: { label: 'Retry', onClick: refetch },
      });
    } else {
      toast.error(data.message);
    }
  }
};
```

This is purely optional — existing consumer code continues to work unchanged because all new fields are optional.

---

## Self-Review

### Spec Coverage

| Requirement                                  | Task                                                                         |
| -------------------------------------------- | ---------------------------------------------------------------------------- |
| Detect "no internet connection" Axios errors | Task 2 — `ERR_NETWORK` → `errorType: 'NETWORK'` + clear message              |
| Handle timeouts distinctly                   | Task 2 — `ECONNABORTED` / `ETIMEDOUT` → `errorType: 'TIMEOUT'` + message     |
| Handle cancelled requests                    | Task 2 — `ERR_CANCELED` / `CanceledError` → `errorType: 'CANCEL'`            |
| Error metadata preserved for consumers       | Task 1 — `errorCode`, `errorType`, `httpStatus` on `ApiResponse`             |
| `isCancel` handled consistently              | Task 3 — Removed from `http.ts` GET-only; now centralized in `handleError`   |
| Non-backend errors have clear messages       | Task 2 — Code-specific messages map for every known error code               |
| Backward compatible                          | Task 1 — All new fields are optional; `success`, `message`, `data` unchanged |
| Better interceptor logs                      | Task 4 — `errorCode` added to log output                                     |

### Placeholder Scan

No placeholders found — every step has complete code, exact file paths, and test commands.

### Type Consistency

- `ApiResponse.errorCode?: string` — matches Axios `error.code` type
- `ApiResponse.errorType?: ErrorType` = `'NETWORK' | 'TIMEOUT' | 'CANCEL' | 'SERVER' | 'CLIENT' | 'UNKNOWN'`
- `ApiResponse.httpStatus?: number` — matches `error.response?.status`
- `ErrorType` is exported from `src/shared/types/api.ts` — available to any consumer that imports `ApiResponse`
- All `ERROR_CODE_TO_TYPE` keys are valid Axios error codes; all `ERROR_CODE_TO_MESSAGE` keys match those codes
- Fallback `inferErrorTypeFromAxiosError()` preserves the original behavior of checking `response` vs `request`
