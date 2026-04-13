import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { shiftService } from '@/services/logicServices/shiftService';
import { ShiftState } from '@/type';

const initialState: ShiftState = {
  currentShift: null,
  currentShiftId: null,
  loading: false,
  error: null,
};

// 🔥 check-in
export const checkInShift = createAsyncThunk(
  'shift/checkInShift',
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await shiftService.checkIn(payload);

      // 🔥 FIX: đảm bảo luôn trả về shift object
      return res?.data || res;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// 🔥 load current shift
export const fetchCurrentShift = createAsyncThunk(
  'shift/fetchCurrentShift',
  async (_, { rejectWithValue }) => {
    try {
      const res = await shiftService.getCurrentShift();

      // 🔥 FIX: unwrap data
      return res?.data || res;
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
    },

    // 🔥 realtime update
    setShift: (state, action) => {
      state.currentShift = action.payload
        ? { ...action.payload } // 🔥 clone để force re-render
        : null;

      state.currentShiftId = action.payload?.id || null;
    },
  },

  extraReducers: (builder) => {
    builder
      // ================= CHECK IN =================
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

      // ================= LOAD CURRENT SHIFT =================
      .addCase(fetchCurrentShift.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentShift.fulfilled, (state, action) => {
        state.loading = false;
        const shift = action.payload?.data || action.payload;

        // Nếu API trả về null hoặc undefined (không có ca) thì reset
        state.currentShift = shift ? { ...shift } : null;
        state.currentShiftId = shift?.id || null;
      })
      .addCase(fetchCurrentShift.rejected, (state) => {
        state.loading = false;
        // Không có ca làm hiện tại → reset về null
        state.currentShift = null;
        state.currentShiftId = null;
      });
  },
});

export const { clearShift, setShift } = shiftSlice.actions;
export default shiftSlice.reducer;