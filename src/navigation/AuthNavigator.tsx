import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../type/types';
// import LoginScreen from '../screen/public/LoginScreen';
import EmailForOTPScreen from '../screen/public/EmailForOTPScreen';
import KDSScreen from '../screen/private/KDSScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="KDSScreen"
    >
      <Stack.Screen name="KDSScreen" component={KDSScreen} />
      <Stack.Screen name="EmailForOTPScreen" component={EmailForOTPScreen} />
    </Stack.Navigator>
  );
}
