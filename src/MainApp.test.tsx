import React from 'react';
import { render, act } from '@testing-library/react-native';
import MainApp from './MainApp';
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: any) => children,
}));
jest.mock('@/navigation/RootNavigator', () => {
    const { View, Text } = require('react-native');
    return () => <View><Text>Root Navigator</Text></View>;
});
jest.mock('./screen/public/WelcomeScreen', () => {
    const { View, Text } = require('react-native');
    return () => <View><Text>Welcome Screen</Text></View>;
});
jest.mock('react-native-toast-message', () => {
    const { View } = require('react-native');
    return () => <View testID="mock-toast" />;
});
jest.mock('react-native-safe-area-context', () => ({
    SafeAreaProvider: ({ children }: any) => children,
}));
describe('MainApp Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  it('shows WelcomeScreen initially and switches to RootNavigator after 5s', () => {
    const { getByText, queryByText } = render(<MainApp />);
    expect(getByText('Welcome Screen')).toBeTruthy();
    expect(queryByText('Root Navigator')).toBeNull();
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(queryByText('Welcome Screen')).toBeNull();
    expect(getByText('Root Navigator')).toBeTruthy();
  });
  it('clears timer on unmount', () => {
    const spy = jest.spyOn(global, 'clearTimeout');
    const { unmount } = render(<MainApp />);
    unmount();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
