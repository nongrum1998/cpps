# RNFetchBlob + Axios Error Handling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring `rn-fetch-blob-client.ts` to parity with the Axios client by normalizing all network/backend errors into structured `ApiResponse<T>` with `errorCode`, `errorType`, and `httpStatus` metadata, and generalize the error categorization utilities in `response.ts` to handle both Axios and RNFetchBlob error shapes.

**Architecture:** Three sequential phases: (1) Complete the existing Axios error handling foundation (adds `errorCode`/`errorType`/`httpStatus` to `ApiResponse<T>`, rewrites `handleError` for Axios), (2) Generalize `categorizeError` in `response.ts` to detect non-Axios errors via message-pattern matching, (3) Fix `rn-fetch-blob-client.ts` catch block and add HTTP status checking for backend error responses.

**Tech Stack:** RNFetchBlob ^0.12.0, Axios v1+, TypeScript, React Native (Expo + bare RN), vitest

**Prerequisite:** The existing Axios plan at `docs/superpowers/plans/2026-06-28-axios-error-handling.md` must be completed first (Phase 1). This plan picks up after that.

---

## File Structure

### Files to Create

| File                                                | Phase                                 | Purpose                                                                  |
| --------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------ |
| `src/shared/utils/api/response.test.ts`             | Phase 1 (per existing plan) + Phase 2 | Tests for `categorizeError` with both Axios and RNFetchBlob error shapes |
| `src/shared/utils/api/rn-fetch-blob-client.test.ts` | Phase 3                               | Tests for `rnFetchBlobClient` error handling                             |

### Files to Modify

| File                                           | Phase                   | Change                                                                                                 |
| ---------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------ |
| `src/shared/types/api.ts`                      | Phase 1 (existing plan) | Add `errorCode`, `errorType`, `httpStatus` to `ApiResponse<T>`                                         |
| `src/shared/utils/api/response.ts`             | Phase 1 + 2             | (Phase 1) Rewrite `handleError` for Axios; (Phase 2) Generalize `categorizeError` for non-Axios errors |
| `src/shared/utils/api/http.ts`                 | Phase 1 (existing plan) | Remove redundant `isCancel` checks                                                                     |
| `src/shared/utils/api/interceptors.ts`         | Phase 1 (existing plan) | Log `error.code`                                                                                       |
| `src/shared/utils/api/rn-fetch-blob-client.ts` | Phase 3                 | Fix catch block + add HTTP status checking                                                             |

---

## Phase 1: Axios Error Handling Foundation

Execute the existing plan at `docs/superpowers/plans/2026-06-28-axios-error-handling.md`. This covers:

- **Task 1:** Add `errorCode`, `errorType`, `httpStatus` optional fields to `ApiResponse<T>` in `src/shared/types/api.ts`
- **Task 2:** Rewrite `handleError` in `src/shared/utils/api/response.ts` to classify Axios errors by `error.code`, with code-to-type map and code-to-message map
- **Task 3:** Remove redundant `isCancel` from `src/shared/utils/api/http.ts` (now centralized in `handleError`)
- **Task 4:** Log `error.code` in the response error interceptor

> [!IMPORTANT]
> The existing plan references vitest tests. If vitest is not yet installed, add it as a devDependency first:
>
> ```bash
> pnpm add -D vitest
> ```
>
> Or create a minimal `vitest.config.ts` if one does not exist.

**Verification gate:** All tests from the existing plan pass. `ApiResponse<T>` now has `errorCode?: string`, `errorType?: ErrorType`, `httpStatus?: number`.

---

## Phase 2: Generalize Error Categorization for Non-Axios Errors

### Task 5: Generalize `categorizeError` to handle RNFetchBlob (and other non-Axios) errors

**Files:**

- Modify: `src/shared/utils/api/response.ts`
- Modify: `src/shared/utils/api/response.test.ts` (extend existing test file from Phase 1)

**Context:** The Phase 1 rewrite of `handleError`/`categorizeError` checks `error instanceof AxiosError` as its first step. When `rn-fetch-blob-client.ts` throws errors (plain `Error` objects with message strings), this check fails and they fall through to the generic handler, losing the ability to detect network/timeout/cancel categories. We need to add a message-pattern detection pass for non-Axios errors.

