import { useContext } from "react";
import { SocketContext } from "../contexts/socket/SocketContext";
import type { SocketContextType } from "../types/socket/SocketContext";

 
export const useSocket = () : SocketContextType => {
  const context = useContext(SocketContext);
 
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider.");
  }
 
  return context;
}