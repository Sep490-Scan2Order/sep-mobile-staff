import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { restaurantService } from '../../services/logicServices/restaurantService';

export interface Restaurant {
  id: number;
  tenantId: string;
  restaurantName: string;
  address: string;
  longitude: number;
  latitude: number;
  image: string;
  phone: string;
  slug: string;
  description: string;
  profileUrl: string;
  qrMenu: string;
  isActive: boolean;
  isOpened: boolean;
  isReceivingOrders: boolean;
  totalOrder: number;
  createdAt: string;
  distanceKm: number | null;
}

interface RestaurantState {
  restaurant: Restaurant | null;
  loading: boolean;
  error: string | null;
}

const initialState: RestaurantState = {
  restaurant: null,
  loading: false,
  error: null,
};

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
      const result = await restaurantService.updateReceivingOrders(
        restaurantId,
        isReceiving
      );

      return {
        restaurantId,
        isReceiving,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
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
      .addCase(toggleReceivingOrders.pending, state => {
        state.loading = true;
      })
      .addCase(toggleReceivingOrders.fulfilled, (state, action) => {
        state.loading = false;
        if (state.restaurant) {
          state.restaurant.isReceivingOrders = action.payload.isReceiving;
        }
      })
      .addCase(toggleReceivingOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default restaurantSlice.reducer;
