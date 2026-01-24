import { useNavigate } from "react-router-dom";
import type { IQuizAPIService } from "../../api/quiz/IQuizAPIService";
import { useAuth } from "../../hooks/useAuthHook";
import { useEffect } from "react";
import { CreateQuiz } from "../../components/quiz/CreateQuiz";
import ToolBar from "../../components/toolbar/ToolBar";

interface CreateQuizPageProps{
    quizAPI: IQuizAPIService;
}

export default function CreateQuizPage({quizAPI}: CreateQuizPageProps){
    const {token, isAuthenticated, logout} = useAuth();
    const navigate = useNavigate();

    // useEffect(()=>{
    //     if(!isAuthenticated || !token){
    //         logout();
    //         navigate("/login");
    //     }
    // }, [isAuthenticated, logout, navigate]);

    return (
        <main className="">
            <div className="max-h-10">
                <ToolBar/>
            </div>
            <CreateQuiz quizAPI={quizAPI}/>
        </main>
    )
}