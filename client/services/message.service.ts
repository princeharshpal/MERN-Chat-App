import { apiClient } from "./apiClient";

export interface Message {
  _id: string;
  sender: string;
  content: string;
  chat: string;
  createdAt: string;
}

export const messageService = {
  getMessages: async (chatId: string) => {
    const res = await apiClient.get<{ success: boolean; messages: Message[] }>(`/messages/chat/${chatId}`);
    return res.data;
  },

  sendMessage: async (chatId: string, content: string) => {
    const res = await apiClient.post<{ success: boolean; message: Message }>("/messages/send", { chatId, content });
    return res.data;
  }
};
