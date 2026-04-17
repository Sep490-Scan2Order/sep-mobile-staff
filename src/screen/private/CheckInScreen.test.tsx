import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import CheckInScreen from './CheckInScreen';
import {
  checkInShift,
  fetchCurrentShift,
  setShift,
  clearShift,
} from '@/store/slices/shiftSlice';
import { shiftService } from '@/services/logicServices/shiftService';
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));
jest.mock('@/store/slices/shiftSlice', () => ({
  checkInShift: jest.fn(),
  fetchCurrentShift: jest.fn(),
  setShift: jest.fn(),
  clearShift: jest.fn(),
}));
jest.mock('@/services/logicServices/shiftService', () => ({
  shiftService: {
    checkOut: jest.fn(),
    getPreview: jest.fn(),
  },
}));
jest.mock('@/components/Header', () => ({
  Header: () => null,
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
    (shiftService.getPreview as jest.Mock).mockResolvedValue({
      totalCashOrder: 0,
      totalTransferOrder: 0,
      totalRefundAmount: 0,
      expectedCashAmount: 0,
    });
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
  it('shows validation snackbar if cash is empty on check-in', async () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        auth: { userInfo: mockUser },
        shift: { currentShift: null },
      })
    );
    const { getByText } = render(<CheckInScreen />);
    const checkInButton = getByText('Bắt đầu ca (Check-in)');
    fireEvent.press(checkInButton);
    await waitFor(() => {
        expect(getByText('Vui lòng nhập số tiền đầu ca')).toBeTruthy();
    });
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
      expect(getByText('Check-in thành công! Ca làm đã bắt đầu.')).toBeTruthy();
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
      expect(getByText('BÁO CÁO KẾT CA')).toBeTruthy();
    });
    fireEvent.press(getByText('Xác nhận kết ca'));
    await waitFor(() => {
      expect(shiftService.checkOut).toHaveBeenCalledWith({
        shiftId: 100,
        cashAmount: 1000000,
        note: '',
      });
      expect(mockDispatch).toHaveBeenCalledWith(clearShift());
      expect(getByText('Checkout thành công')).toBeTruthy();
    });
    fireEvent.press(getByText('OK')); 
    expect(mockNavigation.navigate).toHaveBeenCalledWith('CashReport', { shiftId: 100 });
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
    let current: any = checkInText;
    while (current && current.props.disabled === undefined) {
      current = current.parent;
    }
    expect(current?.props.disabled).toBe(true);
  });
  it('shows error snackbar if user is null on check-in', async () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        auth: { userInfo: null },
        shift: { currentShift: null },
      })
    );
    const { getByText, getByPlaceholderText } = render(<CheckInScreen />);
    fireEvent.changeText(getByPlaceholderText('Nhập số tiền'), '500000');
    fireEvent.press(getByText(/Bắt đầu ca/i));
    await waitFor(() => {
        expect(getByText('Thông tin người dùng không khả dụng')).toBeTruthy();
    });
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
      expect(getByText('Lỗi check-in')).toBeTruthy();
    });
  });
  it('shows validation snackbar if cash is empty on check-out', async () => {
    const mockShift = { id: 100, status: 0 };
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        auth: { userInfo: mockUser },
        shift: { currentShift: mockShift },
      })
    );
    const { getByText } = render(<CheckInScreen />);
    fireEvent.press(getByText(/Kết thúc ca/i));
    await waitFor(() => {
        expect(getByText('Vui lòng nhập tiền cuối ca')).toBeTruthy();
    });
  });
  it('disables check-out button when currentShift has no id', () => {
    const mockShift = { status: 0 };
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        auth: { userInfo: mockUser },
        shift: { currentShift: mockShift },
      })
    );
    const { getByText } = render(<CheckInScreen />);
    const checkOutText = getByText(/Kết thúc ca/i);
    let current: any = checkOutText;
    while (current && current.props.disabled === undefined) {
      current = current.parent;
    }
    expect(current?.props.disabled).toBe(true);
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
      expect(getByText('BÁO CÁO KẾT CA')).toBeTruthy();
    });
    fireEvent.press(getByText('Xác nhận kết ca'));
    await waitFor(() => {
      expect(getByText('Lỗi check-out')).toBeTruthy();
    });
  });
  it('handles error fallback when check-in fails without message', async () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        auth: { userInfo: mockUser },
        shift: { currentShift: null },
      })
    );
    const unwrapMock = jest.fn().mockRejectedValue({});
    mockDispatch.mockReturnValue({ unwrap: unwrapMock });
    const { getByPlaceholderText, getByText } = render(<CheckInScreen />);
    fireEvent.changeText(getByPlaceholderText('Nhập số tiền'), '500000');
    fireEvent.press(getByText(/Bắt đầu ca/i));
    await waitFor(() => {
      expect(getByText('Check-in thất bại')).toBeTruthy();
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
      expect(getByText('BÁO CÁO KẾT CA')).toBeTruthy();
    });
    fireEvent.press(getByText('Xác nhận kết ca'));
    await waitFor(() => {
      expect(getByText('Checkout thất bại')).toBeTruthy();
    });
  });
});
