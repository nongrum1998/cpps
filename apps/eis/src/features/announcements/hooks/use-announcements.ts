import { useQuery } from '@tanstack/react-query';
import { METHODS, QUERY_KEYS, STALE_TIMES } from '@utils/constants';
import { AnnouncementT } from '../types';
import { rpc } from '@utils/api';
import { transformData } from '@utils/helpers';
import { useAuthStore } from '@stores/auth.store';

/**
 * Hook to manage paginated announcement data.
 */
export const useAnnouncements = () => {
  const { isSignedIn } = useAuthStore();
  const { data, isFetching, isLoading, refetch } = useQuery({
    queryKey: QUERY_KEYS.ANNOUNCEMENT.LIST(),
    queryFn: () => rpc<AnnouncementT[]>(METHODS.GET_NOTIFICATIONS),
    select: (res) => res.data,
    staleTime: STALE_TIMES.ANNOUNCEMENT,
    enabled: isSignedIn,
  });

  const announcement = transformData<AnnouncementT>(data);

  return { data: announcement, isFetching, isLoading, refetch };
};