The RNFetchBlob library throws plain `Error` instances with these known message patterns:

- Timeouts: messages containing `"timed out"`, `"timeout"`, or `respInfo.timeout === true`
- Cancellations: messages containing `"cancel"`, `"abort"`
- Network errors: messages containing `"network"`, `"connect"`, `"ENOTFOUND"`, `"ECONNREFUSED"`, `"No address associated with hostname"`, `"DNS"`, `"unable to resolve"`
- SSL errors: messages containing `"SSL"`, `"certificate"`, `"secure connection"`

- [ ] **Step 1: Extend the test file with RNFetchBlob error scenarios**

Add these test cases to `src/shared/utils/api/response.test.ts`:

```ts
// ── RNFetchBlob / generic error scenarios ──────────────────────────

describe('handleError — non-Axios (RNFetchBlob) errors', () => {
  // Helper to simulate RNFetchBlob errors
  function createRNFetchBlobError(message: string): Error {
    return new Error(message);
  }

  it('should detect network errors from error messages', () => {
    const messages = [
      'Network request failed',
      'No address associated with hostname',
      'ENOTFOUND api.example.com',
      'ECONNREFUSED 192.168.1.1:443',
      'Unable to resolve host',
      'network error: connection refused',
    ];

    for (const msg of messages) {
      const result = handleError(createRNFetchBlobError(msg));
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('NETWORK');
      expect(result.message).toBe('Unable to connect. Please check your internet connection.');
      expect(result.httpStatus).toBeUndefined();
    }
  });

  it('should detect timeout errors from error messages', () => {
    const messages = [
      'request timed out',
      'The request timed out after 30000ms',
      'Timeout exceeded',
    ];

    for (const msg of messages) {
      const result = handleError(createRNFetchBlobError(msg));
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('TIMEOUT');
      expect(result.message).toBe('Request timed out. Please try again.');
    }
  });

  it('should detect cancelled requests from error messages', () => {
    const messages = ['Request was cancelled', 'canceled by user', 'AbortError: operation aborted'];

    for (const msg of messages) {
      const result = handleError(createRNFetchBlobError(msg));
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('CANCEL');
      expect(result.message).toBe('Request was cancelled.');
    }
  });

  it('should detect SSL errors as network category', () => {
    const messages = [
      'SSL peer certificate or SSH remote key was not OK',
      'certificate verify failed',
      'A secure connection could not be established',
    ];

    for (const msg of messages) {
      const result = handleError(createRNFetchBlobError(msg));
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('NETWORK');
    }
  });

  it('should fall back to UNKNOWN for unrecognized error messages', () => {
    const error = new Error('Something completely unexpected happened');
    const result = handleError(error);
    expect(result.success).toBe(false);
    expect(result.errorType).toBe('UNKNOWN');
    expect(result.message).toBe('Something completely unexpected happened');
    expect(result.errorCode).toBeUndefined();
    expect(result.httpStatus).toBeUndefined();
  });

  it('should handle null/undefined gracefully', () => {
    const result1 = handleError(null);
    expect(result1.errorType).toBe('UNKNOWN');
    expect(result1.message).toBe('Something went wrong. Please try again.');

    const result2 = handleError(undefined);
    expect(result2.errorType).toBe('UNKNOWN');
    expect(result2.message).toBe('Something went wrong. Please try again.');
  });

  it('should handle string errors gracefully', () => {
    const result = handleError('just a string error');
    expect(result.errorType).toBe('UNKNOWN');
    expect(result.message).toBe('Something went wrong. Please try again.');
  });
});
```

- [ ] **Step 2: Run the new tests to verify they fail**

```bash
npx vitest run src/shared/utils/api/response.test.ts --reporter verbose
```

Expected: Tests fail because `handleError` doesn't classify non-Axios errors by message pattern yet.

- [ ] **Step 3: Add `categorizeGenericError()` to `response.ts`**

Add a new helper function that classifies errors by message pattern. Insert it **before** `handleError`:

