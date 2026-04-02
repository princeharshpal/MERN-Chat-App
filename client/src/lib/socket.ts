import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

let socket: Socket | null = null;

export const getSocket = (): Socket | null => socket;

export const connectSocket = (userId: string): Socket => {
  if (socket?.connected) return socket;

  const finalUrl = SOCKET_URL || window.location.origin.replace(":3000", ":5000");
  console.log("[Socket Debug] Attempting connection to:", finalUrl, "User:", userId);

  socket = io(finalUrl, {
    query: { userId },
    transports: ["websocket", "polling"],
    reconnection: true,
  });

  socket.on("connect", () => {
    console.log("[Socket Debug] Connected! Socket ID:", socket?.id);
  });

  socket.on("connect_error", (error) => {
    console.error("[Socket Debug] Connection failed:", error.message);
    console.error("[Socket Debug] Configured URL was:", SOCKET_URL);
  });

  socket.on("disconnect", (reason) => {
    console.warn("[Socket Debug] Disconnected:", reason);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
