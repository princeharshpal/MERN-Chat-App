import axiosInstance from "../lib/axios";

const getFriends = async () => {
  const response = await axiosInstance.get("/connections/friends");
  return response.data;
};

const getRequests = async () => {
  const response = await axiosInstance.get("/connections/pending");
  return response.data;
};

const sendRequest = async (recipientId: string) => {
  const response = await axiosInstance.post("/connections/request", {
    recipientId,
  });
  return response.data;
};

const respondToRequest = async ({
  connectionId,
  status,
}: {
  connectionId: string;
  status: string;
}) => {
  const response = await axiosInstance.post("/connections/respond", {
    connectionId,
    status,
  });
  return response.data;
};

const getPossibleConnections = async () => {
  const response = await axiosInstance.get("/connections/possible");
  return response.data;
};

export {
  getFriends,
  getRequests,
  sendRequest,
  respondToRequest,
  getPossibleConnections,
};
