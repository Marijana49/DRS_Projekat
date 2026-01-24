import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuthHook";
import { useEffect } from "react";
import { QuizList } from "../../components/quiz/QuizList";
import type { IQuizAPIService } from "../../api/quiz/IQuizAPIService";
import ToolBar from "../../components/toolbar/ToolBar";

interface QuizListPageProps{
    quizAPI: IQuizAPIService;
}

export default function QuizListPage({ quizAPI} : QuizListPageProps){
    const { token, isAuthenticated, logout} = useAuth();
    const navigate = useNavigate();

    useEffect(()=>{
        if(!isAuthenticated || !token){
            logout();
            navigate("/login");
        }
    }, [isAuthenticated, logout, navigate]);

    return (
        <main className="">
            <div className="max-h-10">
                <ToolBar/>
            </div>
            <QuizList quizAPI = {quizAPI}/>
        </main>
    )
}