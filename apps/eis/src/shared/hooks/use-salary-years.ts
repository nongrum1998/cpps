import { SalaryYear } from '@sharedTypes/satatement/salary-years';
import { useAuthStore } from '@stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { rpc } from '@utils/api';
import { METHODS, QUERY_KEYS } from '@utils/constants';

/**
 * Fetches the list of salary years available for the current user.
 *
 * Reads `emp_cd` from the auth store and passes it as the request
 * parameter. The query is disabled (not fired) when `emp_cd` is
 * falsy — typically while auth state is still being hydrated.
 *
 * The query always refetches on mount and never caches (`staleTime: 0`)
 * to ensure the year list is up to date whenever the screen gains
 * focus.
 *
 * @returns A TanStack Query result object with `SalaryYear[]` as the
 *          `data` type. Access the array via `data` after unwrapping
 *          the API envelope.
 *
 * @example
 * ```tsx
 * const { data: years, isLoading } = useSalaryYears();
 * // years is SalaryYear[] | undefined
 * ```
 */
export function useSalaryYears() {
  const { emp_cd } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.SALARY_YEAR(emp_cd),
    queryFn: () => rpc<SalaryYear[]>(METHODS.GET_SALARY_YEARS, { emp_cd }),
    enabled: !!emp_cd,
    refetchOnMount: true,
    staleTime: 0,
    select: (data) => data.data,
  });
}
