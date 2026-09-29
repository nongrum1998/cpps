import * as Network from 'expo-network';
import { onlineManager } from '@tanstack/react-query';

/**
 * Syncs the Expo network state with React Query's online manager.
 *
 * Reads the initial network connectivity state and subscribes to changes
 * via `expo-network`. When connectivity is lost, React Query pauses retries
 * and refetches; when it returns, paused queries resume automatically.
 *
 * @returns A cleanup function that removes the network state listener.
 */
export function setupOnlineManager(): () => void {
  // Initial state
  Network.getNetworkStateAsync().then((state) => {
    onlineManager.setOnline(Boolean(state.isConnected));
  });

  // Listen for changes
  const subscription = Network.addNetworkStateListener((state) => {
    onlineManager.setOnline(Boolean(state.isConnected));
  });

  return () => subscription.remove();
}
