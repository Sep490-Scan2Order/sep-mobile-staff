import axios from 'axios';
import Toast from 'react-native-toast-message';
import { DeviceEventEmitter } from 'react-native';
import { tokenStorage } from '@/utils/tokenStorage';
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
        DeviceEventEmitter.emit('AUTH_LOGOUT');
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