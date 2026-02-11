import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../type/types';
import LoginScreen from '../screen/public/LoginScreen';
import EmailForOTPScreen from '../screen/public/EmailForOTPScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Login"
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="EmailForOTPScreen" component={EmailForOTPScreen} />
    </Stack.Navigator>
  );
}
