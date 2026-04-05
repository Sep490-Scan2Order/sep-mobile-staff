import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Alert } from 'react-native';
import DetailOrderScreen from './DetailOrderScreen';
import {
  confirmCashOrder,
  fetchActiveOrders,
  forceRefresh,
} from '@/store/slices/orderSlice';

// Mock Redux
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

// Mock Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));

// Mock thunks and actions
jest.mock('@/store/slices/orderSlice', () => ({
  confirmCashOrder: jest.fn(),
  fetchActiveOrders: jest.fn(),
  forceRefresh: jest.fn(),
}));

// Mock sub-components
jest.mock('@/components/HeaderDetail', () => {
  const { View } = require('react-native');
  return {
    HeaderDetail: ({ onBack }: { onBack: () => void }) => (
      <View testID="header-detail" />
    ),
  };
});

jest.mock('@/components/CustomerDetailBorder', () => {
  const { View } = require('react-native');
  return {
    CustomerDetailBorder: ({ order }: { order: any }) => (
      <View testID="customer-detail-border" />
    ),
  };
});

jest.mock('@/components/ListFood', () => {
  const { View } = require('react-native');
  return {
    ListFood: ({ item }: { item: any }) => (
      <View testID="list-food" />
    ),
  };
});

jest.mock('@/components/Border', () => ({
  Border: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('DetailOrderScreen', () => {
  const dispatch = jest.fn();
  const navigation = { goBack: jest.fn() };
  const route = { params: { orderId: 1 } };
  
  const mockOrder = {
    id: 1,
    orderCode: 'ORD-001',
    phone: '0901234567',
    amount: 150000,
    status: 0,
    type: 'Cash',
    items: [
      { id: 'item-1', name: 'Món 1', price: 50000, quantity: 1 },
      { id: 'item-2', name: 'Món 2', price: 100000, quantity: 1 },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as unknown as jest.Mock).mockReturnValue((action: any) => action);
    (useNavigation as jest.Mock).mockReturnValue(navigation);
    (useRoute as jest.Mock).mockReturnValue(route);
    
    // Default alert mock
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  const setupSelector = (state: any) => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector: any) => {
      if (selector.toString().includes('state.auth')) {
        return state.auth.userInfo?.restaurantId;
      }
      return state.order;
    });
  };

  it('dispatches fetchActiveOrders on mount if restaurantId exists', () => {
    setupSelector({
      auth: { userInfo: { restaurantId: 10 } },
      order: { orders: [mockOrder], loading: false },
    });

    render(<DetailOrderScreen />);
    expect(fetchActiveOrders).toHaveBeenCalledWith(10);
  });

  it('shows loading state when loading is true', () => {
    setupSelector({
      auth: { userInfo: { restaurantId: 10 } },
      order: { orders: [], loading: true },
    });

    render(<DetailOrderScreen />);
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('shows "Không có đơn hàng" if order ID is not found', () => {
    setupSelector({
      auth: { userInfo: { restaurantId: 10 } },
      order: { orders: [], loading: false },
    });

    render(<DetailOrderScreen />);
    expect(screen.getByText(/Không có đơn hàng/i)).toBeTruthy();
  });

  it('renders order details correctly', () => {
    setupSelector({
      auth: { userInfo: { restaurantId: 10 } },
      order: { orders: [mockOrder], loading: false },
    });

    render(<DetailOrderScreen />);
    
    // Check total amount
    expect(screen.getByText(/150,000 đ/)).toBeTruthy();
    
    // Check if sub-components are rendered (using mocked testids or searching by name if mocked differently)
    // Here we can just check if total amount is there which proves the main view rendered
  });

  it('shows payment button for cash pending orders', () => {
    setupSelector({
      auth: { userInfo: { restaurantId: 10 } },
      order: { orders: [mockOrder], loading: false },
    });

    render(<DetailOrderScreen />);
    expect(screen.getByText('Thanh toán')).toBeTruthy();
  });

  it('hides payment button for non-cash orders', () => {
    const transferOrder = { ...mockOrder, type: 'Transfer' };
    setupSelector({
      auth: { userInfo: { restaurantId: 10 } },
      order: { orders: [transferOrder], loading: false },
    });

    render(<DetailOrderScreen />);
    expect(screen.queryByText('Thanh toán')).toBeNull();
  });

  it('handles payment success flow', async () => {
    setupSelector({
      auth: { userInfo: { restaurantId: 10 } },
      order: { orders: [mockOrder], loading: false },
    });

    // Mock unwrap for confirmCashOrder thunk
    const mockUnwrap = jest.fn().mockResolvedValue({});
    (confirmCashOrder as unknown as jest.Mock).mockReturnValue({
      unwrap: mockUnwrap,
    });

    render(<DetailOrderScreen />);
    
    const paymentButton = screen.getByText('Thanh toán');
    fireEvent.press(paymentButton);

    expect(confirmCashOrder).toHaveBeenCalledWith(mockOrder.id);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Thanh toán thành công',
        expect.stringContaining(mockOrder.orderCode)
      );
      expect(forceRefresh).toHaveBeenCalled();
      expect(navigation.goBack).toHaveBeenCalled();
    });
  });

  it('handles payment failure flow', async () => {
    setupSelector({
      auth: { userInfo: { restaurantId: 10 } },
      order: { orders: [mockOrder], loading: false },
    });

    const mockUnwrap = jest.fn().mockRejectedValue(new Error('Failed'));
    (confirmCashOrder as unknown as jest.Mock).mockReturnValue({
      unwrap: mockUnwrap,
    });

    render(<DetailOrderScreen />);
    
    const paymentButton = screen.getByText('Thanh toán');
    fireEvent.press(paymentButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Thanh toán thất bại');
    });
  });
});
