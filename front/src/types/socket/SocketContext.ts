import type { Socket } from "socket.io-client";
import type { QuizToAccept } from "../Quiz/QuizApproval";

export type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  isLoading: boolean;
  quizes: QuizToAccept[];
  removeQuiz: (id: number) => void;
};