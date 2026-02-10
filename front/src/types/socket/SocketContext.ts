import type { Socket } from "socket.io-client";
import type { QuizPreview } from "../Quiz/QuizPreview";

export type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  isLoading: boolean;
  quizesToApprove: QuizPreview[];
  removeQuiz: (id: number) => void;
};