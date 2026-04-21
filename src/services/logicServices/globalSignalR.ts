import { HubConnection } from '@microsoft/signalr';
import { createSignalRConnection } from '@/services/logicServices/signalRService';
import { store } from '@/store';
import {
  updateOrderStatusLocal,
  addOrder,
  fetchActiveOrders,
} from '@/store/slices/orderSlice';
import {
  updateReceivingOrdersLocal,
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
    return;
  }
  connection = createSignalRConnection();
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
  connection.on('ReceiveOrder', (order: any) => {
    if (!order) return;
    playNotificationSound();
    const rawItems = order.items ?? order.Items ?? [];
    const items = rawItems.map((item: any) => ({
      id: (item.id ?? item.DishId ?? item.dishId)?.toString() ?? '',
      name: item.name ?? item.dishName ?? item.DishName ?? 'Món ăn',
      price: item.price ?? item.Price ?? item.discountedPrice ?? 0,
      quantity: item.quantity ?? item.Quantity ?? 1,
      image: item.image ?? item.dishImageUrl ?? item.DishImageUrl ?? '',
      originalPrice: item.originalPrice ?? item.OriginalPrice ?? 0,
      discountAmount: item.discountAmount ?? item.DiscountAmount ?? 0,
    }));

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
      note: order.note ?? order.Note ?? '',
      tableName: order.tableName ?? order.TableName ?? '',
      paymentProofUrl: order.paymentProofUrl ?? order.PaymentProofUrl ?? '',
      isPreOrder: order.isPreOrder ?? order.IsPreOrder ?? false,
      requestedPickupAt:
        order.requestedPickupAt ?? order.RequestedPickupAt ?? null,
      confirmedPickupAt:
        order.confirmedPickupAt ?? order.ConfirmedPickupAt ?? null,
    };
    store.dispatch(addOrder(mappedOrder));
  });
  connection.on('PaymentReceived', (data: any) => {
    const audioUrl = data.audioUrl ?? data.AudioUrl ?? null;
    if (audioUrl) playAudioFromUrl(audioUrl);
  });
  connection.on('ReceivingOrdersChanged', (data: any) => {
    const isReceiving =
      data.isReceivingOrders ??
      data.IsReceivingOrders ??
      false;
    store.dispatch(updateReceivingOrdersLocal(isReceiving));
  });
  connection.on('ShiftChanged', (data: any) => {
    if (!data) return;
    if (data.status === 1 || data.endDate) {
      store.dispatch(clearShift());
    } else {
      store.dispatch(setShift(data));
    }
  });
  connection.on('ListChanged', () => {
    if (restaurantId) {
      store.dispatch(fetchActiveOrders(restaurantId));
    }
  });
  await connection.start();
  if (restaurantId) {
    await connection.invoke('JoinRestaurantGroup', restaurantId.toString());
  }
  if (staffId) {
    await connection.invoke('JoinGroup', `staff:${staffId}`);
  }
  connection.onreconnected(async () => {
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
      connection = null;
    }
  } catch (error) {
  }
};