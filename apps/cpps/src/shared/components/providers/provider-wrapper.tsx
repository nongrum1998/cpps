import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryErrorResetBoundary } from '@tanstack/react-query';

// Internal Providers
import { AuthInitializer } from './auth-provider';
import { TQueryProvider } from './query-provider';
import { RootProvider } from './root-provider';
// Shared Components & Redirects
import { AuthRedirect } from '@components/common';
import { UpdateModal } from './update-modal';
import { GlobalErrorBoundary } from './global-error-boundary';
import { usePreventScreenCapture } from 'expo-screen-capture';

type Props = {
  children: React.ReactNode;
};

/**
 * Global Provider Wrapper
 *
 * Consolidates all application-wide providers into a single optimized tree.
 * Hierarchy follows a dependency-first approach:
 * 1. Low-level Infrastructure (Gestures, SafeArea, SSL, Updates)
 * 2. Data & State Management (Query, Theme)
 * 3. Domain Contexts (Auth, Notifications)
 * 4. Navigation & Security Gates (LocalAuth, AuthRedirect)
 */
export const ProviderWrapper = ({ children }: Props) => {
  // Prevent user from taking screen shot or screen recording
  usePreventScreenCapture();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider className="flex-1">
        <RootProvider>
          <GlobalErrorBoundary>
            <TQueryProvider>
              <QueryErrorResetBoundary>
                <AuthInitializer>
                  <AuthRedirect>
                    <StatusBar style="auto" animated />
                    {children}
                    <UpdateModal />
                  </AuthRedirect>
                </AuthInitializer>
              </QueryErrorResetBoundary>
            </TQueryProvider>
          </GlobalErrorBoundary>
        </RootProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};
