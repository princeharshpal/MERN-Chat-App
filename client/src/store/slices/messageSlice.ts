import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Message {
  _id: string;
  tempId?: string;
  senderId: string;
  receiverId: string;
  text?: string;
  image?: string;
  isSeen: boolean;
  seenAt?: string;
  isEdited?: boolean;
  createdAt: string;
  updatedAt: string;
  reactions?: { userId: string; emoji: string }[];
  replyTo?: any;
}

interface MessageState {
  messages: Message[];
  isLoading: boolean;
}

const initialState: MessageState = {
  messages: [],
  isLoading: false,
};

const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
      state.isLoading = false;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const exists = state.messages.some((m) => m._id === action.payload._id);
      if (!exists) {
        state.messages.push(action.payload);
      }
    },
    updateMessage: (
      state,
      action: PayloadAction<{
        messageId: string;
        text: string;
        isEdited: boolean;
        newId?: string;
      }>,
    ) => {
      const { messageId, text, isEdited, newId } = action.payload;
      const index = state.messages.findIndex((m) => m._id === messageId);
      if (index !== -1) {
        state.messages[index].text = text;
        state.messages[index].isEdited = isEdited;
        if (newId) state.messages[index]._id = newId;
      }
    },
    deleteMessage: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter((m) => m._id !== action.payload);
    },
    updateReactions: (
      state,
      action: PayloadAction<{
        messageId: string;
        userId: string;
        emoji: string;
      }>,
    ) => {
      const { messageId, userId, emoji } = action.payload;
      const message = state.messages.find((m) => m._id === messageId);
      if (message) {
        if (!message.reactions) message.reactions = [];
        const index = message.reactions.findIndex((r) => r.userId === userId);
        if (index !== -1) {
          if (message.reactions[index].emoji === emoji) {
            message.reactions.splice(index, 1);
          } else {
            message.reactions[index].emoji = emoji;
          }
        } else {
          message.reactions.push({ userId, emoji });
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const {
  setMessages,
  addMessage,
  updateMessage,
  deleteMessage,
  updateReactions,
  setLoading,
  clearMessages,
} = messageSlice.actions;

export default messageSlice.reducer;
