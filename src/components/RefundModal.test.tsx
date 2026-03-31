jest.setTimeout(10000);
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { RefundModal } from './RefundModal';
import { useSelector } from 'react-redux';
import { staffApi } from '@/services/apiEndpoints/staffApi';
import { refundApi } from '@/services/apiEndpoints/refundApi';
import Toast from 'react-native-toast-message';
import { Alert } from 'react-native';

// === MOCKS ===
// Icons are already mocked globally in jest.setup.ts with testID support ('icon-X', etc.)

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('@/services/apiEndpoints/staffApi', () => ({
  staffApi: {
    getStaffByRestaurant: jest.fn(),
  },
}));

jest.mock('@/services/apiEndpoints/refundApi', () => ({
  refundApi: {
    createRefund: jest.fn(),
  },
}));

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

const mockUserInfo = {
  id: 'u1',
  name: 'Admin User',
  restaurantId: 'rest1',
};

const mockStaffList = [
  { id: 'u1', name: 'Admin User', email: 'admin@test.com' },
  { id: 's1', name: 'Staff One', email: 'staff1@test.com' },
  { id: 's2', name: 'Staff Two', email: 'staff2@test.com' },
];

describe('RefundModal Component', () => {
  const mockOnClose = jest.fn();
  const defaultProps = {
    isVisible: true,
    onClose: mockOnClose,
    orderId: 'order-123',
    orderCode: '101',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSelector as unknown as jest.Mock).mockReturnValue(mockUserInfo);
    (staffApi.getStaffByRestaurant as unknown as jest.Mock).mockResolvedValue({
      data: { isSuccess: true, data: mockStaffList },
    });
    jest.spyOn(Alert, 'alert');
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders correctly when visible and fetches staff', async () => {
    const { getByText } = render(<RefundModal {...defaultProps} />);
    
    expect(getByText('Hoàn tiền đơn hàng')).toBeTruthy();
    expect(getByText('ORD-101')).toBeTruthy();
    
    await waitFor(() => {
      expect(staffApi.getStaffByRestaurant).toHaveBeenCalledWith('rest1');
    });
    
    // User should be selected by default and their name visible
    await waitFor(() => expect(getByText('Admin User')).toBeTruthy());
  });

  it('handles staff fetch error', async () => {
    (staffApi.getStaffByRestaurant as unknown as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));
    render(<RefundModal {...defaultProps} />);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Fetch staff error:', expect.any(Error));
    });
  });

  it('does not render when not visible', () => {
    const { queryByText } = render(<RefundModal {...defaultProps} isVisible={false} />);
    expect(queryByText('Hoàn tiền đơn hàng')).toBeNull();
  });

  it('handles staff selection and filtering', async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(<RefundModal {...defaultProps} />);
    
    // Wait for initial load
    await waitFor(() => getByText('Admin User'));

    // Open staff picker (text might be ambiguous, so we use the parent container's role if possible,
    // or just find the user's name text which is inside the picker toggle)
    fireEvent.press(getByText('Admin User'));
    
    // Check list
    expect(getByText('Staff One')).toBeTruthy();
    expect(getByText('Staff Two')).toBeTruthy();

    // Test filtering
    const searchInput = getByPlaceholderText('Tìm tên hoặc email...');
    fireEvent.changeText(searchInput, 'One');
    
    expect(getByText('Staff One')).toBeTruthy();
    expect(queryByText('Staff Two')).toBeNull();

    // Select "Staff One"
    fireEvent.press(getByText('Staff One'));
    
    // Picker should close and show selected staff
    await waitFor(() => expect(queryByText('Tìm tên hoặc email...')).toBeNull());
    expect(getByText('Staff One')).toBeTruthy();
  });

  it('handles empty filtering result', async () => {
    const { getByText, getByPlaceholderText } = render(<RefundModal {...defaultProps} />);
    await waitFor(() => getByText('Admin User'));
    fireEvent.press(getByText('Admin User'));
    
    const searchInput = getByPlaceholderText('Tìm tên hoặc email...');
    fireEvent.changeText(searchInput, 'NothingMatchesThis');
    
    expect(getByText('Không tìm thấy nhân viên')).toBeTruthy();
  });

  it('handles refund type selection', async () => {
    const { getByText, queryByText } = render(<RefundModal {...defaultProps} />);
    
    // Initial type is 0
    expect(getByText('Lỗi Khách quan (Refund Cash)')).toBeTruthy();
    
    // Select "Lỗi Hệ thống"
    fireEvent.press(getByText('Lỗi Hệ thống (System Error)'));
    
    // Check if evidence section appears
    expect(getByText('Ảnh bằng chứng (System Refund)')).toBeTruthy();
  });

  it('validates note on submission', async () => {
    const { getByText } = render(<RefundModal {...defaultProps} />);
    await waitFor(() => getByText('Admin User'));

    fireEvent.press(getByText('Xác nhận hoàn tiền'));
    
    expect(Alert.alert).toHaveBeenCalledWith('Vui lòng nhập ghi chú');
    expect(refundApi.createRefund).not.toHaveBeenCalled();
  });

  it('submits refund successfully', async () => {
    (refundApi.createRefund as unknown as jest.Mock).mockResolvedValueOnce({ data: { isSuccess: true } });
    
    const { getByText, getByPlaceholderText } = render(<RefundModal {...defaultProps} />);
    
    // Wait for staff load
    await waitFor(() => getByText('Admin User'));

    // Fill note
    fireEvent.changeText(getByPlaceholderText('Nhập lý do hoàn tiền...'), 'Test refund note');
    
    // Submit
    await act(async () => {
      fireEvent.press(getByText('Xác nhận hoàn tiền'));
    });
    
    expect(refundApi.createRefund).toHaveBeenCalledWith({
      orderId: 'order-123',
      refundType: 0,
      responsibleStaffId: 'u1',
      note: 'Test refund note',
    });
    
    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({
        type: 'success',
        text1: 'Thành công',
      }));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles submission error from API', async () => {
    const errorResponse = { response: { data: { message: 'Custom API Error' } } };
    (refundApi.createRefund as unknown as jest.Mock).mockRejectedValueOnce(errorResponse);
    
    const { getByText, getByPlaceholderText } = render(<RefundModal {...defaultProps} />);
    
    await waitFor(() => getByText('Admin User'));
    fireEvent.changeText(getByPlaceholderText('Nhập lý do hoàn tiền...'), 'Test error');
    
    await act(async () => {
      fireEvent.press(getByText('Xác nhận hoàn tiền'));
    });
    
    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({
        type: 'error',
        text1: 'Thất bại',
        text2: 'Custom API Error',
      }));
    });
  });

  it('handles generic submission error', async () => {
    (refundApi.createRefund as unknown as jest.Mock).mockRejectedValueOnce(new Error('Generic Error'));
    
    const { getByText, getByPlaceholderText } = render(<RefundModal {...defaultProps} />);
    
    await waitFor(() => getByText('Admin User'));
    fireEvent.changeText(getByPlaceholderText('Nhập lý do hoàn tiền...'), 'Test generic error');
    
    await act(async () => {
      fireEvent.press(getByText('Xác nhận hoàn tiền'));
    });
    
    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({
        type: 'error',
        text2: 'Có lỗi xảy ra',
      }));
    });
  });

  it('handles system error special case (type 2)', async () => {
    const { getByText, getByPlaceholderText } = render(<RefundModal {...defaultProps} />);
    
    await waitFor(() => getByText('Admin User'));
    
    // Select System Error (type 2)
    fireEvent.press(getByText('Lỗi Hệ thống (System Error)'));
    fireEvent.changeText(getByPlaceholderText('Nhập lý do hoàn tiền...'), 'System bug report');
    
    await act(async () => {
      fireEvent.press(getByText('Xác nhận hoàn tiền'));
    });
    
    // It should hit line 87 in RefundModal.tsx
    expect(Alert.alert).toHaveBeenCalledWith(expect.stringContaining('Tính năng hoàn tiền hệ thống cần đính kèm ảnh bằng chứng'));
    expect(refundApi.createRefund).not.toHaveBeenCalled();
  });

  it('calls onClose when close icon is pressed', () => {
    const { getByTestId } = render(<RefundModal {...defaultProps} />);
    // Testing the global icon mock 'testID' injection
    fireEvent.press(getByTestId('icon-X'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
