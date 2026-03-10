import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { shiftService } from '../../services/logicServices/shiftService';

interface ShiftState {
  currentShift: any | null;
  currentShiftId: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: ShiftState = {
  currentShift: null,
  currentShiftId: null,
  loading: false,
  error: null,
};

export const checkInShift = createAsyncThunk(
  'shift/checkInShift',
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await shiftService.checkIn(payload);
      console.log('checkInShift - response from shiftService:', res);
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const shiftSlice = createSlice({
  name: 'shift',
  initialState,
  reducers: {
    clearShift: (state) => {
      state.currentShift = null;
      state.currentShiftId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkInShift.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkInShift.fulfilled, (state, action) => {
        state.loading = false;

        state.currentShift = action.payload;
        state.currentShiftId = action.payload.id;
      })
      .addCase(checkInShift.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearShift } = shiftSlice.actions;

export default shiftSlice.reducer;