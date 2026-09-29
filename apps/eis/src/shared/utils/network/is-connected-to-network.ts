import * as Network from 'expo-network';
import { logger } from '../logger/logger';

/**
 * Checks the current network connectivity and internet reachability status.
 *
 * This utility provides a production-ready check by verifying:
 * 1. `isConnected`: Whether the device is connected to a network (WiFi, Cellular, etc.).
 * 2. `isInternetReachable`: Whether the internet is actually accessible (OS-level check).
 *
 * It includes a try-catch block to handle potential system errors during the check,
 * ensuring the application doesn't crash due to network state queries.
 *
 * @returns {Promise<boolean>} Resolves to `true` if the device is connected and the internet
 * is reachable (or status is being determined), `false` otherwise.
 *
 * @example
 * ```ts
 * const connected = await isConnectedToNetwork();
 * if (!connected) {
 *   alert('No internet connection detected.');
 * }
 * ```
 */
export const isConnectedToNetwork = async (): Promise<boolean> => {
  try {
    const network = await Network.getNetworkStateAsync();

    /**
     * isInternetReachable can be null on some platforms while the OS is determining the status.
     * We return true if connected and NOT explicitly confirmed as unreachable.
     */
    return !!(network.isConnected && network.isInternetReachable !== false);
  } catch (error: any) {
    // Fallback to false if the network state cannot be determined
    logger.error('Failed to check network state', error);
    return false;
  }
};
