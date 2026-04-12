import Toast from 'react-native-toast-message';
import axiosPrivate from './privateClient';
import { tokenStorage } from '@/utils/tokenStorage';
import { logout } from '@/store/slices/authSlice';
import { store } from '@/store';
import { authApi } from '@/services/apiEndpoints/authApi';
import { isTokenExpired } from '@/utils/jwtHelper';

// Mocks
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));
jest.mock('@/utils/tokenStorage', () => ({
  tokenStorage: {
    getTokens: jest.fn(),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
  },
}));
jest.mock('@/store/slices/authSlice', () => ({
  logout: jest.fn(),
}));
jest.mock('@/store', () => ({
  store: { dispatch: jest.fn() },
}));
jest.mock('@/services/apiEndpoints/authApi', () => ({
  authApi: { refreshToken: jest.fn() },
}));
jest.mock('@/utils/jwtHelper', () => ({
  isTokenExpired: jest.fn(),
}));

describe('privateClient', () => {
  let requestInterceptor: any;
  let responseInterceptorSuccess: any;
  let responseInterceptorError: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Extract interceptors
    const reqHandlers = (axiosPrivate.interceptors.request as any).handlers;
    requestInterceptor = reqHandlers[0].fulfilled;

    const resHandlers = (axiosPrivate.interceptors.response as any).handlers;
    responseInterceptorSuccess = resHandlers[0].fulfilled;
    responseInterceptorError = resHandlers[0].rejected;
  });

  describe('Instance Configuration', () => {
    it('should not have hardcoded multipart/form-data header in default config', () => {
      // Axios instance creation with commented out headers line implies we want it empty or auto-detected
      const defaultHeaders = (axiosPrivate.defaults.headers as any);
      expect(defaultHeaders['Content-Type']).toBeUndefined();
    });
  });

  describe('Request Interceptor', () => {
    it('should add Authorization header if token is valid', async () => {
      const config: any = { headers: {} };
      (tokenStorage.getTokens as jest.Mock).mockResolvedValue({ accessToken: 'valid-token' });
      (isTokenExpired as jest.Mock).mockReturnValue(false);

      const updatedConfig = await requestInterceptor(config);

      expect(updatedConfig.headers['Authorization']).toBe('Bearer valid-token');
      expect(isTokenExpired).toHaveBeenCalledWith('valid-token', 60);
    });

    it('should clear tokens, dispatch logout, alert and reject if token is expired', async () => {
      const config: any = { headers: {} };
      (tokenStorage.getTokens as jest.Mock).mockResolvedValue({ accessToken: 'expired-token' });
      (isTokenExpired as jest.Mock).mockReturnValue(true);

      await expect(requestInterceptor(config)).rejects.toThrow('Token expired');

      expect(tokenStorage.clearTokens).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalledWith(logout());
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Phiên đã hết hạn',
        text2: 'Vui lòng đăng nhập lại để tiếp tục sử dụng.',
        visibilityTime: 4000,
      });
    });

    it('should return config unchanged if no access token', async () => {
      const config: any = { headers: {} };
      (tokenStorage.getTokens as jest.Mock).mockResolvedValue({ accessToken: null });

      const updatedConfig = await requestInterceptor(config);

      expect(updatedConfig.headers['Authorization']).toBeUndefined();
    });
  });

  describe('Response Interceptor', () => {
    it('should return response directly on success', () => {
      const mockResponse = { data: 'success' };
      const res = responseInterceptorSuccess(mockResponse);
      expect(res).toBe(mockResponse);
    });

    it('should reject immediately for any error', async () => {
      const mockError = { response: { status: 401 }, config: {} };
      await expect(responseInterceptorError(mockError)).rejects.toBe(mockError);
    });
  });
});
