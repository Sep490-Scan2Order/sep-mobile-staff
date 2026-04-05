import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ResetPasswordScreen from './ResetPasswordScreen';
import { authService } from '@/services/logicServices/authService';

// Mock authService
jest.mock('@/services/logicServices/authService', () => ({
  authService: {
    verifyForgotPasswordOtp: jest.fn(),
    completeForgotPassword: jest.fn(),
  },
}));

// Mock Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));

// Mock lucide icons
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    ChevronLeft: () => <View testID="chevron-left" />,
    Eye: () => <View testID="eye-icon" />,
    EyeOff: () => <View testID="eye-off-icon" />,
  };
});

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('ResetPasswordScreen', () => {
  const navigation = { navigate: jest.fn(), goBack: jest.fn() };
  const route = { params: { email: 'test@example.com' } };

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue(navigation);
    (useRoute as jest.Mock).mockReturnValue(route);
  });

  it('renders correctly', () => {
    const { getByPlaceholderText, getAllByText } = render(<ResetPasswordScreen />);
    expect(getAllByText('Đặt lại mật khẩu').length).toBe(2);
    expect(getByPlaceholderText('Nhập mã OTP')).toBeTruthy();
    expect(getByPlaceholderText('Nhập mật khẩu mới')).toBeTruthy();
  });

  it('shows alert for invalid input', () => {
    const { getByTestId, getByPlaceholderText } = render(<ResetPasswordScreen />);
    const resetButton = getByTestId('reset-button-text');

    // Missing OTP
    fireEvent.press(resetButton);
    expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Vui lòng nhập mã OTP');

    // Short password
    fireEvent.changeText(getByPlaceholderText('Nhập mã OTP'), '123456');
    fireEvent.changeText(getByPlaceholderText('Nhập mật khẩu mới'), '123');
    fireEvent.press(resetButton);
    expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Mật khẩu phải ít nhất 6 ký tự');

    // Mismatched password
    fireEvent.changeText(getByPlaceholderText('Nhập mật khẩu mới'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Nhập lại mật khẩu mới'), 'different');
    fireEvent.press(resetButton);
    expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Mật khẩu xác nhận không khớp');
  });

  it('completes reset password flow successfully', async () => {
    const mockToken = 'reset-token-123';
    (authService.verifyForgotPasswordOtp as jest.Mock).mockResolvedValue({
      success: true,
      resetToken: mockToken,
    });
    (authService.completeForgotPassword as jest.Mock).mockResolvedValue({
      success: true,
    });

    const { getByPlaceholderText, getByTestId } = render(<ResetPasswordScreen />);
    fireEvent.changeText(getByPlaceholderText('Nhập mã OTP'), '123456');
    fireEvent.changeText(getByPlaceholderText('Nhập mật khẩu mới'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Nhập lại mật khẩu mới'), 'password123');
    fireEvent.press(getByTestId('reset-button-text'));

    await waitFor(() => {
      expect(authService.verifyForgotPasswordOtp).toHaveBeenCalledWith('test@example.com', '123456');
    });

    await waitFor(() => {
      expect(authService.completeForgotPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        newPassword: 'password123',
        resetToken: mockToken,
      });
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Thành công',
        'Mật khẩu đã được đặt lại',
        expect.any(Array)
      );
    });

    // Trigger the OK button callback in the alert
    // @ts-ignore
    const alertConfig = Alert.alert.mock.calls[Alert.alert.mock.calls.length - 1][2];
    alertConfig[0].onPress();
    expect(navigation.navigate).toHaveBeenCalledWith('Login');
  });

  it('handles verification failure', async () => {
    (authService.verifyForgotPasswordOtp as jest.Mock).mockResolvedValue({
      success: false,
      message: 'OTP invalid',
    });

    const { getByPlaceholderText, getByTestId } = render(<ResetPasswordScreen />);
    fireEvent.changeText(getByPlaceholderText('Nhập mã OTP'), 'wrong');
    fireEvent.changeText(getByPlaceholderText('Nhập mật khẩu mới'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Nhập lại mật khẩu mới'), 'password123');
    fireEvent.press(getByTestId('reset-button-text'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'OTP invalid');
    });
  });

  it('handles completion failure', async () => {
    (authService.verifyForgotPasswordOtp as jest.Mock).mockResolvedValue({
      success: true,
      resetToken: 'token',
    });
    (authService.completeForgotPassword as jest.Mock).mockResolvedValue({
      success: false,
      message: 'Failed to reset',
    });

    const { getByPlaceholderText, getByTestId } = render(<ResetPasswordScreen />);
    fireEvent.changeText(getByPlaceholderText('Nhập mã OTP'), '123456');
    fireEvent.changeText(getByPlaceholderText('Nhập mật khẩu mới'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Nhập lại mật khẩu mới'), 'password123');
    fireEvent.press(getByTestId('reset-button-text'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Failed to reset');
    });
  });
});
