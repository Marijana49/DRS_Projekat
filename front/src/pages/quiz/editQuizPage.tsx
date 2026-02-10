import { useNavigate } from "react-router-dom";
import type { IQuizAPIService } from "../../api/quiz/IQuizAPIService";
import { useAuth } from "../../hooks/useAuthHook";
import { useEffect } from "react";
import ToolBar from "../../components/toolbar/ToolBar";
import { EditQuiz } from "../../components/quiz/EditQuiz";

interface EditQuizPageProps{
    quizAPI: IQuizAPIService;
}

export default function EditQuizPage({quizAPI}: EditQuizPageProps){
    const {token, isAuthenticated, logout} = useAuth();
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
            <EditQuiz quizAPI={quizAPI}/>
        </main>
    )
}