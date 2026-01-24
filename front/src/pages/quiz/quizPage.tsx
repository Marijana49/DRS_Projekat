import { useNavigate } from "react-router-dom";
import type { IQuizAPIService } from "../../api/quiz/IQuizAPIService";
import { useAuth } from "../../hooks/useAuthHook";
import { useEffect } from "react";
import Quiz from "../../components/quiz/Quiz";

interface QuizPageProps{
    quizAPI: IQuizAPIService;
}

export default function QuizPage({quizAPI}: QuizPageProps){
    const {token, isAuthenticated, logout} = useAuth();
    const navigate = useNavigate();

    useEffect(()=>{
        if(!isAuthenticated || !token){
            logout();
            navigate("login");
        }
    }, [isAuthenticated, logout, navigate]);

    return(
        <main>

            <Quiz quizAPI = {quizAPI}/>
        </main>
    )
}