import axios from 'axios';
import Toast from 'react-native-toast-message';
import { tokenStorage } from '@/utils/tokenStorage';
import { logout } from '@/store/slices/authSlice';
import { store } from '@/store';
import { API_BASE_URL } from '@/config/apiConfig';
import { isTokenExpired } from '@/utils/jwtHelper';
const axiosPrivate = axios.create({
  baseURL: API_BASE_URL,
});
axiosPrivate.interceptors.request.use(
  async config => {
    const { accessToken } = await tokenStorage.getTokens();
    if (accessToken) {
      if (isTokenExpired(accessToken, 60)) {
        await tokenStorage.clearTokens();
        store.dispatch(logout());
        Toast.show({
          type: 'error',
          text1: 'Phiên đã hết hạn',
          text2: 'Vui lòng đăng nhập lại để tiếp tục sử dụng.',
          visibilityTime: 4000,
        });
        return Promise.reject(new Error('Token expired'));
      }
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => Promise.reject(error),
);
axiosPrivate.interceptors.response.use(
  response => response,
  async error => {
    return Promise.reject(error);
  },
);
export default axiosPrivate;