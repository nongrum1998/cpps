import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rpc } from '@utils/api';
import { METHODS, QUERY_KEYS } from '@utils/constants';
import { UpdateLeaveInput } from '../validators';
import { useAuthStore } from '@stores/auth.store';
import { ApiResponse } from '@sharedTypes/api';

/**
 * Creates a leave request via the `create_leave_request` RPC.
 *
 * Automatically attaches the authenticated employee code (`emp_cd`) from
 * the auth store to the payload so callers do not need to pass it.
 *
 * ### State transitions
 *
 * | State       | Meaning                                 |
 * |-------------|-----------------------------------------|
 * | `isPending` | The RPC request is in-flight            |
 * | `isSuccess` | The RPC returned `success: true`        |
 * | `isError`   | The RPC threw or returned network error |
 *
 * ### Cache invalidation
 *
 * On a successful response (`data.success === true`) the entire leave list
 * query cache (`QUERY_KEYS.LEAVE.LIST`) is invalidated so any upstream
 * `useQuery` call picks up the new leave record.
 *
 * On failure the raw API response is returned as-is so callers can inspect
 * the `message` field for user-facing feedback.
 *
 * @param data - Form payload validated against `CreateLeaveSchema`.
 *   Required fields: `type`, `number_of_days`, `from_dt`, `to_dt`,
 *   `order_number`, `order_dt`, `reason`. Optional: `remarks`.
 * @returns A React Query `UseMutationResult` with:
 *   - `mutate(data, options?)` — Triggers the RPC call
 *   - `isPending` — `true` while the request is in-flight
 *   - `isSuccess` — `true` when the RPC returns `success: true`
 *   - `isError` — `true` when the RPC throws or returns a network error
 *   - `data` — Resolves to `ApiResponse<CreateEmployeeResponse>`
 *   - `error` — Resolves to `ApiResponse<unknown>`
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useCreateLeave();
 *
 * const handleSubmit = (inputs: CreateLeaveInputs) => {
 *   mutate(inputs, {
 *     onSuccess: (res) => {
 *       if (res.success) toast.success('Leave created');
 *     },
 *   });
 * };
 * ```
 */

export function useUpdateLeave() {
  const queryClient = useQueryClient();
  const { emp_cd } = useAuthStore();
  return useMutation<ApiResponse<any>, ApiResponse<unknown>, UpdateLeaveInput>({
    mutationKey: QUERY_KEYS.LEAVE.LIST(emp_cd),
    mutationFn: (data: UpdateLeaveInput) =>
      rpc(METHODS.INSERT_UPDATE_LEAVE, {
        ...data,
        emp_cd,
        flag: 'E',
      }),
    onSuccess: (data, { from_dt, order_dt, leave_cd }, _, context) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: context.mutationKey });
        const leaveDetailQuerykey = QUERY_KEYS.LEAVE.DETAILS(emp_cd, from_dt, leave_cd, order_dt);
        queryClient.invalidateQueries({ queryKey: leaveDetailQuerykey });

        return data?.data;
      }
      return data?.data;
    },
  });
}
