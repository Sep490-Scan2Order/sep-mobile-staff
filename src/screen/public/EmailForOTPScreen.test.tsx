import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import EmailForOTPScreen from './EmailForOTPScreen';
import { authService } from '@/services/logicServices/authService';

// Mock authService
jest.mock('@/services/logicServices/authService', () => ({
  authService: {
    sendForgotPasswordOtp: jest.fn(),
  },
}));

// Mock Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

// Mock lucide icons
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    ChevronLeft: () => <View testID="chevron-left" />,
  };
});

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('EmailForOTPScreen', () => {
  const navigation = { navigate: jest.fn(), goBack: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue(navigation);
  });

  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(<EmailForOTPScreen />);
    expect(getByText('Quên mật khẩu')).toBeTruthy();
    expect(getByPlaceholderText('example@gmail.com')).toBeTruthy();
  });

  it('shows alert if email is empty', () => {
    const { getByText } = render(<EmailForOTPScreen />);
    const sendButton = getByText('Gửi mã OTP');
    fireEvent.press(sendButton);
    expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Vui lòng nhập email');
  });

  it('calls sendForgotPasswordOtp and handles success correctly', async () => {
    (authService.sendForgotPasswordOtp as jest.Mock).mockResolvedValue({
      success: true,
      message: 'OTP sent',
    });

    const { getByPlaceholderText, getByText } = render(<EmailForOTPScreen />);
    fireEvent.changeText(getByPlaceholderText('example@gmail.com'), 'test@example.com');
    fireEvent.press(getByText('Gửi mã OTP'));

    expect(authService.sendForgotPasswordOtp).toHaveBeenCalledWith('test@example.com');

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Thành công',
        'OTP sent',
        expect.any(Array)
      );
    });

    // Trigger the OK button callback in the alert
    // @ts-ignore
    const alertConfig = Alert.alert.mock.calls[0][2];
    alertConfig[0].onPress();
    expect(navigation.navigate).toHaveBeenCalledWith('ResetPasswordScreen', {
      email: 'test@example.com',
    });
  });

  it('handles sendForgotPasswordOtp failure', async () => {
    (authService.sendForgotPasswordOtp as jest.Mock).mockResolvedValue({
      success: false,
      message: 'Email not found',
    });

    const { getByPlaceholderText, getByText } = render(<EmailForOTPScreen />);
    fireEvent.changeText(getByPlaceholderText('example@gmail.com'), 'wrong@example.com');
    fireEvent.press(getByText('Gửi mã OTP'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Email not found');
    });
  });

  it('navigates back when chevron is pressed', () => {
    const { getByTestId } = render(<EmailForOTPScreen />);
    const backIcon = getByTestId('chevron-left');
    const backButton = backIcon.parent;
    if (backButton) {
      fireEvent.press(backButton);
      expect(navigation.goBack).toHaveBeenCalled();
    }
  });
});
