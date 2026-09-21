import { ACCESS_TOKEN_KEY, DAT_ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@utils/constants';
import { getItemAsync, setItemAsync, deleteItemAsync } from 'expo-secure-store';

const key = ACCESS_TOKEN_KEY;
const refreshKey = REFRESH_TOKEN_KEY;
const datAccessKey = DAT_ACCESS_TOKEN_KEY;

/**
 * Manages persistence of authentication tokens in the device secure store.
 *
 * Wraps expo-secure-store to read, write, and delete the access token, refresh
 * token, and DAT (digital assistant token) access token. Values are stored
 * encrypted at rest in the platform keychain/keystore, keyed by the constants
 * in `@utils/constants`. All operations are async and may reject if the secure
 * store is unavailable or a value cannot be decrypted.
 */
export const TokenStoreManager = {
  /**
   * Reads the main access token from the secure store.
   *
   * @returns A promise resolving to the stored access token string, or null
   *   when no token has been saved.
   * @throws {Error} If the secure store cannot be read (e.g. keychain
   *   unavailability or decryption failure).
   */
  async getAccessToken(): Promise<string | null> {
    return await getItemAsync(key);
  },

  /**
   * Stores the main access token in the secure store, replacing any existing
   * value under the same key.
   *
   * @param token - The access token string to persist.
   * @returns A promise that resolves once the token has been written.
   * @throws {Error} If the secure store cannot be written.
   */
  async addAccessToken(token: string): Promise<void> {
    return await setItemAsync(key, token);
  },

  /**
   * Removes the main access token from the secure store.
   *
   * @returns A promise that resolves once the token has been deleted.
   *   Deleting a non-existent key resolves successfully.
   * @throws {Error} If the secure store cannot be accessed.
   */
  async removeAccessToken(): Promise<void> {
    return await deleteItemAsync(key);
  },
  /**
   * Reads the refresh token from the secure store.
   *
   * @returns A promise resolving to the stored refresh token string, or null
   *   when no token has been saved.
   * @throws {Error} If the secure store cannot be read.
   */
  async getRefreshToken(): Promise<string | null> {
    return await getItemAsync(refreshKey);
  },

  /**
   * Stores the refresh token in the secure store, replacing any existing
   * value under the same key.
   *
   * @param token - The refresh token string to persist.
   * @returns A promise that resolves once the token has been written.
   * @throws {Error} If the secure store cannot be written.
   */
  async addRefreshToken(token: string): Promise<void> {
    return await setItemAsync(refreshKey, token);
  },

  /**
   * Removes the refresh token from the secure store.
   *
   * @returns A promise that resolves once the token has been deleted.
   *   Deleting a non-existent key resolves successfully.
   * @throws {Error} If the secure store cannot be accessed.
   */
  async removeRefreshToken(): Promise<void> {
    return await deleteItemAsync(refreshKey);
  },

  /**
   * Reads the DAT access token from the secure store.
   *
   * @returns A promise resolving to the stored DAT access token string, or
   *   null when no token has been saved.
   * @throws {Error} If the secure store cannot be read.
   */
  async getDatAccessToken(): Promise<string | null> {
    return await getItemAsync(datAccessKey);
  },

  /**
   * Stores the DAT access token in the secure store, replacing any existing
   * value under the same key.
   *
   * @param token - The DAT access token string to persist.
   * @returns A promise that resolves once the token has been written.
   * @throws {Error} If the secure store cannot be written.
   */
  async addDatAccessToken(token: string): Promise<void> {
    return await setItemAsync(datAccessKey, token);
  },

  /**
   * Removes the DAT access token from the secure store.
   *
   * @returns A promise that resolves once the token has been deleted.
   *   Deleting a non-existent key resolves successfully.
   * @throws {Error} If the secure store cannot be accessed.
   */
  async removeDatAccessTokens(): Promise<void> {
    return await deleteItemAsync(datAccessKey);
  },
  /**
   * Removes all authentication tokens (access, refresh, and DAT access) from
   * the secure store.
   *
   * Used during logout to clear every persisted credential in one call.
   *
   * @returns A promise that resolves once all keys have been deleted.
   *   Deleting a non-existent key resolves successfully.
   * @throws {Error} If the secure store cannot be accessed.
   */
  async removeTokens(): Promise<void> {
    await deleteItemAsync(key);
    await deleteItemAsync(refreshKey);
    await deleteItemAsync(datAccessKey);
  },
};
