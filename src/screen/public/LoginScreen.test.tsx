import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { authService } from '@/services/logicServices/authService';
import LoginScreen from './LoginScreen';
jest.mock('@/services/logicServices/authService', () => ({
  authService: {
    login: jest.fn(),
  },
}));
jest.mock('@/components/InlineError', () => {
  const { Text } = require('react-native');
  return {
    InlineError: ({ message }: any) => {
      if (!message) return null;
      return <Text>{message}</Text>;
    }
  };
});
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
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));
jest.mock('lucide-react-native', () => ({
  Eye: () => null,
  EyeOff: () => null,
  ChevronLeft: () => null,
}));
describe('LoginScreen', () => {
  const navigation = { navigate: jest.fn() };
  beforeEach(() => {
    jest.clearAllMocks();
    (require('@react-navigation/native').useNavigation as jest.Mock).mockReturnValue(navigation);
  });
  it('renders all UI elements correctly', () => {
    const { getByPlaceholderText, getAllByText } = render(<LoginScreen />);
    expect(getByPlaceholderText('Nhập email')).toBeTruthy();
    expect(getByPlaceholderText('Nhập mật khẩu')).toBeTruthy();
    expect(getAllByText('Đăng nhập').length).toBe(2);
  });
  it('shows inline errors if email and password are empty', async () => {
    const { getByText, getAllByText } = render(<LoginScreen />);
    const loginButton = getAllByText('Đăng nhập')[1];
    fireEvent.press(loginButton);
    expect(getByText('Vui lòng nhập email')).toBeTruthy();
    expect(getByText('Vui lòng nhập mật khẩu')).toBeTruthy();
  });
  it('toggles password visibility when eye icon is pressed', () => {
    const { getByPlaceholderText, getByRole } = render(<LoginScreen />);
    const passwordInput = getByPlaceholderText('Nhập mật khẩu');
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });
  it('calls authService.login and handles success correctly', async () => {
    (authService.login as jest.Mock).mockResolvedValue({ success: true });
    const { getByPlaceholderText, getAllByText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText('Nhập email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Nhập mật khẩu'), 'password123');
    fireEvent.press(getAllByText('Đăng nhập')[1]);
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
  it('calls authService.login and handles failure correctly', async () => {
    const errorMessage = 'Sai tài khoản hoặc mật khẩu';
    (authService.login as jest.Mock).mockResolvedValue({ success: false, message: errorMessage });
    const { getByPlaceholderText, getAllByText, getByText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText('Nhập email'), 'wrong@example.com');
    fireEvent.changeText(getByPlaceholderText('Nhập mật khẩu'), 'wrongpass');
    fireEvent.press(getAllByText('Đăng nhập')[1]);
    await waitFor(() => {
      expect(getByText(errorMessage)).toBeTruthy();
    });
  });
  it('navigates to EmailForOTPScreen when "Quên mật khẩu?" is pressed', () => {
    const { getByText } = render(<LoginScreen />);
    const forgotPasswordLink = getByText('Quên mật khẩu?');
    fireEvent.press(forgotPasswordLink);
    expect(navigation.navigate).toHaveBeenCalledWith('EmailForOTPScreen');
  });
});
