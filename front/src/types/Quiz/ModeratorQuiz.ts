export interface ModeratorQuiz {
    id: number;
    quizName: string; 
    questions: string[]; 
    answers: string[][];
    points: number[]; 
    correctAnswers:string[];
    duration: number; 
    author: string;
    status: "Pending" | "Approved" | "Rejected";
    rejectReason?: string | null;
}