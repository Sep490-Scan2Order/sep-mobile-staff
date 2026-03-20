import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import { SDKTable } from '../../components/KDSTable';

import {
  updateOrderStatusLocal,
  fetchActiveOrders,
  clearUnreadByStatus,
  addOrder,
  forceRefresh,
} from '../../store/slices/orderSlice';

import { AppDispatch, RootState } from '../../store';
import { useDispatch, useSelector } from 'react-redux';
import { useSignalR } from '../../hook/useSignalR';
import {
  playNotificationSound,
  playAudioFromUrl,
} from '../../utils/notificationSound';

const KDSScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const restaurantId = useSelector(
    (state: RootState) => state.auth.userInfo?.restaurantId,
  );

  const [activeSidebarIndex, setActiveSidebarIndex] = useState(-1);

  /**
   * FETCH ORDERS
   */
  useEffect(() => {
    if (!restaurantId) return;

    dispatch(fetchActiveOrders(restaurantId));
  }, [restaurantId, dispatch]);

  /**
   * REFETCH ORDERS WHEN SCREEN FOCUS
   */
  useFocusEffect(
    useCallback(() => {
      if (!restaurantId) return;

      dispatch(fetchActiveOrders(restaurantId));
    }, [restaurantId, dispatch]),
  );

  /**
   * SIDEBAR CLICK
   */
  const handleSidebarPress = useCallback(
    (status: number) => {
      setActiveSidebarIndex(status);

      dispatch(clearUnreadByStatus(status));
    },
    [dispatch],
  );

  /**
   * SIGNALR EVENTS
   */
  const kdsEvents = useMemo(() => {
    return [
      {
        name: 'UpdateStatus',
        handler: (data: any) => {
          if (!data) return;

          console.log('SignalR RAW UpdateStatus:', data);

          const orderId =
            data.orderId ?? data.OrderId ?? data.id ?? data.Id ?? null;

          const status =
            data.status ??
            data.Status ??
            data.newStatus ??
            data.NewStatus ??
            null;

          if (!orderId || status === null) {
            console.log('Invalid UpdateStatus payload');
            return;
          }

          console.log('Parsed UpdateStatus:', {
            orderId,
            status,
          });

          dispatch(
            updateOrderStatusLocal({
              id: orderId,
              status,
            }),
          );
        },
      },

      {
        name: 'OrderConfirmed',
        handler: (order: any) => {
          if (!order) return;

          console.log('SignalR RAW OrderConfirmed:', order);

          // Order vừa được thanh toán (chuyển từ pending → active)
          // Thêm vào active list để hiển thị ở KDS
          const items = order.items ?? order.Items ?? [];

          const mappedOrder = {
            id: order.id ?? order.Id,
            phone: order.phone ?? order.Phone ?? '',
            orderCode: order.orderCode ?? order.OrderCode ?? 0,
            createdAt:
              order.createdAt ?? order.CreatedAt ?? new Date().toISOString(),
            amount:
              order.amount ??
              order.totalAmount ??
              order.TotalAmount ??
              order.finalAmount ??
              0,
            status: order.status ?? order.Status ?? 1,
            type: order.type ?? order.Type ?? null,
            items: items,
          };

          console.log('Mapped Confirmed Order:', mappedOrder);

          dispatch(addOrder(mappedOrder));
        },
      },

      {
        name: 'ReceiveOrder',
        handler: (order: any) => {
          if (!order) return;

          console.log('SignalR RAW ReceiveOrder:', order);

          playNotificationSound();

          const items = order.items ?? order.Items ?? [];

          const mappedOrder = {
            id: order.id ?? order.Id,
            phone: order.phone ?? order.Phone ?? '',
            orderCode: order.orderCode ?? order.OrderCode ?? 0,
            createdAt:
              order.createdAt ?? order.CreatedAt ?? new Date().toISOString(),
            amount:
              order.amount ??
              order.totalAmount ??
              order.TotalAmount ??
              order.finalAmount ??
              0,
            status: order.status ?? order.Status ?? 0,
            type: order.type ?? order.Type ?? null,
            items: items,
          };

          console.log('Mapped Order:', mappedOrder);

          dispatch(addOrder(mappedOrder));
        },
      },

      {
        name: 'PaymentReceived',
        handler: (data: any) => {
          if (!data) return;

          console.log('SignalR RAW PaymentReceived:', data);

          const orderCode = data.orderCode ?? data.OrderCode ?? null;
          const amount = data.amount ?? data.Amount ?? 0;
          const audioUrl = data.audioUrl ?? data.AudioUrl ?? null;

          if (!orderCode) {
            console.log('Invalid PaymentReceived payload: missing orderCode');
            return;
          }

          console.log('Payment Received:', {
            orderCode,
            amount,
            audioUrl,
          });

          // Play payment notification sound from URL
          if (audioUrl) {
            playAudioFromUrl(audioUrl);
          }
        },
      },
    ];
  }, [dispatch]);

  /**
   * CONNECT SIGNALR
   */
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
