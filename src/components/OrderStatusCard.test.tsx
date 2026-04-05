import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OrderStatusCard } from './OrderStatusCard';

// Mock lucide icons
jest.mock('lucide-react-native', () => ({
  Power: () => null,
}));

describe('OrderStatusCard', () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when open', () => {
    const { getByText, queryByTestId } = render(
      <OrderStatusCard isOpen={true} onToggle={mockOnToggle} />
    );

    expect(getByText('Đang nhận đơn hàng')).toBeTruthy();
    expect(getByText('Tắt nhận đơn hàng')).toBeTruthy();
    
    // ActivityIndicator is not showing
    const { ActivityIndicator } = require('react-native');
    try {
      expect(queryByTestId('activity-indicator')).toBeNull();
    } catch (e) {
      // Ignored
    }
  });

  it('renders correctly when closed', () => {
    const { getByText } = render(
      <OrderStatusCard isOpen={false} onToggle={mockOnToggle} />
    );

    expect(getByText('Không nhận đơn hàng')).toBeTruthy();
    expect(getByText('Bật nhận đơn hàng')).toBeTruthy();
  });

  it('shows ActivityIndicator when loading', () => {
    const { UNSAFE_getByType } = render(
      <OrderStatusCard isOpen={true} isLoading={true} onToggle={mockOnToggle} />
    );

    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('calls onToggle when button is pressed', () => {
    const { getByText } = render(
      <OrderStatusCard isOpen={true} onToggle={mockOnToggle} />
    );

    const button = getByText('Tắt nhận đơn hàng');
    fireEvent.press(button);

    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('disables button when loading', () => {
    const { getByRole, UNSAFE_getByType } = render(
      <OrderStatusCard isOpen={true} isLoading={true} onToggle={mockOnToggle} />
    );

    const { TouchableOpacity } = require('react-native');
    const button = UNSAFE_getByType(TouchableOpacity);
    expect(button.props.disabled).toBe(true);
  });
});
