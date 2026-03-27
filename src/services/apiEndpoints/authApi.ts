import publicClient from '@/services/axios/publicClient';
import { API_BASE_URL } from '@/config/apiConfig';

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

  sendForgotPasswordOtp: (email: string) => {
    return publicClient.post(`${API_BASE_URL}/Auth/send-forgot-password-staff-otp?email=${email}`);
  },

  verifyForgotPasswordOtp: (email: string, otp: string) => {
    return publicClient.post(
      `${API_BASE_URL}/Auth/verify-forgot-password-staff-otp?email=${email}&otp=${otp}`
    );
  },

  completeForgotPasswordStaff: (data: {
    email: string;
    newPassword: string;
    resetToken: string;
  }) => {
    return publicClient.post(
      `${API_BASE_URL}/Auth/complete-forgot-password-staff`,
      data
    );
  },

  changePasswordStaff: (data: {
    email: string;
    oldPassword: string;
    newPassword: string;
  }) => {
    return publicClient.post(`${API_BASE_URL}/Auth/change-password-staff`, data);
  },
};