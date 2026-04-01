import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ConnectionState {
  friends: any[];
  pendingRequests: any[];
  possibleConnections: any[];
}

const initialState: ConnectionState = {
  friends: [],
  pendingRequests: [],
  possibleConnections: [],
};

const connectionSlice = createSlice({
  name: "connection",
  initialState,
  reducers: {
    setFriends: (state, action: PayloadAction<any[]>) => {
      state.friends = action.payload;
    },
    setPendingRequests: (state, action: PayloadAction<any[]>) => {
      state.pendingRequests = action.payload;
    },
    setPossibleConnections: (state, action: PayloadAction<any[]>) => {
      state.possibleConnections = action.payload;
    },
    updateFriendRequests: (state, action: PayloadAction<any[]>) => {
      state.pendingRequests = action.payload;
    },
  },
});

export const {
  setFriends,
  setPendingRequests,
  setPossibleConnections,
  updateFriendRequests,
} = connectionSlice.actions;
export default connectionSlice.reducer;
