export interface ModeratorQuiz {
    quizId: number;
    quizName: string; 
    questions: string[]; 
    answers: string[][];
    points: number[]; 
    correctAnswers:string[];
    quizDuration: number; 
    quizAuthor: string;
    status: number; // 1-pending, 2-approved, 3-rejected
    rejectReason?: string | null;
}