import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '@/screen/public/LoginScreen';
import EmailForOTPScreen from '@/screen/public/EmailForOTPScreen';
import ResetPasswordScreen from '@/screen/public/ResetPasswordScreen';
import { RootStackParamList } from '@/type';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="EmailForOTPScreen" component={EmailForOTPScreen} />
      <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}
