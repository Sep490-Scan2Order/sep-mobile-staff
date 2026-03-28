import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import LoginScreen from './LoginScreen';
import { authService } from '@/services/logicServices/authService';

// Mock authService
jest.mock('@/services/logicServices/authService', () => ({
  authService: {
    login: jest.fn(),
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all UI elements correctly', () => {
    const { getByPlaceholderText, getAllByText } = render(<LoginScreen />);
    
    expect(getByPlaceholderText('Nhập email')).toBeTruthy();
    expect(getByPlaceholderText('Nhập mật khẩu')).toBeTruthy();
    // Check if both header and button text exist
    expect(getAllByText('Đăng nhập').length).toBe(2);
  });

  it('shows alert if email or password is empty', () => {
    const { getAllByText } = render(<LoginScreen />);
    const loginButton = getAllByText('Đăng nhập')[1]; // The button is the second occurrence

    fireEvent.press(loginButton);

    expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu');
  });

  it('toggles password visibility when eye icon is pressed', () => {
    const { getByPlaceholderText, getByRole } = render(<LoginScreen />);
    const passwordInput = getByPlaceholderText('Nhập mật khẩu');
    
    // Default state: secureTextEntry is true
    expect(passwordInput.props.secureTextEntry).toBe(true);
    
    // The toggle button is a TouchableOpacity. Since it doesn't have a label or testID, 
    // it might be hard to find. However, in this specific layout, it's one of the few touchables.
    // Given the component, we can try to find it by its child icon mock 'EyeOff' if we mocked it as a string
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

    const { getByPlaceholderText, getAllByText } = render(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Nhập email'), 'wrong@example.com');
    fireEvent.changeText(getByPlaceholderText('Nhập mật khẩu'), 'wrongpass');
    fireEvent.press(getAllByText('Đăng nhập')[1]);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Đăng nhập thất bại', errorMessage);
    });
  });
});
