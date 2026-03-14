import React, { useState, useEffect, useMemo } from 'react';
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
  addOrder,
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
    if (restaurantId) {
      dispatch(fetchActiveOrders(restaurantId));
    }
  }, [dispatch, restaurantId]);

  // khi user click sidebar
  const handleSidebarPress = (status: number) => {
    setActiveSidebarIndex(status);

    // clear badge của tab đó
    dispatch(clearUnreadByStatus(status));
  };

  const kdsEvents = useMemo(
    () => [
      {
        name: 'UpdateStatus',
        handler: (data: any) => {
          console.log('SignalR Event Received: UpdateStatus', data);

          dispatch(
            updateOrderStatusLocal({
              id: data.orderId ?? data.OrderId,
              status: data.status ?? data.Status,
            }),
          );
        },
      },
      {
        name: 'ReceiveOrder',
        handler: (order: any) => {
          console.log('SignalR ReceiveOrder data:', order);

          playNotificationSound();

          const mappedOrder = {
            id: order.id ?? order.Id,
            phone: order.phone ?? order.Phone ?? '',
            orderCode: order.orderCode ?? order.OrderCode ?? 0,
            createdAt:
              order.createdAt ?? order.CreatedAt ?? new Date().toISOString(),
            amount: order.amount ?? order.TotalAmount ?? order.finalAmount ?? 0,
            status: order.status ?? order.Status ?? 0,
            items: order.items ?? order.Items ?? [],
          };

          dispatch(addOrder(mappedOrder));
        },
      },
    ],
    [dispatch],
  );

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
