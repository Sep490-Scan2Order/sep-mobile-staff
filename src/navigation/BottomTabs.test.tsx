import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import BottomTabs from './BottomTabs';
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));
jest.mock('@/screen/private/KDSScreen', () => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return () => <View><Text>KDS Screen</Text></View>;
});
jest.mock('@/screen/private/FoodManagementScreen', () => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return () => <View><Text>Foods Screen</Text></View>;
});
jest.mock('@/screen/private/OrderStatusScreen', () => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return () => <View><Text>Orders Screen</Text></View>;
});
jest.mock('@/screen/private/MenuManagementScreen', () => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return () => <View><Text>Menu Screen</Text></View>;
});
jest.mock('@/screen/private/CheckInScreen', () => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return () => <View><Text>CheckIn Screen</Text></View>;
});
jest.mock('@/screen/private/CashReportScreen', () => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return () => <View><Text>CashReport Screen</Text></View>;
});
jest.mock('@react-navigation/bottom-tabs', () => {
    const React = require('react');
    return {
        createBottomTabNavigator: jest.fn(() => ({
            Navigator: ({ children }: any) => <>{children}</>,
            Screen: ({ name, component: Component }: any) => Component ? <Component key={name} /> : null,
        })),
    };
});
describe('BottomTabs Navigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders correctly for regular staff (no Cashier role)', () => {
    (useSelector as unknown as jest.Mock).mockReturnValue({ role: 'Staff' });
    const { getByText, queryByText } = render(
      <NavigationContainer>
        <BottomTabs />
      </NavigationContainer>
    );
    expect(getByText('KDS Screen')).toBeTruthy();
    expect(getByText('Foods Screen')).toBeTruthy();
    expect(getByText('Orders Screen')).toBeTruthy();
    expect(getByText('Menu Screen')).toBeTruthy();
    expect(queryByText('CheckIn Screen')).toBeNull();
    expect(queryByText('CashReport Screen')).toBeNull();
  });
  it('renders correctly for Cashier role', () => {
    (useSelector as unknown as jest.Mock).mockReturnValue({ role: 'Cashier' });
    const { getByText } = render(
      <NavigationContainer>
        <BottomTabs />
      </NavigationContainer>
    );
    expect(getByText('KDS Screen')).toBeTruthy();
    expect(getByText('CheckIn Screen')).toBeTruthy();
    expect(getByText('CashReport Screen')).toBeTruthy();
  });
});
