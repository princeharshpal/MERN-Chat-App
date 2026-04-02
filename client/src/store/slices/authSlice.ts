import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  onlineUsers: string[];
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isCheckingAuth: true,
  onlineUsers: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<any>) => {
      const payload = action.payload?.data || action.payload;
      state.user = payload;
      state.isAuthenticated = !!payload;
      state.isCheckingAuth = false;
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isCheckingAuth = false;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isCheckingAuth = action.payload;
    },
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload;
    },
  },
});

export const { setAuth, logoutSuccess, setAuthLoading, setOnlineUsers } =
  authSlice.actions;
export default authSlice.reducer;