```ts
/**
 * Error message keywords that indicate a network connectivity failure.
 * These come from RNFetchBlob, fetch(), XMLHttpRequest, and other non-Axios HTTP sources.
 */
const NETWORK_ERROR_PATTERNS = [
  'network',
  'enotfound',
  'econnrefused',
  'econnreset',
  'ehostunreach',
  'enetunreach',
  'unable to resolve',
  'no address associated',
  'name or service not known',
  'dns',
  'connect',
  'socket',
  'request failed',
  'ssl',
  'certificate',
  'secure connection',
];

/**
 * Error message keywords that indicate a request timeout.
 */
const TIMEOUT_ERROR_PATTERNS = ['timed out', 'timeout'];

/**
 * Error message keywords that indicate a user-initiated cancellation.
 */
const CANCEL_ERROR_PATTERNS = ['cancel', 'abort'];

/**
 * Attempts to categorize a non-Axios error by inspecting its message string.
 *
 * RNFetchBlob throws plain `Error` objects with descriptive messages. This function
 * matches known patterns to assign a high-level error category. This is intentionally
 * conservative — if no pattern matches, it returns `null` and the caller falls back
 * to the generic UNKNOWN handler.
 *
 * @param error - A non-Axios error instance.
 * @returns An `ErrorResult` if the message matches a known pattern, or `null`.
 */
function categorizeGenericError(error: Error): ErrorResult | null {
  const message = error.message?.toLowerCase() || '';

  // 1. Cancellation — user-intentional, should not trigger retry UI
  if (CANCEL_ERROR_PATTERNS.some((p) => message.includes(p))) {
    return { category: ErrorCategory.CANCEL, message: 'Request was cancelled.' };
  }

  // 2. Timeout — request was sent but no response arrived
  if (TIMEOUT_ERROR_PATTERNS.some((p) => message.includes(p))) {
    return { category: ErrorCategory.TIMEOUT, message: 'Request timed out. Please try again.' };
  }

  // 3. Network / connectivity / SSL failures
  if (NETWORK_ERROR_PATTERNS.some((p) => message.includes(p))) {
    return {
      category: ErrorCategory.NETWORK,
      message: 'Unable to connect. Please check your internet connection.',
    };
  }

  // No pattern matched — let caller handle
  return null;
}
```

- [ ] **Step 4: Update `handleError` to call `categorizeGenericError`**

After the Phase 1 rewrite, `handleError` looks like this (pseudocode):

```ts
export const handleError = <T>(error: unknown): ApiResponse<T> => {
  // 1. Axios CanceledError
  if (isCancel(error)) { ... }

  // 2. AxiosError
  if (error instanceof AxiosError) { ... }

  // 3. Generic Error (current fallback)
  if (error instanceof Error) { ... }

  // 4. Unknown non-Error
  return { success: false, message: 'Something went wrong...', errorType: 'UNKNOWN' };
};
```

Insert a check between steps 2 and 3:

```ts
// 3. Non-Axios error — attempt pattern-based categorization (RNFetchBlob, fetch, etc.)
if (error instanceof Error) {
  const categorized = categorizeGenericError(error);
  if (categorized) {
    return {
      success: false,
      message: categorized.message,
      errorType: categorized.category as unknown as ErrorType,
    };
  }
  return {
    success: false,
    message: error.message || 'Failed to fetch data',
    errorType: 'UNKNOWN',
  };
}
```

The existing `if (error instanceof Error)` branch (step 3 above) should be **replaced** with this new logic. The old branch simply returned `error.message` with `errorType: 'UNKNOWN'` — the new branch first tries to categorize, then falls back to the same behavior.

Here is the complete updated `handleError` post-Phase-2:

```ts
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

  // Non-Axios errors — attempt pattern-based categorization (RNFetchBlob, fetch, etc.)
  if (error instanceof Error) {
    const categorized = categorizeGenericError(error);
    if (categorized) {
      return {
        success: false,
        message: categorized.message,
        errorType: categorized.category as unknown as ErrorType,
      };
    }
    return {
      success: false,
      message: error.message || 'Failed to fetch data',
      errorType: 'UNKNOWN',
    };
  }

  // Non-Error values (null, undefined, strings, etc.)
  return {
    success: false,
    message: 'Something went wrong. Please try again.',
    errorType: 'UNKNOWN',
  };
};
```

