import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import RootNavigator from './RootNavigator';
import { initSignalR, stopSignalR } from '@/services/logicServices/globalSignalR';
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(() => jest.fn()),
}));
jest.mock('@/services/logicServices/globalSignalR', () => ({
  initSignalR: jest.fn(),
  stopSignalR: jest.fn(),
}));
jest.mock('@react-navigation/native-stack', () => {
    const React = require('react');
    return {
        createNativeStackNavigator: jest.fn(() => ({
            Navigator: ({ children }: any) => <>{children}</>,
            Screen: ({ component: Component }: any) => Component ? <Component route={{ params: {} }} /> : null,
            Group: ({ children }: any) => <>{children}</>,
        })),
    };
});
jest.mock('@/navigation/BottomTabs', () => {
    const { View, Text } = require('react-native');
    return () => <View><Text>Main App</Text></View>;
});
jest.mock('@/navigation/AuthNavigator', () => {
    const { View, Text } = require('react-native');
    return () => <View><Text>Auth Screen</Text></View>;
});
jest.mock('@/screen/private/ProfileScreen', () => () => null);
jest.mock('@/screen/private/DetailOrderScreen', () => () => null);
jest.mock('@/screen/private/ChangePasswordScreen', () => () => null);
jest.mock('@/screen/private/ScanDeliveryScreen', () => () => null);
describe('RootNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders Auth flow when not authenticated', () => {
    (useSelector as unknown as jest.Mock).mockImplementation((selector) => selector({
      auth: { accessToken: null, userInfo: null },
      shift: { currentShift: null, loading: false, hasFetchedStatus: false, pendingReports: [] },
    }));
    const { getByText } = render(
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    );
    expect(getByText('Auth Screen')).toBeTruthy();
    expect(stopSignalR).toHaveBeenCalled();
  });
  it('renders MainApp flow when authenticated and initializes SignalR', async () => {
    const mockUser = { id: 'u1', restaurantId: 'r1' };
    (useSelector as unknown as jest.Mock).mockImplementation((selector) => selector({
      auth: { accessToken: 'valid-token', userInfo: mockUser },
      shift: { currentShift: null, loading: false, hasFetchedStatus: false, pendingReports: [] },
    }));
    const { getByText } = render(
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    );
    expect(getByText('Main App')).toBeTruthy();
    await waitFor(() => {
      expect(initSignalR).toHaveBeenCalledWith('r1', 'u1');
    });
  });
  it('handles SignalR initialization error gracefully', async () => {
    const mockUser = { id: 'u1', restaurantId: 'r1' };
    (useSelector as unknown as jest.Mock).mockImplementation((selector) => selector({
      auth: { accessToken: 'valid-token', userInfo: mockUser },
      shift: { currentShift: null, loading: false, hasFetchedStatus: false, pendingReports: [] },
    }));
    (initSignalR as jest.Mock).mockRejectedValueOnce(new Error('SignalR Fail'));
    render(
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    );
    await waitFor(() => {
    });
  });
});
