import { tokenStorage } from './tokenStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
describe('tokenStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('sets tokens correctly', async () => {
    await tokenStorage.setTokens('access-123', 'refresh-456');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('access_token', 'access-123');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('refresh_token', 'refresh-456');
  });
  it('gets tokens correctly', async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce('access-123')
      .mockResolvedValueOnce('refresh-456');
    const tokens = await tokenStorage.getTokens();
    expect(tokens.accessToken).toBe('access-123');
    expect(tokens.refreshToken).toBe('refresh-456');
  });
  it('clears tokens correctly', async () => {
    await tokenStorage.clearTokens();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('access_token');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('refresh_token');
  });
  it('handles errors during getTokens', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
    const tokens = await tokenStorage.getTokens();
    expect(tokens.accessToken).toBeNull();
    expect(tokens.refreshToken).toBeNull();
  });
});
