import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import KDSScreen from '../../src/screen/private/KDSScreen';
import FoodManagementScreen from '../../src/screen/private/FoodManagementScreen';
import OrderStatusScreen from '../../src/screen/private/OrderStatusScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="KDS" component={KDSScreen} />
      <Tab.Screen name="Foods" component={FoodManagementScreen} />
      <Tab.Screen name="Orders" component={OrderStatusScreen} />
    </Tab.Navigator>
  );
}
