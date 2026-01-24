import axios from "axios";
import type { QuizResponse } from "../../types/Quiz/QuizResponse";
import type { IQuizAPIService } from "./IQuizAPIService";
import type { QuizPreview } from "../../types/Quiz/QuizPreview";
import type { QuizDTO } from "../../models/quizes/QuizDTO";

const API_URL:string = import.meta.env.VITE_API_URL; 

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
                {quizName: quizName, questions: questions, answers: answers, correctAnswers: correctAnswers, questionPoints: points, duration: duration}, 
                {headers : {Authorization : `Bearer ${token}`}});
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
    async startQuiz(token: string, id: number): Promise<QuizDTO>{
        try{
            const answer = await axios.post<QuizDTO>(`${API_URL}/quiz/${id}/start`, 
                {quiz_id: id},
                {headers : {Authorization: `Bearer ${token}`}});
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
    async submitQuiz(token: string, id: number): Promise<QuizResponse>{
        try{
            const answer = await axios.post<QuizResponse>(`${API_URL}/quiz/${id}/submit`, 
                {quiz_id: id}, 
                {headers: {Authorization: `Bearer ${token}`}});
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
                {headers: {Authorization: `Bearer ${token}`}});
            
            return answer.data;
        }catch{
            return [];
        }
    }
}