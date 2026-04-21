import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { useSelector } from 'react-redux';
import ProfileScreen from './ProfileScreen';
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));
describe('ProfileScreen', () => {
  const mockUser = {
    id: 'u1',
    accountId: 'ACC-001',
    name: 'Nguyễn Văn A',
    email: 'a@fpt.edu.vn',
    role: 'Staff',
    avatar: null,
    isActive: true,
    restaurantId: 1,
    restaurantName: 'Test Restaurant',
    createdAt: '2024-01-01T00:00:00Z',
  };
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders "Chưa đăng nhập" when userInfo is null', () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ auth: { userInfo: null } })
    );
    render(<ProfileScreen />);
    expect(screen.getByText(/Ch\u01b0a \u0111\u0103ng nh\u1eadp/i)).toBeTruthy();
  });
  it('renders user name when userInfo exists', () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ auth: { userInfo: mockUser } })
    );
    render(<ProfileScreen />);
    expect(screen.getByText('Nguyễn Văn A')).toBeTruthy();
  });
  it('renders accountId correctly', () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ auth: { userInfo: mockUser } })
    );
    render(<ProfileScreen />);
    expect(screen.getByText('ACC-001')).toBeTruthy();
  });
  it('shows "Đang hoạt động" when isActive is true', () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ auth: { userInfo: { ...mockUser, isActive: true } } })
    );
    render(<ProfileScreen />);
    expect(screen.getByText(/\u0110ang ho\u1ea1t \u0111\u1ed9ng/i)).toBeTruthy();
  });
  it('shows "Chưa kích hoạt" when isActive is false', () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ auth: { userInfo: { ...mockUser, isActive: false } } })
    );
    render(<ProfileScreen />);
    expect(screen.getByText(/Ch\u01b0a k\u00edch ho\u1ea1t/i)).toBeTruthy();
  });
  it('uses fallback avatar URL when avatar is null', () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ auth: { userInfo: { ...mockUser, avatar: null } } })
    );
    const { UNSAFE_getByType } = render(<ProfileScreen />);
    const { Image } = require('react-native');
    const img = UNSAFE_getByType(Image);
    expect(img.props.source.uri).toBe('https://i.pravatar.cc/150?img=3');
  });
  it('uses actual avatar URL when avatar is provided', () => {
    const avatarUrl = 'https://example.com/avatar.jpg';
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ auth: { userInfo: { ...mockUser, avatar: avatarUrl } } })
    );
    const { UNSAFE_getByType } = render(<ProfileScreen />);
    const { Image } = require('react-native');
    const img = UNSAFE_getByType(Image);
    expect(img.props.source.uri).toBe(avatarUrl);
  });
});
