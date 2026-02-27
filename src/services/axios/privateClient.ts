import axios from 'axios';
import { Alert } from 'react-native';
import { tokenStorage } from '../../utils/tokenStorage';
import { setUser } from '../../store/slices/authSlice';
import { store } from '../../store';
import { authApi } from '../../api/services/authApi'; /
import { API_BASE_URL } from '../../config/apiConfig';

const axiosPrivate = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ==========================
// Refresh Queue Handaxiling
// ==========================
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (error: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(p => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
};

// ==========================
// 1️⃣ Request Interceptor
// ==========================
axiosPrivate.interceptors.request.use(
  async config => {
    const { accessToken } = await tokenStorage.getTokens();
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// ==========================
// 2️⃣ Response Interceptor
// ==========================
axiosPrivate.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Nếu đang refresh token, đợi queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            if (token)
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axiosPrivate(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const { refreshToken } = await tokenStorage.getTokens();
        if (!refreshToken) throw new Error('No refresh token');

        // ✅ Gọi refresh token thông qua authApi
        const res = await authApi.refreshToken(refreshToken);

        const { access_token: newAccessToken, refresh_token: newRefreshToken } =
          res.data.data || {};

        if (!newAccessToken || !newRefreshToken)
          throw new Error('Invalid refresh token response');

        // ✅ Lưu lại token mới
        await tokenStorage.setTokens(newAccessToken, newRefreshToken);

        // ✅ Cập nhật headers
        axiosPrivate.defaults.headers[
          'Authorization'
        ] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        // ✅ Giải phóng queue
        processQueue(null, newAccessToken);

        return axiosPrivate(originalRequest);
      } catch (err) {
        processQueue(err, null);
        await tokenStorage.clearTokens();
        store.dispatch(setUser(null));
        Alert.alert(
          'Đăng nhập lại',
          'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        );
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosPrivate;