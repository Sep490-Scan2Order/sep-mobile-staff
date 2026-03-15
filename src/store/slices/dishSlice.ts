import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dishService } from '../../services/logicServices/dishService';

export interface Dish {
  id: number;
  restaurantName: string;
  dishName: string;
  dishImageUrl: string;
  isSelling: boolean;
  price: number;
  isSoldOut: boolean;
  discountedPrice?: number;
  promotionName?: string | null;
  promotionLabel?: string | null;
  hasPromotion?: boolean;
}

interface DishState {
  dishes: Dish[];
  loading: boolean;
  error: string | null;
}

const initialState: DishState = {
  dishes: [],
  loading: false,
  error: null,
};

interface TogglePayload {
  restaurantId: number;
  id: number;
  isSoldOut: boolean;
  quantity: number;
}


export const toggleSoldOutThunk = createAsyncThunk(
  'dish/toggleSoldOut',
  async (
    { restaurantId, id, isSoldOut, quantity }: TogglePayload,
    { rejectWithValue }
  ) => {
    try {
      await dishService.toggleSoldOut(
        restaurantId,
        id,
        isSoldOut,
        quantity
      );

      return { id, isSoldOut };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Toggle failed'
      );
    }
  }
);

export const fetchDishesByRestaurant = createAsyncThunk(
  'dish/fetchByRestaurant',
  async (restaurantId: number, { rejectWithValue }) => {
    try {
      return await dishService.getBranchDishes(restaurantId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);


const dishSlice = createSlice({
  name: 'dish',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder

      .addCase(fetchDishesByRestaurant.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDishesByRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        state.dishes = action.payload;
      })
      .addCase(fetchDishesByRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(toggleSoldOutThunk.pending, state => {
        state.loading = true;
      })
      .addCase(toggleSoldOutThunk.fulfilled, (state, action) => {
        state.loading = false;

        const { id, isSoldOut } = action.payload;

        const dish = state.dishes.find(d => d.id === id);
        if (dish) {
          dish.isSoldOut = isSoldOut;
        }
      })
      .addCase(toggleSoldOutThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default dishSlice.reducer;