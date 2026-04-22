import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useDispatch, useSelector } from 'react-redux';
import { GlobalCheckInModal } from './GlobalCheckInModal';
import { checkInShift, setShift, fetchCurrentShift } from '@/store/slices/shiftSlice';
import { useSnackbar } from '@/hooks/useSnackbar';
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));
jest.mock('@/store/slices/shiftSlice', () => ({
  checkInShift: jest.fn(),
  setShift: jest.fn(),
  fetchCurrentShift: jest.fn(),
}));
jest.mock('@/hooks/useSnackbar', () => ({
  useSnackbar: jest.fn(),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useNavigationState: jest.fn(),
}));
jest.mock('lucide-react-native', () => ({
  LogOut: () => null,
  CreditCard: () => null,
  ArrowRight: () => null,
}));
jest.mock('@/components/AppSnackbar', () => {
  const { View, Text } = require('react-native');
  return {
    AppSnackbar: ({ message, visible }: any) => {
      if (!visible) return null;
      return <View testID="mock-snackbar"><Text>{message}</Text></View>;
    }
  };
});
describe('GlobalCheckInModal', () => {
  const mockDispatch = jest.fn();
  const mockUser = {
    id: 'user-123',
    name: 'Test Staff',
    role: 'Cashier',
    restaurantId: 456,
  };
  const mockSnackbar = {
    showWarning: jest.fn(),
    showError: jest.fn(),
    hide: jest.fn(),
    config: { visible: false, message: '', type: 'info' }
  };
  const mockNavigation = { navigate: jest.fn() };
  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    (useSnackbar as jest.Mock).mockReturnValue(mockSnackbar);
    (require('@react-navigation/native').useNavigation as jest.Mock).mockReturnValue(mockNavigation);
    (require('@react-navigation/native').useNavigationState as jest.Mock).mockReturnValue('CheckIn');
  });
  it('renders nothing when user is not logged in', () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        auth: { userInfo: null },
        shift: { currentShift: null, loading: false, hasFetchedStatus: true },
      })
    );
    const { queryByText } = render(<GlobalCheckInModal />);
    expect(queryByText('Yêu cầu Check-in')).toBeNull();
  });
  it('renders nothing when user already has an active shift', () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        auth: { userInfo: mockUser },
        shift: { currentShift: { id: 1 }, loading: false, hasFetchedStatus: true },
      })
    );
    const { queryByText } = render(<GlobalCheckInModal />);
    expect(queryByText('Yêu cầu Check-in')).toBeNull();
  });
  it('renders when user is logged in and has no active shift', () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        auth: { userInfo: mockUser },
        shift: { currentShift: null, loading: false, hasFetchedStatus: true },
      })
    );
    const { getByText } = render(<GlobalCheckInModal />);
    expect(getByText('Yêu cầu Check-in')).toBeTruthy();
    expect(getByText('Test Staff')).toBeTruthy();
  });
  it('renders when user is logged in and has no active shift', () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        auth: { userInfo: mockUser },
        shift: { currentShift: null, loading: false, hasFetchedStatus: true },
      })
    );
    const { getByText } = render(<GlobalCheckInModal />);
    expect(getByText('Yêu cầu Check-in')).toBeTruthy();
    expect(getByText('Test Staff')).toBeTruthy();
  });

  it('handles successful check-in', async () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        auth: { userInfo: mockUser },
        shift: { currentShift: null, loading: false, hasFetchedStatus: true },
      })
    );
    const mockResult = { id: 100, status: 0 };
    const unwrapMock = jest.fn().mockResolvedValue(mockResult);
    mockDispatch.mockReturnValue({ unwrap: unwrapMock });
    const { getByPlaceholderText, getByText } = render(<GlobalCheckInModal />);
    
    fireEvent.changeText(getByPlaceholderText('Nhập ghi chú...'), 'Ghi chú test');
    fireEvent.press(getByText('Vào ca ngay'));
    
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(checkInShift({
        restaurantId: mockUser.restaurantId,
        staffId: mockUser.id,
        note: 'Ghi chú test',
      }));
      expect(mockDispatch).toHaveBeenCalledWith(setShift(mockResult));
    });
  });

  it('handles check-in failure and shows error snackbar', async () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        auth: { userInfo: mockUser },
        shift: { currentShift: null, loading: false, hasFetchedStatus: true },
      })
    );
    const error = new Error('Lỗi check-in');
    const unwrapMock = jest.fn().mockRejectedValue(error);
    mockDispatch.mockReturnValue({ unwrap: unwrapMock });
    const { getByText } = render(<GlobalCheckInModal />);
    
    fireEvent.press(getByText('Vào ca ngay'));
    
    await waitFor(() => {
      expect(mockSnackbar.showError).toHaveBeenCalledWith('Lỗi check-in');
    });
  });

  it('handles check-in failure with fallback message', async () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        auth: { userInfo: mockUser },
        shift: { currentShift: null, loading: false, hasFetchedStatus: true },
      })
    );
    const unwrapMock = jest.fn().mockRejectedValue({});
    mockDispatch.mockReturnValue({ unwrap: unwrapMock });
    const { getByText } = render(<GlobalCheckInModal />);
    
    fireEvent.press(getByText('Vào ca ngay'));
    
    await waitFor(() => {
      expect(mockSnackbar.showError).toHaveBeenCalledWith('Check-in thất bại');
    });
  });
});
