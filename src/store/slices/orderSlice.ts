import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { orderService } from '../../services/logicServices/orderService';

/* ================================
   TYPES
================================ */

/** Item trong một order */
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

/** Order hiển thị trong KDS */
export interface Order {
  id: string;
  phone: string;
  orderCode: number;
  createdAt: string;
  amount: number;
  status: number;
  items: OrderItem[];
}

/** State quản lý orders trong Redux */
interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;

  /** badge unread cho từng trạng thái */
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
   HELPER FUNCTIONS
================================ */

/** tăng badge unread */
const increaseUnread = (state: OrderState, status: number) => {
  state.unread.all += 1;

  if (state.unread[status as 0 | 1 | 2 | 3 | 4] !== undefined) {
    state.unread[status as 0 | 1 | 2 | 3 | 4] += 1;
  }
};

/* ================================
   ASYNC THUNKS
================================ */

/**
 * Lấy danh sách order active của nhà hàng
 */
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

/**
 * Lấy danh sách order tiền mặt chưa thanh toán
 */
export const fetchPendingCashOrders = createAsyncThunk<Order[]>(
  'order/fetchPendingCashOrders',
  async (_, { rejectWithValue }) => {
    try {
      const data = await orderService.getPendingCashOrders();

      /** map dữ liệu API sang format Redux */
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

/**
 * Update trạng thái order (call API)
 */
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

/**
 * Xác nhận thanh toán tiền mặt
 */
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
    /**
     * Thêm order mới vào state
     * (dùng khi nhận realtime từ SignalR)
     */
   addOrder: (state, action: PayloadAction<Order>) => {
  const order = action.payload;

  const index = state.orders.findIndex(o => o.id === order.id);

  if (index !== -1) {
    // update order nếu đã tồn tại
    state.orders[index] = order;
    return;
  }

  // thêm order mới
  state.orders.unshift(order);

  increaseUnread(state, order.status);
},

    /**
     * Update status order realtime (SignalR)
     */
    updateOrderStatusLocal: (
      state,
      action: PayloadAction<{ id: string; status: number }>
    ) => {
      const order = state.orders.find(o => o.id === action.payload.id);
      if (!order) return;

      if (order.status !== action.payload.status) {
        order.status = action.payload.status;

        increaseUnread(state, action.payload.status);
      }
    },

    /**
     * Clear badge unread khi user click tab
     */
    clearUnreadByStatus: (state, action: PayloadAction<number>) => {
      const status = action.payload;

      if (status === -1) {
        // reset tất cả
        state.unread = { all: 0, 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
      } else {
        if (state.unread[status as 0 | 1 | 2 | 3 | 4] !== undefined) {
          state.unread[status as 0 | 1 | 2 | 3 | 4] = 0;
        }
      }
    },
  },

  extraReducers: builder => {
    builder

      /**
       * fetchActiveOrders - loading
       */
      .addCase(fetchActiveOrders.pending, state => {
        state.loading = true;
      })

      /**
       * fetchActiveOrders - success
       */
      .addCase(fetchActiveOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;

        // reset unread
        state.unread = { all: 0, 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };

        // tính lại unread
        action.payload.forEach(order => {
          increaseUnread(state, order.status);
        });
      })

      /**
       * fetchActiveOrders - error
       */
      .addCase(fetchActiveOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /**
       * fetchPendingCashOrders - success
       */
      .addCase(fetchPendingCashOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })

      /**
       * confirmCashOrder - remove order khỏi list
       */
      .addCase(confirmCashOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter(
          order => order.id !== action.payload
        );
      })

      /**
       * updateOrderStatus API success
       */
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const order = state.orders.find(
          o => o.id === action.payload.orderId
        );

        if (order) {
          order.status = action.payload.newStatus;
        }
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
} = orderSlice.actions;

export default orderSlice.reducer;