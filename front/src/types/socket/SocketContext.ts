import type { Socket } from "socket.io-client";

export type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  isLoading: boolean;
};