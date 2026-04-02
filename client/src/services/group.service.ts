import axiosInstance from "../lib/axios";

export const getGroups = async () => {
  const response = await axiosInstance.get("/groups");
  return response.data;
};

export const createGroup = async (data: {
  name: string;
  members: string[];
  groupIcon?: string;
  description?: string;
}) => {
  const response = await axiosInstance.post("/groups", data);
  return response.data;
};

export const getGroupById = async (id: string) => {
  const response = await axiosInstance.get(`/groups/${id}`);
  return response.data;
};

export const updateGroup = async (id: string, data: any) => {
  const response = await axiosInstance.put(`/groups/${id}`, data);
  return response.data;
};

export const partialUpdateGroup = async (id: string, data: any) => {
  const response = await axiosInstance.patch(`/groups/${id}`, data);
  return response.data;
};

export const deleteGroup = async (id: string) => {
  const response = await axiosInstance.delete(`/groups/${id}`);
  return response.data;
};

export const manageMembers = async (
  id: string,
  data: { memberId: string; action: "add" | "remove" },
) => {
  const response = await axiosInstance.post(`/groups/${id}/members`, data);
  return response.data;
};
