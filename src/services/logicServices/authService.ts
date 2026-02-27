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

      const response = axiosResponse.data; // 👈 QUAN TRỌNG

      console.log('API Response Data:', response);

      if (response?.isSuccess) {
        const { accessToken, refreshToken, userInfo } = response.data;

        // 1️⃣ Lưu token
        await tokenStorage.setTokens(accessToken, refreshToken);

        // 2️⃣ Lưu user vào Redux
        store.dispatch(setUser(userInfo));

        console.log('Login SUCCESS');

        return {
          success: true,
          user: userInfo,
        };
      }

      console.log('Login FAILED:', response?.message);

      return {
        success: false,
        message: response?.message || 'Sai tài khoản hoặc mật khẩu',
      };
    } catch (error: any) {
      console.log('❌ LOGIN SERVICE ERROR FULL:', error);
      console.log('❌ MESSAGE:', error?.message);
      console.log('❌ RESPONSE:', error?.response);

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