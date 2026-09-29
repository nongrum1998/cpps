import { useQuery } from '@tanstack/react-query';
import { EPayslip } from '../types';
import { useAuthStore } from '@stores/auth.store';
import { METHODS, QUERY_KEYS } from '@utils/constants';
import { rpc } from '@utils/api';

/**
 * Fetches the e-pay slip for an employee via TanStack Query.
 *
 * Resolves the GE number to query from the signed-in user's `ge_no` when
 * available, otherwise falls back to the provided `geNumber` prop. The query
 * POSTs the resolved `{ ge_number }` payload to the e-pay slip endpoint and
 * unwraps the `{ data: EPayslip }` response envelope.
 *
 * The query is **enabled only when** the app is signed in and a GE number can
 * be resolved (either from the user record or the `geNumber` prop). While the
 * fetch is inactive, `data` is `undefined`, mirroring the loading state in the
 * consuming screens.
 *
 * @param options - Hook options containing the GE number to look up.
 * @param options.geNumber - The employee GE number. Ignored when the signed-in
 * user already has a `ge_no`.
 *
 * @returns A TanStack Query result whose `data` is the fetched
 * {@link EPayslip} once the request succeeds.
 *
 * @example
 * ```ts
 * const { data: payslip, isLoading, isError, refetch } = useEPayslip({
 *   geNumber: activeGeNumber,
 * });
 * ```
 */
export function useEPayslipDetail({ payslipNo }: { payslipNo: string }) {
  const { user, isSignedIn } = useAuthStore();
  const isGeNumberExist = !!user?.ge_no;
  const enabled = !!isGeNumberExist;

  const payload: { ge_number: string; payslip_no: string } = {
    ge_number: user?.ge_no || '',
    payslip_no: payslipNo,
  };

  return useQuery({
    queryKey: QUERY_KEYS.E_PAY_SLIP.DETAIL(payload),
    queryFn: () => rpc<EPayslip>(METHODS.GET_E_PAY_SLIP_DETAIL, payload),
    select: (data) => data.data,
    enabled: enabled && isSignedIn,
  });
}
