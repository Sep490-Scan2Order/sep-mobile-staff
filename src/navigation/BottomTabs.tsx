import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

import KDSScreen from '../screen/private/KDSScreen';
import FoodManagementScreen from '../screen/private/FoodManagementScreen';
import OrderStatusScreen from '../screen/private/OrderStatusScreen';
import MenuManagementScreen from '../screen/private/MenuManagementScreen';
import CheckInScreen from '../screen/private/CheckInScreen';

import {
  ClipboardList,
  Utensils,
  ShoppingCart,
  Menu,
  QrCode,
  FileText,
} from 'lucide-react-native';
import CashReportScreen from '../screen/private/CashReportScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const user = useSelector((state: RootState) => state.auth.userInfo);
  const role = user?.role;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#226B5D',
        tabBarInactiveTintColor: 'gray',

        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'KDS':
              return <ClipboardList size={size} color={color} />;

            case 'Foods':
              return <Utensils size={size} color={color} />;

            case 'Orders':
              return <ShoppingCart size={size} color={color} />;

            case 'Menu':
              return <Menu size={size} color={color} />;

            case 'CheckIn':
              return <QrCode size={size} color={color} />;

            case 'CashReport':
              return <FileText size={size} color={color} />;

            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen name="KDS" component={KDSScreen} />
      <Tab.Screen name="Foods" component={FoodManagementScreen} />
      {role === 'Cashier' && (
        <Tab.Screen name="CheckIn" component={CheckInScreen} />
      )}
      {role === 'Cashier' && (
        <Tab.Screen name="CashReport" component={CashReportScreen} />
      )}
      <Tab.Screen name="Orders" component={OrderStatusScreen} />
      <Tab.Screen name="Menu" component={MenuManagementScreen} />
    </Tab.Navigator>
  );
}
