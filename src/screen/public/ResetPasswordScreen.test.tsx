import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ResetPasswordScreen from './ResetPasswordScreen';
import { authService } from '@/services/logicServices/authService';
jest.mock('@/services/logicServices/authService', () => ({
  authService: {
    verifyForgotPasswordOtp: jest.fn(),
    completeForgotPassword: jest.fn(),
  },
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));
jest.mock('@/components/AppSnackbar', () => {
    const { View, Text } = require('react-native');
    return {
      AppSnackbar: ({ message, visible }: any) => {
        if (!visible) return null;
        return <View><Text>{message}</Text></View>;
      }
    };
});
jest.mock('@/components/AppModal', () => {
    const { View, Text, TouchableOpacity } = require('react-native');
    return {
        AppModal: ({ visible, title, message, buttons }: any) => {
            if (!visible) return null;
            return (
                <View>
                    <Text>{title}</Text>
                    <Text>{message}</Text>
                    {buttons?.map((btn: any, index: number) => (
                        <TouchableOpacity key={index} onPress={btn.onPress}>
                            <Text>{btn.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            );
        }
    }
});
describe('ResetPasswordScreen', () => {
  const navigation = { navigate: jest.fn(), goBack: jest.fn() };
  const route = { params: { email: 'test@example.com' } };
  const validPassword = 'Password123!';
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
  it('shows inline errors for invalid input', () => {
    const { getByTestId, getByPlaceholderText, getByText } = render(<ResetPasswordScreen />);
    const resetButton = getByTestId('reset-button-text');
    fireEvent.press(resetButton);
    expect(getByText('Vui lòng nhập mã OTP')).toBeTruthy();
    fireEvent.changeText(getByPlaceholderText('Nhập mã OTP'), '123456');
    fireEvent.changeText(getByPlaceholderText('Nhập mật khẩu mới'), '123');
    fireEvent.press(resetButton);
    expect(getByText('Mật khẩu phải có ít nhất 8 ký tự')).toBeTruthy();
    fireEvent.changeText(getByPlaceholderText('Nhập mật khẩu mới'), validPassword);
    fireEvent.changeText(getByPlaceholderText('Nhập lại mật khẩu mới'), 'different');
    fireEvent.press(resetButton);
    expect(getByText('Mật khẩu xác nhận không khớp')).toBeTruthy();
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
    const { getByPlaceholderText, getByTestId, getByText } = render(<ResetPasswordScreen />);
    fireEvent.changeText(getByPlaceholderText('Nhập mã OTP'), '123456');
    fireEvent.changeText(getByPlaceholderText('Nhập mật khẩu mới'), validPassword);
    fireEvent.changeText(getByPlaceholderText('Nhập lại mật khẩu mới'), validPassword);
    fireEvent.press(getByTestId('reset-button-text'));
    await waitFor(() => {
      expect(authService.verifyForgotPasswordOtp).toHaveBeenCalledWith('test@example.com', '123456');
    });
    await waitFor(() => {
      expect(authService.completeForgotPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        newPassword: validPassword,
        resetToken: mockToken,
      });
    });
    await waitFor(() => {
      expect(getByText('Đặt lại mật khẩu thành công')).toBeTruthy();
    });
    fireEvent.press(getByText('OK'));
    expect(navigation.navigate).toHaveBeenCalledWith('Login');
  });
  it('handles verification failure', async () => {
    (authService.verifyForgotPasswordOtp as jest.Mock).mockResolvedValue({
      success: false,
      message: 'OTP invalid',
    });
    const { getByPlaceholderText, getByTestId, getByText } = render(<ResetPasswordScreen />);
    fireEvent.changeText(getByPlaceholderText('Nhập mã OTP'), 'wrong');
    fireEvent.changeText(getByPlaceholderText('Nhập mật khẩu mới'), validPassword);
    fireEvent.changeText(getByPlaceholderText('Nhập lại mật khẩu mới'), validPassword);
    fireEvent.press(getByTestId('reset-button-text'));
    await waitFor(() => {
      expect(getByText('OTP invalid')).toBeTruthy();
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
    const { getByPlaceholderText, getByTestId, getByText } = render(<ResetPasswordScreen />);
    fireEvent.changeText(getByPlaceholderText('Nhập mã OTP'), '123456');
    fireEvent.changeText(getByPlaceholderText('Nhập mật khẩu mới'), validPassword);
    fireEvent.changeText(getByPlaceholderText('Nhập lại mật khẩu mới'), validPassword);
    fireEvent.press(getByTestId('reset-button-text'));
    await waitFor(() => {
      expect(getByText('Failed to reset')).toBeTruthy();
    });
  });
});
