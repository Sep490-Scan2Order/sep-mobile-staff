import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

import BottomTabs from './BottomTabs';
import AuthNavigator from './AuthNavigator';
import ProfileScreen from '../screen/private/ProfileScreen';
import DetailOrderScreen from '../screen/private/DetailOrderScreen';
import DetailPaymentScreen from '../screen/private/DetailPaymentScreen';
import ChangePasswordScreen from '../screen/private/ChangePasswordScreen';
import ScanDeliveryScreen from '../screen/private/ScanDeliveryScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.accessToken,
  );

  console.log('RootNavigator - isAuthenticated:', isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="MainApp" component={BottomTabs} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen
            name="DetailOrderScreen"
            component={DetailOrderScreen}
          />
          <Stack.Screen
            name="DetailPaymentScreen"
            component={DetailPaymentScreen}
          />
          <Stack.Screen
            name="ChangePasswordScreen"
            component={ChangePasswordScreen}
          />
          <Stack.Screen
            name="ScanDeliveryScreen"
            component={ScanDeliveryScreen}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
