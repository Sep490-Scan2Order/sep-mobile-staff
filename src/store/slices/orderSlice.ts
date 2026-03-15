import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { orderService } from '../../services/logicServices/orderService';

/* ================================
TYPES
================================ */

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;

  originalPrice?: number;
  discountAmount?: number;
  promotionName?: string;
  subTotal?: number;
  image?: string;
}

export interface Order {
  id: string;
  phone: string;
  orderCode: number;
  createdAt: string;
  amount: number;
  status: number;
  items: OrderItem[];
}

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refreshCount: number;

  unread: {
    all: number;
    0: number;
    1: number;
    2: number;
    3: number;
    4: number;
  };
}

/* ================================
INITIAL STATE
================================ */

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

/* ================================
HELPER
================================ */

const increaseUnread = (state: OrderState, status: number) => {
  state.unread.all += 1;

  if (state.unread[status as 0 | 1 | 2 | 3 | 4] !== undefined) {
    state.unread[status as 0 | 1 | 2 | 3 | 4] += 1;
  }
};

/* ================================
THUNKS
================================ */

export const fetchActiveOrders = createAsyncThunk<Order[], number>(
  'order/fetchActiveOrders',
  async (restaurantId, { rejectWithValue }) => {
    try {
      return await orderService.getActiveOrders(restaurantId);
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

      return data.map((order: any) => ({
        id: order.id,
        phone: order.phone,
        orderCode: order.orderCode,
        createdAt: order.createdAt,
        amount: order.amount,
        status: order.status,
        items: order.items.map((item: any) => ({
          id: item.dishId.toString(),
          name: item.dishName,
          price: item.price,
          quantity: item.quantity,
          originalPrice: item.originalPrice,
          discountAmount: item.discountAmount,
          promotionName: item.promotionName,
          subTotal: item.subTotal,
        })),
      }));
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

/* ================================
SLICE
================================ */

const orderSlice = createSlice({
  name: 'order',
  initialState,

  reducers: {

    /* =========================
    RECEIVE ORDER REALTIME
    ========================= */

    addOrder: (state, action: PayloadAction<Order>) => {
      const order = action.payload;

      const exists = state.orders.some(o => o.id === order.id);
      if (exists) return;

      state.orders = [...state.orders, order];

      increaseUnread(state, order.status);
    },

    /* =========================
    UPDATE STATUS REALTIME
    ========================= */

    updateOrderStatusLocal: (
      state,
      action: PayloadAction<{ id: string; status: number }>
    ) => {
      const { id, status } = action.payload;

      state.orders = state.orders.map(order => {
        if (order.id === id) {
          if (order.status !== status) {
            increaseUnread(state, status);
          }
console.log("OLD:", order.status, "NEW:", status);
          return {
            ...order,
            status,
          };
        }

        return order;
      });
    },

    /* =========================
    CLEAR BADGE
    ========================= */

    clearUnreadByStatus: (state, action: PayloadAction<number>) => {
      const status = action.payload;

      if (status === -1) {
        state.unread = { all: 0, 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
      } else {
        if (state.unread[status as 0 | 1 | 2 | 3 | 4] !== undefined) {
          state.unread[status as 0 | 1 | 2 | 3 | 4] = 0;
        }
      }
    },

    /* =========================
    FORCE REFRESH WITHOUT API
    ========================= */

    forceRefresh: (state) => {
      // Increment counter để trigger re-render
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

        const existingIds = new Set(state.orders.map(o => o.id));

        const merged = [
          ...state.orders,
          ...action.payload.filter(o => !existingIds.has(o.id)),
        ];

        state.orders = merged;

        state.unread = { all: 0, 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };

        merged.forEach(order => {
          increaseUnread(state, order.status);
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

        state.orders = state.orders.filter(order => order.id !== orderId);
      })

      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const { orderId, newStatus } = action.payload;

        state.orders = state.orders.map(order =>
          order.id === orderId
            ? { ...order, status: newStatus }
            : order
        );
      });
  },
});

/* ================================
EXPORTS
================================ */

export const {
  addOrder,
  updateOrderStatusLocal,
  clearUnreadByStatus,
  forceRefresh,
} = orderSlice.actions;

export default orderSlice.reducer;