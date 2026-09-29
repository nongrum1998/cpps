import React, { useEffect } from 'react';
import { useLocalAuthStore } from '@stores/local-auth.store';

export const LocalAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const checkHardwareAsync = useLocalAuthStore((s) => s.checkHardwareAsync);

  useEffect(() => {
    checkHardwareAsync();
  }, [checkHardwareAsync]);

  return <>{children}</>;
};
