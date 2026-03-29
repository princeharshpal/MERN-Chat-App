import { apiClient } from "./apiClient";
import { PendingRequest, User } from "../providers/AuthProvider";

interface FriendResponse {
  success: boolean;
  friends: User[];
}

interface PendingResponse {
  success: boolean;
  requests: PendingRequest[];
}

interface SearchResponse {
  success: boolean;
  users: Array<User & { isFriend: boolean; pendingRequest: boolean }>;
}

export const requestService = {
  getFriends: async () => {
    const res = await apiClient.get<FriendResponse>("/requests/friends");
    return res.data;
  },

  getPendingRequests: async () => {
    const res = await apiClient.get<PendingResponse>("/requests/pending");
    return res.data;
  },

  searchUsers: async (name: string) => {
    const res = await apiClient.get<SearchResponse>(
      `/requests/search?name=${name}`,
    );
    return res.data;
  },

  sendRequest: async (receiverId: string) => {
    const res = await apiClient.post<{ success: boolean }>("/requests/send", {
      receiverId,
    });
    return res.data;
  },

  acceptRequest: async (requestId: string) => {
    const res = await apiClient.put<{ success: boolean }>(
      `/requests/accept/${requestId}`,
    );
    return res.data;
  },
};
