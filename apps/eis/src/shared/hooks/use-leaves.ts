import { useQuery } from '@tanstack/react-query';
import { rpc } from '@utils/api';
import { QUERY_KEYS, METHODS, STALE_TIMES } from '@utils/constants';
import { useAuthStore } from '@stores/auth.store';
import { transformData } from '@utils/helpers/transform-data';
import type { LeaveListItem } from '@sharedTypes/leave';

/**
 * Fetches the authenticated employee's leave list.
 *
 * Calls the `GET_EMP_LEAVES` RPC with the employee code from the auth store.
 * The query **only executes** when the user is signed in and `emp_cd` is
 * available (the `enabled` option gates the request).
 *
 * ### Returned data
 *
 * Raw `Leave[]` results are passed through `transformData`, which adds a
 * stable `id` field to each record (derived from `leave_cd` + dates) so
 * list renders have a consistent React key.
 *
 * ### Stale behaviour
 *
 * Uses the default React Query stale time (5 minutes). Call `refetch` to
 * force a fresh fetch, or configure a custom `staleTime` at the query
 * client level.
 *
 * @returns An object with:
 *  - `data` — Transformed leave array (`(Leave & { id: string })[]`) or
 *    `undefined` when loading or the query is disabled.
 *  - `isFetching` — `true` during any fetch (including background refetches).
 *  - `isLoading` — `true` only on the initial load (no cached data yet).
 *  - `refetch` — Manually triggers a refetch.
 *
 * @example
 * ```tsx
 * const { data: leaves, isLoading } = useLeaves();
 *
 * if (isLoading) return <Spinner />;
 * return <LeaveList items={leaves} />;
 * ```
 */
export function useLeaves() {
  const { isSignedIn, emp_cd } = useAuthStore();

  const { data, isFetching, isLoading, refetch } = useQuery({
    queryKey: QUERY_KEYS.LEAVE.LIST(emp_cd),
    queryFn: () => rpc<LeaveListItem[]>(METHODS.GET_EMP_LEAVES, { emp_cd }),
    staleTime: STALE_TIMES.LEAVE,
    select: (data) => data.data,
    enabled: !!emp_cd && isSignedIn,
  });

  return { data: transformData<LeaveListItem>(data), isFetching, isLoading, refetch };
}
