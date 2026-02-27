import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screen/public/LoginScreen';
import EmailForOTPScreen from '../screen/public/EmailForOTPScreen';
import { AuthStackParamList } from '../type/types'; // Đảm bảo type đã khai báo Login

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Login là màn hình đầu tiên khi chưa đăng nhập */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="EmailForOTPScreen" component={EmailForOTPScreen} />
    </Stack.Navigator>
  );
}
