import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

let socket: Socket | null = null;

export const getSocket = (): Socket | null => socket;

export const connectSocket = (userId: string): Socket => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    query: { userId },
  });

  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket?.id);
  });

  socket.on("disconnect", () => {
    console.log("[Socket] Disconnected");
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
