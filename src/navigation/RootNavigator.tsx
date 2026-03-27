import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

import BottomTabs from '@/navigation/BottomTabs';
import AuthNavigator from '@/navigation/AuthNavigator';
import ProfileScreen from '@/screen/private/ProfileScreen';
import DetailOrderScreen from '@/screen/private/DetailOrderScreen';
import DetailPaymentScreen from '@/screen/private/DetailPaymentScreen';
import ChangePasswordScreen from '@/screen/private/ChangePasswordScreen';
import ScanDeliveryScreen from '@/screen/private/ScanDeliveryScreen';
import { RootStackParamList } from '@/type';

import {
  initSignalR,
  stopSignalR,
} from '@/services/logicServices/globalSignalR';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.accessToken,
  );

  const user = useSelector((state: RootState) => state.auth.userInfo);

  // 🔥 SIGNALR GLOBAL
  useEffect(() => {
    const init = async () => {
      try {
        if (!user) {
          await stopSignalR();
          return;
        }
        await initSignalR(user.restaurantId, user.id);
      } catch (err) {
        console.log('⚠️ SignalR init error', err);
      }
    };
    init();
  }, [user]);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Group>
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
        </Stack.Group>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
