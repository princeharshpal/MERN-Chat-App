import axiosInstance from "../lib/axios";

export const getMessages = async (id: string) => {
  const response = await axiosInstance.get(`/messages/${id}`);
  return response.data;
};

export const editMessage = async (id: string, text: string) => {
  const response = await axiosInstance.patch(`/messages/${id}`, { text });
  return response.data;
};

export const unsendMessage = async (id: string) => {
  const response = await axiosInstance.delete(`/messages/${id}`);
  return response.data;
};

export const addReaction = async (id: string, emoji: string) => {
  const response = await axiosInstance.post(`/messages/${id}/react`, { emoji });
  return response.data;
};

export const getChatMeta = async () => {
  const response = await axiosInstance.get("/messages/chat-meta");
  return response.data;
};

export const getSidebarUsers = async () => {
  const response = await axiosInstance.get("/messages/users");
  return response.data;
};