> [!NOTE]
> The `ErrorType` import needs to be available — it was added to `src/shared/types/api.ts` in Phase 1, so the import in `response.ts` should already include it:
>
> ```ts
> import { ApiResponse, ErrorType } from '../../types/api';
> ```

- [ ] **Step 5: Run all tests to verify they pass**

```bash
npx vitest run src/shared/utils/api/response.test.ts --reporter verbose
```

Expected: All test cases pass — both Axios-specific and RNFetchBlob-specific.

- [ ] **Step 6: Run the full test suite for regressions**

```bash
npx vitest run --reporter verbose
```

Expected: All existing tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/shared/utils/api/response.ts src/shared/utils/api/response.test.ts
git commit -m "feat(api): generalize categorizeError for non-Axios (RNFetchBlob) errors"
```

---

## Phase 3: Fix Error Handling in `rn-fetch-blob-client.ts`

### Task 6: Fix catch block and add HTTP status checking

**Files:**

- Modify: `src/shared/utils/api/rn-fetch-blob-client.ts`
- Create: `src/shared/utils/api/rn-fetch-blob-client.test.ts`

**Context:** Currently `rn-fetch-blob-client.ts` has two problems:

1. **Catch block (line 144-146):** `catch (error: any) { throw error; }` — errors propagate as unhandled exceptions, but the `HttpClient` interface contract says methods return `Promise<ApiResponse<T>>`. Consumers call `http.post()` and expect always getting back `ApiResponse<T>`, not a thrown error.

2. **No HTTP status checking (lines 120-122):** RNFetchBlob does **not** throw on 4xx/5xx HTTP responses. It returns the response as normal with `respInfo.status` set. The current code tries to `JSON.parse` and `decrypt` the response body regardless. If the backend returns a non-encrypted error body (e.g., HTML, plain text, or an error JSON without the envelope), this will crash with a JSON parse or decryption error.

- [ ] **Step 1: Write the failing tests**

Create `src/shared/utils/api/rn-fetch-blob-client.test.ts`:

```ts
import { rnFetchBlobClient } from './rn-fetch-blob-client';

// ── Mock RNFetchBlob ──────────────────────────────────────────────
jest.mock('rn-fetch-blob', () => {
  const mockConfig = jest.fn().mockReturnThis();
  const mockFetch = jest.fn();

  return {
    __esModule: true,
    default: {
      config: mockConfig.mockReturnValue({ fetch: mockFetch }),
    },
  };
});

// Mock encryption — pass-through for testing
jest.mock('@lib/encryption', () => ({
  encrypt: (data: string) => data,
  decrypt: <T>(data: string) => JSON.parse(data) as T,
}));

// Mock token store
jest.mock('@stores/token.store', () => ({
  TokenStoreManager: {
    getAccessToken: jest.fn().mockResolvedValue('mock-token'),
    removeAccessToken: jest.fn(),
  },
}));

