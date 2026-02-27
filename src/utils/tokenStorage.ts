import { createAsyncStorage } from "@react-native-async-storage/async-storage";

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const storage = createAsyncStorage("appDB");
export const tokenStorage = {
  async setTokens(accessToken: string, refreshToken: string) {
    try {
      await Promise.all([
        storage.setItem(ACCESS_TOKEN_KEY, accessToken),
        storage.setItem(REFRESH_TOKEN_KEY, refreshToken),
      ]);
    } catch (err) {
      console.error('❌ Error saving tokens', err);
    }
  },

  async getTokens() {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        storage.getItem(ACCESS_TOKEN_KEY),
        storage.getItem(REFRESH_TOKEN_KEY),
      ]);
      return { accessToken, refreshToken };
    } catch (err) {
      console.error('❌ Error getting tokens', err);
      return { accessToken: null, refreshToken: null };
    }
  },

  async clearTokens() {
    try {
      await Promise.all([
        storage.removeItem(ACCESS_TOKEN_KEY),
        storage.removeItem(REFRESH_TOKEN_KEY),
      ]);
    } catch (err) {
      console.error('❌ Error clearing tokens', err);
    }
  },
};