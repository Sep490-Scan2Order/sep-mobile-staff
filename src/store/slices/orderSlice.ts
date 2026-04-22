import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { orderService } from '@/services/logicServices/orderService';
import { isToday } from '@/utils/dateUtils';
import { Order, OrderItem, OrderState } from '@/type';

const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null,
  refreshCount: 0,
  unread: {
    all: 0,
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  },
};

const increaseUnread = (state: OrderState, order: Order) => {
  if (!isToday(order.createdAt)) return;
  state.unread.all += 1;
  const status = order.status as 0 | 1 | 2 | 3 | 4;
  if (state.unread[status] !== undefined) {
    state.unread[status] += 1;
  }
};

export const fetchActiveOrders = createAsyncThunk<Order[], number>(
  'order/fetchActiveOrders',
  async (restaurantId, { rejectWithValue }) => {
    try {
      const data = await orderService.getActiveOrders(restaurantId);
      return data.map((order: any) => {
        const isRefund = order.typeOrder === 1;
        let amount = 0;
        const transformedItems = order.items.map((item: any) => {
          // Fix: Ensure price is not 0 if discountedPrice is 0 or null
          const finalPrice = (item.discountedPrice && item.discountedPrice > 0) 
            ? item.discountedPrice 
            : (item.price || 0);
          const qty = item.quantity || 0;
          if (!isRefund) {
            amount += finalPrice * qty;
          }
          return {
            id: item.id?.toString(),
            name: item.name,
            price: finalPrice,
            quantity: qty,
            originalPrice: item.originalPrice || item.price || finalPrice || 0,
            discountedPrice: finalPrice,
            promotionAmount: item.promotionAmount,
            refundedQuantity: item.refundedQuantity || 0,
            image: item.image,
          };
        });

        const finalAmount = isRefund ? order.finalAmount : amount - (order.promotionDiscount || 0);

        return {
          id: order.id,
          phone: order.phone,
          orderCode: order.orderCode,
          createdAt: order.createdAt,
          amount: isRefund ? order.amount : amount,
          finalAmount: finalAmount,
          totalAmount: order.totalAmount,
          promotionDiscount: order.promotionDiscount,
          promotionName: order.promotionName,
          status: order.status,
          type: order.type,
          typeOrder: order.typeOrder,
          isPreOrder: order.isPreOrder,
          requestedPickupAt: order.requestedPickupAt,
          confirmedPickupAt: order.confirmedPickupAt,
          originalOrderCode: order.originalOrderCode,
          paymentProofUrl: order.paymentProofUrl,
          note: order.note,
          items: transformedItems,
        };
      });
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPendingCashOrders = createAsyncThunk<Order[]>(
  'order/fetchPendingCashOrders',
  async (_, { rejectWithValue }) => {
    try {
      const data = await orderService.getPendingCashOrders();
      return data.map((order: any) => {
        const isRefund = order.typeOrder === 1;
        let amount = 0;
        const transformedItems = order.items.map((item: any) => {
          const finalPrice = item.price || 0;
          const qty = item.quantity || 0;
          if (!isRefund) {
            amount += finalPrice * qty;
          }
          return {
            id: item.dishId.toString(),
            name: item.dishName,
            price: finalPrice,
            quantity: qty,
            originalPrice: item.originalPrice || finalPrice,
            discountAmount: item.discountAmount,
            promotionName: item.promotionName,
            subTotal: item.subTotal,
          };
        });

        const finalAmount = isRefund
          ? order.finalAmount
          : amount - (order.promotionDiscount || 0);

        return {
          id: order.id,
          phone: order.phone,
          amount: isRefund ? order.amount : amount,
          finalAmount: finalAmount,
          totalAmount: order.totalAmount,
          promotionDiscount: order.promotionDiscount,
          promotionName: order.promotionName,
          status: order.status,
          type: order.type,
          tableName: order.tableName,
          originalOrderCode: order.originalOrderCode,
          paymentProofUrl: order.paymentProofUrl,
          items: transformedItems,
        };
      });
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'order/updateOrderStatus',
  async (
    { orderId, newStatus }: { orderId: string; newStatus: number },
    { rejectWithValue }
  ) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      return { orderId, newStatus };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const confirmCashOrder = createAsyncThunk(
  'order/confirmCashOrder',
  async (orderId: string, { rejectWithValue }) => {
    try {
      await orderService.confirmCashOrder(orderId);
      return orderId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const confirmPickupTime = createAsyncThunk(
  'order/confirmPickupTime',
  async (
    { orderId, confirmedPickupAt }: { orderId: string; confirmedPickupAt: string },
    { rejectWithValue }
  ) => {
    try {
      await orderService.confirmPickupTime(orderId, confirmedPickupAt);
      return { orderId, confirmedPickupAt };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<Order>) => {
      const order = action.payload;
      const exists = state.orders.some(o => o.id === order.id);
      if (exists) return;
      state.orders = [...state.orders, order];
      increaseUnread(state, order);
    },
    updateOrderStatusLocal: (
      state,
      action: PayloadAction<{ id: string; status: number }>
    ) => {
      const { id, status } = action.payload;
      state.orders = state.orders.map(order => {
        if (order.id === id) {
          if (order.status !== status) {
            increaseUnread(state, { ...order, status });
          }
          return {
            ...order,
            status,
          };
        }
        return order;
      });
    },
    clearUnreadByStatus: (state, action: PayloadAction<number>) => {
      const status = action.payload;
      if (status === -1) {
        state.unread = { all: 0, 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
      } else {
        const s = status as 0 | 1 | 2 | 3 | 4;
        if (state.unread[s] !== undefined) {
          state.unread[s] = 0;
        }
      }
    },
    forceRefresh: (state) => {
      state.refreshCount = (state.refreshCount + 1) % 1000000;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchActiveOrders.pending, state => {
        state.loading = true;
      })
      .addCase(fetchActiveOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.unread = { all: 0, 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
        action.payload.forEach(order => {
          increaseUnread(state, order);
        });
      })
      .addCase(fetchActiveOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPendingCashOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(confirmCashOrder.fulfilled, (state, action) => {
        const orderId = action.payload;
        state.orders = state.orders.map(order =>
          order.id === orderId ? { ...order, status: 1 } : order,
        );
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const { orderId, newStatus } = action.payload;
        state.orders = state.orders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order,
        );
      })
      .addCase(confirmPickupTime.fulfilled, (state, action) => {
        const { orderId, confirmedPickupAt } = action.payload;
        state.orders = state.orders.map(order =>
          order.id === orderId ? { ...order, confirmedPickupAt } : order,
        );
      });
  },
});

export const {
  addOrder,
  updateOrderStatusLocal,
  clearUnreadByStatus,
  forceRefresh,
} = orderSlice.actions;

export default orderSlice.reducer;