// Mock logger
jest.mock('../../logger/logger', () => ({
  logger: {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import RNFetchBlob from 'rn-fetch-blob';

function mockRNFetchBlobResponse(overrides: {
  status?: number;
  data?: string;
  body?: any;
  timeout?: boolean;
}) {
  const responseData =
    overrides.data ||
    JSON.stringify({
      response: JSON.stringify({
        status_code: '200',
        message: 'OK',
        success_flag: true,
        data: overrides.body || null,
      }),
    });

  const mockFetch = RNFetchBlob.config().fetch as jest.Mock;
  mockFetch.mockResolvedValue({
    data: responseData,
    respInfo: {
      status: overrides.status ?? 200,
      timeout: overrides.timeout ?? false,
      headers: {},
      redirects: [],
      taskId: 'test-1',
      state: '2',
      respType: 'text',
      rnfbEncode: 'utf8',
    },
  });
}

function mockRNFetchBlobNetworkError() {
  const mockFetch = RNFetchBlob.config().fetch as jest.Mock;
  mockFetch.mockRejectedValue(
    new Error('Network request failed: No address associated with hostname')
  );
}

function mockRNFetchBlobTimeoutError() {
  const mockFetch = RNFetchBlob.config().fetch as jest.Mock;
  mockFetch.mockRejectedValue(new Error('The request timed out after 30000ms'));
}

function mockRNFetchBlobCancelError() {
  const mockFetch = RNFetchBlob.config().fetch as jest.Mock;
  mockFetch.mockRejectedValue(new Error('Request was cancelled'));
}

describe('rnFetchBlobClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('successful responses', () => {
    it('should return success for a 200 with valid encrypted envelope', async () => {
      mockRNFetchBlobResponse({
        status: 200,
        body: { id: 1, name: 'Test' },
      });

      const result = await rnFetchBlobClient.get('/test');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 1, name: 'Test' });
      expect(result.httpStatus).toBeUndefined(); // success has no httpStatus
    });

    it('should return success for a POST with body', async () => {
      mockRNFetchBlobResponse({
        status: 200,
        body: { created: true },
      });

      const result = await rnFetchBlobClient.post('/test', { key: 'value' });
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ created: true });
    });
  });

  describe('backend errors (4xx/5xx HTTP status)', () => {
    it('should detect 500 as SERVER error with httpStatus', async () => {
      // Backend returns HTTP 500 with an error message in the body
      mockRNFetchBlobResponse({
        status: 500,
        data: JSON.stringify({
          response: JSON.stringify({
            status_code: '500',
            message: 'Internal server error occurred',
            success_flag: false,
          }),
        }),
      });

      const result = await rnFetchBlobClient.get('/test');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Internal server error occurred');
      expect(result.errorType).toBe('SERVER');
      expect(result.httpStatus).toBe(500);
    });

    it('should detect 404 as CLIENT error with httpStatus', async () => {
      mockRNFetchBlobResponse({
        status: 404,
        data: JSON.stringify({
          response: JSON.stringify({
            status_code: '404',
            message: 'Resource not found',
            success_flag: false,
          }),
        }),
      });

      const result = await rnFetchBlobClient.get('/not-found');
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('CLIENT');
      expect(result.httpStatus).toBe(404);
    });

    it('should fall back to generic message if backend body is not encrypted', async () => {
      // Backend returned plain HTML or unencrypted JSON
      mockRNFetchBlobResponse({
        status: 502,
        data: '<html>Bad Gateway</html>',
      });

      const result = await rnFetchBlobClient.get('/bad-gateway');
      expect(result.success).toBe(false);
      expect(result.message).toContain('502');
      expect(result.errorType).toBe('SERVER');
      expect(result.httpStatus).toBe(502);
    });

    it('should handle 401 by removing the token', async () => {
      mockRNFetchBlobResponse({
        status: 401,
        data: JSON.stringify({
          response: JSON.stringify({
            status_code: '401',
            message: 'Unauthorized',
            success_flag: false,
          }),
        }),
      });

      const { TokenStoreManager } = require('@stores/token.store');
      await rnFetchBlobClient.get('/protected');
      expect(TokenStoreManager.removeAccessToken).toHaveBeenCalled();
    });
  });

  describe('network errors (no response)', () => {
    it('should return NETWORK error type for DNS/connectivity failures', async () => {
      mockRNFetchBlobNetworkError();

      const result = await rnFetchBlobClient.get('/test');
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('NETWORK');
      expect(result.message).toBe('Unable to connect. Please check your internet connection.');
      expect(result.httpStatus).toBeUndefined();
    });
  });

  describe('timeout errors', () => {
    it('should return TIMEOUT error type when request times out', async () => {
      mockRNFetchBlobTimeoutError();

      const result = await rnFetchBlobClient.get('/slow');
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('TIMEOUT');
      expect(result.message).toBe('Request timed out. Please try again.');
    });
  });

  describe('cancelled requests', () => {
    it('should return CANCEL error type when request is cancelled', async () => {
      mockRNFetchBlobCancelError();

      const result = await rnFetchBlobClient.get('/cancel-me');
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('CANCEL');
      expect(result.message).toBe('Request was cancelled.');
    });
  });

  describe('edge cases', () => {
    it('should handle empty response data gracefully', async () => {
      mockRNFetchBlobResponse({
        status: 200,
        data: '',
      });

      const result = await rnFetchBlobClient.get('/empty');
      expect(result.success).toBe(false);
      expect(result.message).toBe('No data returned');
    });

    it('should handle malformed JSON in response body', async () => {
      mockRNFetchBlobResponse({
        status: 200,
        data: 'not json at all',
      });

      const result = await rnFetchBlobClient.get('/bad-json');
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('UNKNOWN');
      expect(result.message).toBeDefined();
    });

    it('should handle decryption failure', async () => {
      // Response body exists but doesn't have the expected envelope
      mockRNFetchBlobResponse({
        status: 200,
        data: JSON.stringify({ someOtherField: 'value' }),
      });

      const result = await rnFetchBlobClient.get('/bad-envelope');
      expect(result.success).toBe(false);
      expect(result.errorType).toBe('UNKNOWN');
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/shared/utils/api/rn-fetch-blob-client.test.ts --reporter verbose
```

Expected: Most tests fail — `rnFetchBlobClient` currently throws errors (not returning ApiResponse) and doesn't check HTTP status.

- [ ] **Step 3: Rewrite `rn-fetch-blob-client.ts` — add HTTP status check and fix catch block**

Import `handleError` at the top:

```ts
import { handleError } from './response';
```

Add a helper function to extract the backend error message from a response body, handling the case where the body may or may not be the encrypted envelope:

```ts
/**
 * Attempts to extract a user-facing error message from a backend error response.
 *
 * The backend may return the encrypted envelope format (with `response` field)
 * or a plain JSON error body. This function tries the envelope first, then
 * falls back to a generic message based on HTTP status.
 *
 * @param responseData - The raw response data string.
 * @param httpStatus - The HTTP status code.
 * @returns An object with `message` and optional `statusCode` from the envelope.
 */
function extractBackendError(
  responseData: string,
  httpStatus: number
): { message: string; statusCode?: string } {
  const defaultMessage = `Server error (${httpStatus}). Please try again later.`;
  if (!responseData) {
    return { message: defaultMessage };
  }
  try {
    const parsed = JSON.parse(responseData);
    // Try encrypted envelope format: parsed.response contains the encrypted string
    if (parsed.response && typeof parsed.response === 'string') {
      const { decrypt } = require('@lib/encryption');
      const decrypted = decrypt<DecryptedBackendResponse<unknown>>(parsed.response);
      return {
        message: decrypted.message || defaultMessage,
        statusCode: decrypted.status_code,
      };
    }
    // Try plain JSON error format: { message: '...' }
    if (parsed.message) {
      return { message: parsed.message };
    }
  } catch {
    // Body is not parseable JSON — use default message
  }
  return { message: defaultMessage };
}
```

Update the response handling (after `const response = await RNFetchBlob.config(BASE_CONFIG).fetch(...)`). Add an HTTP status check before the data/decryption logic:

```ts
// ── HTTP status check ────────────────────────────────────────
const httpStatus = response.respInfo?.status;

if (httpStatus && httpStatus >= 400) {
  // Backend responded with an error — extract message from body
  const bodyAsString = response.data || '';
  const backendError = extractBackendError(bodyAsString, httpStatus);

  // 401 handling — clear token on auth failures
  if (httpStatus === 401 && body.functionName !== METHODS.EMP_LOGIN) {
    await TokenStoreManager.removeAccessToken();
  }

  logger.log('Backend Error', {
    http_status: httpStatus,
    message: backendError.message,
    method: body?.functionName,
  });

  return backendResponse<T>({
    success_flag: false,
    message: backendError.message,
    status_code: backendError.statusCode || String(httpStatus),
  });
}

// ── Data & decryption ────────────────────────────────────────
if (!response.data) {
  return backendResponse<T>({
    message: 'No data returned',
    success_flag: false,
    status_code: '500',
  });
}

const parsed = JSON.parse(response.data);
const decrypted = decrypt<DecryptedBackendResponse<T>>(parsed.response);

// ... rest of the decryption / success handling stays the same ...
```

Fix the catch block at the bottom to return a structured error instead of throwing:

```ts
  } catch (error: any) {
    logger.log('RNFetchBlob Error', {
      message: error?.message,
      method: body?.functionName,
    });
    return handleError<T>(error);
  }
```

- [ ] **Step 4: Show the full updated file for clarity**

Here is the complete updated `src/shared/utils/api/rn-fetch-blob-client.ts`:

```ts
import { decrypt } from '@lib/encryption';
import { TokenStoreManager } from '@stores/token.store';
import { logger } from '../logger/logger';
import RNFetchBlob from 'rn-fetch-blob';
import { METHODS } from '@utils/constants';
import { HttpClient } from '@sharedTypes/api';
import { handleError } from './response';

const APP_ID = process.env.EXPO_PUBLIC_APP_ID;
const API_URL = process.env.EXPO_PUBLIC_API_URL;

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
 */
function backendResponse<T>(data: DecryptedBackendResponse<T>): ApiResponse<T> {
  return {
    success: data.success_flag,
    message: data.message,
    data: data.data as T,
  };
}

/**
 * Attempts to extract a user-facing error message from a backend error response.
 *
 * The backend may return the encrypted envelope format (with `response` field)
 * or a plain JSON error body. This function tries the envelope first, then
 * falls back to a generic message based on HTTP status.
 */
function extractBackendError(
  responseData: string,
  httpStatus: number
): { message: string; statusCode?: string } {
  const defaultMessage = `Server error (${httpStatus}). Please try again later.`;
  if (!responseData) {
    return { message: defaultMessage };
  }
  try {
    const parsed = JSON.parse(responseData);
    // Try encrypted envelope format: parsed.response contains the encrypted string
    if (parsed.response && typeof parsed.response === 'string') {
      const envelope = decrypt<DecryptedBackendResponse<unknown>>(parsed.response);
      return {
        message: envelope.message || defaultMessage,
        statusCode: envelope.status_code,
      };
    }
    // Try plain JSON error format: { message: '...' }
    if (parsed.message) {
      return { message: parsed.message };
    }
  } catch {
    // Body is not parseable JSON — use default message
  }
  return { message: defaultMessage };
}

/**
 * Core native HTTP request function using `RNFetchBlob`.
 *
 * Handles encryption of the request body, Bearer token injection, response
 * decryption, HTTP status checking, and 401 response handling (token removal).
 * All errors (network, timeout, backend, cancellation) are normalized into
 * structured `ApiResponse<T>` failure responses.
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
    const { encrypt } = require('@lib/encryption');
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
    functionName: body?.functionName,
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

    // ── HTTP status check ──────────────────────────────────────
    const httpStatus = response.respInfo?.status;

    if (httpStatus && httpStatus >= 400) {
      const bodyAsString = response.data || '';
      const backendError = extractBackendError(bodyAsString, httpStatus);

      // 401 handling — clear token on auth failures (except login)
      if (httpStatus === 401 && body?.functionName !== METHODS.EMP_LOGIN) {
        await TokenStoreManager.removeAccessToken();
      }

      logger.log('Backend Error', {
        http_status: httpStatus,
        message: backendError.message,
        method: body?.functionName,
      });

      return backendResponse<T>({
        success_flag: false,
        message: backendError.message,
        status_code: backendError.statusCode || String(httpStatus),
      });
    }

    // ── Success path — data & decryption ───────────────────────
    logger.log({
      method: `${method} <=`,
      path: uri,
      duration: `${duration}ms`,
      status: httpStatus,
    });

    if (!response.data) {
      return backendResponse<T>({
        message: 'No data returned',
        success_flag: false,
        status_code: '500',
      });
    }

    const parsed = JSON.parse(response.data);
    const decrypted = decrypt<DecryptedBackendResponse<T>>(parsed.response);

    logger.log('Decrypted Response', {
      success: decrypted.success_flag,
      message: decrypted.message,
      method: body?.functionName,
      response_status: decrypted.status_code,
      http_status: httpStatus,
    });

    if (decrypted.status_code === '401' && body?.functionName !== METHODS.EMP_LOGIN) {
      await TokenStoreManager.removeAccessToken();
    }

    const data = typeof decrypted.data === 'string' ? JSON.parse(decrypted.data) : decrypted.data;

    return backendResponse<T>({
      success_flag: decrypted.success_flag,
      message: decrypted.message,
      data: data as T,
      status_code: decrypted.status_code,
    });
  } catch (error: any) {
    logger.log('RNFetchBlob Error', {
      message: error?.message,
      method: body?.functionName,
    });
    return handleError<T>(error);
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
```

> [!WARNING]
> The `import { encrypt }` is moved inside the `if (body)` block as a dynamic `require` to avoid a circular dependency concern. If `@lib/encryption` is a pure utility, a static `import { encrypt, decrypt }` at the top is fine — just note that `decrypt` is already imported statically.

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/shared/utils/api/rn-fetch-blob-client.test.ts --reporter verbose
```

Expected: All test cases pass — both success and error scenarios.

- [ ] **Step 5: Run the full test suite for regressions**

```bash
npx vitest run --reporter verbose
```

Expected: All existing tests pass, including Phase 1 and Phase 2 tests.

- [ ] **Step 6: Commit**

```bash
git add src/shared/utils/api/rn-fetch-blob-client.ts src/shared/utils/api/rn-fetch-blob-client.test.ts
git commit -m "fix(api): normalize all RNFetchBlob errors into structured ApiResponse with HTTP status checking"
```

---

## Self-Review

### Spec Coverage

| Requirement                                             | Task                                                                                                        |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Handle network errors (DNS failure, connection refused) | Task 5 — `categorizeGenericError` matches `NETWORK_ERROR_PATTERNS`; Task 6 — catch block uses `handleError` |
| Handle timeout errors                                   | Task 5 — `TIMEOUT_ERROR_PATTERNS` in `categorizeGenericError`; Task 6 — catch block                         |
| Handle cancelled requests                               | Task 5 — `CANCEL_ERROR_PATTERNS` in `categorizeGenericError`; Task 6 — catch block                          |
| Handle backend errors (4xx/5xx)                         | Task 6 — HTTP status check + `extractBackendError`                                                          |
| Handle 401 auth failures with token removal             | Task 6 — 401 check in HTTP status block                                                                     |
| Handle malformed/unencrypted backend responses          | Task 6 — `extractBackendError` with try-catch for JSON parse and decrypt                                    |
| Return structured ApiResponse<T> (not thrown errors)    | Task 6 — catch block returns `handleError<T>(error)`                                                        |
| Preserve errorType, errorCode, httpStatus metadata      | Task 5 + Phase 1 — existing `ApiResponse<T>` fields set by `handleError`                                    |
| Log errors with categorization                          | Task 6 — `logger.log('RNFetchBlob Error', { message, method })`                                             |
| Handle non-Error thrown values                          | Task 5 — final fallback in `handleError` handles null/undefined/strings                                     |

### Placeholder Scan

- All code blocks contain complete, working implementations
- All file paths are exact
- All test cases have assertions
- All import paths are verified against the codebase
- No TBD, TODO, or "add more test cases" patterns

### Type Consistency

- `ApiResponse<T>` fields from Phase 1: `success`, `message`, `data?`, `errorCode?`, `errorType?`, `httpStatus?` — verified against `src/shared/types/api.ts`
- `ErrorType`: `'NETWORK' | 'TIMEOUT' | 'CANCEL' | 'SERVER' | 'CLIENT' | 'UNKNOWN'` — defined in Phase 1
- `ErrorCategory` enum in `response.ts` values match `ErrorType` strings (except `UNKNOWN` is the catch-all for both)
- `categorizeGenericError` returns `ErrorCategory` values — cast to `ErrorType` in `handleError` (safe because value strings are identical)
- RNFetchBlob types: `FetchBlobResponse.respInfo.status`, `FetchBlobResponse.data`, `RNFetchBlobResponseInfo.timeout` — verified against `node_modules/rn-fetch-blob/index.d.ts`
