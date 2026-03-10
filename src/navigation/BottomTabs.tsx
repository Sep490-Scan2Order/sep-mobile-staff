import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

import KDSScreen from '../screen/private/KDSScreen';
import FoodManagementScreen from '../screen/private/FoodManagementScreen';
import OrderStatusScreen from '../screen/private/OrderStatusScreen';
import MenuManagementScreen from '../screen/private/MenuManagementScreen';
import CheckInScreen from '../screen/private/CheckInScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const user = useSelector((state: RootState) => state.auth.userInfo);
  const role = user?.role;
  console.log('BottomTabs - user role:', role);
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      {/* chỉ cashier mới có */}
      {role === 'Cashier' && (
        <Tab.Screen name="CheckIn" component={CheckInScreen} />
      )}

      <Tab.Screen name="KDS" component={KDSScreen} />
      <Tab.Screen name="Foods" component={FoodManagementScreen} />
      <Tab.Screen name="Orders" component={OrderStatusScreen} />
      <Tab.Screen name="Menu" component={MenuManagementScreen} />
    </Tab.Navigator>
  );
}
