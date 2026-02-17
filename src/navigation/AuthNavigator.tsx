import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../type/types';
// import LoginScreen from '../screen/public/LoginScreen';
import EmailForOTPScreen from '../screen/public/EmailForOTPScreen';
import DetailPaymentScreen from '../screen/private/DetailPaymentScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="DetailPaymentScreen"
    >
      <Stack.Screen
        name="DetailPaymentScreen"
        component={DetailPaymentScreen}
      />
      <Stack.Screen name="EmailForOTPScreen" component={EmailForOTPScreen} />
    </Stack.Navigator>
  );
}
