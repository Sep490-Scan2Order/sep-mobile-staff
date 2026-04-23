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
import { setShift, clearShift, fetchPendingReport, fetchStaffShifts } from '@/store/slices/shiftSlice';
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
    if (restaurantId) {
      store.dispatch(fetchActiveOrders(restaurantId));
    }
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
      type: (() => {
        const t = order.type ?? order.Type;
        if (t === 0 || t === '0' || t === 'Cash') return 'Cash';
        if (t === 1 || t === '1' || t === 'Banking') return 'Banking';
        return t?.toString() || null;
      })(),
      items,
      note: order.note ?? order.Note ?? '',
      tableName: order.tableName ?? order.TableName ?? '',
      paymentProofUrl: order.paymentProofUrl ?? order.PaymentProofUrl ?? '',
      isPreOrder: !!(order.isPreOrder ?? order.IsPreOrder),
      requestedPickupAt:
        order.requestedPickupAt ?? order.RequestedPickupAt ?? null,
      confirmedPickupAt:
        order.confirmedPickupAt ?? order.ConfirmedPickupAt ?? null,
    };
    store.dispatch(addOrder(mappedOrder));
    if (restaurantId) {
      store.dispatch(fetchActiveOrders(restaurantId));
    }
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
    
    const incomingStaffId = data.staffId ?? data.StaffId;
    
    // If it's the current user's shift
    if (incomingStaffId === staffId) {
      if (data.status === 1 || data.endDate) {
        store.dispatch(clearShift());
      } else {
        store.dispatch(setShift(data));
      }
    } else {
      // If it's someone else's shift and I am a Cashier, refresh my staff list
      const state = store.getState();
      const isCashier = state.auth.userInfo?.role === 'Cashier';
      const cashierShiftId = state.shift.currentShiftId;

      if (isCashier && cashierShiftId) {
        store.dispatch(fetchStaffShifts(cashierShiftId));
      }
    }
  });
  connection.on('ShiftTransferSuccess', (data: any) => {
    store.dispatch(fetchPendingReport());
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