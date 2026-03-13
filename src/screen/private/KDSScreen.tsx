import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import { SDKTable } from '../../components/KDSTable';
import { BottomNavbar } from '../../components/BottomNavbar';
import {
  updateOrderStatusLocal,
  fetchActiveOrders,
  clearUnreadByStatus,
} from '../../store/slices/orderSlice';
import { AppDispatch, RootState } from '../../store';
import { useDispatch, useSelector } from 'react-redux';
import { useSignalR } from '../../hook/useSignalR';
import { playNotificationSound } from '../../utils/notificationSound';

const KDSScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [activeSidebarIndex, setActiveSidebarIndex] = useState(-1);
  const restaurantId = useSelector(
    (state: RootState) => state.auth.userInfo?.restaurantId,
  );
  console.log('KDSScreen - restaurantId:', restaurantId);
  // fetch orders
  useEffect(() => {
    dispatch(fetchActiveOrders(restaurantId));
  }, [dispatch, restaurantId]);

  // khi user click sidebar
  const handleSidebarPress = (status: number) => {
    setActiveSidebarIndex(status);

    // clear badge của tab đó
    dispatch(clearUnreadByStatus(status));
  };

  const kdsEvents = [
    {
      name: 'UpdateStatus',
      handler: (data: any) => {
        console.log('SignalR Event Received: UpdateStatus');

        playNotificationSound();

        dispatch(
          updateOrderStatusLocal({
            id: data.orderId || data.OrderId,
            status: data.status || data.Status,
          }),
        );
      },
    },
  ];

  useSignalR(restaurantId, kdsEvents);

  return (
    <View className="flex-1 bg-teal-700">
      <SafeAreaView className="flex-1" edges={['top']}>
        <Header />

        <View className="flex-1 flex-row bg-white">
          <Sidebar
            activeIndex={activeSidebarIndex}
            onItemPress={handleSidebarPress}
          />

          <View className="flex-1">
            <SDKTable statusFilter={activeSidebarIndex} />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default KDSScreen;
