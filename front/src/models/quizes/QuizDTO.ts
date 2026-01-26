export interface QuizDTO {
    id: number;
    quizName: string; 
    questions: string[]; 
    answers: string[][];
    points: number[]; 
    correctAnswers:string[];
    duration: number; 
    author: string;
}