import { useAuthStore } from '@stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { rpc } from '@utils/api';
import { METHODS, QUERY_KEYS, STALE_TIMES } from '@utils/constants';
import { LoanT } from '../types';

/**
 * Queries the list of loans for the signed-in employee.
 *
 * Uses the `GET_EMP_LOAN` RPC method with the employee code from the auth
 * store. The query is enabled only when the user is signed in, so it does not
 * fire for unauthenticated sessions. The raw array payload returned by the RPC
 * is mapped via `select` to the `LoanT[]` data exposed by the query result.
 *
 * The query key is derived from the employee code (`QUERY_KEYS.LOAN.LIST`),
 * so the result is cached per employee.
 *
 * @returns A react-query result resolving to an array of {@link LoanT}.
 * @example
 * ```ts
 * const { data: loans, isLoading } = useLoans();
 * ```
 */
export function useLoans() {
  const { isSignedIn, emp_cd } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.LOAN.LIST(emp_cd),
    enabled: isSignedIn,
    queryFn: () => rpc<LoanT[]>(METHODS.GET_EMP_LOAN, { emp_cd }),
    select: (data) => data.data,
    staleTime: STALE_TIMES.LOAN,
  });
}
