import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@utils/constants';
import { getItemAsync, setItemAsync, deleteItemAsync } from 'expo-secure-store';

const key = ACCESS_TOKEN_KEY;
const refreshKey = REFRESH_TOKEN_KEY;

export const TokenStoreManager = {
  async getAccessToken(): Promise<string | null> {
    return await getItemAsync(key);
  },

  async addAccessToken(token: string): Promise<void> {
    return await setItemAsync(key, token);
  },

  async removeTokens(): Promise<void> {
    await deleteItemAsync(key);

    await deleteItemAsync(refreshKey);
  },
  async removeAccessToken(): Promise<void> {
    return await deleteItemAsync(key);
  },
  async getRefreshToken(): Promise<string | null> {
    return await getItemAsync(refreshKey);
  },

  async addRefreshToken(token: string): Promise<void> {
    return await setItemAsync(refreshKey, token);
  },

  async removeRefreshToken(): Promise<void> {
    return await deleteItemAsync(refreshKey);
  },
};
