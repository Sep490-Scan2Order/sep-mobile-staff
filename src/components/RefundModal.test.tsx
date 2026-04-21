import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { RefundModal } from './RefundModal';
import { useSelector } from 'react-redux';
import { staffApi } from '@/services/apiEndpoints/staffApi';
import { refundApi } from '@/services/apiEndpoints/refundApi';
import Toast from 'react-native-toast-message';
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
    return {
        Camera: {
            requestCameraPermission: jest.fn().mockResolvedValue('granted'),
        } as any,
        useCameraDevice: jest.fn().mockReturnValue({}),
    };
});
jest.mock('react-native-fs', () => ({
    exists: jest.fn().mockResolvedValue(true),
    readFile: jest.fn().mockResolvedValue('base64data'),
}));
(globalThis as any).FormData = class {
  append = jest.fn();
} as any;
const mockUserInfo = {
  id: 'u1',
  name: 'Admin User',
  restaurantId: 'rest1',
};
const mockStaffList = [
  { id: 'u1', name: 'Admin User', email: 'admin@test.com' },
  { id: 's1', name: 'Staff One', email: 'staff1@test.com' },
];
describe('RefundModal Component', () => {
  const mockOnClose = jest.fn();
  const defaultProps = {
    isVisible: true,
    onClose: mockOnClose,
    orderId: 'order-123',
    orderCode: '101',
    isUnpaid: false,
    paymentStatus: 1,
    orderItems: [
      { id: '1', name: 'Item 1', quantity: 2, price: 10000 },
      { id: '2', name: 'Item 2', quantity: 1, price: 20000 },
    ],
  };
    beforeEach(() => {
    jest.clearAllMocks();
    (useSelector as unknown as jest.Mock).mockReturnValue(mockUserInfo);
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
  it('renders correctly for unpaid order (isUnpaid=true)', async () => {
    const { getByText, queryByText } = render(<RefundModal {...defaultProps} isUnpaid={true} />);
    await waitFor(() => expect(getByText('Lỗi Hệ thống (System Error)')).toBeTruthy());
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
    (refundApi.confirmSystemPayment as unknown as jest.Mock).mockResolvedValueOnce({ data: { isSuccess: true } });
    const { getByText, getByPlaceholderText } = render(<RefundModal {...defaultProps} isUnpaid={true} />);
    await waitFor(() => getByText('Admin User'));
    fireEvent.changeText(getByPlaceholderText('Nhập lý do hoàn tiền...'), 'System error note');
    await act(async () => {
      fireEvent.press(getByText('Xác nhận hoàn tiền'));
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
