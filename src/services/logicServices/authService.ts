import { authApi } from '../apiEndpoints/authApi';
import { tokenStorage } from '../../utils/tokenStorage';
import { store } from '../../store';
import { setUser } from '../../store/slices/authSlice';

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    console.log('=== VÀO authService.login ===');

    try {
      const axiosResponse = await authApi.staffLogin(credentials);

      console.log('Raw Axios Response:', axiosResponse);

      const response = axiosResponse.data; 

      console.log('API Response Data:', response);

      if (!response?.isSuccess) {
        console.log('Login FAILED:', response?.message);

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

      console.log('✅ Login SUCCESS & Redux updated');

      return {
        success: true,
      };
    } catch (error: any) {
      console.log('❌ LOGIN SERVICE ERROR FULL:', error);

      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          'Không thể kết nối server',
      };
    }
  },
};