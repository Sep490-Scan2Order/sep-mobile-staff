import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import CheckInScreen from './CheckInScreen';
import {
  checkInShift,
  fetchCurrentShift,
  setShift,
  clearShift,
} from '@/store/slices/shiftSlice';
import { shiftService } from '@/services/logicServices/shiftService';

// Mock Redux
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

// Mock Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

// Mock Slice Actions
jest.mock('@/store/slices/shiftSlice', () => ({
  checkInShift: jest.fn(),
  fetchCurrentShift: jest.fn(),
  setShift: jest.fn(),
  clearShift: jest.fn(),
}));

// Mock Services
jest.mock('@/services/logicServices/shiftService', () => ({
  shiftService: {
    checkOut: jest.fn(),
  },
}));

// Mock Header
jest.mock('@/components/Header', () => ({
  Header: () => null,
}));

describe('CheckInScreen', () => {
  const mockDispatch = jest.fn();
  const mockNavigation = { navigate: jest.fn() };
  const mockUser = {
    id: 'user-123',
    name: 'Test Staff',
    role: 'Staff',
    restaurantId: 'res-456',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  it('fetches current shift on mount if user exists', () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        auth: { userInfo: mockUser },
        shift: { currentShift: null },
      })
    );

    render(<CheckInScreen />);
    expect(mockDispatch).toHaveBeenCalledWith(fetchCurrentShift());
  });

  it('shows validation alert if cash is empty on check-in', () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        auth: { userInfo: mockUser },
        shift: { currentShift: null },
      })
    );

    const { getByText } = render(<CheckInScreen />);
    const checkInButton = getByText('Bắt đầu ca (Check-in)');
    
    fireEvent.press(checkInButton);
    
    expect(Alert.alert).toHaveBeenCalledWith('Thông báo', 'Vui lòng nhập số tiền đầu ca');
  });

  it('handles successful check-in', async () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        auth: { userInfo: mockUser },
        shift: { currentShift: null },
      })
    );

    const mockResult = { id: 100, status: 0 };
    const unwrapMock = jest.fn().mockResolvedValue(mockResult);
    mockDispatch.mockReturnValue({ unwrap: unwrapMock });

    const { getByPlaceholderText, getByText } = render(<CheckInScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Nhập số tiền'), '500000');
    fireEvent.changeText(getByPlaceholderText('Nhập ghi chú'), 'Ghi chú test');
    
    const checkInButton = getByText('Bắt đầu ca (Check-in)');
    fireEvent.press(checkInButton);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(checkInShift({
        restaurantId: mockUser.restaurantId,
        staffId: mockUser.id,
        openingCashAmount: 500000,
        note: 'Ghi chú test',
      }));
      expect(mockDispatch).toHaveBeenCalledWith(setShift(mockResult));
      expect(Alert.alert).toHaveBeenCalledWith('Thành công', 'Check-in thành công');
    });
  });

  it('handles successful check-out and navigates to CashReport', async () => {
    const mockShift = { id: 100, status: 0 };
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        auth: { userInfo: mockUser },
        shift: { currentShift: mockShift },
      })
    );

    (shiftService.checkOut as jest.Mock).mockResolvedValue({ data: {} });

    const { getByPlaceholderText, getByText } = render(<CheckInScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Nhập số tiền'), '1000000');
    
    const checkOutButton = getByText('Kết thúc ca (Check-out)');
    fireEvent.press(checkOutButton);

    await waitFor(() => {
      expect(shiftService.checkOut).toHaveBeenCalledWith({
        shiftId: 100,
        cashAmount: 1000000,
        note: '',
      });
      expect(mockDispatch).toHaveBeenCalledWith(clearShift());
      
      // Trigger Alert Press
      const alertCallback = (Alert.alert as jest.Mock).mock.calls[0][2][0].onPress;
      alertCallback();
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('CashReport', { shiftId: 100 });
    });
  });

  it('disables check-in button when shift is already open', () => {
    const mockShift = { id: 100, status: 0 };
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        auth: { userInfo: mockUser },
        shift: { currentShift: mockShift },
      })
    );

    const { getByText } = render(<CheckInScreen />);
    const checkInText = getByText(/Bắt đầu ca/i);
    
    // In React Native, the parent might be several levels up depending on styling wrappers
    // Let's look for the one that has the 'disabled' prop using a helper or traversal
    let current: any = checkInText;
    while (current && current.props.disabled === undefined) {
      current = current.parent;
    }
    
    expect(current?.props.disabled).toBe(true);
  });

  it('shows error alert if user is null on check-in', () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        auth: { userInfo: null },
        shift: { currentShift: null },
      })
    );

    const { getByText, getByPlaceholderText } = render(<CheckInScreen />);
    fireEvent.changeText(getByPlaceholderText('Nhập số tiền'), '500000');
    fireEvent.press(getByText(/Bắt đầu ca/i));
    
    expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Thông tin người dùng không khả dụng');
  });

  it('handles error when check-in fails', async () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        auth: { userInfo: mockUser },
        shift: { currentShift: null },
      })
    );

    const unwrapMock = jest.fn().mockRejectedValue(new Error('Lỗi check-in'));
    mockDispatch.mockReturnValue({ unwrap: unwrapMock });

    const { getByPlaceholderText, getByText } = render(<CheckInScreen />);
    fireEvent.changeText(getByPlaceholderText('Nhập số tiền'), '500000');
    fireEvent.press(getByText(/Bắt đầu ca/i));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Lỗi check-in');
    });
  });

  it('shows validation alert if cash is empty on check-out', () => {
    const mockShift = { id: 100, status: 0 };
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        auth: { userInfo: mockUser },
        shift: { currentShift: mockShift },
      })
    );

    const { getByText } = render(<CheckInScreen />);
    fireEvent.press(getByText(/Kết thúc ca/i));
    
    expect(Alert.alert).toHaveBeenCalledWith('Thông báo', 'Vui lòng nhập tiền cuối ca');
  });

  it('shows error alert if currentShift has no id on check-out', () => {
    const mockShift = { status: 0 }; // missing id
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        auth: { userInfo: mockUser },
        shift: { currentShift: mockShift },
      })
    );

    const { getByText, getByPlaceholderText } = render(<CheckInScreen />);
    fireEvent.changeText(getByPlaceholderText('Nhập số tiền'), '1000000');
    fireEvent.press(getByText(/Kết thúc ca/i));
    
    expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Không tìm thấy ca làm hiện tại');
  });

  it('handles error when check-out fails', async () => {
    const mockShift = { id: 100, status: 0 };
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        auth: { userInfo: mockUser },
        shift: { currentShift: mockShift },
      })
    );

    (shiftService.checkOut as jest.Mock).mockRejectedValue(new Error('Lỗi check-out'));

    const { getByPlaceholderText, getByText } = render(<CheckInScreen />);
    fireEvent.changeText(getByPlaceholderText('Nhập số tiền'), '1000000');
    fireEvent.press(getByText(/Kết thúc ca/i));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Lỗi check-out');
    });
  });

  it('handles error fallback when check-in fails without message', async () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        auth: { userInfo: mockUser },
        shift: { currentShift: null },
      })
    );

    // Reject without a standard Error object to hit the fallback `|| 'Check-in thất bại'`
    const unwrapMock = jest.fn().mockRejectedValue({});
    mockDispatch.mockReturnValue({ unwrap: unwrapMock });

    const { getByPlaceholderText, getByText } = render(<CheckInScreen />);
    fireEvent.changeText(getByPlaceholderText('Nhập số tiền'), '500000');
    fireEvent.press(getByText(/Bắt đầu ca/i));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Check-in thất bại');
    });
  });

  it('handles error fallback when check-out fails without message', async () => {
    const mockShift = { id: 100, status: 0 };
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        auth: { userInfo: mockUser },
        shift: { currentShift: mockShift },
      })
    );

    (shiftService.checkOut as jest.Mock).mockRejectedValue({});

    const { getByPlaceholderText, getByText } = render(<CheckInScreen />);
    fireEvent.changeText(getByPlaceholderText('Nhập số tiền'), '1000000');
    fireEvent.press(getByText(/Kết thúc ca/i));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Checkout thất bại');
    });
  });
});
