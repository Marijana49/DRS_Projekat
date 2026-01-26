import { useEffect, useState } from "react";
import type { IQuizAPIService } from "../../api/quiz/IQuizAPIService";
import { useAuth } from "../../hooks/useAuthHook";
import { useNavigate } from "react-router-dom";
import type { QuizPreview } from "../../types/Quiz/QuizPreview";
import { SacuvajPoKljucu } from "../../helpers/local_storage";

interface QuizListProps {
    quizAPI: IQuizAPIService
}

export function QuizList({quizAPI}: QuizListProps){
    const {token} = useAuth();
    const [quizes, setQuizes] = useState<QuizPreview[]>([]);
    const navigate = useNavigate();

    const handlePlay = async (id: number) => {
        SacuvajPoKljucu("quizId", id.toString());
        navigate("/quizes/play");
    }

    useEffect(() => {
        (async ()=>{
            const data = await quizAPI.getAllQuizes(token ?? "");
            setQuizes(data);
        })();
    }, [token, quizAPI]);

    return(
        <div className="container px-4 mx-auto min-h-screen min-w-screen">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-6">
                    <h2 className="text-3xl md:text-4l font-extrabold text-indigo-700/90">Quizes</h2>
                </div>
                <div className="grid grid-cols-2 gap-5 text-center">
                    {quizes.length > 0 ? (quizes.map(quiz => (

                        <button onClick = {() => handlePlay(quiz.id)} className="p-0.5 bg-blue-900  hover:bg-linear-to-r hover:from-blue-500 hover:to-purple-400 hover:shadow-2xl transition duration-400 shadow shadow-zinc-700">
                            <div className="bg-indigo-200/90">
                                <h3 className="text-2xl font-bold text-indigo-900/75">{quiz.quizName}</h3>
                                <div className="inline-block mr-4">
                                    Duration: {quiz.duration}min
                                </div>
                                <div className="inline-block">by {quiz.author}</div>
                                <div>
                                </div>
                            </div>
                        </button>
                    )) 
                    ):( 
                    <div className="text-gray-500 font-extrabold justify-center text-2xl text-center col-span-2 py-10">
                        Sorry, no quizes are currently available
                    </div>
                    )}
                </div>
            </div>
        </div>
    )
}