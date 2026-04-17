import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import DetailOrderScreen from './DetailOrderScreen';
import {
  confirmCashOrder,
  fetchActiveOrders,
  forceRefresh,
} from '@/store/slices/orderSlice';
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));
jest.mock('@/store/slices/orderSlice', () => ({
  confirmCashOrder: jest.fn(),
  fetchActiveOrders: jest.fn(),
  forceRefresh: jest.fn(),
}));
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
    expect(screen.getByText(/150,000 đ/)).toBeTruthy();
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
    const mockUnwrap = jest.fn().mockResolvedValue({});
    (confirmCashOrder as unknown as jest.Mock).mockReturnValue({
      unwrap: mockUnwrap,
    });
    render(<DetailOrderScreen />);
    const paymentButton = screen.getByText('Thanh toán');
    await act(async () => {
      fireEvent.press(paymentButton);
    });
    await waitFor(() => {
      expect(screen.getByText('Xác nhận thanh toán')).toBeTruthy();
    });
    await act(async () => {
      const confirmButtons = screen.getAllByText('Thanh toán');
      fireEvent.press(confirmButtons[confirmButtons.length - 1]);
    });
    await waitFor(() => {
      expect(confirmCashOrder).toHaveBeenCalledWith(mockOrder.id);
      expect(screen.getByText(`Đơn hàng #${mockOrder.orderCode} đã thanh toán thành công`)).toBeTruthy();
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
    await act(async () => {
      fireEvent.press(paymentButton);
    });
    await waitFor(() => {
      expect(screen.getByText('Xác nhận thanh toán')).toBeTruthy();
    });
    await act(async () => {
      const confirmButtons = screen.getAllByText('Thanh toán');
      fireEvent.press(confirmButtons[confirmButtons.length - 1]);
    });
    await waitFor(() => {
      expect(screen.getByText('Thanh toán thất bại. Vui lòng thử lại.')).toBeTruthy();
    });
  });
});
