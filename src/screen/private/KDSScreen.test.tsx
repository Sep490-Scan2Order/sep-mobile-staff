import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { useDispatch, useSelector } from 'react-redux';
import KDSScreen from './KDSScreen';
import { fetchActiveOrders, updateOrderStatus, confirmPickupTime } from '@/store/slices/orderSlice';
import { orderService } from '@/services/logicServices/orderService';
import { playAudioUrl } from '@/services/logicServices/playAudioUrl';
import { Alert } from 'react-native';

// Mock Redux hooks
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

// Mock orderSlice actions
jest.mock('@/store/slices/orderSlice', () => ({
  fetchActiveOrders: jest.fn(),
  updateOrderStatus: jest.fn(),
  confirmPickupTime: jest.fn(),
  clearUnreadByStatus: jest.fn(),
}));

// Mock sub-components to reduce noise but keep KDSTable for testing logic
jest.mock('@/components/Header', () => ({
  Header: () => null,
}));
jest.mock('@/components/Sidebar', () => ({
  Sidebar: ({ onItemPress }: any) => (
    <mock-sidebar onItemSelected={(id: number) => onItemPress(id)} />
  ),
}));

// Mock services
jest.mock('@/services/logicServices/orderService', () => ({
  orderService: {
    readyForPickup: jest.fn(),
  },
}));

jest.mock('@/services/logicServices/playAudioUrl', () => ({
  playAudioUrl: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Sample data
const mockOrders = [
  {
    id: 'order-1',
    orderCode: 101,
    status: 1, // Đã nhận
    phone: '0987654321',
    amount: 50000,
    isPreOrder: false,
    createdAt: new Date().toISOString(),
    items: [{ name: 'Bún chả', quantity: 1 }],
  },
  {
    id: 'order-2',
    orderCode: 102,
    status: 2, // Đang làm
    phone: '0123456789',
    amount: 75000,
    isPreOrder: true,
    requestedPickupAt: new Date(Date.now() + 3600000).toISOString(),
    createdAt: new Date().toISOString(),
    items: [{ name: 'Phở bò', quantity: 1 }],
  },
  {
    id: 'order-3',
    orderCode: 103,
    status: 1, // Đã nhận
    phone: '1112223333',
    amount: 30000,
    isPreOrder: true,
    confirmedPickupAt: null,
    createdAt: new Date().toISOString(),
    items: [{ name: 'Trà đá', quantity: 1 }],
  },
];

describe('KDSScreen Flow', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useSelector as jest.Mock).mockImplementation((selector) => selector({
      auth: { userInfo: { restaurantId: 'res-123' } },
      order: { orders: mockOrders },
    }));
  });

  it('fetches orders on mount', () => {
    render(<KDSScreen />);
    expect(mockDispatch).toHaveBeenCalledWith(fetchActiveOrders('res-123'));
  });

  it('renders orders correctly', () => {
    const { getByText } = render(<KDSScreen />);
    expect(getByText('ORD-101')).toBeTruthy();
    expect(getByText('ORD-102')).toBeTruthy();
  });

  it('filters orders by search text', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<KDSScreen />);
    
    const searchInput = getByPlaceholderText('Tìm món ăn / SĐT / mã đơn...');
    fireEvent.changeText(searchInput, '101');

    expect(getByText('ORD-101')).toBeTruthy();
    expect(queryByText('ORD-102')).toBeNull();
  });

  it('handles "Nhận đơn" (1 -> 2) status update', async () => {
    const { getAllByText } = render(<KDSScreen />);
    const receiveButton = getAllByText('Nhận đơn')[0];

    fireEvent.press(receiveButton);

    expect(mockDispatch).toHaveBeenCalledWith(updateOrderStatus({
      orderId: 'order-1',
      newStatus: 2,
    }));
  });

  it('handles "Làm xong" (2 -> 3) status update and calls readyForPickup service', async () => {
    (orderService.readyForPickup as jest.Mock).mockResolvedValue({ audioUrl: 'test-url' });
    
    const { getByText } = render(<KDSScreen />);
    const doneButton = getByText('Làm xong');

    fireEvent.press(doneButton);

    await waitFor(() => {
      expect(orderService.readyForPickup).toHaveBeenCalledWith(102);
      expect(playAudioUrl).toHaveBeenCalledWith('test-url');
      expect(mockDispatch).toHaveBeenCalledWith(updateOrderStatus({
        orderId: 'order-2',
        newStatus: 3,
      }));
    });
  });

  it('shows pre-order pickup confirmation modal', () => {
    const { getByText } = render(<KDSScreen />);
    const confirmButton = getByText('Xác nhận giờ nhận hàng');
    fireEvent.press(confirmButton);
    // Modal is shown
  });
});
