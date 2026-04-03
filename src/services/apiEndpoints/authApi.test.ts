import publicClient from '@/services/axios/publicClient';
import axiosPrivate from '@/services/axios/privateClient';
import { authApi } from './authApi';
import { API_BASE_URL } from '@/config/apiConfig';

// Mock publicClient
jest.mock('@/services/axios/publicClient', () => ({
  post: jest.fn(),
}));

// Mock privateClient (used for authenticated endpoints)
jest.mock('@/services/axios/privateClient', () => ({
  post: jest.fn(),
}));

describe('authApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('staffLogin should call /Auth/staff-login with correct data', async () => {
    const credentials = { email: 'test@example.com', password: 'password123' };
    (publicClient.post as jest.Mock).mockResolvedValue({ data: { isSuccess: true } });

    await authApi.staffLogin(credentials);

    expect(publicClient.post).toHaveBeenCalledWith(
      `${API_BASE_URL}/Auth/staff-login`,
      credentials
    );
  });

  it('refreshToken should call /Auth/refresh-token with correct data', async () => {
    const token = 'refresh-token-123';
    (publicClient.post as jest.Mock).mockResolvedValue({ data: { isSuccess: true } });

    await authApi.refreshToken(token);

    expect(publicClient.post).toHaveBeenCalledWith(
      `${API_BASE_URL}/Auth/refresh-token`,
      { refreshToken: token }
    );
  });

  it('sendForgotPasswordOtp should call /Auth/send-forgot-password-staff-otp with email', async () => {
    const email = 'test@example.com';
    (publicClient.post as jest.Mock).mockResolvedValue({ data: { isSuccess: true } });

    await authApi.sendForgotPasswordOtp(email);

    expect(publicClient.post).toHaveBeenCalledWith(
      `${API_BASE_URL}/Auth/send-forgot-password-staff-otp?email=${email}`
    );
  });

  it('verifyForgotPasswordOtp should call /Auth/verify-forgot-password-staff-otp with email and otp', async () => {
    const email = 'test@example.com';
    const otp = '123456';
    (publicClient.post as jest.Mock).mockResolvedValue({ data: { isSuccess: true } });

    await authApi.verifyForgotPasswordOtp(email, otp);

    expect(publicClient.post).toHaveBeenCalledWith(
      `${API_BASE_URL}/Auth/verify-forgot-password-staff-otp?email=${email}&otp=${otp}`
    );
  });

  it('completeForgotPasswordStaff should call /Auth/complete-forgot-password-staff with correct data', async () => {
    const data = {
      email: 'test@example.com',
      newPassword: 'new-password',
      resetToken: 'reset-token',
    };
    (publicClient.post as jest.Mock).mockResolvedValue({ data: { isSuccess: true } });

    await authApi.completeForgotPasswordStaff(data);

    expect(publicClient.post).toHaveBeenCalledWith(
      `${API_BASE_URL}/Auth/complete-forgot-password-staff`,
      data
    );
  });

  it('changePasswordStaff should call /Auth/change-password-staff with correct data using authenticated client', async () => {
    const data = {
      email: 'test@example.com',
      oldPassword: 'old-password',
      newPassword: 'new-password',
    };
    // changePasswordStaff now uses axiosPrivate (requires auth token)
    (axiosPrivate.post as jest.Mock).mockResolvedValue({ data: { isSuccess: true } });

    await authApi.changePasswordStaff(data);

    expect(axiosPrivate.post).toHaveBeenCalledWith(
      `${API_BASE_URL}/Auth/change-password-staff`,
      data
    );
    // publicClient should NOT be called
    expect(publicClient.post).not.toHaveBeenCalled();
  });
});
