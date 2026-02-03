import { createContext, useEffect, useState, type ReactNode } from "react";
import type { SocketContextType } from "../../types/socket/SocketContext";
import { io, Socket } from "socket.io-client";
 
export const SocketContext = createContext<SocketContextType | undefined>(undefined);
 
const ioServerUrl = import.meta.env.VITE_QUIZ_URL;
 
// Create socket connection without auto connecting to the server
function createSocketConnection() {
  return io(ioServerUrl, {
    autoConnect: false,
  });
}
 
export const SocketProvider: React.FC<{ children : ReactNode}> = ({children}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
 
  useEffect(() => {
    const newSocket = createSocketConnection();
 
    // Handles the socket connection event
    function handleConnect() {
      console.log("Socket connected", newSocket.id);
 
      setSocket(newSocket);
      setIsConnected(true);
      setIsLoading(false);
    }
 
    // Handles the socket disconnection event, i.e. if the connection is lost
    function handleDisconnect() {
      console.log("Socket disconnected");
 
      setIsConnected(false);
      setIsLoading(false);
    }
 
    // Handles the socket connection error event, e.g. the server is down
    function handleConnectError() {
      console.error("Socket connection error", Error);
 
      setIsLoading(false);
    }
 
    newSocket.on("connect", handleConnect);
    newSocket.on("disconnect", handleDisconnect);
    newSocket.on("connect_error", handleConnectError);
 
    // Connects to the server
    newSocket.connect();
 
    // Cleans up the event listeners and disconnects from the server
    return () => {
      newSocket.off("connect", handleConnect);
      newSocket.off("disconnect", handleDisconnect);
      newSocket.off("connect_error", handleConnectError);
      newSocket.disconnect();
    };
  }, []);
  
  const value : SocketContextType = {
    socket,
    isConnected,
    isLoading
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;