import { createContext, useEffect, useState, type ReactNode } from "react";
import type { SocketContextType } from "../../types/socket/SocketContext";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";
import type { QuizPreview } from "../../types/Quiz/QuizPreview";
 
export const SocketContext = createContext<SocketContextType | undefined>(undefined);
 
const ioServerUrl = import.meta.env.VITE_QUIZ_API_URL;

function createSocketConnection() {
  return io(ioServerUrl, {
    autoConnect: false,
  });
}
 
export const SocketProvider: React.FC<{ children : ReactNode}> = ({children}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quizes, setQuizes] = useState<QuizPreview[]>([]);
 
  useEffect(() => {
    const newSocket = createSocketConnection();

    function handleConnect() {
      console.log("Socket connected", newSocket.id);
      // setQuizes([]);
      setSocket(newSocket);
      setIsConnected(true);
      setIsLoading(false);
    }

    function handleDisconnect() {
      console.log("Socket disconnected");
 
      setIsConnected(false);
      setIsLoading(false);
    }

    function handleConnectError() {
      console.error("Socket connection error", Error);
 
      setIsLoading(false);
    }

    function handleQuiz(data: QuizPreview){
      toast("New quiz for approval")
      setQuizes(prev => [...prev, data]);
      setIsLoading(false);
    }
 
    newSocket.on("connect", handleConnect);
    newSocket.on("disconnect", handleDisconnect);
    newSocket.on("connect_error", handleConnectError);
    newSocket.on("new_quiz", handleQuiz);
    newSocket.connect();

    return () => {
      newSocket.off("connect", handleConnect);
      newSocket.off("disconnect", handleDisconnect);
      newSocket.off("connect_error", handleConnectError);
      newSocket.off("new_quiz", handleQuiz)
      newSocket.disconnect();
    };
  }, []);

  const removeQuiz = (id: number) => {
      setQuizes(prev => prev.filter(quiz => quiz.quizId !== id));
    };
  
  const value : SocketContextType = {
    socket,
    isConnected,
    isLoading,
    quizesToApprove: quizes,
    removeQuiz
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;