import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isCheckingAuth: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
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
  },
});

export const { setAuth, logoutSuccess, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;
