import { authApi } from '@/services/apiEndpoints/authApi';
import { tokenStorage } from '@/utils/tokenStorage';
import { store } from '@/store';
import { setUser, logout } from '@/store/slices/authSlice';
import Toast from 'react-native-toast-message';
export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    try {
      const axiosResponse = await authApi.staffLogin(credentials);
      const response = axiosResponse.data;
      if (!response?.isSuccess) {
        return {
          success: false,
          message: response?.message || 'Sai tài khoản hoặc mật khẩu',
        };
      }
      const { accessToken, refreshToken, userInfo } = response.data;
      await tokenStorage.setTokens(accessToken, refreshToken);
      store.dispatch(
        setUser({
          accessToken,
          refreshToken,
          userInfo,
        }),
      );
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Không thể kết nối server',
      };
    }
  },
  logout: async () => {
    try {
      await tokenStorage.clearTokens();
      store.dispatch(logout());
      return {
        success: true,
      };
    } catch (error: any) {
      store.dispatch(logout());
      return {
        success: false,
        message: error?.message || 'Lỗi khi đăng xuất',
      };
    }
  },
  forceLogout: async () => {
    try {
      await authService.logout();
      Toast.show({
        type: 'error',
        text1: 'Phiên đăng nhập hết hạn',
        text2: 'Vui lòng đăng nhập lại để tiếp tục.',
        visibilityTime: 4000,
      });
    } catch (error) {
    }
  },
  sendForgotPasswordOtp: async (email: string) => {
    try {
      const { data: res } = await authApi.sendForgotPasswordOtp(email);
      if (!res?.isSuccess) {
        return { success: false, message: res?.message || 'Không thể gửi OTP' };
      }
      return { success: true, message: 'OTP đã được gửi tới email của bạn' };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Lỗi khi gửi OTP',
      };
    }
  },
  verifyForgotPasswordOtp: async (email: string, otp: string) => {
    try {
      const { data: res } = await authApi.verifyForgotPasswordOtp(email, otp);
      if (!res?.isSuccess) {
        return { success: false, message: res?.message || 'OTP không hợp lệ' };
      }
      return { success: true, resetToken: res.data };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Lỗi khi xác thực OTP',
      };
    }
  },
  completeForgotPassword: async (data: {
    email: string;
    newPassword: string;
    resetToken: string;
  }) => {
    try {
      const { data: res } = await authApi.completeForgotPasswordStaff(data);
      if (!res?.isSuccess) {
        return { success: false, message: res?.message || 'Không thể đặt lại mật khẩu' };
      }
      return { success: true, message: 'Đặt lại mật khẩu thành công' };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Lỗi khi đặt lại mật khẩu',
      };
    }
  },
  changePassword: async (data: {
    email: string;
    oldPassword: string;
    newPassword: string;
  }) => {
    try {
      const { data: res } = await authApi.changePasswordStaff(data);
      if (!res?.isSuccess) {
        return { success: false, message: res?.message || 'Không thể đổi mật khẩu' };
      }
      return { success: true, message: 'Đổi mật khẩu thành công' };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Lỗi khi đổi mật khẩu',
      };
    }
  },
};
