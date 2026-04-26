import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useDispatch, useSelector } from 'react-redux';
import KDSScreen from './KDSScreen';
import { fetchActiveOrders, clearUnreadByStatus } from '@/store/slices/orderSlice';
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));
jest.mock('@/store/slices/orderSlice', () => ({
  fetchActiveOrders: jest.fn(),
  clearUnreadByStatus: jest.fn(),
}));
jest.mock('@/components/Header', () => ({
  Header: () => null,
}));
jest.mock('@/components/Sidebar', () => {
    const React = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    return {
        Sidebar: ({ onItemPress, activeIndex }: any) => (
            <TouchableOpacity onPress={() => onItemPress(1)} testID="sidebar-item-1">
                <Text>{`Active: ${activeIndex}`}</Text>
            </TouchableOpacity>
        ),
    };
});
jest.mock('@/components/KDSTable', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return {
        SDKTable: ({ statusFilter }: any) => (
            <Text>{`Status Filter: ${statusFilter}`}</Text>
        ),
    };
});
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: any) => cb(),
}));
describe('KDSScreen Component', () => {
  const mockDispatch = jest.fn();
  const mockRestaurantId = 'res-123';
  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    (useSelector as unknown as jest.Mock).mockImplementation((selector) => selector({
      auth: { userInfo: { restaurantId: mockRestaurantId } },
      order: { refreshCount: 0 },
    }));
  });
  it('fetches active orders on mount/focus', () => {
    render(<KDSScreen />);
    expect(mockDispatch).toHaveBeenCalledWith(fetchActiveOrders(mockRestaurantId));
  });
  it('changes filter and clears unread when sidebar item is pressed', () => {
    const { getByTestId, getByText } = render(<KDSScreen />);
    expect(getByText('Status Filter: -1')).toBeTruthy();
    fireEvent.press(getByTestId('sidebar-item-1'));
    expect(mockDispatch).toHaveBeenCalledWith(clearUnreadByStatus(1));
    expect(getByText('Status Filter: 1')).toBeTruthy();
  });
});
