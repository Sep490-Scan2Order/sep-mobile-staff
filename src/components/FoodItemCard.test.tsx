import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Switch, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { FoodItemCard } from './FoodItemCard';
import { toggleSoldOutThunk } from '@/store/slices/dishSlice';
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));
jest.mock('@/store/slices/dishSlice', () => ({
  toggleSoldOutThunk: jest.fn(),
}));
describe('FoodItemCard', () => {
  const dispatch = jest.fn();
  const restaurantId = 1;
  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as jest.Mock).mockReturnValue(dispatch);
    (useSelector as jest.Mock).mockReturnValue(restaurantId);
    jest.spyOn(Alert, 'alert');
  });
  const defaultProps = {
    id: 101,
    name: 'Phở Bò',
    price: '50,000 VND',
    image: 'https://example.com/pho.jpg',
    active: true,
    originalPrice: 60000,
    discountedPrice: 50000,
    promotionName: 'Giảm giá 10k',
    hasPromotion: true,
    quantity: 0,
  };
  it('renders dish name, image, and promotion price correctly', () => {
    render(<FoodItemCard {...defaultProps} />);
    expect(screen.getByText('Phở Bò')).toBeTruthy();
    expect(screen.getByText(/50,000/)).toBeTruthy();
  });
  it('dispatches toggleSoldOutThunk(true) when toggling search off', () => {
    render(<FoodItemCard {...defaultProps} />);
    const switchEl = screen.UNSAFE_getByType(Switch);
    fireEvent(switchEl, 'onValueChange', false);
    expect(Alert.alert).toHaveBeenCalled();
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const confirmButton = alertCall[2].find((btn: any) => btn.style === 'destructive');
    confirmButton.onPress();
    expect(toggleSoldOutThunk).toHaveBeenCalledWith({
      restaurantId,
      id: 101,
      isSoldOut: true,
      quantity: 0,
    });
  });
  it('opens quantity modal when clicking the SL button', () => {
    render(<FoodItemCard {...defaultProps} />);
    const qtyButton = screen.getByText('Nhập SL');
    fireEvent.press(qtyButton);
    expect(screen.getByPlaceholderText('Nhập số lượng')).toBeTruthy();
  });
  it('submits quantity and dispatches toggleSoldOutThunk(false) from modal', () => {
    render(<FoodItemCard {...defaultProps} />);
    fireEvent.press(screen.getByText('Nhập SL'));
    const input = screen.getByPlaceholderText('Nhập số lượng');
    fireEvent.changeText(input, '20');
    fireEvent.press(screen.getByText('Xác nhận'));
    expect(toggleSoldOutThunk).toHaveBeenCalledWith({
      restaurantId,
      id: 101,
      isSoldOut: false,
      quantity: 20,
    });
  });
});
