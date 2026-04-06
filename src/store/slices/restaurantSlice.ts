import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { restaurantService } from '@/services/logicServices/restaurantService';
import { RestaurantState } from '@/type';

const initialState: RestaurantState = {
  restaurant: null,
  loading: false,
  error: null,
};

// ================== API ==================

export const fetchRestaurantById = createAsyncThunk(
  'restaurant/fetchById',
  async (restaurantId: number, { rejectWithValue }) => {
    try {
      return await restaurantService.getRestaurantById(restaurantId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleReceivingOrders = createAsyncThunk(
  'restaurant/toggleReceivingOrders',
  async (
    { restaurantId, isReceiving }: { restaurantId: number; isReceiving: boolean },
    { rejectWithValue }
  ) => {
    try {
      await restaurantService.updateReceivingOrders(
        restaurantId,
        isReceiving
      );

      return { isReceiving };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleOpeningStatus = createAsyncThunk(
  'restaurant/toggleOpeningStatus',
  async (
    { restaurantId, isOpened }: { restaurantId: number; isOpened: boolean },
    { rejectWithValue }
  ) => {
    try {
      await restaurantService.updateOpeningStatus(restaurantId, isOpened);
      return { isOpened };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// ================== SLICE ==================

const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState,
  reducers: {
    // ✅ 🔥 realtime update
    updateReceivingOrdersLocal: (state, action) => {
      if (state.restaurant) {
        state.restaurant.isReceivingOrders = action.payload;
      }
    },
    updateOpeningStatusLocal: (state, action) => {
      if (state.restaurant) {
        state.restaurant.isOpened = action.payload;
        if (!action.payload) {
          state.restaurant.isReceivingOrders = false;
        }
      }
    },
  },
  extraReducers: builder => {
    builder
      // fetch
      .addCase(fetchRestaurantById.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurantById.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurant = action.payload;
      })
      .addCase(fetchRestaurantById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // toggle
      .addCase(toggleReceivingOrders.pending, state => {
        state.loading = true;
      })
      .addCase(toggleReceivingOrders.fulfilled, (state, action) => {
        state.loading = false;

        // ⚠️ vẫn update để tránh delay nếu SignalR chậm
        if (state.restaurant) {
          state.restaurant.isReceivingOrders = action.payload.isReceiving;
        }
      })
      .addCase(toggleReceivingOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // toggle opening
      .addCase(toggleOpeningStatus.pending, state => {
        state.loading = true;
      })
      .addCase(toggleOpeningStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (state.restaurant) {
          state.restaurant.isOpened = action.payload.isOpened;
          if (!action.payload.isOpened) {
            state.restaurant.isReceivingOrders = false;
          }
        }
      })
      .addCase(toggleOpeningStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateReceivingOrdersLocal } = restaurantSlice.actions;

export default restaurantSlice.reducer;