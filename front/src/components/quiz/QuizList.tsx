import { useEffect, useState } from "react";
import type { IQuizAPIService } from "../../api/quiz/IQuizAPIService";
import { useAuth } from "../../hooks/useAuthHook";
import { useNavigate } from "react-router-dom";
import type { QuizPreview } from "../../types/Quiz/QuizPreview";
import { SacuvajPoKljucu } from "../../helpers/local_storage";
import { parseQuizStatus } from "../../helpers/parseQuizStatus";
import { parseRole } from "../../helpers/parseRole";
import { useSocket } from "../../hooks/useSocketHook";

interface QuizListProps {
    quizAPI: IQuizAPIService
}

export function QuizList({quizAPI}: QuizListProps){
    const { quizesToApprove } = useSocket();
    const {token, user} = useAuth();
    const [allQuizes, setQuizes] = useState<QuizPreview[]>([]);
    const navigate = useNavigate();

    if(!token)return;

    const handlePlay = async (id: number) => {
        let quiz = allQuizes.find(q => q.quizId == id);
        if(!quiz ||  parseQuizStatus(quiz?.quizStatus) == "Pending"){
            
            return;
        }
        SacuvajPoKljucu("quizId", id.toString());
        navigate(`/quiz/play/${id}`);
    }

    useEffect(() => {
        (async ()=>{
            const data = await quizAPI.getAllQuizes(token);
            setQuizes(data);
        })();
    }, [token, quizAPI]);

    useEffect(()=>{
        quizesToApprove.forEach(quiz => {
            if(allQuizes.includes(quiz)){
                setQuizes(prev => [...prev, quiz]);
            }
        });
    }, [quizesToApprove, allQuizes]);

    
    const handleDelete  = async (id: number) => {
        const answer = await quizAPI.deleteQuiz(token, id);
        if(!answer.success){
            return;
        }
        setQuizes(prev => prev.filter(q => q.quizId !== id));

    }

    const handleEdit = (id: number) => {
        navigate(`/quiz/edit/${id}`);
    }

    const handleToApproval = (quizId: number) => {
        navigate(`/admin/quiz/${quizId}`)
    }

    return(
        <div className="container px-4 mx-auto min-h-screen min-w-screen">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-6">
                    <h2 className="text-3xl md:text-4l font-extrabold text-indigo-700/90">Quizes</h2>
                </div>
                <div className="grid grid-cols-2 gap-5 text-center">
                    {allQuizes.length > 0 ? (allQuizes.map(quiz => (
                        <div key={quiz.quizId}>
                            <button onClick = {() => handlePlay(quiz.quizId)} className="p-0.5 bg-blue-900  hover:bg-linear-to-r hover:from-blue-500 hover:to-purple-400 hover:shadow-2xl transition duration-400 shadow shadow-zinc-700">
                                <div className="bg-indigo-200/90">
                                    <h3 className="text-2xl font-bold text-indigo-900/75">{quiz.quizName}</h3>
                                    <div className="inline-block mr-4">
                                        Duration: {quiz.quizDuration} min
                                    </div>
                                    <div className="inline-block">by {quiz.quizAuthor}</div>
                                    {parseRole(user?.role) == "ADMINISTRATOR" && <p>Status: {parseQuizStatus(quiz.quizStatus)}</p>}
                                </div>
                            </button>
                            <div className="mt-2">
                                <button onClick={() => handleDelete(quiz.quizId)} className="inline-block bg-rose-700 text-white px-6 py-2 mr-2 rounded hover:bg-rose-900 transition duration-500">
                                    Delete
                                </button>
                                {(parseRole(user?.role) == "MODERATOR" && quiz.quizAuthor == user?.email) &&
                                <button onClick={() => handleEdit(quiz.quizId)} className="inline-block bg-indigo-700 text-white px-6 py-2 rounded hover:bg-indigo-900 transition duration-500">
                                    Edit
                                </button>}
                                {(parseRole(user?.role) === "ADMINISTRATOR" && parseQuizStatus(quiz.quizStatus) === "Pending") && <button onClick={() => handleToApproval(quiz.quizId)} className="inline-block bg-indigo-700 text-white px-6 py-2 rounded hover:bg-indigo-900 transition duration-500">
                                    To Approval
                                </button>}
                            </div>
                        </div>
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