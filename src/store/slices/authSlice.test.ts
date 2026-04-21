import authReducer, { setUser, logout } from './authSlice';
import { AuthState, UserInfo } from '@/type';
describe('authSlice', () => {
  const initialState: AuthState = {
    accessToken: null,
    refreshToken: null,
    userInfo: null,
    isAuthenticated: false,
  };
  it('should return the initial state when passed an empty action', () => {
    const result = authReducer(undefined, { type: '' });
    expect(result).toEqual(initialState);
  });
  it('should handle setUser', () => {
    const mockUserInfo: UserInfo = {
        id: '1',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'Staff',
        restaurantId: 1
    } as any;
    const payload = {
      accessToken: 'at123',
      refreshToken: 'rt123',
      userInfo: mockUserInfo,
    };
    const result = authReducer(initialState, setUser(payload));
    expect(result.accessToken).toBe('at123');
    expect(result.refreshToken).toBe('rt123');
    expect(result.userInfo).toEqual(mockUserInfo);
    expect(result.isAuthenticated).toBe(true);
  });
  it('should handle logout', () => {
    const loggedInState: AuthState = {
      accessToken: 'at',
      refreshToken: 'rt',
      userInfo: {} as any,
      isAuthenticated: true,
    };
    const result = authReducer(loggedInState, logout());
    expect(result).toEqual(initialState);
  });
});
