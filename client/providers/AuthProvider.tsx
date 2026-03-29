"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "@heroui/react";
import { apiClient } from "../services/apiClient";
import { authService } from "../services/auth.service";
import { requestService } from "../services/request.service";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export { apiClient };

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: { url: string };
  friends: string[];
}

export interface PendingRequest {
  _id: string;
  sender: User;
  status: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  socket: Socket | null;
  pendingRequests: PendingRequest[];
  isLoading: boolean;
  loginContext: (userData: User) => void;
  logoutContext: () => void;
  fetchPendingRequests: () => Promise<void>;
  acceptRequestInContext: (requestId: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  socket: null,
  pendingRequests: [],
  isLoading: true,
  loginContext: () => {},
  logoutContext: () => {},
  fetchPendingRequests: async () => {},
  acceptRequestInContext: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await authService.getProfile();
      if (data.success && data.user) {
        setUser(data.user);
        return data.user;
      }
    } catch (err) {
      console.log("No active session");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    if (!user) return;
    try {
      const data = await requestService.getPendingRequests();
      if (data.success) {
        setPendingRequests(data.requests);
      }
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  };

  const loginContext = (userData: User) => {
    setUser(userData);
  };

  const logoutContext = async () => {
    try {
      await authService.logout();
    } catch (err) {}
    setUser(null);
    setPendingRequests([]);
  };

  const acceptRequestInContext = (requestId: string) => {
    setPendingRequests((prev) => prev.filter((req) => req._id !== requestId));
  };

  
  useEffect(() => {
    fetchProfile();
  }, []);

  
  useEffect(() => {
    if (user) {
      
      const newSocket = io(BACKEND_URL, {
        query: { userId: user._id },
        withCredentials: true,
      });

      setSocket(newSocket);
      fetchPendingRequests();

      
      newSocket.on("NEW_REQUEST", (newReq: any) => {
        
        toast(`New friend request!`);
        fetchPendingRequests();
      });

      
      newSocket.on("REQUEST_ACCEPTED", (acceptedReq: any) => {
        toast.success(`A friend request was accepted!`);
        
        fetchProfile();
      });

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
    
  }, [user?._id]);

  return (
    <AuthContext.Provider
      value={{
        user,
        socket,
        pendingRequests,
        isLoading,
        loginContext,
        logoutContext,
        fetchPendingRequests,
        acceptRequestInContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
