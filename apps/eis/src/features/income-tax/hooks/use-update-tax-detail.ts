import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rpc } from '@utils/api';
import { METHODS, QUERY_KEYS } from '@utils/constants';
import { useAuthStore } from '@stores/auth.store';
import { UpdateTaxPayload } from '../types';

export function useUpdateTaxDetail() {
  const { emp_cd } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateTaxPayload) =>
      rpc<void>(METHODS.UPDATE_EMP_TAX_DETAIL, { emp_cd, ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TAX.DETAIL(emp_cd) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TAX.LIST(emp_cd) });
    },
  });
}
