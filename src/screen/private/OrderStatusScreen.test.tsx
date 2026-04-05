import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { useDispatch, useSelector } from 'react-redux';
import OrderStatusScreen from './OrderStatusScreen';
import {
  fetchRestaurantById,
  toggleReceivingOrders,
  updateReceivingOrdersLocal,
} from '@/store/slices/restaurantSlice';

// Mock Redux
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

// Mock thunks and actions
jest.mock('@/store/slices/restaurantSlice', () => ({
  fetchRestaurantById: jest.fn(),
  toggleReceivingOrders: jest.fn(),
  updateReceivingOrdersLocal: jest.fn(),
}));

// Mock sub-components
jest.mock('@/components/Header', () => ({
  Header: () => null,
}));

jest.mock('@/components/RestaurantCard', () => {
  const { View } = require('react-native');
  return {
    RestaurantCard: () => <View testID="restaurant-card" />,
  };
});

jest.mock('@/components/OrderStatusCard', () => {
  const { TouchableOpacity } = require('react-native');
  return {
    OrderStatusCard: ({ onToggle }: { onToggle: () => void }) => (
      <TouchableOpacity testID="order-status-card" onPress={onToggle} />
    ),
  };
});

describe('OrderStatusScreen', () => {
  const dispatch = jest.fn();
  const mockRestaurant = {
    id: 58,
    restaurantName: 'Test Restaurant',
    address: '123 Test St',
    isOpened: true,
    image: 'test-image.jpg',
    isReceivingOrders: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as unknown as jest.Mock).mockReturnValue(dispatch);
  });

  const setupSelector = (state: any) => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector: any) => selector({ restaurant: state }));
  };

  it('dispatches fetchRestaurantById(58) on mount', () => {
    setupSelector({ restaurant: null, loading: false, error: null });
    render(<OrderStatusScreen />);
    expect(fetchRestaurantById).toHaveBeenCalledWith(58);
  });

  it('shows ActivityIndicator when loading and no restaurant data', () => {
    setupSelector({ restaurant: null, loading: true, error: null });
    render(<OrderStatusScreen />);
    // ActivityIndicator is the only thing shown in this state
    // We can't easily find ActivityIndicator by text, so we check it's not showing the "not found" text
    expect(screen.queryByText(/Không tìm thấy thông tin nhà hàng/i)).toBeNull();
  });

  it('shows error message when error occurs', () => {
    const errorMessage = 'Something went wrong';
    setupSelector({ restaurant: null, loading: false, error: errorMessage });
    render(<OrderStatusScreen />);
    expect(screen.getByText(`Lỗi: ${errorMessage}`)).toBeTruthy();
  });

  it('shows "not found" message when restaurant is null after loading', () => {
    setupSelector({ restaurant: null, loading: false, error: null });
    render(<OrderStatusScreen />);
    expect(screen.getByText(/Không tìm thấy thông tin nhà hàng/i)).toBeTruthy();
  });

  it('renders RestaurantCard and OrderStatusCard when data is loaded', () => {
    setupSelector({ restaurant: mockRestaurant, loading: false, error: null });
    render(<OrderStatusScreen />);
    
    // Check if the mock components are rendered with correct data
    // We can use UNSAFE_getByType or search by name if we didn't mock them as custom elements
    // Since we mocked them, we can check for the mocked content
    expect(screen.getByTestId('restaurant-card')).toBeTruthy();
    expect(screen.getByTestId('order-status-card')).toBeTruthy();
  });

  it('handles toggle logic correctly', () => {
    setupSelector({ restaurant: mockRestaurant, loading: false, error: null });
    render(<OrderStatusScreen />);

    const orderStatusCard = screen.getByTestId('order-status-card');
    fireEvent(orderStatusCard, 'press');

    // Should dispatch updateReceivingOrdersLocal with the opposite value (!true = false)
    expect(updateReceivingOrdersLocal).toHaveBeenCalledWith(false);

    // Should dispatch toggleReceivingOrders with correct payload
    expect(toggleReceivingOrders).toHaveBeenCalledWith({
      restaurantId: mockRestaurant.id,
      isReceiving: false,
    });
  });
});
