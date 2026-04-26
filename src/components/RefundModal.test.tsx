import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import RefundModal from './RefundModal';
import { useSelector } from 'react-redux';
import { staffApi } from '@/services/apiEndpoints/staffApi';
import { refundApi } from '@/services/apiEndpoints/refundApi';
import Toast from 'react-native-toast-message';

jest.mock('lucide-react-native', () => {
    const { View } = require('react-native');
    return {
        X: () => null,
        Camera: () => null,
        ChevronDown: () => null,
        User: () => null,
        Check: () => null,
        Minus: (props: any) => <View {...props} testID="icon-Minus" />,
        Plus: (props: any) => <View {...props} testID="icon-Plus" />,
    };
});
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));
jest.mock('@/services/apiEndpoints/staffApi', () => ({
  staffApi: {
    getStaffByRestaurant: jest.fn(),
  },
}));
jest.mock('@/services/apiEndpoints/refundApi', () => ({
  refundApi: {
    createRefund: jest.fn(),
    confirmSystemPayment: jest.fn(),
  },
}));
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));
jest.mock('react-native-image-resizer', () => ({
  createResizedImage: jest.fn().mockResolvedValue({
    uri: 'resized-uri',
    name: 'resized-name',
  }),
}));
jest.mock('react-native-vision-camera', () => {
    const React = require('react');
    const { View } = require('react-native');
    const MockCamera = (props: any) => React.createElement(View, props, props.children);
    (MockCamera as any).requestCameraPermission = jest.fn().mockResolvedValue('granted');
    return {
        Camera: MockCamera,
        useCameraDevice: jest.fn().mockReturnValue({}),
    };
});
jest.mock('react-native-fs', () => ({
    exists: jest.fn().mockResolvedValue(true),
    readFile: jest.fn().mockResolvedValue('base64data'),
}));
jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
}));
jest.mock('@/hooks/useSnackbar', () => ({
    useSnackbar: jest.fn().mockReturnValue({ showSuccess: jest.fn(), showError: jest.fn(), showWarning: jest.fn() }),
}));
jest.mock('@/store/slices/orderSlice', () => ({
    fetchActiveOrders: jest.fn(),
}));

(globalThis as any).FormData = class {
  append = jest.fn();
} as any;

const mockStaffList = [
  { id: 'u1', name: 'Admin User', email: 'admin@test.com' },
  { id: 's1', name: 'Staff One', email: 'staff1@test.com' },
];

const mockUserInfo = {
  id: 'u1',
  accountId: '123',
  name: 'Admin User',
  restaurantId: 'rest1',
};

const mockOrder = {
  id: 'order-123',
  orderCode: 101,
  status: 1,
  items: [
    { id: '1', name: 'Item 1', quantity: 2, price: 10000 },
    { id: '2', name: 'Item 2', quantity: 1, price: 20000 },
  ],
  amount: 40000,
  finalAmount: 40000,
  totalAmount: 40000,
};

describe('RefundModal Component', () => {
  const mockOnClose = jest.fn();
  const defaultProps = {
    isVisible: true,
    onClose: mockOnClose,
    orderId: 'order-123',
  };

  let mockState: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockState = {
      auth: { userInfo: mockUserInfo },
      order: { orders: [{ ...mockOrder }] },
      shift: { currentShift: null }
    };
    (useSelector as unknown as jest.Mock).mockImplementation((selector) => selector(mockState));
    (staffApi.getStaffByRestaurant as unknown as jest.Mock).mockResolvedValue({
      data: { isSuccess: true, data: mockStaffList },
    });
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders correctly for paid order', async () => {
    const { getByText } = render(<RefundModal {...defaultProps} />);
    expect(getByText('ORD-101')).toBeTruthy();
  });

  it('handles item selection and quantity changes', async () => {
    const { getByText, getAllByTestId, queryByTestId } = render(<RefundModal {...defaultProps} />);
    await waitFor(() => getByText('Một phần đơn'));
    
    // Switch to partial refund
    fireEvent.press(getByText('Một phần đơn'));
    
    await waitFor(() => getByText('Item 1'));
    
    // Toggle on Item 1
    fireEvent.press(getByText('Item 1'));
    
    // Test Minus/Plus buttons
    await waitFor(() => expect(queryByTestId('icon-Plus')).toBeTruthy());
    fireEvent.press(getAllByTestId('icon-Plus')[0]);
    fireEvent.press(getAllByTestId('icon-Minus')[0]);
  });

  it('handles reason and staff selection', async () => {
    const { getByText, getByTestId, getAllByText } = render(<RefundModal {...defaultProps} />);
    await waitFor(() => getByText('Admin User'));
    
    // Switch reason
    fireEvent.press(getByText('Lỗi Nhân viên (Staff pay)'));
    fireEvent.press(getByText('Lỗi Khách quan (Refund Cash)'));
    
    // Switch staff
    fireEvent.press(getByText('Admin User')); // Open dropdown
    await waitFor(() => getByText('Staff One'));
    fireEvent.press(getByText('Staff One'));
  });

  it('submits partial refund successfully', async () => {
    (refundApi.createRefund as unknown as jest.Mock).mockResolvedValueOnce({ data: { isSuccess: true } });
    const { getByText, getByPlaceholderText } = render(<RefundModal {...defaultProps} />);
    
    await waitFor(() => getByText('Một phần đơn'));
    fireEvent.press(getByText('Một phần đơn'));
    
    await waitFor(() => getByText('Item 1'));
    fireEvent.press(getByText('Item 1')); // Select Item 1
    
    fireEvent.changeText(getByPlaceholderText('Nhập lý do hoàn tiền...'), 'Partial refund note');
    
    await act(async () => {
      fireEvent.press(getByText('Xác nhận hoàn tiền'));
    });
    
    expect(refundApi.createRefund).toHaveBeenCalledWith(expect.any(FormData));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('submits paid refund successfully', async () => {
    (refundApi.createRefund as unknown as jest.Mock).mockResolvedValueOnce({ data: { isSuccess: true } });
    const { getByText, getByPlaceholderText } = render(<RefundModal {...defaultProps} />);
    await waitFor(() => getByText('Admin User'));
    fireEvent.changeText(getByPlaceholderText('Nhập lý do hoàn tiền...'), 'Paid refund note');
    await act(async () => {
      fireEvent.press(getByText('Xác nhận hoàn tiền'));
    });
    expect(refundApi.createRefund).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('submits unpaid (system) refund successfully', async () => {
    mockState.order.orders[0].status = 0;
    (refundApi.confirmSystemPayment as unknown as jest.Mock).mockResolvedValueOnce({ data: { isSuccess: true } });
    const { getByText, getByPlaceholderText } = render(<RefundModal {...defaultProps} />);
    await waitFor(() => getByText('Admin User'));
    fireEvent.changeText(getByPlaceholderText(/Nhập ghi chú xác nhận thanh toán/), 'System error note');
    await act(async () => {
      fireEvent.press(getByText('Xác nhận thanh toán'));
    });
    expect(refundApi.confirmSystemPayment).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles submission error', async () => {
    (refundApi.createRefund as unknown as jest.Mock).mockRejectedValueOnce(new Error('API Fail'));
    const { getByText, getByPlaceholderText } = render(<RefundModal {...defaultProps} />);
    await waitFor(() => getByText('Admin User'));
    fireEvent.changeText(getByPlaceholderText('Nhập lý do hoàn tiền...'), 'Error case');
    await act(async () => {
      fireEvent.press(getByText('Xác nhận hoàn tiền'));
    });
    expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({
      type: 'error',
      text1: 'Hoàn tiền thất bại',
    }));
  });
});
