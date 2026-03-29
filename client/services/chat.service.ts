import { apiClient } from "./apiClient";

export interface Chat {
  _id: string;
  name: string;
  avatar: string[];
  members: string[];
  groupChat: boolean;
  lastMessage: string;
}

export const chatService = {
  getMyChats: async () => {
    const res = await apiClient.get<{ success: boolean; chats: Chat[] }>("/chats/my-chats");
    return res.data;
  },

  getOrCreateChat: async (userId: string) => {
    const res = await apiClient.post<{ success: boolean; chat: Chat }>("/chats/new-chat", { userId });
    return res.data;
  }
};
