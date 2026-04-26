import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import MenuScreen from './MenuManagementScreen';
import { logout } from '@/store/slices/authSlice';
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));
jest.mock('@/store/slices/authSlice', () => ({
  logout: jest.fn(),
}));
jest.mock('lucide-react-native', () => ({
  User: () => null,
  LogOut: () => null,
  ChevronRight: () => null,
  Lock: () => null,
}));
describe('MenuManagementScreen', () => {
  const dispatch = jest.fn();
  const navigation = { navigate: jest.fn() };
  const mockUserInfo = {
    accountId: '123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'Staff',
    avatar: 'https://example.com/avatar.jpg',
  };
  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as unknown as jest.Mock).mockReturnValue(dispatch);
    (useNavigation as jest.Mock).mockReturnValue(navigation);
  });
  const setupSelector = (userInfo: any) => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector: any) => 
      selector({ 
        auth: { userInfo },
        shift: { currentShift: null }
      })
    );
  };
  it('shows logged out message when userInfo is null', () => {
    setupSelector(null);
    render(<MenuScreen />);
    expect(screen.getByText('Chưa đăng nhập')).toBeTruthy();
  });
  it('renders user information when logged in', () => {
    setupSelector(mockUserInfo);
    render(<MenuScreen />);
    expect(screen.getByText('Test User')).toBeTruthy();
    expect(screen.getByText(/Staff/)).toBeTruthy();
    expect(screen.getByText(/test@example.com/)).toBeTruthy();
    const avatar = screen.UNSAFE_getByType(require('react-native').Image);
    expect(avatar.props.source).toEqual({ uri: mockUserInfo.avatar });
  });
  it('navigates to ProfileScreen when "Thông tin cá nhân" is pressed', () => {
    setupSelector(mockUserInfo);
    render(<MenuScreen />);
    const profileItem = screen.getByText('Thông tin cá nhân');
    fireEvent.press(profileItem);
    expect(navigation.navigate).toHaveBeenCalledWith('ProfileScreen');
  });
  it('navigates to ChangePasswordScreen when "Đổi mật khẩu" is pressed', () => {
    setupSelector(mockUserInfo);
    render(<MenuScreen />);
    const changePasswordItem = screen.getByText('Đổi mật khẩu');
    fireEvent.press(changePasswordItem);
    expect(navigation.navigate).toHaveBeenCalledWith('ChangePasswordScreen', {
      email: mockUserInfo.email,
    });
  });
  it('dispatches logout when "Đăng xuất" is pressed', () => {
    setupSelector(mockUserInfo);
    render(<MenuScreen />);
    const logoutButton = screen.getByText('Đăng xuất');
    fireEvent.press(logoutButton);
    expect(dispatch).toHaveBeenCalled();
    expect(logout).toHaveBeenCalled();
  });
});
