import type { QuizDTO } from "../../models/quizes/QuizDTO";
import type { QuizResultDTO } from "../../models/quizes/QuizResultDTO";
import type { ModeratorQuiz } from "../../types/Quiz/ModeratorQuiz";
import type { QuizPreview } from "../../types/Quiz/QuizPreview";
import type { QuizResponse } from "../../types/Quiz/QuizResponse";

export interface IQuizAPIService {
    createQuiz(token: string,
               quizName: string,
               questions: string[],
               answers: string[][],
               points: number[],
               correctAnswers: string[],
               duration: number
    ): Promise<QuizResponse>;
    getAllQuizes(token: string): Promise<QuizPreview[]>;
    startQuiz(token: string, id: number): Promise<QuizDTO>;
    submitQuiz(token: string, id: number, answers: string[], duration: number): Promise<QuizResponse>;
    approveQuiz(token: string, id:number): Promise<QuizResponse>;
    rejectQuiz(toke: string, id:number, message:string): Promise<QuizResponse>;
    getPendingQuizes(token: string): Promise<QuizPreview[]>;
    getPendingQuiz(token: string, id: number): Promise<QuizDTO>;
    getModeratorQuizes(token: string): Promise<ModeratorQuiz[]>;
    updateQuiz(token: string, id:number, quiz: QuizDTO): Promise<QuizResponse>;
    deleteQuiz(token: string, id:number): Promise<QuizResponse>;
    getResults(token:string, id:number): Promise<QuizResultDTO[]>;
    getAllResults(token: string): Promise<QuizResponse>;
}