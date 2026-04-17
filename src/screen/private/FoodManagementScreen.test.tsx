import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import FoodManagementScreen from './FoodManagementScreen';
import { fetchDishesByRestaurant } from '@/store/slices/dishSlice';
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));
jest.mock('@/store/slices/dishSlice', () => ({
  fetchDishesByRestaurant: jest.fn(),
  toggleSoldOutThunk: jest.fn(),
}));
jest.mock('@/components/Header', () => ({
  Header: () => null,
}));
describe('FoodManagementScreen', () => {
  const dispatch = jest.fn();
  const mockUser = { restaurantId: 1 };
  const mockDishes = [
    { id: 1, dishName: 'Dish 1', price: 10000, isSoldOut: false, dishImageUrl: '', hasPromotion: false },
    { id: 2, dishName: 'Dish 2', price: 20000, isSoldOut: true, dishImageUrl: '', hasPromotion: false },
    { id: 3, dishName: 'Dish 3', price: 30000, isSoldOut: false, dishImageUrl: '', hasPromotion: false },
  ];
  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as jest.Mock).mockReturnValue(dispatch);
  });
  const setupSelector = (state: any) => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector: any) => {
      if (selector.toString().includes('state.dish')) {
        return state.dish;
      }
      return state.auth.userInfo;
    });
  };
  it('dispatches fetchDishesByRestaurant on mount if restaurantId exists', () => {
    setupSelector({
      auth: { userInfo: mockUser },
      dish: { dishes: [], loading: false, error: null },
    });
    render(<FoodManagementScreen />);
    expect(fetchDishesByRestaurant).toHaveBeenCalledWith(1);
  });
  it('shows missing restaurant info when restaurantId is null', () => {
    setupSelector({
      auth: { userInfo: null },
      dish: { dishes: [], loading: false, error: null },
    });
    render(<FoodManagementScreen />);
    expect(screen.getByText(/Không tìm thấy thông tin nhà hàng/i)).toBeTruthy();
  });
  it('shows loading indicator when loading is true', () => {
    setupSelector({
      auth: { userInfo: mockUser },
      dish: { dishes: [], loading: true, error: null },
    });
    render(<FoodManagementScreen />);
    expect(screen.getByText(/Đang tải dữ liệu/i)).toBeTruthy();
  });
  it('filters dishes when activeTab changes (TabBar buttons)', () => {
    setupSelector({
      auth: { userInfo: mockUser },
      dish: { dishes: mockDishes, loading: false, error: null },
    });
    render(<FoodManagementScreen />);
    expect(screen.getByText('Dish 1')).toBeTruthy();
    expect(screen.getByText('Dish 2')).toBeTruthy();
    expect(screen.getByText('Dish 3')).toBeTruthy();
    const buttons = screen.UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(buttons[1]);
    expect(screen.getByText('Dish 1')).toBeTruthy();
    expect(screen.getByText('Dish 3')).toBeTruthy();
    expect(screen.queryByText('Dish 2')).toBeNull();
    fireEvent.press(buttons[2]);
    expect(screen.getByText('Dish 2')).toBeTruthy();
    expect(screen.queryByText('Dish 1')).toBeNull();
    expect(screen.queryByText('Dish 3')).toBeNull();
  });
});
