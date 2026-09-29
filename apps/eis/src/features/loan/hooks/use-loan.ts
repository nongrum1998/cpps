import { useAuthStore } from '@stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { rpc } from '@utils/api';
import { METHODS, QUERY_KEYS, STALE_TIMES } from '@utils/constants';
import { LoanItemI } from '../types';

type UseLoanProps = {
  loanId: string;
};

export function useLoan({ loanId }: UseLoanProps) {
  const { isSignedIn, emp_cd } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.LOAN.DETAILS(emp_cd, loanId),
    enabled: isSignedIn && !!loanId,
    queryFn: () => rpc<LoanItemI>(METHODS.GET_EMP_LOAN_DETAILS, { emp_cd, loan_id: loanId }),
    select: (data) => data?.data,
    staleTime: STALE_TIMES.LOAN,
    refetchOnMount: true,
  });
}
