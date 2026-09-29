import { useAuthStore } from '@stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { rpc } from '@utils/api';
import { METHODS, QUERY_KEYS } from '@utils/constants';
import { NPSAnnux5 } from '../types/nps';

type Props = {
  finYear?: string | null;
};

export function useNpsStatements({ finYear }: Props) {
  const { isSignedIn, user } = useAuthStore();

  const ppan = user?.ppan;

  const isFieldsExist = !!ppan;

  const isEnabled = isSignedIn && isFieldsExist && !!finYear && !!ppan;

  return useQuery({
    enabled: isEnabled,
    queryKey: QUERY_KEYS.NPS.LIST(ppan, finYear),
    queryFn: () =>
      rpc<NPSAnnux5>(METHODS.GET_NPS_ANNEX5, {
        ppan,
        fin_year: finYear,
      }),
    select: (data) => data.data,
  });
}
