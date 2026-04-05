import axios from 'axios';
import { Alert } from 'react-native';
import { tokenStorage } from '@/utils/tokenStorage';
import { logout } from '@/store/slices/authSlice';
import { store } from '@/store';
// import { authApi } from '@/services/apiEndpoints/authApi';
import { API_BASE_URL } from '@/config/apiConfig';
import { isTokenExpired } from '@/utils/jwtHelper';

const axiosPrivate = axios.create({
  baseURL: API_BASE_URL,
  // ❌ XÓA DÒNG NÀY: headers: { 'Content-Type': 'multipart/form-data' },
  // Để Axios tự nhận diện Content-Type
});

axiosPrivate.interceptors.request.use(
  async config => {
    const { accessToken } = await tokenStorage.getTokens();

    if (accessToken) {
      if (isTokenExpired(accessToken, 60)) {
        console.log('⚠️ Access token expired - clearing tokens and logging out');
        await tokenStorage.clearTokens();
        store.dispatch(logout());

        Alert.alert(
          'Phiên đã hết hạn',
          'Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.',
          [{ text: 'OK' }],
        );

        return Promise.reject(new Error('Token expired'));
      }

      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// Phần response interceptor (refresh token) bạn đang comment lại thì cứ giữ nguyên
axiosPrivate.interceptors.response.use(
  response => response,
  async error => {
    // ... logic refresh token ...
    return Promise.reject(error);
  },
);

export default axiosPrivate;