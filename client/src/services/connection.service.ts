import axiosInstance from "../lib/axios";

export const getFriends = async () => {
  const response = await axiosInstance.get("/connections");
  return response.data;
};

export const getPendingRequests = async () => {
  const response = await axiosInstance.get("/connections/pending");
  return response.data;
};

export const sendRequest = async (recipientId: string) => {
  const response = await axiosInstance.post("/connections", { recipientId });
  return response.data;
};

export const respondToRequest = async (
  id: string,
  status: "accepted" | "rejected",
) => {
  const response = await axiosInstance.patch(`/connections/${id}`, { status });
  return response.data;
};

export const getPossibleConnections = async () => {
  const response = await axiosInstance.get("/connections/possible");
  return response.data;
};
