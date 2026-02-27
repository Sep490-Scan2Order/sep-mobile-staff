import publicClient from '../axios/publicClient';
import { API_BASE_URL } from '../../config/apiConfig';

export const authApi = {
  staffLogin: (credentials: { email: string; password: string }) => {
    return publicClient.post(
      `${API_BASE_URL}/Auth/staff-login`,
      credentials
    );
  },

  refreshToken: (refreshToken: string) => {
    return publicClient.post(
      `${API_BASE_URL}/Auth/refresh-token`,
      { refreshToken }
    );
  },
};