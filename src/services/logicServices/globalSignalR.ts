import { HubConnection } from '@microsoft/signalr';
import { createSignalRConnection } from '@/services/logicServices/signalRService';
import { store } from '@/store';

import {
  updateOrderStatusLocal,
  addOrder,
} from '@/store/slices/orderSlice';

import {
  updateReceivingOrdersLocal, // 👈 thêm
} from '@/store/slices/restaurantSlice';

import { setShift, clearShift } from '@/store/slices/shiftSlice';

import {
  playNotificationSound,
  playAudioFromUrl,
} from '@/utils/notificationSound';

let connection: HubConnection | null = null;

export const initSignalR = async (
  restaurantId?: number,
  staffId?: string
) => {
  if (connection) {
    console.log('⚠️ SignalR already initialized');
    return;
  }

  connection = createSignalRConnection();

  // ================== EVENTS ==================

  // ✅ Order status
  connection.on('UpdateStatus', (data: any) => {
    const orderId =
      data.orderId ?? data.OrderId ?? data.id ?? data.Id ?? null;

    const status =
      data.status ??
      data.Status ??
      data.newStatus ??
      data.NewStatus ??
      null;

    if (!orderId || status === null) return;

    store.dispatch(
      updateOrderStatusLocal({
        id: orderId,
        status,
      })
    );
  });

  // ✅ New order
  connection.on('ReceiveOrder', (order: any) => {
    if (!order) return;

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
      items,
      isPreOrder: order.isPreOrder ?? order.IsPreOrder ?? false,
      requestedPickupAt:
        order.requestedPickupAt ?? order.RequestedPickupAt ?? null,
      confirmedPickupAt:
        order.confirmedPickupAt ?? order.ConfirmedPickupAt ?? null,
    };

    store.dispatch(addOrder(mappedOrder));
  });

  // ✅ Payment
  connection.on('PaymentReceived', (data: any) => {
    const audioUrl = data.audioUrl ?? data.AudioUrl ?? null;
    if (audioUrl) playAudioFromUrl(audioUrl);
  });

  // ✅ 🔥 NEW: Receiving Orders toggle realtime
  connection.on('ReceivingOrdersChanged', (data: any) => {
    console.log('📡 ReceivingOrdersChanged:', data);

    const isReceiving =
      data.isReceivingOrders ??
      data.IsReceivingOrders ??
      false;

    store.dispatch(updateReceivingOrdersLocal(isReceiving));
  });
  // ✅ Shift change
  connection.on('ShiftChanged', (data: any) => {
    console.log('🔔 Shift changed notification:', data);
    if (!data) return;

    if (data.status === 1 || data.endDate) {
      store.dispatch(clearShift());
    } else {
      store.dispatch(setShift(data));
    }
  });

  // ================== START ==================

  await connection.start();
  console.log('✅ SignalR Connected');

  if (restaurantId) {
    await connection.invoke('JoinRestaurantGroup', restaurantId.toString());
  }

  if (staffId) {
    await connection.invoke('JoinGroup', `staff:${staffId}`);
  }

  connection.onreconnected(async () => {
    console.log('🔁 Reconnected');

    if (restaurantId) {
      await connection.invoke('JoinRestaurantGroup', restaurantId.toString());
    }

    if (staffId) {
      await connection.invoke('JoinGroup', `staff:${staffId}`);
    }
  });
};

export const stopSignalR = async () => {
  try {
    if (connection) {
      await connection.stop();
      console.log('⚡ SignalR disconnected');
      connection = null;
    }
  } catch (error) {
    console.log('⚠️ Error stopping SignalR:', error);
  }
};