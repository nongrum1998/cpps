import React, { useEffect, useState } from 'react';
import { ProviderWrapper } from '@providers/provider-wrapper';
import { NetworkBanner } from '@components/common';
import { Toaster, SnackbarProvider } from '@components/ui';
import '../shared/styles/global.css';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { logger } from '../shared/utils/logger';
import { Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';

// Handle initial route settings
export const unstable_settings = {
  initialRouteName: '/auth',
};

// Prevent the splash screen from auto-hiding before JS has mounted.
// This is intentionally module-level – must run before any component renders.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* Non-critical; splash will hide via the timeout fallback in Layout */
});

// Configure the splash screen hide animation.
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

/** Root layout that wraps every screen with global providers and UI shell. */
export default function Layout() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load all Inter weight variants under the single "Inter" family name so
  // that React Native picks the correct font asset automatically when the
  // `fontWeight` style property is set (400 → Regular, 500 → Medium, 700 → Bold).
  useEffect(() => {
    let cancelled = false;

    const loadFonts = async () => {
      try {
        await Font.loadAsync('Inter', Inter_400Regular);
        await Font.loadAsync('Inter', Inter_500Medium);
        await Font.loadAsync('Inter', Inter_700Bold);
        if (!cancelled) setLoaded(true);
      } catch (e) {
        if (!cancelled) setError(e as Error);
      }
    };

    loadFonts();

    return () => {
      cancelled = true;
    };
  }, []);

  // Keep the native splash screen visible until fonts have loaded (or failed).
  // This prevents a white flash: the splash stays up during the async font
  // fetch and only tears down once the app is fully ready to paint.
  useEffect(() => {
    if (!loaded && !error) return;

    const hideSplash = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        logger.warn('Failed to hide splash screen:', e);
      }
    };

    hideSplash();
  }, [loaded, error]);

  // Block rendering until fonts are available so the first paint includes the
  // correct typeface (no FOUT). If fonts fail to load, render anyway — the
  // system fallback fonts will be used.
  if (!loaded && !error) {
    return null;
  }

  return (
    <ProviderWrapper>
      <NetworkBanner />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
      <Toaster />
      <SnackbarProvider />
    </ProviderWrapper>
  );
}
