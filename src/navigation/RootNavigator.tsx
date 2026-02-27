import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

import BottomTabs from './BottomTabs';
import AuthNavigator from './AuthNavigator';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  // Lấy trạng thái từ Redux
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  console.log('RootNavigator - isAuthenticated:', isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        // NHÓM PRIVATE: Chỉ hiện khi đã đăng nhập
        <Stack.Screen name="MainApp" component={BottomTabs} />
      ) : (
        // NHÓM PUBLIC: Hiện khi chưa đăng nhập (Login, OTP,...)
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
