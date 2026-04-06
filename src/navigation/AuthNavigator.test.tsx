import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';

// === MOCKS ===

jest.mock('@react-navigation/native-stack', () => {
    const React = require('react');
    return {
        createNativeStackNavigator: jest.fn(() => ({
            Navigator: ({ children }: any) => <>{children}</>,
            Screen: ({ name, component: Component }: any) => Component ? <Component key={name} /> : null,
        })),
    };
});

// Mock the screens to isolate navigator testing
jest.mock('@/screen/public/LoginScreen', () => {
  const { View, Text } = require('react-native');
  return () => (
    <View>
      <Text>Login Screen</Text>
    </View>
  );
});

jest.mock('@/screen/public/EmailForOTPScreen', () => {
  const { View, Text } = require('react-native');
  return () => (
    <View>
      <Text>Email For OTP Screen</Text>
    </View>
  );
});

jest.mock('@/screen/public/ResetPasswordScreen', () => {
  const { View, Text } = require('react-native');
  return () => (
    <View>
      <Text>Reset Password Screen</Text>
    </View>
  );
});

// Mock createNativeStackNavigator (Optional if jest.setup.ts already mocks it, but good to be explicit)
// Native Stack involves native components, so we usually rely on the mock from @react-navigation/native-stack/lib/commonjs/mock.js 
// which is often configured in jest.setup.ts.

describe('AuthNavigator', () => {
  it('renders Login screen by default', () => {
    const { getByText } = render(
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
    
    expect(getByText('Login Screen')).toBeTruthy();
  });
});
