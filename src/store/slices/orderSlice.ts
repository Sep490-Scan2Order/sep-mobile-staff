import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { orderService } from '../../services/logicServices/orderService';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
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

  unread: {
    all: number;
    1: number;
    2: number;
    3: number;
  };
}

const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null,

  unread: {
    all: 0,
    1: 0,
    2: 0,
    3: 0,
  },
};

export const fetchActiveOrders = createAsyncThunk<Order[], number>(
  'order/fetchActiveOrders',
  async (restaurantId, { rejectWithValue }) => {
    try {
      const data = await orderService.getActiveOrders(restaurantId);
      return data;
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

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<Order>) => {
      const order = action.payload;

      state.orders.unshift(order);

      state.unread.all += 1;
      state.unread[order.status as 1 | 2 | 3] += 1;
    },

    updateOrderStatusLocal: (
      state,
      action: PayloadAction<{ id: string; status: number }>
    ) => {
      const index = state.orders.findIndex(o => o.id === action.payload.id);

      if (index !== -1) {
        const oldStatus = state.orders[index].status;
        const newStatus = action.payload.status;

        if (oldStatus !== newStatus) {
          state.orders[index].status = newStatus;

          state.unread.all += 1;
          state.unread[newStatus as 1 | 2 | 3] += 1;
        }
      }
    },

    clearUnreadByStatus: (state, action: PayloadAction<number>) => {
      const status = action.payload;

      if (status === -1) {
        state.unread = { all: 0, 1: 0, 2: 0, 3: 0 };
      } else {
        state.unread[status as 1 | 2 | 3] = 0;
      }
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
      })
      .addCase(fetchActiveOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(
          o => o.id === action.payload.orderId
        );

        if (index !== -1) {
          state.orders[index].status = action.payload.newStatus;
        }
      });
  },
});

export const {
  addOrder,
  updateOrderStatusLocal,
  clearUnreadByStatus,
} = orderSlice.actions;

export default orderSlice.reducer;