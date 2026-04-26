import { DeviceEventEmitter } from 'react-native';
import Toast from 'react-native-toast-message';
import axiosPrivate from './privateClient';
import { tokenStorage } from '@/utils/tokenStorage';
import { isTokenExpired } from '@/utils/jwtHelper';

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

jest.mock('@/utils/jwtHelper', () => ({
  isTokenExpired: jest.fn(),
}));

// Mock DeviceEventEmitter.emit
jest.spyOn(DeviceEventEmitter, 'emit').mockImplementation(() => ({}) as any);

describe('privateClient', () => {
  let requestInterceptor: any;
  let responseInterceptorSuccess: any;
  let responseInterceptorError: any;

  beforeEach(() => {
    jest.clearAllMocks();
    const reqHandlers = (axiosPrivate.interceptors.request as any).handlers;
    const resHandlers = (axiosPrivate.interceptors.response as any).handlers;
    requestInterceptor = reqHandlers[0].fulfilled;
    responseInterceptorSuccess = resHandlers[0].fulfilled;
    responseInterceptorError = resHandlers[0].rejected;
  });

  describe('request interceptor', () => {
    it('adds Authorization header if token exists', async () => {
      (tokenStorage.getTokens as jest.Mock).mockResolvedValue({
        accessToken: 'test-token',
      });
      (isTokenExpired as jest.Mock).mockReturnValue(false);

      const config = { headers: {} };
      const result = await requestInterceptor(config);

      expect(result.headers.Authorization).toBe('Bearer test-token');
    });

    it('clears tokens and emits logout if token is expired', async () => {
      const config = { headers: {} };
      (tokenStorage.getTokens as jest.Mock).mockResolvedValue({
        accessToken: 'expired-token',
      });
      (isTokenExpired as jest.Mock).mockReturnValue(true);

      await expect(requestInterceptor(config)).rejects.toThrow('Token expired');
      expect(tokenStorage.clearTokens).toHaveBeenCalled();
      expect(DeviceEventEmitter.emit).toHaveBeenCalledWith('AUTH_LOGOUT');
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Phiên đã hết hạn',
        text2: 'Vui lòng đăng nhập lại để tiếp tục sử dụng.',
        visibilityTime: 4000,
      });
    });
  });

  describe('response interceptor', () => {
    it('returns response on success', () => {
      const response = { data: 'test' };
      const result = responseInterceptorSuccess(response);
      expect(result).toBe(response);
    });

    it('rejects with error on failure', async () => {
      const error = { response: { status: 401 } };
      await expect(responseInterceptorError(error)).rejects.toBe(error);
    });
  });
});
