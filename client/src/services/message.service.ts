import axiosInstance from "../lib/axios";

const getMessages = async (userId: string) => {
  const response = await axiosInstance.get(`/messages/${userId}`);
  return response.data;
};

const sendMessage = async (
  userId: string,
  data: { text: string; image?: string },
) => {
  const response = await axiosInstance.post(`/messages/send/${userId}`, data);
  return response.data;
};

export { getMessages, sendMessage };
