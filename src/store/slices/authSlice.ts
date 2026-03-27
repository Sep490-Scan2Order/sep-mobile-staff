import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserInfo, AuthState } from '@/type';

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  userInfo: null,
  isAuthenticated: false,
};


const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    setUser: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        userInfo: UserInfo;
      }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.userInfo = action.payload.userInfo;
      state.isAuthenticated = true;
    },

    logout: state => {
      state.accessToken = null;
      state.refreshToken = null;
      state.userInfo = null;
      state.isAuthenticated = false;
    },
  },

  
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;