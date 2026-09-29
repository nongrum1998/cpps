/**
 * Centralized React Query key factory.
 *
 * Provides consistent, type-safe query keys for cache management across features.
 * Each top-level key corresponds to a domain, with nested factories for specific
 * queries (list, details, overview, etc.).
 */
export const QUERY_KEYS = {
  AUTH: {
    ME: (...args: string[]) => ['me', ...args] as const,
    OAUTH_TOKEN: ['oauth-token'] as const,
  },
  HOME: {
    OVERVIEW: (...args: string[]) => ['home', 'overview', ...args] as const,
  },
  SALARY: {
    PAYSLIP: (...args: string[]) => ['salary', ...args] as const,
    STATEMENTS: (...args: any[]) => ['employee salary', ...args].filter(Boolean),
  },
  PENSION: {
    LIST: (employeeId: string, year: string, month: string, status: string) =>
      ['pension', employeeId, year, month, status] as const,
    DETAIL: (employeeId: string, pensionId: string) => ['pension', employeeId, pensionId] as const,
  },
  LEAVE: {
    LIST: (...args: string[]) => ['leaves', ...args].filter(Boolean),
    TYPE: (...args: string[]) => ['leaves', 'type', ...args].filter(Boolean),
    REASON: (...args: string[]) => ['leaves', 'reason', ...args].filter(Boolean),
    DETAILS: (...args: string[]) => ['leaves', ...args].filter(Boolean),
  },
  EMPLOYEE: {
    LIST: (page?: number) => ['employees', page] as const,
    DETAILS: (id: string) => ['employee', id] as const,
  },
  ANNOUNCEMENT: {
    LIST: (page?: number) => ['announcement_list', page].filter(Boolean),
    DETAILS: (id: string) => ['announcement_details', id] as const,
  },
  TAX: {
    LIST: (...args: (string | undefined)[]) => ['income-tax', ...args].filter(Boolean),
    DETAIL: (...args: (string | undefined)[]) => ['income-tax', 'detail', ...args].filter(Boolean),
  },
  SALARY_YEAR: (...args: string[]) => ['salary', 'year', ...args] as const,
  GPF: {
    STATEMENTS: (...args: any[]) => ['gpf', 'statements', ...args].filter(Boolean),
    FINANCIAL_YEARS: (...args: any[]) => ['gpf', 'financial-years', ...args].filter(Boolean),
  },
  E_PAY_SLIP: {
    LIST: (...args: any[]) => ['e-payslip', ...args].filter(Boolean),
    DETAIL: (...args: any[]) => ['e-payslip', 'details', ...args].filter(Boolean),
  },
  LOAN: {
    LIST: (...args: any[]) => ['loan', ...args].filter(Boolean),
    DETAILS: (...args: any[]) => ['loan', 'details', ...args].filter(Boolean),
  },
  NPS: {
    LIST: (...args: any[]) => ['nps', ...args].filter(Boolean),
    DETAILS: (...args: any[]) => ['nps', 'details', ...args].filter(Boolean),
  },
};

/**
 * Recommended stale times per domain, in milliseconds.
 *
 * These are presets to pass as `staleTime` in individual `useQuery` calls.
 * They override the global default (5 minutes) where data freshness needs
 * differ from the baseline.
 *
 * @example
 * ```ts
 * useQuery({
 *   queryKey: QUERY_KEYS.LEAVE.LIST(emp_cd),
 *   queryFn: ...,
 *   staleTime: STALE_TIMES.LEAVE,
 * });
 * ```
 */

export const STALE_TIMES = {
  /** Auth/session data — stale immediately, always check server. */
  GLOBAL: 0, // less than a second
  AUTH: 0,
  /** Fast-changing data like leave approvals. */
  LEAVE_FAST: 0, // 30 seconds
  /** Leave list/balance queries. */
  LEAVE: 0, // 1 minute
  /** Moderate cadence — announcements. */
  ANNOUNCEMENT: 0, // 5 minutes
  /** Slow-changing reference data — salary, payslips. */
  SALARY: 0, // 15 minutes
  /** Rarely-changing — employee directory. */
  EMPLOYEE: 0, // 30 minutes
  /** Static reference data — pension records. */
  PENSION: 0, // 15 minutes
  /** Tax data — slow-changing annually. */
  TAX: 0, // 15 minutes
  GPF: 0,
  E_PAY_SLIP: 0,
  LOAN: 0,
  NPS: 0,
} as const;
