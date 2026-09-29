import { useEffect } from 'react';
import { useAuthStore } from '@stores/auth.store';
import { logger } from '@utils/logger';

type Props = {
  children: React.ReactNode;
};

export const AuthInitializer = ({ children }: Props) => {
  const hydrate = useAuthStore((s) => s._hydrate);
  const logout = useAuthStore((s) => s.logout);
  const emp_cd = useAuthStore((s) => s.emp_cd);
  useEffect(() => {
    if (!emp_cd) {
      logout();
    }
  }, [emp_cd]);

  useEffect(() => {
    logger.info('AuthInitializer: checking persist hydration');
    if (useAuthStore.persist.hasHydrated()) {
      logger.info('AuthInitializer: already hydrated, calling _hydrate');
      hydrate();
    } else {
      logger.info('AuthInitializer: waiting for hydration');
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        logger.info('AuthInitializer: hydration finished, calling _hydrate');
        hydrate();
      });
      return () => unsub();
    }
  }, [hydrate]);

  return <>{children}</>;
};
