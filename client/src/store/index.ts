import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import connectionReducer from "./slices/connectionSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    connection: connectionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
