import { authService } from './authService';
import { authApi } from '@/services/apiEndpoints/authApi';
import { tokenStorage } from '@/utils/tokenStorage';
import { store } from '@/store';
import { setUser, logout } from '@/store/slices/authSlice';
import Toast from 'react-native-toast-message';

// Mock authApi
jest.mock('@/services/apiEndpoints/authApi', () => ({
  authApi: {
    staffLogin: jest.fn(),
    sendForgotPasswordOtp: jest.fn(),
    verifyForgotPasswordOtp: jest.fn(),
    completeForgotPasswordStaff: jest.fn(),
    changePasswordStaff: jest.fn(),
  },
}));

// Mock tokenStorage
jest.mock('@/utils/tokenStorage', () => ({
  tokenStorage: {
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
  },
}));

// Mock store
jest.mock('@/store', () => ({
  store: {
    dispatch: jest.fn(),
  },
}));

// Mock authSlice actions
jest.mock('@/store/slices/authSlice', () => ({
  setUser: jest.fn(),
  logout: jest.fn(),
}));

// Mock Toast
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const mockCredentials = { email: 'test@example.com', password: 'password' };
    const mockUser = { id: 1, name: 'Test User' };

    it('should login successfully and dispatch setUser', async () => {
      const mockResponse = {
        data: {
          isSuccess: true,
          data: {
            accessToken: 'at',
            refreshToken: 'rt',
            userInfo: mockUser,
          },
        },
      };
      (authApi.staffLogin as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.login(mockCredentials);

      expect(result.success).toBe(true);
      expect(tokenStorage.setTokens).toHaveBeenCalledWith('at', 'rt');
      expect(setUser).toHaveBeenCalledWith({
        accessToken: 'at',
        refreshToken: 'rt',
        userInfo: mockUser,
      });
      expect(store.dispatch).toHaveBeenCalled();
    });

    it('should return error message when API returns failure', async () => {
      const mockResponse = {
        data: {
          isSuccess: false,
          message: 'Invalid credentials',
        },
      };
      (authApi.staffLogin as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.login(mockCredentials);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
      expect(tokenStorage.setTokens).not.toHaveBeenCalled();
    });

    it('should return error message when API throws error', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Network Error',
          },
        },
      };
      (authApi.staffLogin as jest.Mock).mockRejectedValue(mockError);

      const result = await authService.login(mockCredentials);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Network Error');
    });

    it('should handle generic error message when API throws error without response', async () => {
      const mockError = new Error('Generic Error');
      (authApi.staffLogin as jest.Mock).mockRejectedValue(mockError);

      const result = await authService.login(mockCredentials);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Generic Error');
    });
  });

  describe('logout', () => {
    it('should clear tokens and dispatch logout', async () => {
      const result = await authService.logout();

      expect(result.success).toBe(true);
      expect(tokenStorage.clearTokens).toHaveBeenCalled();
      expect(logout).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalled();
    });

    it('should dispatch logout even if clearing tokens fails', async () => {
      (tokenStorage.clearTokens as jest.Mock).mockRejectedValue(new Error('Clear error'));

      const result = await authService.logout();

      expect(result.success).toBe(false);
      expect(logout).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalled();
    });
  });

  describe('forceLogout', () => {
    it('should call logout and show alert', async () => {
      const logoutSpy = jest.spyOn(authService, 'logout').mockResolvedValue({ success: true });

      await authService.forceLogout();

      expect(logoutSpy).toHaveBeenCalled();
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Phiên đăng nhập hết hạn',
        text2: 'Vui lòng đăng nhập lại để tiếp tục.',
        visibilityTime: 4000,
      });
      logoutSpy.mockRestore();
    });
  });

  describe('forgot password flow', () => {
    describe('sendForgotPasswordOtp', () => {
      it('should return true on success', async () => {
        (authApi.sendForgotPasswordOtp as jest.Mock).mockResolvedValue({
          data: { isSuccess: true },
        });

        const result = await authService.sendForgotPasswordOtp('test@test.com');
        expect(result.success).toBe(true);
        expect(result.message).toContain('đã được gửi');
      });

      it('should return false on API failure', async () => {
        (authApi.sendForgotPasswordOtp as jest.Mock).mockResolvedValue({
          data: { isSuccess: false, message: 'Wait for 30s' },
        });

        const result = await authService.sendForgotPasswordOtp('test@test.com');
        expect(result.success).toBe(false);
        expect(result.message).toBe('Wait for 30s');
      });

      it('should handle exception', async () => {
        (authApi.sendForgotPasswordOtp as jest.Mock).mockRejectedValue({
          response: { data: { message: 'Api Error' } },
        });
        const result = await authService.sendForgotPasswordOtp('test@test.com');
        expect(result.success).toBe(false);
        expect(result.message).toBe('Api Error');
      });
    });

    describe('verifyForgotPasswordOtp', () => {
      it('should return resetToken on success', async () => {
        (authApi.verifyForgotPasswordOtp as jest.Mock).mockResolvedValue({
          data: { isSuccess: true, data: 'reset-token-123' },
        });

        const result = await authService.verifyForgotPasswordOtp('test@test.com', '123456');
        expect(result.success).toBe(true);
        expect(result.resetToken).toBe('reset-token-123');
      });

      it('should return false on failure', async () => {
        (authApi.verifyForgotPasswordOtp as jest.Mock).mockResolvedValue({
          data: { isSuccess: false, message: 'Invalid OTP' },
        });

        const result = await authService.verifyForgotPasswordOtp('test@test.com', '123456');
        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid OTP');
      });
    });

    describe('completeForgotPassword', () => {
      it('should return true on success', async () => {
        (authApi.completeForgotPasswordStaff as jest.Mock).mockResolvedValue({
          data: { isSuccess: true },
        });

        const result = await authService.completeForgotPassword({
          email: 'test@test.com',
          newPassword: 'new',
          resetToken: 'token',
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('changePassword', () => {
    it('should return success on valid call', async () => {
      (authApi.changePasswordStaff as jest.Mock).mockResolvedValue({
        data: { isSuccess: true },
      });

      const result = await authService.changePassword({
        email: 'test@test.com',
        oldPassword: 'old',
        newPassword: 'new',
      });
      expect(result.success).toBe(true);
    });

    it('should return error message on failure', async () => {
        (authApi.changePasswordStaff as jest.Mock).mockResolvedValue({
          data: { isSuccess: false, message: 'Old password incorrect' },
        });
  
        const result = await authService.changePassword({
          email: 'test@test.com',
          oldPassword: 'old',
          newPassword: 'new',
        });
        expect(result.success).toBe(false);
        expect(result.message).toBe('Old password incorrect');
      });
  });
});
