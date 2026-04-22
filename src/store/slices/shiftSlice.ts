import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { shiftService } from '@/services/logicServices/shiftService';
import { ShiftState } from '@/type';
const initialState: ShiftState = {
  currentShift: null,
  currentShiftId: null,
  pendingReport: null,
  loading: false,
  error: null,
  hasFetchedStatus: false,
};
export const checkInShift = createAsyncThunk(
  'shift/checkInShift',
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await shiftService.checkIn(payload);
      return res?.data || res;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
export const fetchCurrentShift = createAsyncThunk(
  'shift/fetchCurrentShift',
  async (_, { rejectWithValue }) => {
    try {
      const res = await shiftService.getCurrentShift();
      return res?.data || res;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
export const fetchPendingReport = createAsyncThunk(
  'shift/fetchPendingReport',
  async (_, { rejectWithValue }) => {
    try {
      const report = await shiftService.getPendingReport();
      return report;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
const shiftSlice = createSlice({
  name: 'shift',
  initialState,
  reducers: {
    clearShift: (state) => {
      state.currentShift = null;
      state.currentShiftId = null;
      state.hasFetchedStatus = false;
      state.pendingReport = null;
    },
    setShift: (state, action) => {
      state.currentShift = action.payload
        ? { ...action.payload } 
        : null;
      state.currentShiftId = action.payload?.id || null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkInShift.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkInShift.fulfilled, (state, action) => {
        state.loading = false;
        const shift = action.payload?.data || action.payload;
        state.currentShift = shift ? { ...shift } : null;
        state.currentShiftId = shift?.id || null;
      })
      .addCase(checkInShift.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCurrentShift.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentShift.fulfilled, (state, action) => {
        state.loading = false;
        state.hasFetchedStatus = true;
        const shift = action.payload?.data || action.payload;
        state.currentShift = shift ? { ...shift } : null;
        state.currentShiftId = shift?.id || null;
      })
      .addCase(fetchCurrentShift.rejected, (state) => {
        state.loading = false;
        state.hasFetchedStatus = true;
        state.currentShift = null;
        state.currentShiftId = null;
      })
      .addCase(fetchPendingReport.fulfilled, (state, action) => {
        state.pendingReport = action.payload;
      });
  },
});
export const { clearShift, setShift } = shiftSlice.actions;
export default shiftSlice.reducer;