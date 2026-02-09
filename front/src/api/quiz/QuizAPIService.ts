import axios from "axios";
import type { QuizResponse } from "../../types/Quiz/QuizResponse";
import type { IQuizAPIService } from "./IQuizAPIService";
import type { QuizPreview } from "../../types/Quiz/QuizPreview";
import type { QuizDTO } from "../../models/quizes/QuizDTO";
import type { QuizToAccept } from "../../types/Quiz/QuizApproval";
import type { ModeratorQuiz } from "../../types/Quiz/ModeratorQuiz";

const API_URL:string = import.meta.env.VITE_QUIZ_API_URL;
console.log(API_URL);

export const QuizAPI : IQuizAPIService = {
    async createQuiz(token : string,
                     quizName: string,
                     questions: string[],
                     answers: string[][],
                     points: number[],
                     correctAnswers: string[],
                     duration: number): 
    Promise<QuizResponse>{
        try{
            const answer = await axios.post<QuizResponse>(`${API_URL}/quiz`, 
                {quizName: quizName, questions: questions, answers: answers, correctAnswers: correctAnswers, points: points, duration: duration}, 
                {headers : {Authorization : `Bearer ${token}`,
                 "Content-Type": "application/json"},
                 withCredentials: true});
            return(answer.data);
            }
        catch(error){
            let message = "Quiz error";
            if(axios.isAxiosError(error)){
                message = error.response?.data?.message || message;
            }
            return{
                success: false,
                message: message
            };
        }
    },
    async getPendingQuizes(token: string): Promise<QuizToAccept[]> {
        try{
            const answer = await axios.get<QuizToAccept[]>(
                `${API_URL}/admin/quizes/pending`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                }
            );
            return answer.data;
        }catch{
            return [];
        }
    },
    async getModeratorQuizes(token: string): Promise<ModeratorQuiz[]> {
        try{
            const answer = await axios.get<ModeratorQuiz[]>(
                `${API_URL}/moderator/quizes`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                }
            );
            return answer.data;
        }catch{
            return [];
        }
    },
    async updateQuiz(token: string, id:number, quiz: QuizDTO){
        const res = await axios.put(`${API_URL}/moderator/quiz/${id}`, quiz, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },
    async startQuiz(token: string, id: number): Promise<QuizDTO>{
        try{
            const answer = await axios.post<QuizDTO>(`${API_URL}/quiz/${id}/start`, 
                {},
                {headers : {Authorization: `Bearer ${token}`,
                 "Content-Type": "application/json"},
                 withCredentials: true});
            return answer.data;
        }catch{
            return{
                id: 0,
                quizName: "",
                questions: [],
                answers: [],
                points: [],
                correctAnswers: [],
                duration: 0,
                author: ""
            }
        }
    },
    async submitQuiz(token: string, id: number, answers: string[], duration: number): Promise<QuizResponse>{
        try{
            const answer = await axios.post<QuizResponse>(`${API_URL}/quiz/${id}/submit`, 
                {answers: answers, spentTime: duration}, 
                {headers: {Authorization: `Bearer ${token}`,
                 "Content-Type": "application/json"},
                 withCredentials: true});
            return answer.data;
        }catch{
            return{
                success: false,
                message: "ERROR"
            }
        }
    },
    async getAllQuizes(token: string): Promise<QuizPreview[]>{
        try{
            const answer = await axios.get<QuizPreview[]>(`${API_URL}/quiz`, 
                {headers: {Authorization: `Bearer ${token}`},
                 withCredentials: true});
            
            return answer.data;
        }catch{
            return [];
        }
    },
    async rejectQuiz(token: string, id: number, message: string): Promise<QuizResponse> {
        try{
            const answer = await axios.put<QuizResponse>(`${API_URL}/admin/quiz/${id}/reject`,
                {reason: message},
                {headers: {Authorization: `Bearer ${token}`}});
            return answer.data;
        }catch{
            return{
                success: false,
                message: "ERROR"
            }
        }        

    },

    async approveQuiz(token: string, id: number): Promise<QuizResponse>{
        try{
            const answer = await axios.put<QuizResponse>(`${API_URL}/admin/quiz/${id}/approve`,
                {},
                {headers: {Authorization: `Bearer ${token}`}});
            return answer.data;
        }catch{
            return{
                success: false,
                message: "ERROR"
            }
        }
    }
}