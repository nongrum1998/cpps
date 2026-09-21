import { useQuery } from '@tanstack/react-query';
import { ENDPOINTS } from '@utils/constants';
import { http } from '@utils/http';

export function useUser() {
  return useQuery({
    queryKey: ['current', 'user'],
    queryFn: () => http.get(ENDPOINTS.AUTH.USER),
    select: (data) => data.data,
  });
}
