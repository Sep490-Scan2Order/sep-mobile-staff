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

// Mock lucide icons
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    ChevronLeft: () => <View testID="chevron-left" />,
    AlertCircle: () => <View testID="alert-circle" />,
  };
});

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

  it('shows inline error if email is empty', () => {
    const { getByText } = render(<EmailForOTPScreen />);
    const sendButton = getByText('Gửi mã OTP');
    fireEvent.press(sendButton);
    expect(getByText('Vui lòng nhập email')).toBeTruthy();
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
      expect(getByText('Gửi OTP thành công')).toBeTruthy();
    });

    fireEvent.press(getByText('OK'));
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
      expect(getByText('Email not found')).toBeTruthy();
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
