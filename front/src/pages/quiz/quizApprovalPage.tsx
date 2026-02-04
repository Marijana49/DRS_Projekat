import { useNavigate } from "react-router-dom";
import type { IQuizAPIService } from "../../api/quiz/IQuizAPIService";
import { useAuth } from "../../hooks/useAuthHook";
import { useEffect } from "react";
import ToolBar from "../../components/toolbar/ToolBar";
import QuizAccept from "../../components/socket/QuizAccept";

interface QuizApprovalPageProps{
    quizAPI: IQuizAPIService;
}

export default function QuizApprovalPage({quizAPI}: QuizApprovalPageProps){
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
            <QuizAccept quizAPI={quizAPI}/>
        </main>
    )
}