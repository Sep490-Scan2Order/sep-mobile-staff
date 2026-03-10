import { authApi } from '../apiEndpoints/authApi';
import { tokenStorage } from '../../utils/tokenStorage';
import { store } from '../../store';
import { setUser, logout } from '../../store/slices/authSlice';
import { Alert } from 'react-native';

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
      console.error('❌ LOGOUT ERROR:', error);
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
      
      Alert.alert(
        'Phiên hết hạn',
        'Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.',
        [{ text: 'OK' }],
      );
    } catch (error) {
      console.error('❌ Error forcing logout:', error);
    }
  },

  
sendEmailOtp: async (email: string) => {
  try {

    const otp = Math.floor(10000000 + Math.random() * 90000000).toString();

    const htmlContent = `
      <h2>Scan2Order - Reset Password</h2>
      <p>Mã OTP của bạn là:</p>
      <h1>${otp}</h1>
      <p>Mã có hiệu lực trong 5 phút.</p>
    `;

    const axiosResponse = await authApi.sendEmail(
      email,
      "OTP Reset Password",
      htmlContent
    );

    const response = axiosResponse.data;
    console.log('API Response Data for Send Email OTP:', response);

    if (!response?.isSuccess) {
      return {
        success: false,
        message: response?.message || "Không gửi được email"
      };
    }

    return {
      success: true,
      otp
    };

  } catch (error: any) {

  const message =
    error?.response?.data?.message ||
    error?.message ||
    "Không thể gửi email OTP";

  return {
    success: false,
    message: typeof message === "string"
      ? message
      : JSON.stringify(message),
  };
}
}

, resetPassword: async (data: { email: string; newPassword: string; resetToken: string }) => {
  try {
    const { data: res } = await authApi.resetPassword(data);
    return { success: true, message: res?.message || "Đổi mật khẩu thành công", data: res };
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Không thể reset mật khẩu",
    };
  }
}
}

