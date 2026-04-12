import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { useDispatch, useSelector } from 'react-redux';
import OrderStatusScreen from './OrderStatusScreen';
import {
  fetchRestaurantById,
  toggleReceivingOrders,
  toggleOpeningStatus,
} from '@/store/slices/restaurantSlice';

// === MOCKS ===

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('@/store/slices/restaurantSlice', () => ({
  fetchRestaurantById: jest.fn(),
  toggleReceivingOrders: jest.fn(),
  toggleOpeningStatus: jest.fn(),
}));

jest.mock('lucide-react-native', () => {
    const { View } = require('react-native');
    return {
        Clock: () => <View testID="clock-icon" />,
        Store: () => <View testID="store-icon" />,
        ShoppingBag: () => <View testID="bag-icon" />,
    };
});

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

describe('OrderStatusScreen', () => {
  const mockDispatch = jest.fn();
  const mockRestaurantId = 58;
  const mockRestaurant = {
    id: 58,
    restaurantName: 'Test Restaurant',
    address: '123 Test St',
    isOpened: true,
    isReceivingOrders: true,
    openTime: '08:00',
    closeTime: '22:00',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    
    const mockState = {
      auth: { userInfo: { id: 'u1', restaurantId: mockRestaurantId } },
      restaurant: {
        restaurant: mockRestaurant,
        loading: false,
        error: null,
      },
    };

    (useSelector as unknown as jest.Mock).mockImplementation((selector) => selector(mockState));
  });

  it('renders restaurant info correctly', () => {
    render(<OrderStatusScreen />);
    
    expect(screen.getByText('Test Restaurant')).toBeTruthy();
    expect(screen.getByText('123 Test St')).toBeTruthy();
    expect(screen.getByText('08:00 - 22:00')).toBeTruthy();
  });

  it('dispatches fetchRestaurantById on mount', () => {
    render(<OrderStatusScreen />);
    expect(fetchRestaurantById).toHaveBeenCalledWith(mockRestaurantId);
  });

  it('handles toggle opening status success', async () => {
    const unwrapMock = jest.fn().mockResolvedValue({});
    mockDispatch.mockReturnValue({ unwrap: unwrapMock });

    render(<OrderStatusScreen />);
    
    const openingSwitch = screen.getAllByRole('switch')[0];
    fireEvent(openingSwitch, 'valueChange', false);

    expect(toggleOpeningStatus).toHaveBeenCalledWith({
      restaurantId: mockRestaurant.id,
      isOpened: false,
    });

    await waitFor(() => {
      expect(screen.getByText('Đã đóng cửa hàng')).toBeTruthy();
    });
  });

  it('handles toggle receiving orders success', async () => {
    const unwrapMock = jest.fn().mockResolvedValue({});
    mockDispatch.mockReturnValue({ unwrap: unwrapMock });

    render(<OrderStatusScreen />);
    
    const receivingSwitch = screen.getAllByRole('switch')[1];
    fireEvent(receivingSwitch, 'valueChange', false);

    expect(toggleReceivingOrders).toHaveBeenCalledWith({
      restaurantId: mockRestaurant.id,
      isReceiving: false,
    });

    await waitFor(() => {
      expect(screen.getByText('Đã tắt nhận đơn hàng')).toBeTruthy();
    });
  });

  it('handles toggle failure with snackbar', async () => {
    const errorMsg = 'Update failed';
    const unwrapMock = jest.fn().mockRejectedValue({ message: errorMsg });
    mockDispatch.mockReturnValue({ unwrap: unwrapMock });

    render(<OrderStatusScreen />);
    
    const openingSwitch = screen.getAllByRole('switch')[0];
    fireEvent(openingSwitch, 'valueChange', false);

    await waitFor(() => {
        expect(screen.getByText(errorMsg)).toBeTruthy();
    });
  });

  it('shows loading state', () => {
    const mockLoadingState = {
        auth: { userInfo: { restaurantId: mockRestaurantId } },
        restaurant: { restaurant: null, loading: true, error: null },
    };
    (useSelector as unknown as jest.Mock).mockImplementation((selector) => selector(mockLoadingState));

    render(<OrderStatusScreen />);
    expect(screen.getByText('Đang tải dữ liệu...')).toBeTruthy();
  });

  it('shows error state when initial load fails', () => {
    const mockErrorState = {
        auth: { userInfo: { restaurantId: mockRestaurantId } },
        restaurant: { restaurant: null, loading: false, error: 'Load Error' },
    };
    (useSelector as unknown as jest.Mock).mockImplementation((selector) => selector(mockErrorState));

    render(<OrderStatusScreen />);
    expect(screen.getByText('Load Error')).toBeTruthy();
    expect(screen.getByText('Thử lại')).toBeTruthy();
  });
});
