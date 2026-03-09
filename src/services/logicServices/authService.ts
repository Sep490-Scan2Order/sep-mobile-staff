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
};