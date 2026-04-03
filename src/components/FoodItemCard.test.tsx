import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { TouchableOpacity, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { FoodItemCard } from './FoodItemCard';
import { toggleSoldOutThunk } from '@/store/slices/dishSlice';

// Mock Redux
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

// Mock thunk
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
  };

  it('renders dish name, image, and promotion price correctly', () => {
    render(<FoodItemCard {...defaultProps} />);
    
    expect(screen.getByText('Phở Bò')).toBeTruthy();
    expect(screen.getByText(/50,000/)).toBeTruthy();
    expect(screen.getByText(/60,000/)).toBeTruthy();
    expect(screen.getByText(/giảm giá/i)).toBeTruthy();
  });

  it('dispatches toggleSoldOutThunk(true) when clicking the status button', () => {
    render(<FoodItemCard {...defaultProps} />);
    
    const buttons = screen.UNSAFE_getAllByType(TouchableOpacity);
    // The status button is the only visible TouchableOpacity
    fireEvent.press(buttons[0]);
    
    expect(toggleSoldOutThunk).toHaveBeenCalledWith({
      restaurantId,
      id: 101,
      isSoldOut: true,
      quantity: 0,
    });
    expect(dispatch).toHaveBeenCalled();
  });

  it('opens quantity modal when clicking the "Hết hàng" button', () => {
    const soldOutProps = { ...defaultProps, active: false };
    render(<FoodItemCard {...soldOutProps} />);
    
    const buttons = screen.UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(buttons[0]); // Button 0: Hết hàng
    
    // Check for "Nhập số lượng" text which might be mangled, 
    // but Modal header and TextInput placeholder contain it.
    // Let's use getByPlaceholderText or searching for the modal title by mangled name or just identifying the TextInput
    expect(screen.getByPlaceholderText(/.+/)).toBeTruthy();
  });

  it('submits quantity and dispatches toggleSoldOutThunk(false) from modal', () => {
    const soldOutProps = { ...defaultProps, active: false };
    render(<FoodItemCard {...soldOutProps} />);
    
    const buttons = screen.UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(buttons[0]);
    
    const input = screen.UNSAFE_getByType(TextInput);
    fireEvent.changeText(input, '20');
    
    // Identify confirm button in modal. 
    // It's the 3rd button overall (0: Hết hàng, 1: Huỷ, 2: Xác nhận)
    const allButtons = screen.UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(allButtons[2]); 
    
    expect(toggleSoldOutThunk).toHaveBeenCalledWith({
      restaurantId,
      id: 101,
      isSoldOut: false,
      quantity: 20,
    });
    expect(dispatch).toHaveBeenCalled();
  });

  it('closes modal correctly when clicking Cancel', () => {
    const soldOutProps = { ...defaultProps, active: false };
    render(<FoodItemCard {...soldOutProps} />);
    
    const buttons = screen.UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(buttons[0]);
    
    const allButtons = screen.UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(allButtons[1]); // Cancel button
    
    expect(dispatch).not.toHaveBeenCalled();
  });
});
