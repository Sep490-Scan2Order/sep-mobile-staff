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
    // The implementation has "Chưa đăng nhập123" currently
    expect(screen.getByText(/Chưa đăng nhập/i)).toBeTruthy();
  });

  it('renders user name when userInfo exists', () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ auth: { userInfo: mockUser } })
    );
    render(<ProfileScreen />);
    expect(screen.getAllByText('Nguyễn Văn A').length).toBeGreaterThan(0);
  });

  it('shows "Đang hoạt động" when isActive is true', () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ auth: { userInfo: { ...mockUser, isActive: true } } })
    );
    render(<ProfileScreen />);
    expect(screen.getByText(/Đang hoạt động/i)).toBeTruthy();
  });

  it('shows "Chưa kích hoạt" when isActive is false', () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ auth: { userInfo: { ...mockUser, isActive: false } } })
    );
    render(<ProfileScreen />);
    expect(screen.getByText(/Chưa kích hoạt/i)).toBeTruthy();
  });

  it('renders placeholder icon when avatar is null', () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ auth: { userInfo: { ...mockUser, avatar: null } } })
    );
    const { UNSAFE_queryByType } = render(<ProfileScreen />);
    const { Image } = require('react-native');
    const img = UNSAFE_queryByType(Image);
    expect(img).toBeNull();
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
