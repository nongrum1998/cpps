import { useAuthStore } from '@stores/auth.store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rpc } from '@utils/api';
import { METHODS, QUERY_KEYS } from '@utils/constants';
import { ApiResponse } from '@sharedTypes/api';

/**
 * Persists the employee's GE number to the backend once the user has
 * confirmed that the fetched e-pay slip belongs to them.
 *
 * On success the caller should call the auth store `refresh()`, which
 * re-fetches employee details; the updated GE number is returned in
 * `user.ge_number` so later visits skip the entry form.
 *
 * @returns A React Query mutation exposing
 * `mutateAsync({ geNumber }): Promise<ApiResponse<void>>`.
 */
export function useUpdateGeNumber() {
  const { emp_cd, refresh } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<void>, Error, { geNumber: string }>({
    mutationFn: ({ geNumber }: { geNumber: string }) =>
      rpc<void>(METHODS.INSERT_GE_NUMBER, { emp_cd, ge_no: geNumber }),
    onSuccess: (data, { geNumber }) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.E_PAY_SLIP.LIST(geNumber) });
        refresh();
        return data;
      }
      return data;
    },
    retry: false,
  });
}
