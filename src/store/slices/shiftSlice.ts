import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { shiftService } from '@/services/logicServices/shiftService';
import { ShiftState } from '@/type';
const initialState: ShiftState = {
  currentShift: null,
  currentShiftId: null,
  pendingReports: [],
  staffShifts: [],
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
export const fetchPendingReports = createAsyncThunk(
  'shift/fetchPendingReports',
  async (_, { rejectWithValue }) => {
    try {
      const reports = await shiftService.getPendingReports();
      return reports;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
export const fetchStaffShifts = createAsyncThunk(
  'shift/fetchStaffShifts',
  async (cashierShiftId: number, { rejectWithValue }) => {
    try {
      const data = await shiftService.getStaffShifts(cashierShiftId);
      return data;
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
      state.pendingReports = [];
      state.staffShifts = [];
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
      .addCase(fetchPendingReports.fulfilled, (state, action) => {
        state.pendingReports = action.payload || [];
      })
      .addCase(fetchStaffShifts.fulfilled, (state, action) => {
        const raw = action.payload?.data ?? action.payload;
        state.staffShifts = Array.isArray(raw) ? raw : (raw?.items ?? []);
      });
  },
});
export const { clearShift, setShift } = shiftSlice.actions;
export default shiftSlice.reducer;