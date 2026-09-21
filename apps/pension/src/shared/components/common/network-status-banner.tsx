import { useEffect, useState, useRef } from 'react';
import { View, Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { cn } from '@utils/helpers';

export const NetworkStatusBanner = () => {
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const wasOffline = useRef<boolean>(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = Boolean(state.isConnected && state.isInternetReachable !== false);

      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }

      if (!connected) {
        setIsOffline(true);
        setIsVisible(true);
        wasOffline.current = true;
      } else {
        setIsOffline(false);
        if (wasOffline.current) {
          setIsVisible(true);
          hideTimer.current = setTimeout(() => {
            setIsVisible(false);
            wasOffline.current = false;
          }, 2000);
        } else {
          setIsVisible(false);
        }
      }
    });

    return () => {
      unsubscribe();
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <View
      className={cn(
        'w-full items-center justify-center px-4 py-1.5',
        isOffline ? 'bg-amber-500' : 'bg-emerald-600'
      )}>
      <Text
        className={cn(
          isOffline ? 'text-slate-950' : 'text-white',
          'text-center text-[11px] font-semibold tracking-wide'
        )}>
        {isOffline ? 'Offline' : 'Back Online'}
      </Text>
    </View>
  );
};
