import { useEffect } from "react";
import QuizResult from "../../components/quiz/QuizResults";
import ToolBar from "../../components/toolbar/ToolBar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuthHook";
import type { IQuizAPIService } from "../../api/quiz/IQuizAPIService";

interface QuizResultPageProps{
    quizAPI: IQuizAPIService;
}

export default function QuizResultPage({quizAPI}: QuizResultPageProps){
    const {token, isAuthenticated, logout} = useAuth();
    const navigate = useNavigate();

    useEffect(()=>{
        if(!isAuthenticated || !token){
            logout();
            navigate("/login");
        }
    }, [isAuthenticated, logout, navigate]);

    return(
        <main>
            <div className="max-h-10">
                <ToolBar/>
            </div>
            <QuizResult quizAPI={quizAPI}/>
        </main>
    )
}