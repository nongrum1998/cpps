import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS, METHODS, STALE_TIMES } from '@utils/constants';
import { rpc } from '@utils/api';
import { useAuthStore } from '@stores/auth.store';
import { LeaveListItem } from '@sharedTypes/leave';
import { ILeaveDetails } from '../types';
import type { LeaveTypeCode } from '@sharedTypes/leave';

/** Identifies which leave record to fetch from the backend. */
type Props = {
  /** Leave type code (e.g. `SL` for Sick Leave). */
  leave_cd: LeaveTypeCode;
  /** Order / approval date in `DD/MM/YYYY` format. */
  order_dt: string;
  /** Leave start date in `DD/MM/YYYY` format. */
  from_dt: string;
};

/**
 * Fetches the full details of a single leave request including the
 * employee's remaining leave balance for that type.
 *
 * The query is **gated** — it only fires when all three identifiers
 * (`from_dt`, `leave_cd`, `order_dt`) are present and the user is signed
 * in. This prevents spurious requests before navigation params resolve.
 *
 * ### Staleness
 *
 * Uses `STALE_TIMES.LEAVE_FAST` (30 seconds) so the detail screen shows
 * fresh data quickly after navigating back from an edit or approval flow.
 *
 * @param from_dt - Leave start date used as part of the composite key.
 * @param leave_cd - Leave type code used as part of the composite key.
 * @param order_dt - Order / approval date used as part of the composite key.
 *
 * @returns A React Query result whose `data` is a single {@link LeaveListItem}
 *          record (which includes balance fields from the extended
 *          {@link LeaveBalanceT} type), or `undefined` when the query is
 *          disabled or still loading.
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useLeaveDetail({
 *   leave_cd: 'SL',
 *   order_dt: '25/05/2026',
 *   from_dt: '01/06/2026',
 * });
 * ```
 */
export function useLeaveDetail({ from_dt, leave_cd, order_dt }: Props) {
  const { isSignedIn, emp_cd } = useAuthStore();
  const isEnable = !!emp_cd && isSignedIn && !!from_dt && !!leave_cd && !!order_dt;
  return useQuery({
    queryKey: QUERY_KEYS.LEAVE.DETAILS(emp_cd, from_dt, leave_cd, order_dt),
    queryFn: () =>
      rpc<ILeaveDetails>(METHODS.GET_EMP_LEAVE_DETAILS, {
        emp_cd,
        from_dt,
        leave_cd,
        order_dt,
      }),
    staleTime: STALE_TIMES.LEAVE_FAST,
    enabled: isEnable,
    select: (data) => data.data,
  });
}
