import { SalaryStatement } from '@sharedTypes/satatement';
import { useAuthStore } from '@stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { rpc } from '@utils/api';
import { METHODS, QUERY_KEYS, STALE_TIMES } from '@utils/constants';
import { getCurrentMonth, getCurrentYear, getMonthNumber } from '@utils/helpers';

type Props = {
  month?: string;
  year?: number;
};

export function useSalaryStatements({
  month = getCurrentMonth(),
  year = getCurrentYear(),
}: Props = {}) {
  const { emp_cd, isSignedIn } = useAuthStore();

  const monthNumber = getMonthNumber(month);

  const queryKey = QUERY_KEYS.SALARY.STATEMENTS(emp_cd, monthNumber, year);

  const { data, isFetched, isError, error, refetch, isLoading, isFetching } = useQuery({
    queryKey: queryKey,
    queryFn: () =>
      rpc<SalaryStatement>(METHODS.GET_SALARY_STATEMENTS, {
        emp_cd,
        sal_mon: monthNumber,
        sal_year: year,
      }),
    staleTime: STALE_TIMES.SALARY,
    select: (data) => data?.data,
    enabled: !!emp_cd && isSignedIn,
  });

  return { data, isFetched, isError, error, refetch, isLoading, isFetching };
}
